import React, { useRef, useEffect } from 'react';
import { GameState, Color } from '../../game/types';
import { positionToCoordinate } from '../../game/coordinates';

interface MoveHistoryProps {
  gameState: GameState;
  reviewMode: boolean;
  reviewMoveIndex: number;
  onJumpToMove: (moveIndex: number) => void;
}

export function MoveHistory({ gameState, reviewMode, reviewMoveIndex, onJumpToMove }: MoveHistoryProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const { moveHistory, size } = gameState;

  useEffect(() => {
    if (listRef.current) {
      const activeItem = listRef.current.querySelector('.move-item.active');
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [reviewMoveIndex]);

  if (moveHistory.length === 0) {
    return (
      <div className="move-history">
        <div className="move-history-header">
          <h3>Move History</h3>
        </div>
        <div className="move-history-empty">No moves yet</div>
      </div>
    );
  }

  return (
    <div className="move-history">
      <div className="move-history-header">
        <h3>Move History</h3>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
          {moveHistory.length} moves
        </span>
      </div>
      <div className="move-history-list" ref={listRef}>
        {moveHistory.map((move, index) => {
          const isActive = reviewMode && reviewMoveIndex === index + 1;
          const coordStr = move.position
            ? positionToCoordinate(move.position, size)
            : move.type === 'pass' ? 'Pass' : 'Resign';

          return (
            <div
              key={index}
              className={`move-item ${isActive ? 'active' : ''}`}
              onClick={() => onJumpToMove(index + 1)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') onJumpToMove(index + 1); }}
            >
              <span className="move-number">{move.moveNumber}.</span>
              <span className={`move-color ${move.color === Color.BLACK ? 'black' : 'white'}`}>
                {move.color === Color.BLACK ? '●' : '○'}
              </span>
              <span className="move-coord">{coordStr}</span>
              {move.capturedStones.length > 0 && (
                <span className="move-captures">+{move.capturedStones.length}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
