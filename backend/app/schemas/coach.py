"""
Coach API schemas
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum

from .analysis import AnalysisResponse, BoardPosition, StoneColor


class CoachingContext(str, Enum):
    """Context for coaching request"""
    MOVE_EXPLANATION = "move_explanation"
    POSITION_ANALYSIS = "position_analysis"
    GAME_REVIEW = "game_review"
    STRATEGY_ADVICE = "strategy_advice"
    MISTAKE_EXPLANATION = "mistake_explanation"


class CoachRequest(BaseModel):
    """
    Request schema for AI coaching.
    
    This defines the contract for future Gemini integration.
    """
    context: CoachingContext = Field(..., description="Type of coaching request")
    
    # Game/position context
    board_size: int = Field(..., ge=2, le=25, description="Board size")
    board_state: List[List[StoneColor]] = Field(..., description="Current board state")
    player_to_move: StoneColor = Field(..., description="Whose turn it is")
    komi: float = Field(default=7.5, description="Komi value")
    
    # Move information (for move-specific coaching)
    move_position: Optional[BoardPosition] = Field(
        None, 
        description="Position of the move being discussed"
    )
    move_color: Optional[StoneColor] = Field(
        None, 
        description="Color of the move being discussed"
    )
    
    # Engine analysis (from KataGo, when available)
    engine_analysis: Optional[AnalysisResponse] = Field(
        None, 
        description="KataGo analysis results (when available)"
    )
    
    # User question (for interactive coaching)
    question: Optional[str] = Field(
        None, 
        max_length=500,
        description="User's question about the position or move"
    )
    
    # Coaching configuration
    language: str = Field(default="en", description="Response language")
    detail_level: str = Field(
        default="standard",
        description="Level of detail (brief, standard, detailed)"
    )


class CoachResponse(BaseModel):
    """
    Response schema for AI coaching.
    
    This defines the contract for future Gemini integration.
    """
    status: str = Field(..., description="Status of the response (ok, error, not_implemented)")
    message: Optional[str] = Field(None, description="Status message")
    
    # Coaching response (will be populated when Gemini is integrated)
    explanation: Optional[str] = Field(None, description="Coaching explanation")
    key_points: Optional[List[str]] = Field(None, description="Key coaching points")
    suggestions: Optional[List[str]] = Field(None, description="Suggestions for improvement")
    
    # Move evaluation (when applicable)
    move_quality: Optional[str] = Field(
        None,
        description="Move quality assessment (excellent, good, inaccuracy, mistake, blunder)"
    )


class CoachNotImplementedResponse(BaseModel):
    """Response when coaching is not yet implemented"""
    status: str = Field(default="not_implemented")
    message: str = Field(default="Coaching endpoint is not yet implemented. Gemini integration pending.")
    endpoint: str = Field(default="/coach")
