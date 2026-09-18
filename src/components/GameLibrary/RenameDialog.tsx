import { useState, useEffect } from 'react';
import { SavedGame } from '../../storage/types';
import { generateDefaultGameName } from '../../storage/api';

interface RenameDialogProps {
  game: SavedGame;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
}

export function RenameDialog({ game, onConfirm, onCancel }: RenameDialogProps) {
  const defaultName = generateDefaultGameName(game);
  const [name, setName] = useState(game.name || '');

  useEffect(() => {
    // Focus the input when dialog opens
    const input = document.querySelector('.rename-input') as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName) {
      onConfirm(trimmedName);
    }
  };

  const handleReset = () => {
    setName('');
  };

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <h3>Rename Game</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="game-name">Game Name</label>
            <input
              id="game-name"
              type="text"
              className="rename-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={defaultName}
              maxLength={100}
            />
            <p className="form-hint">
              Leave empty to use default name: "{defaultName}"
            </p>
          </div>
          <div className="dialog-actions">
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Reset to Default
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
