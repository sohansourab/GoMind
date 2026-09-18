import React, { useState } from 'react';
import { GameConfig, PlayerMode, AiDifficulty } from '../../game/types';

interface NewGameDialogProps {
  onNewGame: (config: GameConfig) => void;
  onClose: () => void;
}

const DIFFICULTY_INFO: Record<AiDifficulty, { label: string; emoji: string; description: string }> = {
  easy: {
    label: 'Easy',
    emoji: '🌱',
    description: 'Random play. Great for learning.',
  },
  medium: {
    label: 'Medium',
    emoji: '⚔️',
    description: 'Balanced play with strategy.',
  },
  hard: {
    label: 'Hard',
    emoji: '🐉',
    description: 'Strong play with look-ahead.',
  },
};

export function NewGameDialog({ onNewGame, onClose }: NewGameDialogProps) {
  const [size, setSize] = useState<number>(9);
  const [komi, setKomi] = useState<number>(7.5);
  const [playerMode, setPlayerMode] = useState<PlayerMode>('human-vs-human');
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>('medium');

  const handleStart = () => {
    onNewGame({
      size,
      komi,
      ruleset: 'chinese',
      playerMode,
      aiDifficulty,
    });
    onClose();
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <h2>New Game</h2>

        <div className="dialog-section">
          <label className="dialog-label">Board</label>
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
          <label className="dialog-label">Players</label>
          <div className="player-mode-options">
            <label
              className={`radio-option ${playerMode === 'human-vs-human' ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="playerMode"
                value="human-vs-human"
                checked={playerMode === 'human-vs-human'}
                onChange={() => setPlayerMode('human-vs-human')}
              />
              <span>Human vs Human</span>
            </label>
            <label
              className={`radio-option ${playerMode === 'human-vs-computer' ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="playerMode"
                value="human-vs-computer"
                checked={playerMode === 'human-vs-computer'}
                onChange={() => setPlayerMode('human-vs-computer')}
              />
              <span>Human vs Computer</span>
            </label>
          </div>
          {playerMode === 'human-vs-computer' && (
            <p className="dialog-hint">You play as Black (●). Computer plays as White (○).</p>
          )}
        </div>

        {playerMode === 'human-vs-computer' && (
          <div className="dialog-section">
            <label className="dialog-label">Difficulty</label>
            <div className="difficulty-options">
              {(['easy', 'medium', 'hard'] as AiDifficulty[]).map(diff => {
                const info = DIFFICULTY_INFO[diff];
                return (
                  <label
                    key={diff}
                    className={`difficulty-option ${aiDifficulty === diff ? 'selected' : ''} difficulty-${diff}`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={diff}
                      checked={aiDifficulty === diff}
                      onChange={() => setAiDifficulty(diff)}
                    />
                    <div className="difficulty-content">
                      <span className="difficulty-emoji">{info.emoji}</span>
                      <div className="difficulty-text">
                        <span className="difficulty-name">{info.label}</span>
                        <span className="difficulty-desc">{info.description}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

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

        <div className="dialog-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleStart}>Start Game</button>
        </div>
      </div>
    </div>
  );
}
