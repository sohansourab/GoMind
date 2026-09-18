"""
KataGo Data Models

Pydantic models for KataGo analysis results and configuration.
"""

from typing import List, Optional, Tuple
from pydantic import BaseModel, Field


class KataGoConfig(BaseModel):
    """Configuration for KataGo engine"""
    executable_path: str = Field(..., description="Path to KataGo executable")
    nn_model_path: str = Field(..., description="Path to KataGo neural network model file")
    config_path: Optional[str] = Field(None, description="Path to KataGo config file")
    max_visits: int = Field(default=100, ge=1, description="Maximum analysis visits")
    timeout_seconds: float = Field(default=30.0, gt=0, description="Analysis timeout")
    allowed_board_sizes: List[int] = Field(
        default=[9, 13, 19],
        description="Allowed board sizes"
    )


class KataGoMove(BaseModel):
    """A move from KataGo analysis"""
    move: str = Field(..., description="Move in KataGo format (e.g., 'D4', 'pass')")
    visits: int = Field(..., ge=0, description="Number of visits")
    winrate: float = Field(..., ge=0, le=1, description="Win rate (0-1)")
    scoreMean: float = Field(..., description="Mean score")
    scoreStdev: float = Field(..., ge=0, description="Score standard deviation")
    prior: float = Field(..., ge=0, le=1, description="Policy prior")
    order: int = Field(..., ge=0, description="Rank order (0 = best)")


class KataGoAnalysis(BaseModel):
    """Complete analysis result from KataGo"""
    moveInfos: List[KataGoMove] = Field(default_factory=list, description="Candidate moves")
    rootInfo: dict = Field(default_factory=dict, description="Root position info")
    
    # Extracted fields for easier access
    @property
    def best_move(self) -> Optional[KataGoMove]:
        """Get the best move (highest winrate)"""
        if not self.moveInfos:
            return None
        return max(self.moveInfos, key=lambda m: m.winrate)
    
    @property
    def win_rate(self) -> Optional[float]:
        """Get win rate for current player"""
        if not self.rootInfo:
            return None
        return self.rootInfo.get("winrate")
    
    @property
    def score_estimate(self) -> Optional[float]:
        """Get score estimate"""
        if not self.rootInfo:
            return None
        return self.rootInfo.get("scoreMean")
    
    @property
    def principal_variation(self) -> List[str]:
        """Get principal variation (best line)"""
        if not self.moveInfos:
            return []
        best = self.best_move
        if best and "pv" in best.model_extra:
            return best.model_extra["pv"]
        return []


class KataGoBoardState(BaseModel):
    """Board state in KataGo format"""
    size: int = Field(..., ge=2, le=25, description="Board size")
    stones: List[List[int]] = Field(
        ...,
        description="2D array: 0=empty, 1=black, 2=white"
    )
    player: str = Field(..., description="Player to move: 'black' or 'white'")
    komi: float = Field(..., description="Komi value")
    move_history: List[str] = Field(
        default_factory=list,
        description="Move history in KataGo format"
    )


class KataGoAnalysisRequest(BaseModel):
    """Request for KataGo analysis"""
    board_state: KataGoBoardState
    config: KataGoConfig
    max_visits: Optional[int] = Field(None, description="Override max visits")
    timeout: Optional[float] = Field(None, description="Override timeout")
