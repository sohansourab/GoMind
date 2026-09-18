import { GameSummary } from '../../storage/types';
import { Color } from '../../game/types';
import { generateDefaultGameName } from '../../storage/api';

interface GameCardProps {
  game: GameSummary;
  onContinue?: (gameId: string) => void;
  onReview?: (gameId: string) => void;
  onDelete: (game: GameSummary) => void;
  onRename: (gameId: string) => void;
}

export function GameCard({ game, onContinue, onReview, onDelete, onRename }: GameCardProps) {
  const displayName = game.name || generateDefaultGameName({
    id: game.id,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
    isCompleted: game.isCompleted,
    size: game.size,
    ruleset: 'chinese',
    komi: 7.5,
    playerMode: game.playerMode,
    aiDifficulty: game.aiDifficulty,
    gameState: {} as any,
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResultText = () => {
    if (!game.isCompleted || !game.winner) return null;

    if (game.playerMode === 'human-vs-computer') {
      // Human is always Black
      const humanWon = game.winner === Color.BLACK;
      return humanWon ? 'You Win!' : 'You Lose';
    } else {
      return game.winner === Color.BLACK ? 'Black Wins' : 'White Wins';
    }
  };

  const getResultDetail = () => {
    if (!game.isCompleted || !game.winReason) return null;

    if (game.winReason === 'resignation') {
      return 'by resignation';
    } else if (game.margin !== undefined) {
      return `by ${game.margin} points`;
    }
    return null;
  };

  return (
    <div className={`game-card ${game.isCompleted ? 'completed' : 'active'}`}>
      <div className="game-card-header">
        <div className="game-card-title">
          <h4>{displayName}</h4>
          <button 
            className="btn-icon" 
            onClick={() => onRename(game.id)}
            title="Rename game"
          >
            ✏️
          </button>
        </div>
        <div className="game-card-meta">
          <span className="badge">{game.size}×{game.size}</span>
          {game.aiDifficulty && (
            <span className="badge">{game.aiDifficulty}</span>
          )}
          <span className="badge">
            {game.playerMode === 'human-vs-computer' ? 'vs Computer' : 'vs Human'}
          </span>
        </div>
      </div>

      <div className="game-card-info">
        <div className="info-row">
          <span className="label">Moves:</span>
          <span className="value">{game.moveCount}</span>
        </div>
        <div className="info-row">
          <span className="label">Created:</span>
          <span className="value">{formatDate(game.createdAt)}</span>
        </div>
        <div className="info-row">
          <span className="label">Updated:</span>
          <span className="value">{formatDate(game.updatedAt)}</span>
        </div>
        {game.isCompleted && (
          <>
            <div className="info-row result">
              <span className="label">Result:</span>
              <span className="value">{getResultText()}</span>
            </div>
            {getResultDetail() && (
              <div className="info-row">
                <span className="label"></span>
                <span className="value">{getResultDetail()}</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="game-card-actions">
        {!game.isCompleted && onContinue && (
          <button 
            className="btn btn-primary"
            onClick={() => onContinue(game.id)}
          >
            Continue
          </button>
        )}
        {game.isCompleted && onReview && (
          <button 
            className="btn btn-primary"
            onClick={() => onReview(game.id)}
          >
            Review
          </button>
        )}
        <button 
          className="btn btn-danger"
          onClick={() => onDelete(game)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
