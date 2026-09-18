import React from 'react';
import { Color } from '../../game/types';

interface PlayerPanelProps {
  color: Color;
  label: string;
  captures: number;
  isActive: boolean;
  isThinking?: boolean;
}

export function PlayerPanel({ 
  color, 
  label, 
  captures, 
  isActive, 
  isThinking = false,
}: PlayerPanelProps) {
  const isBlack = color === Color.BLACK;

  return (
    <div className={`player-panel ${isActive ? 'active' : ''}`}>
      <div className="player-panel-header">
        <div className="player-panel-name">
          <div className={`player-stone ${isBlack ? 'black' : 'white'}`} />
          <div>
            <div className="player-label">{isBlack ? 'Black' : 'White'}</div>
            <div className="player-name">
              {label}
              {isThinking && <span className="thinking-indicator"> thinking...</span>}
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
      </div>
    </div>
  );
}
