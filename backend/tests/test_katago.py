"""
Tests for KataGo integration

Includes both unit tests (with mocks) and integration tests (requiring real KataGo).
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch
from app.services.katago.models import KataGoConfig, KataGoBoardState, KataGoAnalysis, KataGoMove
from app.services.katago.protocol import KataGoProtocol
from app.services.katago.engine import KataGoEngine
from app.services.katago.service import KataGoService


# ============================================================================
# Unit Tests (with mocks)
# ============================================================================

class TestKataGoModels:
    """Test KataGo data models"""
    
    def test_katago_config(self):
        """Test KataGo configuration model"""
        config = KataGoConfig(
            executable_path="/usr/bin/katago",
            nn_model_path="/models/model.bin.gz",
            max_visits=100,
            timeout_seconds=30.0
        )
        assert config.executable_path == "/usr/bin/katago"
        assert config.max_visits == 100
    
    def test_katago_board_state(self):
        """Test board state model"""
        board = KataGoBoardState(
            size=9,
            stones=[[0] * 9 for _ in range(9)],
            player="black",
            komi=7.5
        )
        assert board.size == 9
        assert board.player == "black"
    
    def test_katago_move(self):
        """Test move model"""
        move = KataGoMove(
            move="D4",
            visits=100,
            winrate=0.55,
            scoreMean=2.5,
            scoreStdev=15.0,
            prior=0.1,
            order=0
        )
        assert move.move == "D4"
        assert move.winrate == 0.55
    
    def test_katago_analysis_best_move(self):
        """Test analysis best move extraction"""
        analysis = KataGoAnalysis(
            moveInfos=[
                KataGoMove(move="D4", visits=100, winrate=0.55, scoreMean=2.5, scoreStdev=15.0, prior=0.1, order=0),
                KataGoMove(move="Q16", visits=80, winrate=0.52, scoreMean=1.8, scoreStdev=14.0, prior=0.08, order=1),
            ],
            rootInfo={"winrate": 0.53, "scoreMean": 2.0}
        )
        
        best = analysis.best_move
        assert best is not None
        assert best.move == "D4"
        assert best.winrate == 0.55
    
    def test_katago_analysis_properties(self):
        """Test analysis property extraction"""
        analysis = KataGoAnalysis(
            moveInfos=[],
            rootInfo={"winrate": 0.53, "scoreMean": 2.0}
        )
        
        assert analysis.win_rate == 0.53
        assert analysis.score_estimate == 2.0


class TestKataGoProtocol:
    """Test KataGo protocol handler"""
    
    @pytest.mark.asyncio
    async def test_protocol_start_failure(self):
        """Test protocol start with invalid executable"""
        config = KataGoConfig(
            executable_path="/nonexistent/katago",
            nn_model_path="/models/model.bin.gz"
        )
        protocol = KataGoProtocol(config)
        
        with pytest.raises(RuntimeError, match="not found"):
            await protocol.start()
    
    @pytest.mark.asyncio
    async def test_protocol_xy_to_gtp(self):
        """Test coordinate conversion"""
        config = KataGoConfig(
            executable_path="/usr/bin/katago",
            nn_model_path="/models/model.bin.gz"
        )
        protocol = KataGoProtocol(config)
        
        # Test various coordinates
        assert protocol._xy_to_gtp(0, 0, 19) == "A19"
        assert protocol._xy_to_gtp(3, 3, 19) == "D16"
        assert protocol._xy_to_gtp(18, 18, 19) == "T1"
        
        # Test 9x9
        assert protocol._xy_to_gtp(0, 0, 9) == "A9"
        assert protocol._xy_to_gtp(4, 4, 9) == "E5"


class TestKataGoEngine:
    """Test KataGo engine manager"""
    
    @pytest.mark.asyncio
    async def test_engine_not_running(self):
        """Test analysis when engine not running"""
        config = KataGoConfig(
            executable_path="/usr/bin/katago",
            nn_model_path="/models/model.bin.gz"
        )
        engine = KataGoEngine(config)
        
        board = KataGoBoardState(
            size=9,
            stones=[[0] * 9 for _ in range(9)],
            player="black",
            komi=7.5
        )
        
        with pytest.raises(RuntimeError, match="not running"):
            await engine.analyze(board)
    
    @pytest.mark.asyncio
    async def test_engine_invalid_board_size(self):
        """Test analysis with invalid board size"""
        config = KataGoConfig(
            executable_path="/usr/bin/katago",
            nn_model_path="/models/model.bin.gz",
            allowed_board_sizes=[9, 13, 19]
        )
        engine = KataGoEngine(config)
        engine.protocol = Mock()
        engine.protocol.is_running = True
        
        board = KataGoBoardState(
            size=7,  # Not allowed
            stones=[[0] * 7 for _ in range(7)],
            player="black",
            komi=7.5
        )
        
        with pytest.raises(ValueError, match="not allowed"):
            await engine.analyze(board)


class TestKataGoService:
    """Test KataGo service"""
    
    def test_service_not_enabled(self):
        """Test service when KataGo not enabled"""
        service = KataGoService()
        
        with patch('app.services.katago.service.settings') as mock_settings:
            mock_settings.katago_enabled = False
            
            with pytest.raises(RuntimeError, match="not enabled"):
                service._get_config()
    
    def test_service_missing_config(self):
        """Test service with missing configuration"""
        service = KataGoService()
        
        with patch('app.services.katago.service.settings') as mock_settings:
            mock_settings.katago_enabled = True
            mock_settings.katago_binary_path = ""
            
            with pytest.raises(RuntimeError, match="binary path"):
                service._get_config()
    
    def test_convert_board_state(self):
        """Test board state conversion"""
        service = KataGoService()
        
        board = [
            ["black", "white", "empty"],
            ["empty", "black", "white"]
        ]
        
        result = service._convert_board_state(board)
        
        assert result == [
            [1, 2, 0],
            [0, 1, 2]
        ]
    
    def test_convert_move_history(self):
        """Test move history conversion"""
        service = KataGoService()
        
        moves = [
            {"color": "black", "position": {"x": 3, "y": 3}},
            {"color": "white", "position": None}  # Pass
        ]
        
        result = service._convert_move_history(moves, 9)
        
        assert result == ["black D6", "white pass"]
    
    def test_gtp_to_xy(self):
        """Test GTP to xy conversion"""
        service = KataGoService()
        
        assert service._gtp_to_xy("D4") == {"x": 3, "y": 15}
        assert service._gtp_to_xy("pass") == {"x": -1, "y": -1}


# ============================================================================
# Integration Tests (require real KataGo)
# ============================================================================

@pytest.mark.integration
class TestKataGoIntegration:
    """
    Integration tests requiring real KataGo installation.
    
    These tests will be skipped if KataGo is not available.
    Run with: pytest -m integration
    """
    
    @pytest.fixture
    def katago_config(self):
        """Get KataGo configuration from environment"""
        import os
        executable = os.environ.get("KATAGO_EXECUTABLE")
        model = os.environ.get("KATAGO_MODEL")
        
        if not executable or not model:
            pytest.skip("KataGo not configured (set KATAGO_EXECUTABLE and KATAGO_MODEL)")
        
        return KataGoConfig(
            executable_path=executable,
            nn_model_path=model,
            max_visits=50,  # Lower for tests
            timeout_seconds=60.0
        )
    
    @pytest.mark.asyncio
    async def test_engine_start_stop(self, katago_config):
        """Test engine start and stop"""
        engine = KataGoEngine(katago_config)
        
        try:
            await engine.start()
            assert engine.is_running
            
            await engine.stop()
            assert not engine.is_running
        finally:
            await engine.stop()
    
    @pytest.mark.asyncio
    async def test_analyze_empty_board(self, katago_config):
        """Test analyzing empty 9x9 board"""
        engine = KataGoEngine(katago_config)
        
        try:
            await engine.start()
            
            board = KataGoBoardState(
                size=9,
                stones=[[0] * 9 for _ in range(9)],
                player="black",
                komi=7.5
            )
            
            result = await engine.analyze(board, max_visits=50)
            
            assert result is not None
            assert len(result.moveInfos) > 0
            assert result.best_move is not None
            
        finally:
            await engine.stop()
    
    @pytest.mark.asyncio
    async def test_analyze_19x19_board(self, katago_config):
        """Test analyzing 19x19 board"""
        engine = KataGoEngine(katago_config)
        
        try:
            await engine.start()
            
            board = KataGoBoardState(
                size=19,
                stones=[[0] * 19 for _ in range(19)],
                player="black",
                komi=7.5
            )
            
            result = await engine.analyze(board, max_visits=50)
            
            assert result is not None
            assert result.best_move is not None
            
        finally:
            await engine.stop()
    
    @pytest.mark.asyncio
    async def test_service_analyze_position(self, katago_config):
        """Test service-level analysis"""
        service = KataGoService()
        service._config = katago_config
        
        try:
            result = await service.analyze_position(
                board_size=9,
                board_state=[["empty"] * 9 for _ in range(9)],
                player_to_move="black",
                komi=7.5,
                max_visits=50
            )
            
            assert result["status"] == "ok"
            assert result["best_move"] is not None
            assert result["win_rate"] is not None
            
        finally:
            await service.shutdown()
