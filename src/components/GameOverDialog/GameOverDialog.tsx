import React from 'react';
import { Color, GameState, ScoreResult } from '../../game/types';

interface GameOverDialogProps {
  gameState: GameState;
  score: ScoreResult | null;
  onNewGame: () => void;
  onClose: () => void;
}

export function GameOverDialog({ gameState, score, onNewGame, onClose }: GameOverDialogProps) {
  const { winner, winReason, playerMode } = gameState;
  const isVsComputer = playerMode === 'human-vs-computer';
  // Human plays Black, computer plays White
  const humanWon = winner === Color.BLACK;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog game-over-dialog" onClick={e => e.stopPropagation()}>
        <h2>Game Over</h2>

        <div className="game-over-result">
          {winReason === 'resignation' ? (
            <div className="result-text">
              <span className="winner-announce">
                {isVsComputer
                  ? (humanWon ? '🎉 You win!' : 'Computer wins')
                  : `${winner === Color.BLACK ? '● Black' : '○ White'} wins`
                }
              </span>
              <span className="win-method">
                {isVsComputer
                  ? (humanWon ? 'Computer resigned' : 'You resigned')
                  : 'by resignation'
                }
              </span>
            </div>
          ) : score ? (
            <div className="result-text">
              <span className="winner-announce">
                {isVsComputer
                  ? (humanWon ? '🎉 You win!' : 'Computer wins')
                  : `${score.winner === Color.BLACK ? '● Black' : '○ White'} wins`
                }
              </span>
              <span className="win-method">
                by {score.margin} point{score.margin !== 1 ? 's' : ''}
              </span>
              <div className="final-scores">
                <div className="final-score-item">
                  <span className="stone-icon black small" />
                  <span>{isVsComputer ? 'You' : 'Black'}: {score.blackTotal}</span>
                </div>
                <div className="final-score-item">
                  <span className="stone-icon white small" />
                  <span>{isVsComputer ? 'Computer' : 'White'}: {score.whiteTotal}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onClose}>Review Game</button>
          <button className="btn btn-primary" onClick={onNewGame}>New Game</button>
        </div>
      </div>
    </div>
  );
}
