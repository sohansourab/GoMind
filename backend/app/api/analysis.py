"""
Analysis API endpoint

Connects to KataGo for real position analysis.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    CandidateMove,
    BoardPosition
)
from app.services.katago import get_katago_service
from app.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/",
    response_model=AnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze a Go position",
    description="""
    Analyze a Go position using KataGo engine.
    
    Returns:
    - Best move recommendation
    - Win rate for current player
    - Score estimate
    - Top candidate moves
    - Principal variation (best line)
    """
)
async def analyze_position(request: AnalysisRequest):
    """
    Analyze a Go position using KataGo.
    """
    # Check if KataGo is enabled
    if not settings.katago_enabled:
        return AnalysisResponse(
            status="not_implemented",
            message="KataGo is not enabled. Set KATAGO_ENABLED=true in .env"
        )
    
    try:
        # Get KataGo service
        katago_service = get_katago_service()
        
        # Convert board state from enum to string
        board_state_str = []
        for row in request.board_state:
            board_state_str.append([stone.value for stone in row])
        
        # Convert move history
        move_history = None
        if request.move_history:
            move_history = []
            for move in request.move_history:
                move_dict = {
                    "color": move.color.value,
                    "position": None
                }
                if move.position:
                    move_dict["position"] = {
                        "x": move.position.x,
                        "y": move.position.y
                    }
                move_history.append(move_dict)
        
        # Perform analysis
        result = await katago_service.analyze_position(
            board_size=request.board_size,
            board_state=board_state_str,
            player_to_move=request.player_to_move.value,
            komi=request.komi,
            move_history=move_history,
            max_visits=request.max_visits,
            timeout=None  # Use default timeout
        )
        
        # Convert result to response format
        response = AnalysisResponse(
            status=result["status"],
            win_rate=result.get("win_rate"),
            score_estimate=result.get("score_estimate")
        )
        
        # Best move
        if result.get("best_move"):
            best = result["best_move"]
            response.best_move = CandidateMove(
                position=BoardPosition(**best["position"]),
                win_rate=best["win_rate"],
                score_estimate=best["score_estimate"],
                visits=best["visits"]
            )
        
        # Candidate moves
        if result.get("candidate_moves"):
            response.candidate_moves = [
                CandidateMove(
                    position=BoardPosition(**c["position"]),
                    win_rate=c["win_rate"],
                    score_estimate=c["score_estimate"],
                    visits=c["visits"]
                )
                for c in result["candidate_moves"]
            ]
        
        # Principal variation
        if result.get("principal_variation"):
            response.principal_variation = [
                BoardPosition(**pos) for pos in result["principal_variation"]
            ]
        
        return response
        
    except RuntimeError as e:
        logger.error(f"KataGo error: {e}")
        return AnalysisResponse(
            status="error",
            message=f"KataGo analysis failed: {str(e)}"
        )
    except ValueError as e:
        logger.error(f"Invalid request: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return AnalysisResponse(
            status="error",
            message="Internal server error during analysis"
        )


@router.get(
    "/status",
    summary="Get analysis service status",
    description="Check if KataGo analysis service is available"
)
async def analysis_status():
    """
    Get the status of the analysis service.
    """
    katago_service = get_katago_service()
    
    return {
        "service": "analysis",
        "status": "available" if katago_service.is_available else "unavailable",
        "engine": "katago" if settings.katago_enabled else "none",
        "message": "KataGo analysis available" if katago_service.is_available else "KataGo not available"
    }
