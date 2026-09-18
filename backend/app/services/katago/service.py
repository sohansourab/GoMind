"""
KataGo Service

High-level service for KataGo analysis with automatic engine management.
"""

import asyncio
import logging
from typing import Optional, Dict, Any, List
from .engine import KataGoEngine
from .models import KataGoConfig, KataGoAnalysis, KataGoBoardState, KataGoMove
from app.config import settings

logger = logging.getLogger(__name__)


class KataGoService:
    """
    High-level KataGo service with automatic engine management.
    
    Provides analysis API and handles engine lifecycle.
    """
    
    def __init__(self):
        self._engine: Optional[KataGoEngine] = None
        self._config: Optional[KataGoConfig] = None
        self._lock = asyncio.Lock()
    
    def _get_config(self) -> KataGoConfig:
        """Get KataGo configuration from settings"""
        if self._config is None:
            if not settings.katago_enabled:
                raise RuntimeError("KataGo is not enabled")
            
            if not settings.katago_binary_path:
                raise RuntimeError("KataGo binary path not configured")
            
            if not settings.katago_model_path:
                raise RuntimeError("KataGo model path not configured")
            
            self._config = KataGoConfig(
                executable_path=settings.katago_binary_path,
                model_path=settings.katago_model_path,
                config_path=settings.katago_config_path if settings.katago_config_path else None,
                max_visits=100,
                timeout_seconds=30.0,
                allowed_board_sizes=[9, 13, 19]
            )
        
        return self._config
    
    async def _ensure_engine(self) -> KataGoEngine:
        """Ensure KataGo engine is running"""
        async with self._lock:
            if self._engine is None or not self._engine.is_running:
                config = self._get_config()
                self._engine = KataGoEngine(config)
                await self._engine.start()
            
            return self._engine
    
    async def analyze_position(
        self,
        board_size: int,
        board_state: List[List[str]],
        player_to_move: str,
        komi: float,
        move_history: Optional[List[Dict[str, Any]]] = None,
        max_visits: Optional[int] = None,
        timeout: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Analyze a Go position
        
        Args:
            board_size: Board size (9, 13, or 19)
            board_state: 2D array of stone colors ("black", "white", "empty")
            player_to_move: "black" or "white"
            komi: Komi value
            move_history: Optional move history
            max_visits: Override max visits
            timeout: Override timeout
            
        Returns:
            Analysis result in Satori API format
        """
        try:
            # Ensure engine is running
            engine = await self._ensure_engine()
            
            # Convert board state to KataGo format
            katago_stones = self._convert_board_state(board_state)
            
            # Convert move history
            katago_moves = []
            if move_history:
                katago_moves = self._convert_move_history(move_history, board_size)
            
            # Create KataGo board state
            katago_board = KataGoBoardState(
                size=board_size,
                stones=katago_stones,
                player=player_to_move,
                komi=komi,
                move_history=katago_moves
            )
            
            # Analyze
            analysis = await engine.analyze(katago_board, max_visits, timeout)
            
            # Convert to Satori format
            return self._convert_analysis(analysis, player_to_move)
            
        except RuntimeError as e:
            logger.error(f"KataGo service error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in KataGo service: {e}")
            raise
    
    def _convert_board_state(self, board_state: List[List[str]]) -> List[List[int]]:
        """Convert Satori board state to KataGo format"""
        katago_stones = []
        for row in board_state:
            katago_row = []
            for stone in row:
                if stone == "black":
                    katago_row.append(1)
                elif stone == "white":
                    katago_row.append(2)
                else:  # empty
                    katago_row.append(0)
            katago_stones.append(katago_row)
        return katago_stones
    
    def _convert_move_history(
        self,
        move_history: List[Dict[str, Any]],
        board_size: int
    ) -> List[str]:
        """Convert Satori move history to KataGo format"""
        katago_moves = []
        for move in move_history:
            color = move["color"]
            position = move.get("position")
            
            if position is None:
                # Pass move
                katago_moves.append(f"{color} pass")
            else:
                # Regular move
                x, y = position["x"], position["y"]
                coord = self._xy_to_gtp(x, y, board_size)
                katago_moves.append(f"{color} {coord}")
        
        return katago_moves
    
    def _xy_to_gtp(self, x: int, y: int, size: int) -> str:
        """Convert x,y coordinates to GTP format"""
        letters = "ABCDEFGHJKLMNOPQRST"
        col = letters[x]
        row = size - y
        return f"{col}{row}"
    
    def _convert_analysis(
        self,
        analysis: KataGoAnalysis,
        player_to_move: str
    ) -> Dict[str, Any]:
        """Convert KataGo analysis to Satori API format"""
        result = {
            "status": "ok",
            "best_move": None,
            "win_rate": None,
            "score_estimate": None,
            "candidate_moves": [],
            "principal_variation": []
        }
        
        # Best move
        best = analysis.best_move
        if best:
            result["best_move"] = {
                "position": self._gtp_to_xy(best.move),
                "win_rate": best.winrate,
                "score_estimate": best.scoreMean,
                "visits": best.visits
            }
        
        # Win rate and score from root info
        if analysis.win_rate is not None:
            result["win_rate"] = analysis.win_rate
        
        if analysis.score_estimate is not None:
            result["score_estimate"] = analysis.score_estimate
        
        # Candidate moves
        for move in analysis.moveInfos[:10]:  # Top 10
            candidate = {
                "position": self._gtp_to_xy(move.move),
                "win_rate": move.winrate,
                "score_estimate": move.scoreMean,
                "visits": move.visits
            }
            result["candidate_moves"].append(candidate)
        
        # Principal variation
        pv = analysis.principal_variation
        if pv:
            result["principal_variation"] = [
                self._gtp_to_xy(move) for move in pv
            ]
        
        return result
    
    def _gtp_to_xy(self, gtp_move: str) -> Dict[str, int]:
        """Convert GTP move to x,y coordinates"""
        if gtp_move.lower() == "pass":
            return {"x": -1, "y": -1}  # Special marker for pass
        
        # Parse GTP format (e.g., "D4")
        col_letter = gtp_move[0].upper()
        row_num = int(gtp_move[1:])
        
        # Convert column letter to x
        letters = "ABCDEFGHJKLMNOPQRST"
        x = letters.index(col_letter)
        
        # Row number to y (will be adjusted based on board size)
        # For now, assume 19x19, will be adjusted in API layer
        y = 19 - row_num
        
        return {"x": x, "y": y}
    
    async def shutdown(self) -> None:
        """Shutdown KataGo service"""
        logger.info("Shutting down KataGo service")
        if self._engine:
            await self._engine.stop()
            self._engine = None
        self._config = None
    
    @property
    def is_available(self) -> bool:
        """Check if KataGo is available"""
        return (
            settings.katago_enabled and
            settings.katago_binary_path and
            settings.katago_model_path and
            self._engine is not None and
            self._engine.is_running
        )


# Global service instance
_katago_service: Optional[KataGoService] = None


def get_katago_service() -> KataGoService:
    """Get global KataGo service instance"""
    global _katago_service
    if _katago_service is None:
        _katago_service = KataGoService()
    return _katago_service


async def shutdown_katago_service() -> None:
    """Shutdown global KataGo service"""
    global _katago_service
    if _katago_service:
        await _katago_service.shutdown()
        _katago_service = None
