import React from 'react';
import { GameState } from '../../game/types';

interface GameControlsProps {
  gameState: GameState;
  reviewMode: boolean;
  isAiThinking?: boolean;
  onPass: () => void;
  onResign: () => void;
  onNewGame: () => void;
  onReviewPrevious: () => void;
  onReviewNext: () => void;
  onExitReview: () => void;
  onExportSgf?: () => void;
  onImportSgf?: () => void;
}

export function GameControls({
  gameState,
  reviewMode,
  isAiThinking = false,
  onPass,
  onResign,
  onNewGame,
  onReviewPrevious,
  onReviewNext,
  onExitReview,
  onExportSgf,
  onImportSgf,
}: GameControlsProps) {
  return (
    <div className="game-controls">
      {!gameState.isGameOver && !reviewMode && (
        <>
          <button
            className="btn"
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
          ← Prev
        </button>
        <button
          className="btn btn-review"
          onClick={onReviewNext}
          disabled={!reviewMode}
        >
          Next →
        </button>
        {reviewMode && (
          <button className="btn btn-exit-review" onClick={onExitReview}>
            Exit Review
          </button>
        )}
      </div>

      <div className="sgf-controls">
        {onExportSgf && (
          <button
            className="btn btn-sgf"
            onClick={onExportSgf}
            disabled={gameState.moveHistory.length === 0}
            title="Export game as SGF file"
          >
            📥 Export SGF
          </button>
        )}
        {onImportSgf && (
          <button
            className="btn btn-sgf"
            onClick={onImportSgf}
            title="Import game from SGF file"
          >
            📤 Import SGF
          </button>
        )}
      </div>
    </div>
  );
}
