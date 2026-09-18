import React from 'react';
import { Color, ScoreResult } from '../../game/types';

interface ScorePanelProps {
  score: ScoreResult;
  winner: Color | null;
  winReason: 'resignation' | 'score' | null;
}

export function ScorePanel({ score, winner, winReason }: ScorePanelProps) {
  return (
    <div className="score-panel">
      <h3>Final Score</h3>
      <div className="score-grid">
        <div className="score-header"></div>
        <div className="score-header">Black</div>
        <div className="score-header">White</div>

        <div className="score-label">Stones</div>
        <div className="score-value">{score.blackStones}</div>
        <div className="score-value">{score.whiteStones}</div>

        <div className="score-label">Territory</div>
        <div className="score-value">{score.blackTerritory}</div>
        <div className="score-value">{score.whiteTerritory}</div>

        <div className="score-label">Komi</div>
        <div className="score-value">—</div>
        <div className="score-value">{score.komi}</div>

        <div className="score-label total">Total</div>
        <div className="score-value total">{score.blackTotal}</div>
        <div className="score-value total">{score.whiteTotal}</div>
      </div>

      <div className="score-result">
        <span className="winner-badge">
          {winner === Color.BLACK ? '● Black' : '○ White'} wins by {score.margin} point{score.margin !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
