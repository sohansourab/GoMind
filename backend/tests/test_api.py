"""
Tests for backend API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    """Create a test client"""
    return TestClient(app)


class TestHealthEndpoint:
    """Tests for /health endpoint"""
    
    def test_health_check(self, client):
        """Test health check returns correct response"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "satori-backend"
    
    def test_health_check_content_type(self, client):
        """Test health check returns JSON"""
        response = client.get("/health")
        assert response.headers["content-type"] == "application/json"


class TestRootEndpoint:
    """Tests for / endpoint"""
    
    def test_root(self, client):
        """Test root endpoint returns service info"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "satori-backend"
        assert data["version"] == "0.1.0"
        assert data["status"] == "running"


class TestAnalysisEndpoint:
    """Tests for /analysis endpoint"""
    
    def test_analysis_not_implemented(self, client):
        """Test analysis endpoint returns not implemented"""
        request_data = {
            "board_size": 9,
            "board_state": [["empty"] * 9 for _ in range(9)],
            "player_to_move": "black",
            "komi": 7.5
        }
        response = client.post("/analysis/", json=request_data)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "not_implemented"
        assert "not yet implemented" in data["message"]
    
    def test_analysis_status(self, client):
        """Test analysis status endpoint"""
        response = client.get("/analysis/status")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "analysis"
        assert data["status"] == "not_implemented"
        assert data["engine"] == "none"
    
    def test_analysis_invalid_board_size(self, client):
        """Test analysis rejects invalid board size"""
        request_data = {
            "board_size": 1,  # Too small
            "board_state": [["empty"]],
            "player_to_move": "black",
            "komi": 7.5
        }
        response = client.post("/analysis/", json=request_data)
        assert response.status_code == 422  # Validation error
    
    def test_analysis_invalid_board_state(self, client):
        """Test analysis rejects invalid board state"""
        request_data = {
            "board_size": 9,
            "board_state": [["invalid_color"] * 9 for _ in range(9)],
            "player_to_move": "black",
            "komi": 7.5
        }
        response = client.post("/analysis/", json=request_data)
        assert response.status_code == 422  # Validation error
    
    def test_analysis_missing_required_fields(self, client):
        """Test analysis rejects missing required fields"""
        request_data = {
            "board_size": 9
            # Missing board_state and player_to_move
        }
        response = client.post("/analysis/", json=request_data)
        assert response.status_code == 422  # Validation error
    
    def test_analysis_with_move_history(self, client):
        """Test analysis accepts move history"""
        request_data = {
            "board_size": 9,
            "board_state": [["empty"] * 9 for _ in range(9)],
            "player_to_move": "black",
            "komi": 7.5,
            "move_history": [
                {
                    "color": "black",
                    "position": {"x": 3, "y": 3},
                    "move_number": 1
                }
            ]
        }
        response = client.post("/analysis/", json=request_data)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "not_implemented"
    
    def test_analysis_with_pass_move(self, client):
        """Test analysis accepts pass moves (null position)"""
        request_data = {
            "board_size": 9,
            "board_state": [["empty"] * 9 for _ in range(9)],
            "player_to_move": "white",
            "komi": 7.5,
            "move_history": [
                {
                    "color": "black",
                    "position": None,  # Pass
                    "move_number": 1
                }
            ]
        }
        response = client.post("/analysis/", json=request_data)
        assert response.status_code == 200


class TestCoachEndpoint:
    """Tests for /coach endpoint"""
    
    def test_coach_not_implemented(self, client):
        """Test coach endpoint returns not implemented"""
        request_data = {
            "context": "move_explanation",
            "board_size": 9,
            "board_state": [["empty"] * 9 for _ in range(9)],
            "player_to_move": "black",
            "komi": 7.5
        }
        response = client.post("/coach/", json=request_data)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "not_implemented"
        assert "not yet implemented" in data["message"]
    
    def test_coach_status(self, client):
        """Test coach status endpoint"""
        response = client.get("/coach/status")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "coach"
        assert data["status"] == "not_implemented"
        assert data["engine"] == "none"
    
    def test_coach_invalid_context(self, client):
        """Test coach rejects invalid context"""
        request_data = {
            "context": "invalid_context",
            "board_size": 9,
            "board_state": [["empty"] * 9 for _ in range(9)],
            "player_to_move": "black"
        }
        response = client.post("/coach/", json=request_data)
        assert response.status_code == 422  # Validation error
    
    def test_coach_with_question(self, client):
        """Test coach accepts user question"""
        request_data = {
            "context": "move_explanation",
            "board_size": 9,
            "board_state": [["empty"] * 9 for _ in range(9)],
            "player_to_move": "black",
            "question": "Why is this move good?"
        }
        response = client.post("/coach/", json=request_data)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "not_implemented"
    
    def test_coach_with_move_position(self, client):
        """Test coach accepts move position"""
        request_data = {
            "context": "move_explanation",
            "board_size": 9,
            "board_state": [["empty"] * 9 for _ in range(9)],
            "player_to_move": "black",
            "move_position": {"x": 3, "y": 3},
            "move_color": "black"
        }
        response = client.post("/coach/", json=request_data)
        assert response.status_code == 200
    
    def test_coach_with_engine_analysis(self, client):
        """Test coach accepts engine analysis"""
        request_data = {
            "context": "move_explanation",
            "board_size": 9,
            "board_state": [["empty"] * 9 for _ in range(9)],
            "player_to_move": "black",
            "engine_analysis": {
                "status": "ok",
                "win_rate": 0.55,
                "score_estimate": 2.5
            }
        }
        response = client.post("/coach/", json=request_data)
        assert response.status_code == 200
    
    def test_coach_question_too_long(self, client):
        """Test coach rejects overly long question"""
        request_data = {
            "context": "move_explanation",
            "board_size": 9,
            "board_state": [["empty"] * 9 for _ in range(9)],
            "player_to_move": "black",
            "question": "x" * 501  # Over 500 character limit
        }
        response = client.post("/coach/", json=request_data)
        assert response.status_code == 422  # Validation error


class TestErrorHandling:
    """Tests for error handling"""
    
    def test_invalid_json(self, client):
        """Test handling of invalid JSON"""
        response = client.post(
            "/analysis/",
            content="invalid json",
            headers={"content-type": "application/json"}
        )
        assert response.status_code == 422
    
    def test_nonexistent_endpoint(self, client):
        """Test handling of nonexistent endpoint"""
        response = client.get("/nonexistent")
        assert response.status_code == 404
    
    def test_method_not_allowed(self, client):
        """Test handling of wrong HTTP method"""
        response = client.delete("/health")
        assert response.status_code == 405


class TestCORSSecurity:
    """Tests for CORS and security"""
    
    def test_cors_headers_present(self, client):
        """Test CORS headers are present"""
        response = client.get(
            "/health",
            headers={"Origin": "http://localhost:3000"}
        )
        # CORS headers should be present
        assert "access-control-allow-origin" in response.headers
    
    def test_no_stack_traces_in_errors(self, client):
        """Test that stack traces are not exposed in error responses"""
        response = client.post("/analysis/", json={})
        assert response.status_code == 422
        data = response.json()
        # Should not contain Python stack trace indicators
        assert "Traceback" not in str(data)
        assert "File " not in str(data)


class TestSchemaValidation:
    """Tests for schema validation"""
    
    def test_analysis_board_size_bounds(self, client):
        """Test board size validation bounds"""
        # Valid: 2-25
        for size in [2, 9, 13, 19, 25]:
            request_data = {
                "board_size": size,
                "board_state": [["empty"] * size for _ in range(size)],
                "player_to_move": "black"
            }
            response = client.post("/analysis/", json=request_data)
            assert response.status_code == 200
        
        # Invalid: outside bounds
        for size in [1, 26]:
            request_data = {
                "board_size": size,
                "board_state": [["empty"] * size for _ in range(size)],
                "player_to_move": "black"
            }
            response = client.post("/analysis/", json=request_data)
            assert response.status_code == 422
    
    def test_analysis_komi_validation(self, client):
        """Test komi validation"""
        # Valid: >= 0
        for komi in [0, 0.5, 6.5, 7.5, 100]:
            request_data = {
                "board_size": 9,
                "board_state": [["empty"] * 9 for _ in range(9)],
                "player_to_move": "black",
                "komi": komi
            }
            response = client.post("/analysis/", json=request_data)
            assert response.status_code == 200
        
        # Invalid: negative
        request_data = {
            "board_size": 9,
            "board_state": [["empty"] * 9 for _ in range(9)],
            "player_to_move": "black",
            "komi": -1
        }
        response = client.post("/analysis/", json=request_data)
        assert response.status_code == 422
