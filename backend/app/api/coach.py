"""
Coach API endpoint
"""
from fastapi import APIRouter, HTTPException, status
from app.schemas.coach import (
    CoachRequest,
    CoachResponse,
    CoachNotImplementedResponse
)
from app.config import settings

router = APIRouter()


@router.post(
    "/",
    response_model=CoachResponse,
    status_code=status.HTTP_200_OK,
    summary="Get AI coaching",
    description="""
    Get AI coaching for a Go position or move.
    
    **Note:** This endpoint is not yet implemented. Gemini integration is pending.
    
    When implemented, this endpoint will:
    - Accept game context and optional engine analysis
    - Use Gemini to generate coaching explanations
    - Return strategic advice, move evaluations, and improvement suggestions
    """
)
async def get_coaching(request: CoachRequest):
    """
    Get AI coaching for a Go position or move.
    
    Currently returns a "not implemented" response.
    Will be connected to Gemini in a future phase.
    """
    # Check if Gemini is enabled
    if not settings.gemini_enabled:
        return CoachResponse(
            status="not_implemented",
            message="Coaching endpoint is not yet implemented. Gemini integration pending."
        )
    
    # Future: Implement Gemini coaching here
    # For now, return not implemented
    return CoachResponse(
        status="not_implemented",
        message="Coaching endpoint is not yet implemented. Gemini integration pending."
    )


@router.get(
    "/status",
    summary="Get coaching service status",
    description="Check if the coaching service is available"
)
async def coaching_status():
    """
    Get the status of the coaching service.
    """
    return {
        "service": "coach",
        "status": "not_implemented",
        "engine": "none",
        "message": "Gemini integration pending"
    }
