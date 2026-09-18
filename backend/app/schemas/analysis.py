"""
Analysis API schemas
"""
from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum


class StoneColor(str, Enum):
    """Stone color enumeration"""
    BLACK = "black"
    WHITE = "white"
    EMPTY = "empty"


class BoardPosition(BaseModel):
    """Position on the board"""
    x: int = Field(..., ge=0, description="X coordinate (0-indexed)")
    y: int = Field(..., ge=0, description="Y coordinate (0-indexed)")


class Move(BaseModel):
    """A single move in the game"""
    color: StoneColor = Field(..., description="Color of the stone played")
    position: Optional[BoardPosition] = Field(None, description="Position where stone was placed (null for pass)")
    move_number: int = Field(..., ge=1, description="Move number (1-indexed)")


class AnalysisRequest(BaseModel):
    """
    Request schema for position analysis.
    
    This defines the contract for future KataGo integration.
    """
    board_size: int = Field(..., ge=2, le=25, description="Board size (e.g., 9, 13, 19)")
    board_state: List[List[StoneColor]] = Field(
        ..., 
        description="2D array representing the board state"
    )
    player_to_move: StoneColor = Field(..., description="Whose turn it is")
    komi: float = Field(default=7.5, ge=0, description="Komi value")
    move_history: Optional[List[Move]] = Field(None, description="Optional move history")
    
    # Analysis configuration
    analysis_type: str = Field(
        default="standard",
        description="Type of analysis (standard, deep, quick)"
    )
    max_visits: Optional[int] = Field(
        None, 
        ge=1, 
        description="Maximum number of visits for analysis"
    )


class CandidateMove(BaseModel):
    """A candidate move with evaluation"""
    position: BoardPosition = Field(..., description="Move position")
    win_rate: float = Field(..., ge=0, le=1, description="Win rate (0-1)")
    score_estimate: float = Field(..., description="Score estimate")
    visits: int = Field(..., ge=0, description="Number of visits")


class AnalysisResponse(BaseModel):
    """
    Response schema for position analysis.
    
    This defines the contract for future KataGo integration.
    """
    status: str = Field(..., description="Status of the analysis (ok, error, not_implemented)")
    message: Optional[str] = Field(None, description="Status message")
    
    # Analysis results (will be populated when KataGo is integrated)
    best_move: Optional[CandidateMove] = Field(None, description="Best move")
    win_rate: Optional[float] = Field(None, ge=0, le=1, description="Current position win rate")
    score_estimate: Optional[float] = Field(None, description="Current position score estimate")
    candidate_moves: Optional[List[CandidateMove]] = Field(
        None, 
        description="Top candidate moves"
    )
    principal_variation: Optional[List[BoardPosition]] = Field(
        None, 
        description="Principal variation (sequence of moves)"
    )


class AnalysisNotImplementedResponse(BaseModel):
    """Response when analysis is not yet implemented"""
    status: str = Field(default="not_implemented")
    message: str = Field(default="Analysis endpoint is not yet implemented. KataGo integration pending.")
    endpoint: str = Field(default="/analysis")
