# KataGo Integration Guide

This guide explains how to install and configure KataGo for use with Satori.

## Overview

KataGo is a powerful Go AI that provides:
- Position analysis with win rates
- Best move recommendations
- Score estimation
- Principal variations
- Candidate moves

Satori uses KataGo through the FastAPI backend for real Go analysis.

## Installation

### 1. Download KataGo

Visit the [KataGo releases page](https://github.com/lightvector/KataGo/releases) and download:

**For Linux/macOS:**
```bash
# Download KataGo executable
wget https://github.com/lightvector/KataGo/releases/download/v1.15.0/katago-v1.15.0-linux-x64
chmod +x katago-v1.15.0-linux-x64
sudo mv katago-v1.15.0-linux-x64 /usr/local/bin/katago
```

**For Windows:**
Download `katago-v1.15.0-windows-x64.zip` and extract to a known location.

### 2. Download Model

Download a KataGo model file:

```bash
# Recommended model (good balance of speed and strength)
wget https://github.com/lightvector/KataGo/releases/download/v1.15.0/b18c384nbt-s1184076672-d1665968314.bin.gz

# Or use a smaller/faster model
wget https://github.com/lightvector/KataGo/releases/download/v1.15.0/b10c128nbt-s1663028736-d1665968314.bin.gz
```

Place the model in a known location, e.g., `/models/katago/` or `C:\models\katago\`.

### 3. Verify Installation

Test that KataGo works:

```bash
katago --version
```

You should see version information.

## Configuration

### 1. Copy Environment Template

```bash
cd backend
cp .env.example .env
```

### 2. Configure KataGo

Edit `.env` and set:

```env
# Enable KataGo
KATAGO_ENABLED=true

# Path to KataGo executable
KATAGO_BINARY_PATH=/usr/local/bin/katago

# Path to model file
KATAGO_MODEL_PATH=/models/katago/b18c384nbt-s1184076672-d1665968314.bin.gz

# Optional: Path to config file
KATAGO_CONFIG_PATH=
```

**Windows example:**
```env
KATAGO_ENABLED=true
KATAGO_BINARY_PATH=C:\katago\katago.exe
KATAGO_MODEL_PATH=C:\models\katago\b18c384nbt-s1184076672-d1665968314.bin.gz
```

### 3. Start Backend

```bash
cd backend
./start.sh
```

Or manually:

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Verification

### 1. Check Backend Status

```bash
curl http://localhost:8000/
```

Should return:
```json
{
  "service": "satori-backend",
  "version": "0.1.0",
  "status": "running",
  "katago_enabled": true
}
```

### 2. Check Analysis Status

```bash
curl http://localhost:8000/analysis/status
```

Should return:
```json
{
  "service": "analysis",
  "status": "available",
  "engine": "katago",
  "message": "KataGo analysis available"
}
```

### 3. Test Analysis

```bash
curl -X POST http://localhost:8000/analysis/ \
  -H "Content-Type: application/json" \
  -d '{
    "board_size": 9,
    "board_state": [["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"], ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"], ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"], ["empty", "empty", "empty", "black", "empty", "empty", "empty", "empty", "empty"], ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"], ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"], ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"], ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"], ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"]],
    "player_to_move": "black",
    "komi": 7.5
  }'
```

Should return analysis with:
- `best_move`: Recommended move
- `win_rate`: Win probability
- `score_estimate`: Score prediction
- `candidate_moves`: Top moves
- `principal_variation`: Best line

## Frontend Integration

The frontend automatically connects to the backend:

1. Start backend: `cd backend && ./start.sh`
2. Start frontend: `npm run dev`
3. Open browser: `http://localhost:5173`
4. Check bottom-right corner for backend status indicator

## Troubleshooting

### KataGo Not Found

**Error:** `KataGo executable not found`

**Solution:**
- Verify `KATAGO_BINARY_PATH` is correct
- Check file permissions: `chmod +x /path/to/katago`
- Test manually: `/path/to/katago --version`

### Model Not Found

**Error:** `KataGo model not found`

**Solution:**
- Verify `KATAGO_MODEL_PATH` is correct
- Check file exists: `ls -lh /path/to/model.bin.gz`
- Download model if missing

### Analysis Timeout

**Error:** `KataGo analysis timeout`

**Solution:**
- Increase timeout in configuration
- Use fewer visits: `max_visits=50` instead of 100
- Use smaller model for faster analysis

### Engine Crash

**Error:** `KataGo process ended unexpectedly`

**Solution:**
- Check KataGo logs
- Verify model compatibility
- Try restarting backend
- Check system resources (RAM, CPU)

## Performance

### Resource Usage

Typical resource usage:
- **Memory:** 2-4 GB (depends on model size)
- **CPU:** 1-4 cores (depends on visits)
- **Analysis time:** 1-10 seconds (depends on visits and position complexity)

### Optimization

**For faster analysis:**
- Use smaller model (b10c128nbt)
- Reduce `max_visits` to 50
- Use fewer candidate moves

**For stronger analysis:**
- Use larger model (b18c384nbt)
- Increase `max_visits` to 200+
- Allow more time

## API Reference

### POST /analysis/

Analyze a Go position.

**Request:**
```json
{
  "board_size": 19,
  "board_state": [["empty", "black", ...], ...],
  "player_to_move": "black",
  "komi": 7.5,
  "move_history": [
    {"color": "black", "position": {"x": 3, "y": 3}, "move_number": 1}
  ],
  "max_visits": 100
}
```

**Response:**
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
  "candidate_moves": [
    {
      "position": {"x": 15, "y": 3},
      "win_rate": 0.524,
      "score_estimate": 1.8,
      "visits": 100
    }
  ],
  "principal_variation": [
    {"x": 15, "y": 3},
    {"x": 3, "y": 15}
  ]
}
```

### GET /analysis/status

Check analysis service status.

**Response:**
```json
{
  "service": "analysis",
  "status": "available",
  "engine": "katago",
  "message": "KataGo analysis available"
}
```

## Testing

### Unit Tests

Run unit tests (no KataGo required):

```bash
cd backend
pytest tests/test_katago.py -v
```

### Integration Tests

Run integration tests (requires KataGo):

```bash
cd backend
export KATAGO_EXECUTABLE=/usr/local/bin/katago
export KATAGO_MODEL=/models/katago/model.bin.gz
pytest tests/test_katago.py -m integration -v
```

## Architecture

```
Frontend (React)
    ↓
FastAPI Backend
    ↓
KataGoService
    ↓
KataGoEngine
    ↓
KataGoProtocol
    ↓
KataGo Process (subprocess)
```

### Components

- **KataGoService**: High-level API, handles conversion
- **KataGoEngine**: Process management, concurrent requests
- **KataGoProtocol**: GTP protocol communication
- **KataGo Process**: Actual KataGo engine

## Limitations

- KataGo must be installed separately
- Model files are large (100MB+)
- Analysis requires significant CPU/RAM
- Not suitable for very large boards (>25x25)
- Some positions may timeout with high visit counts

## Support

For KataGo issues:
- [KataGo GitHub](https://github.com/lightvector/KataGo)
- [KataGo Documentation](https://github.com/lightvector/KataGo/blob/master/cpp/README.md)

For Satori integration issues:
- Check backend logs
- Verify configuration
- Test KataGo manually
- Review API documentation
