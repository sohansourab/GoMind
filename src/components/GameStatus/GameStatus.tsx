import React from 'react';
import { Color, GameState } from '../../game/types';

interface GameStatusProps {
  gameState: GameState;
  reviewMode: boolean;
  reviewMoveIndex: number;
  lastMoveMessage: string | null;
}

export function GameStatus({ gameState, reviewMode, reviewMoveIndex, lastMoveMessage }: GameStatusProps) {
  const { currentPlayer, isGameOver, winner, winReason, moveHistory } = gameState;

  let statusText = '';
  let isAccent = false;

  if (reviewMode) {
    statusText = `Review · Move ${reviewMoveIndex} of ${moveHistory.length}`;
  } else if (isGameOver) {
    if (winReason === 'resignation') {
      const resignedPlayer = winner === Color.BLACK ? 'White' : 'Black';
      statusText = `${resignedPlayer} resigned · ${winner === Color.BLACK ? 'Black' : 'White'} wins`;
    } else {
      statusText = 'Game Over';
    }
    isAccent = true;
  } else {
    statusText = `${currentPlayer === Color.BLACK ? 'Black' : 'White'} to move`;
  }

  return (
    <div className="game-status">
      <div className={`game-status-text ${isAccent ? 'accent' : ''}`}>
        {statusText}
      </div>
      {lastMoveMessage && (
        <div className="error-message" style={{ marginTop: '8px' }}>
          {lastMoveMessage}
        </div>
      )}
    </div>
  );
}
