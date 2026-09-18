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
  
  // In human vs computer, human is always Black
  const humanColor = Color.BLACK;
  const humanWon = winner === humanColor;

  // Lock body scroll when modal is open
  React.useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Determine result message
  const getResultMessage = () => {
    if (winReason === 'resignation') {
      if (isVsComputer) {
        return {
          title: humanWon ? 'You Win!' : 'You Lose',
          subtitle: humanWon ? 'Computer resigned' : 'You resigned',
          isWin: humanWon,
        };
      } else {
        return {
          title: winner === Color.BLACK ? 'Black Wins' : 'White Wins',
          subtitle: 'by resignation',
          isWin: null, // Not applicable for human vs human
        };
      }
    } else if (score) {
      if (isVsComputer) {
        return {
          title: humanWon ? 'You Win!' : 'You Lose',
          subtitle: `by ${score.margin} point${score.margin !== 1 ? 's' : ''}`,
          isWin: humanWon,
        };
      } else {
        return {
          title: score.winner === Color.BLACK ? 'Black Wins' : 'White Wins',
          subtitle: `by ${score.margin} point${score.margin !== 1 ? 's' : ''}`,
          isWin: null,
        };
      }
    }
    return null;
  };

  const result = getResultMessage();

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog game-over-dialog" onClick={e => e.stopPropagation()}>
        <h2>Game Over</h2>

        <div className="dialog-content">
          {result && (
            <div className="game-over-result">
              <div className="result-text">
                <span className={`winner-announce ${result.isWin === true ? 'win' : result.isWin === false ? 'lose' : ''}`}>
                  {result.title}
                </span>
                <span className="win-method">
                  {result.subtitle}
                </span>
                {score && (
                  <div className="final-scores">
                    <div className="final-score-item">
                      <span className="player-stone black small" />
                      <span>{isVsComputer ? 'You' : 'Black'}: {score.blackTotal}</span>
                    </div>
                    <div className="final-score-item">
                      <span className="player-stone white small" />
                      <span>{isVsComputer ? 'Computer' : 'White'}: {score.whiteTotal}</span>
                    </div>
                    <div className="final-score-item">
                      <span>Komi: {score.komi}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="dialog-actions">
          <button className="btn btn-ghost" onClick={onClose}>Review Game</button>
          <button className="btn btn-primary" onClick={onNewGame}>New Game</button>
        </div>
      </div>
    </div>
  );
}
