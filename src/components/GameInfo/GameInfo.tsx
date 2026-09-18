import React from 'react';
import { Color, GameState } from '../../game/types';

interface GameInfoProps {
  gameState: GameState;
  lastMoveMessage: string | null;
  reviewMode: boolean;
  reviewMoveIndex: number;
}

export function GameInfo({ gameState, lastMoveMessage, reviewMode, reviewMoveIndex }: GameInfoProps) {
  const { currentPlayer, blackCaptures, whiteCaptures, isGameOver, winner, winReason, moveHistory } = gameState;

  return (
    <div className="game-info">
      {!isGameOver && (
        <div className="turn-indicator">
          <div className={`stone-icon ${currentPlayer === Color.BLACK ? 'black' : 'white'}`} />
          <span className="turn-text">
            {reviewMode ? 'Review Mode' : `${currentPlayer === Color.BLACK ? 'Black' : 'White'} to play`}
          </span>
        </div>
      )}

      {isGameOver && (
        <div className="game-over-indicator">
          <span className="game-over-text">
            {winReason === 'resignation'
              ? `${winner === Color.BLACK ? 'Black' : 'White'} wins by resignation`
              : 'Game Over - Scoring...'
            }
          </span>
        </div>
      )}

      <div className="captures">
        <div className="capture-item">
          <div className="stone-icon black small" />
          <span>Black captures: {blackCaptures}</span>
        </div>
        <div className="capture-item">
          <div className="stone-icon white small" />
          <span>White captures: {whiteCaptures}</span>
        </div>
      </div>

      <div className="move-count">
        Move {moveHistory.length} | Board: {gameState.size}×{gameState.size} | Komi: {gameState.komi}
      </div>

      {lastMoveMessage && (
        <div className="error-message">
          {lastMoveMessage}
        </div>
      )}

      {reviewMode && (
        <div className="review-info">
          Viewing move {reviewMoveIndex} of {moveHistory.length}
        </div>
      )}
    </div>
  );
}
