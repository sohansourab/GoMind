"""
Health check endpoint
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint to verify backend is running.
    
    Returns:
        dict: Status information
    """
    return {
        "status": "ok",
        "service": "satori-backend"
    }
