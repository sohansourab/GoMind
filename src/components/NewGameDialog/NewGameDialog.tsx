import React, { useState } from 'react';
import { GameConfig } from '../../game/types';

interface NewGameDialogProps {
  onNewGame: (config: GameConfig) => void;
  onClose: () => void;
}

export function NewGameDialog({ onNewGame, onClose }: NewGameDialogProps) {
  const [size, setSize] = useState<number>(9);
  const [komi, setKomi] = useState<number>(7.5);

  const handleStart = () => {
    onNewGame({
      size,
      komi,
      ruleset: 'chinese',
    });
    onClose();
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <h2>New Game</h2>

        <div className="dialog-section">
          <label className="dialog-label">Board Size</label>
          <div className="board-size-options">
            {[9, 13, 19].map(s => (
              <label key={s} className={`radio-option ${size === s ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="boardSize"
                  value={s}
                  checked={size === s}
                  onChange={() => setSize(s)}
                />
                <span>{s}×{s}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="dialog-section">
          <label className="dialog-label">Rules</label>
          <div className="rules-display">Chinese (Area Scoring)</div>
        </div>

        <div className="dialog-section">
          <label className="dialog-label">Komi</label>
          <input
            type="number"
            className="komi-input"
            value={komi}
            step={0.5}
            min={0}
            max={20}
            onChange={e => setKomi(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="dialog-section">
          <label className="dialog-label">Players</label>
          <div className="rules-display">Human vs Human</div>
        </div>

        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleStart}>Start Game</button>
        </div>
      </div>
    </div>
  );
}
