# Satori Backend

FastAPI backend for the Satori Go game application. This backend will eventually host KataGo for position analysis and Gemini for AI coaching.

## Current Status

**Phase 3: Backend Infrastructure** - API contracts established, no AI integration yet.

### Implemented Endpoints

- `GET /health` - Health check endpoint
- `GET /analysis/status` - Analysis service status
- `POST /analysis/` - Position analysis (returns "not implemented")
- `GET /coach/status` - Coaching service status  
- `POST /coach/` - AI coaching (returns "not implemented")

### Planned Integration

- **KataGo** - Position analysis, move suggestions, win rate estimation
- **Gemini** - Strategic explanations, move coaching, game review

## Setup

### Prerequisites

- Python 3.9+
- pip

### Installation

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` to set your configuration:

```env
# Application
APP_NAME=Satori Backend
DEBUG=false

# CORS - Comma-separated list of allowed origins
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# KataGo (Future)
KATAGO_ENABLED=false
KATAGO_BINARY_PATH=
KATAGO_MODEL_PATH=
KATAGO_CONFIG_PATH=

# Gemini (Future)
GEMINI_ENABLED=false
GEMINI_API_KEY=
```

### Running the Server

```bash
# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "service": "satori-backend"
}
```

### Position Analysis

```http
POST /analysis/
Content-Type: application/json

{
  "board_size": 19,
  "board_state": [["empty", "black", ...], ...],
  "player_to_move": "black",
  "komi": 7.5,
  "move_history": [
    {
      "color": "black",
      "position": {"x": 3, "y": 3},
      "move_number": 1
    }
  ],
  "analysis_type": "standard",
  "max_visits": 100
}
```

**Response (Current - Not Implemented):**
```json
{
  "status": "not_implemented",
  "message": "Analysis endpoint is not yet implemented. KataGo integration pending."
}
```

**Response (Future - With KataGo):**
```json
{
  "status": "ok",
  "best_move": {
    "position": {"x": 15, "y": 3},
    "win_rate": 0.524,
    "score_estimate": 1.8,
    "visits": 100
  },
  "win_rate": 0.512,
  "score_estimate": 0.5,
  "candidate_moves": [...],
  "principal_variation": [...]
}
```

### AI Coaching

```http
POST /coach/
Content-Type: application/json

{
  "context": "move_explanation",
  "board_size": 19,
  "board_state": [["empty", "black", ...], ...],
  "player_to_move": "black",
  "komi": 7.5,
  "move_position": {"x": 15, "y": 3},
  "move_color": "black",
  "engine_analysis": {
    "status": "ok",
    "win_rate": 0.524,
    "score_estimate": 1.8
  },
  "question": "Why is this move good?",
  "language": "en",
  "detail_level": "standard"
}
```

**Response (Current - Not Implemented):**
```json
{
  "status": "not_implemented",
  "message": "Coaching endpoint is not yet implemented. Gemini integration pending."
}
```

**Response (Future - With Gemini):**
```json
{
  "status": "ok",
  "explanation": "This move strengthens your position on the right side...",
  "key_points": [
    "Secures territory on the right",
    "Reduces opponent's influence",
    "Creates good shape"
  ],
  "suggestions": [
    "Consider following up with aExtension to the center",
    "Watch for opponent's invasion at R14"
  ],
  "move_quality": "good"
}
```

## Testing

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_api.py

# Run with coverage
pytest --cov=app
```

## Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration management
│   ├── api/
│   │   ├── health.py        # Health check endpoint
│   │   ├── analysis.py      # Analysis endpoint (contract only)
│   │   └── coach.py         # Coach endpoint (contract only)
│   ├── schemas/
│   │   ├── analysis.py      # Analysis request/response schemas
│   │   └── coach.py         # Coach request/response schemas
│   └── services/            # Future: KataGo, Gemini services
├── tests/
│   └── test_api.py          # API tests
├── requirements.txt
├── .env.example
└── README.md
```

## Security

- **No secrets in frontend**: API keys are stored in backend `.env` only
- **CORS configured**: Only allowed origins can access the API
- **Input validation**: All requests validated with Pydantic schemas
- **No stack traces**: Error responses don't expose internal details
- **Rate limiting**: Ready to be added when needed

## Future Phases

### Phase 4: KataGo Integration

- Implement KataGo service in `app/services/katago.py`
- Connect to `/analysis/` endpoint
- Add KataGo binary and model management
- Implement position analysis logic

### Phase 5: Gemini Integration

- Implement Gemini service in `app/services/gemini.py`
- Connect to `/coach/` endpoint
- Add prompt engineering for Go coaching
- Implement strategic explanation generation

## Deployment

### Docker (Future)

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production

```env
DEBUG=false
CORS_ORIGINS=https://satori-go.vercel.app
KATAGO_ENABLED=true
KATAGO_BINARY_PATH=/app/katago/katago
KATAGO_MODEL_PATH=/app/katago/model.bin
GEMINI_ENABLED=true
GEMINI_API_KEY=your-secret-key
```

## License

Part of the Satori Go game project.
