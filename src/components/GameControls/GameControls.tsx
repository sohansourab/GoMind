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
  onRequestHint?: () => void;
  onClearHint?: () => void;
  hintPosition?: { x: number; y: number } | null;
  hintsEnabled?: boolean;
  isHumanTurn?: boolean;
  onExportSgf?: () => void;
  onImportSgf?: () => void;
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
  onRequestHint,
  onClearHint,
  hintPosition,
  hintsEnabled = true,
  isHumanTurn = true,
  onExportSgf,
  onImportSgf,
}: GameControlsProps) {
  const showHintButton = hintsEnabled && !gameState.isGameOver && !reviewMode && isHumanTurn && !isAiThinking;
  const hasActiveHint = hintPosition !== null;

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
          {showHintButton && onRequestHint && (
            <button
              className={`btn ${hasActiveHint ? 'btn-hint-active' : 'btn-hint'}`}
              onClick={hasActiveHint && onClearHint ? onClearHint : onRequestHint}
              disabled={isAiThinking}
              title={hasActiveHint ? 'Clear hint' : 'Get hint'}
            >
              {hasActiveHint ? '✕ Clear' : '💡 Hint'}
            </button>
          )}
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
