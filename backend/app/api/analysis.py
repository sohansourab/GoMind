"""
Analysis API endpoint
"""
from fastapi import APIRouter, HTTPException, status
from app.schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    AnalysisNotImplementedResponse
)
from app.config import settings

router = APIRouter()


@router.post(
    "/",
    response_model=AnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze a Go position",
    description="""
    Analyze a Go position and return evaluation data.
    
    **Note:** This endpoint is not yet implemented. KataGo integration is pending.
    
    When implemented, this endpoint will:
    - Accept a board position and game state
    - Run KataGo analysis
    - Return win rates, score estimates, candidate moves, and principal variations
    """
)
async def analyze_position(request: AnalysisRequest):
    """
    Analyze a Go position.
    
    Currently returns a "not implemented" response.
    Will be connected to KataGo in a future phase.
    """
    # Check if KataGo is enabled
    if not settings.katago_enabled:
        return AnalysisResponse(
            status="not_implemented",
            message="Analysis endpoint is not yet implemented. KataGo integration pending."
        )
    
    # Future: Implement KataGo analysis here
    # For now, return not implemented
    return AnalysisResponse(
        status="not_implemented",
        message="Analysis endpoint is not yet implemented. KataGo integration pending."
    )


@router.get(
    "/status",
    summary="Get analysis service status",
    description="Check if the analysis service is available"
)
async def analysis_status():
    """
    Get the status of the analysis service.
    """
    return {
        "service": "analysis",
        "status": "not_implemented",
        "engine": "none",
        "message": "KataGo integration pending"
    }
