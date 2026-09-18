"""
KataGo Engine Manager

Manages KataGo process lifecycle and handles concurrent analysis requests.
"""

import asyncio
import logging
from typing import Optional, Dict, Any
from .protocol import KataGoProtocol
from .models import KataGoConfig, KataGoAnalysis, KataGoBoardState

logger = logging.getLogger(__name__)


class KataGoEngine:
    """
    Manages KataGo engine lifecycle and analysis requests.
    
    Supports persistent engine instance for efficiency.
    """
    
    def __init__(self, config: KataGoConfig):
        self.config = config
        self.protocol: Optional[KataGoProtocol] = None
        self._lock = asyncio.Lock()
        self._request_count = 0
    
    async def start(self) -> None:
        """Start KataGo engine"""
        async with self._lock:
            if self.protocol and self.protocol.is_running:
                logger.info("KataGo engine already running")
                return
            
            logger.info("Starting KataGo engine")
            self.protocol = KataGoProtocol(self.config)
            await self.protocol.start()
            logger.info("KataGo engine started")
    
    async def stop(self) -> None:
        """Stop KataGo engine"""
        async with self._lock:
            if self.protocol:
                logger.info("Stopping KataGo engine")
                await self.protocol.stop()
                self.protocol = None
                logger.info("KataGo engine stopped")
    
    async def analyze(
        self,
        board_state: KataGoBoardState,
        max_visits: Optional[int] = None,
        timeout: Optional[float] = None
    ) -> KataGoAnalysis:
        """
        Analyze a position
        
        Args:
            board_state: Board state to analyze
            max_visits: Override max visits
            timeout: Override timeout
            
        Returns:
            KataGoAnalysis result
        """
        if not self.protocol or not self.protocol.is_running:
            raise RuntimeError("KataGo engine not running")
        
        # Validate board size
        if board_state.size not in self.config.allowed_board_sizes:
            raise ValueError(
                f"Board size {board_state.size} not allowed. "
                f"Allowed sizes: {self.config.allowed_board_sizes}"
            )
        
        # Apply overrides
        if max_visits:
            config = self.config.model_copy(update={"max_visits": max_visits})
        else:
            config = self.config
        
        if timeout:
            config = config.model_copy(update={"timeout_seconds": timeout})
        
        # Convert to dict for protocol
        board_dict = {
            "size": board_state.size,
            "stones": board_state.stones,
            "player": board_state.player,
            "komi": board_state.komi,
            "move_history": board_state.move_history
        }
        
        # Analyze with lock to prevent concurrent issues
        async with self._lock:
            self._request_count += 1
            request_id = self._request_count
            logger.info(f"Starting analysis request #{request_id}")
            
            try:
                result = await self.protocol.analyze(board_dict, max_visits)
                logger.info(f"Completed analysis request #{request_id}")
                return result
            except Exception as e:
                logger.error(f"Analysis request #{request_id} failed: {e}")
                raise
    
    async def restart(self) -> None:
        """Restart KataGo engine"""
        logger.info("Restarting KataGo engine")
        await self.stop()
        await self.start()
    
    @property
    def is_running(self) -> bool:
        """Check if engine is running"""
        return self.protocol is not None and self.protocol.is_running
    
    @property
    def request_count(self) -> int:
        """Get total number of analysis requests"""
        return self._request_count
    
    async def __aenter__(self):
        """Async context manager entry"""
        await self.start()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.stop()
