import React from 'react';
import { Color, AiDifficulty } from '../../game/types';
import type { AiStatus } from '../../ai/types';

interface PlayerPanelProps {
  color: Color;
  label: string;
  captures: number;
  isActive: boolean;
  isAiThinking?: boolean;
  isAi?: boolean;
  aiStatus?: AiStatus;
  aiDifficulty?: AiDifficulty;
}

export function PlayerPanel({ 
  color, 
  label, 
  captures, 
  isActive, 
  isAiThinking,
  isAi = false,
  aiStatus = 'idle',
  aiDifficulty
}: PlayerPanelProps) {
  const isBlack = color === Color.BLACK;

  const getStatusText = () => {
    if (!isAi) return null;
    
    switch (aiStatus) {
      case 'thinking':
        return 'Thinking…';
      case 'playing':
        return 'Playing';
      case 'idle':
        return 'Ready';
      case 'game-over':
        return 'Game Over';
      case 'error':
        return 'Error';
      default:
        return null;
    }
  };

  const statusText = getStatusText();

  return (
    <div className={`player-panel ${isActive ? 'active' : ''}`}>
      <div className="player-panel-header">
        <div className="player-panel-name">
          <div className={`player-stone ${isBlack ? 'black' : 'white'}`} />
          <div>
            <div className="player-label">{isBlack ? 'Black' : 'White'}</div>
            <div className="player-name">
              {label}
              {isAi && aiDifficulty && (
                <span className="player-ai-badge">AI</span>
              )}
            </div>
          </div>
        </div>
        <div className="turn-indicator" title={isActive ? 'Active turn' : ''} />
      </div>
      <div className="player-stats">
        <div className="player-stat">
          <span className="player-stat-label">Captures</span>
          <span className="player-stat-value">{captures}</span>
        </div>
        {isAi && aiDifficulty && (
          <div className="player-stat">
            <span className="player-stat-label">Difficulty</span>
            <span className="player-stat-value player-difficulty">
              {aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)}
            </span>
          </div>
        )}
        {statusText && (
          <div className="player-stat">
            <span className="player-stat-label">Status</span>
            <span className={`player-stat-value player-status player-status-${aiStatus}`}>
              {statusText}
            </span>
          </div>
        )}
        {!isAi && isAiThinking && isActive && (
          <div className="player-stat">
            <span className="player-stat-label">Status</span>
            <span className="player-stat-value" style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>
              Thinking…
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
