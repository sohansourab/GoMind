import React from 'react';
import { Color, GameState } from '../../game/types';

interface GameStatusProps {
  gameState: GameState;
  reviewMode: boolean;
  reviewMoveIndex: number;
  lastMoveMessage: string | null;
  isAiThinking?: boolean;
}

export function GameStatus({ gameState, reviewMode, reviewMoveIndex, lastMoveMessage, isAiThinking = false }: GameStatusProps) {
  const { currentPlayer, isGameOver, winner, winReason, moveHistory, playerMode } = gameState;

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
  } else if (isAiThinking && playerMode === 'human-vs-computer') {
    statusText = 'Computer thinking...';
    isAccent = true;
  } else {
    const playerName = playerMode === 'human-vs-computer' && currentPlayer === Color.WHITE ? 'Computer' : (currentPlayer === Color.BLACK ? 'Black' : 'White');
    statusText = `${playerName} to move`;
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
