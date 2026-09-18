"""
KataGo Protocol Handler

Handles communication with KataGo using GTP (Go Text Protocol) with JSON extensions.
"""

import asyncio
import json
import logging
from typing import Optional, Dict, Any
from .models import KataGoConfig, KataGoAnalysis

logger = logging.getLogger(__name__)


class KataGoProtocol:
    """Handles GTP protocol communication with KataGo"""
    
    def __init__(self, config: KataGoConfig):
        self.config = config
        self.process: Optional[asyncio.subprocess.Process] = None
        self._initialized = False
    
    async def start(self) -> None:
        """Start KataGo process"""
        if self.process is not None:
            logger.warning("KataGo process already running")
            return
        
        try:
            # Build command
            cmd = [
                self.config.executable_path,
                "gtp",
                "-model", self.config.model_path,
            ]
            
            if self.config.config_path:
                cmd.extend(["-config", self.config.config_path])
            
            logger.info(f"Starting KataGo: {' '.join(cmd)}")
            
            # Start process
            self.process = await asyncio.create_subprocess_exec(
                *cmd,
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                limit=1024 * 1024  # 1MB buffer
            )
            
            # Wait for startup
            await self._wait_for_ready()
            self._initialized = True
            
            logger.info("KataGo started successfully")
            
        except FileNotFoundError as e:
            logger.error(f"KataGo executable not found: {self.config.executable_path}")
            raise RuntimeError(f"KataGo executable not found: {self.config.executable_path}") from e
        except Exception as e:
            logger.error(f"Failed to start KataGo: {e}")
            await self.stop()
            raise
    
    async def _wait_for_ready(self) -> None:
        """Wait for KataGo to be ready"""
        if not self.process or not self.process.stdin or not self.process.stdout:
            raise RuntimeError("KataGo process not started")
        
        # Send version command
        await self._send_command("version")
        
        # Read response
        response = await self._read_response()
        
        if not response.startswith("="):
            raise RuntimeError(f"KataGo failed to initialize: {response}")
    
    async def _send_command(self, command: str) -> None:
        """Send a GTP command to KataGo"""
        if not self.process or not self.process.stdin:
            raise RuntimeError("KataGo process not running")
        
        try:
            # Add newline and flush
            self.process.stdin.write(f"{command}\n".encode())
            await self.process.stdin.drain()
            logger.debug(f"Sent: {command}")
        except Exception as e:
            logger.error(f"Failed to send command: {e}")
            raise
    
    async def _read_response(self) -> str:
        """Read response from KataGo"""
        if not self.process or not self.process.stdout:
            raise RuntimeError("KataGo process not running")
        
        try:
            # Read until we get a complete response
            lines = []
            while True:
                line = await asyncio.wait_for(
                    self.process.stdout.readline(),
                    timeout=self.config.timeout_seconds
                )
                
                if not line:
                    raise RuntimeError("KataGo process ended unexpectedly")
                
                line_str = line.decode().strip()
                lines.append(line_str)
                
                # Empty line or response completion
                if line_str == "" or (line_str.startswith("=") and len(lines) > 1):
                    break
            
            response = "\n".join(lines)
            logger.debug(f"Received: {response[:200]}...")
            return response
            
        except asyncio.TimeoutError:
            logger.error("KataGo response timeout")
            raise RuntimeError("KataGo analysis timeout")
        except Exception as e:
            logger.error(f"Failed to read response: {e}")
            raise
    
    async def analyze(self, board_state: Dict[str, Any], max_visits: Optional[int] = None) -> KataGoAnalysis:
        """
        Request analysis from KataGo
        
        Args:
            board_state: Board state in KataGo format
            max_visits: Override max visits for this analysis
            
        Returns:
            KataGoAnalysis result
        """
        if not self._initialized:
            raise RuntimeError("KataGo not initialized")
        
        # Build genmove command with analysis
        visits = max_visits or self.config.max_visits
        
        # Set board state
        await self._setup_board(board_state)
        
        # Request analysis
        cmd = f"genmove_analysis visits={visits}"
        await self._send_command(cmd)
        
        # Read JSON response
        response = await self._read_response()
        
        # Parse response
        return self._parse_analysis_response(response)
    
    async def _setup_board(self, board_state: Dict[str, Any]) -> None:
        """Set up board position in KataGo"""
        # Clear board
        await self._send_command("clear_board")
        await self._read_response()
        
        # Set board size
        size = board_state["size"]
        await self._send_command(f"boardsize {size}")
        await self._read_response()
        
        # Set komi
        komi = board_state["komi"]
        await self._send_command(f"komi {komi}")
        await self._read_response()
        
        # Place stones
        stones = board_state["stones"]
        for y, row in enumerate(stones):
            for x, stone in enumerate(row):
                if stone == 1:  # Black
                    coord = self._xy_to_gtp(x, y, size)
                    await self._send_command(f"play black {coord}")
                    await self._read_response()
                elif stone == 2:  # White
                    coord = self._xy_to_gtp(x, y, size)
                    await self._send_command(f"play white {coord}")
                    await self._read_response()
        
        # Play move history
        for move in board_state.get("move_history", []):
            await self._send_command(f"play {move}")
            await self._read_response()
    
    def _xy_to_gtp(self, x: int, y: int, size: int) -> str:
        """Convert x,y coordinates to GTP format"""
        # GTP uses letters A-T (excluding I)
        letters = "ABCDEFGHJKLMNOPQRST"
        col = letters[x]
        row = size - y  # GTP row 1 is at bottom
        return f"{col}{row}"
    
    def _parse_analysis_response(self, response: str) -> KataGoAnalysis:
        """Parse KataGo analysis response"""
        # Response format: = {JSON data}
        if not response.startswith("="):
            raise RuntimeError(f"Invalid KataGo response: {response}")
        
        # Extract JSON part
        json_str = response[1:].strip()
        
        try:
            data = json.loads(json_str)
            return KataGoAnalysis(
                moveInfos=data.get("moveInfos", []),
                rootInfo=data.get("rootInfo", {})
            )
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse KataGo JSON: {e}")
            raise RuntimeError(f"Invalid KataGo response format: {e}")
    
    async def stop(self) -> None:
        """Stop KataGo process"""
        if self.process is None:
            return
        
        try:
            logger.info("Stopping KataGo process")
            
            # Send quit command
            try:
                await self._send_command("quit")
                await asyncio.wait_for(self.process.wait(), timeout=5.0)
            except:
                pass
            
            # Force terminate if still running
            if self.process.returncode is None:
                self.process.terminate()
                try:
                    await asyncio.wait_for(self.process.wait(), timeout=5.0)
                except asyncio.TimeoutError:
                    logger.warning("KataGo process did not terminate, killing")
                    self.process.kill()
                    await self.process.wait()
            
            logger.info("KataGo process stopped")
            
        except Exception as e:
            logger.error(f"Error stopping KataGo: {e}")
        finally:
            self.process = None
            self._initialized = False
    
    @property
    def is_running(self) -> bool:
        """Check if KataGo process is running"""
        return self.process is not None and self.process.returncode is None
