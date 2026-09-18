import React from 'react';
import { GameState } from '../../game/types';

interface GameControlsProps {
  gameState: GameState;
  reviewMode: boolean;
  isAiThinking: boolean;
  onPass: () => void;
  onResign: () => void;
  onNewGame: () => void;
  onReviewPrevious: () => void;
  onReviewNext: () => void;
  onExitReview: () => void;
}

export function GameControls({
  gameState,
  reviewMode,
  isAiThinking,
  onPass,
  onResign,
  onNewGame,
  onReviewPrevious,
  onReviewNext,
  onExitReview,
}: GameControlsProps) {
  const controlsDisabled = gameState.isGameOver || reviewMode || isAiThinking;

  return (
    <div className="game-controls">
      <button className="btn btn-new-game" onClick={onNewGame}>
        New Game
      </button>

      {!gameState.isGameOver && !reviewMode && (
        <>
          <button
            className="btn btn-pass"
            onClick={onPass}
            disabled={isAiThinking}
          >
            Pass
          </button>
          <button
            className="btn btn-resign"
            onClick={onResign}
            disabled={isAiThinking}
          >
            Resign
          </button>
        </>
      )}

      <div className="review-controls">
        <button
          className="btn btn-review"
          onClick={onReviewPrevious}
          disabled={reviewMode ? false : gameState.moveHistory.length === 0}
        >
          ◀ Previous
        </button>
        <button
          className="btn btn-review"
          onClick={onReviewNext}
          disabled={!reviewMode}
        >
          Next ▶
        </button>
        {reviewMode && (
          <button className="btn btn-exit-review" onClick={onExitReview}>
            Exit Review
          </button>
        )}
      </div>
    </div>
  );
}
