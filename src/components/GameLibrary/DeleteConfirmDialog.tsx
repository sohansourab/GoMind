import { GameSummary } from '../../storage/types';
import { generateDefaultGameName } from '../../storage/api';

interface DeleteConfirmDialogProps {
  game: GameSummary;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ game, onConfirm, onCancel }: DeleteConfirmDialogProps) {
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

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <h3>Delete Game</h3>
        <p>Are you sure you want to delete this game?</p>
        <p className="dialog-game-name">{displayName}</p>
        <p className="dialog-warning">This action cannot be undone.</p>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
