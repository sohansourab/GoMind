import React, { useState, useMemo } from 'react';
import { useGoGame } from './hooks/useGoGame';
import { GoBoard } from './components/GoBoard/GoBoard';
import { GameInfo } from './components/GameInfo/GameInfo';
import { GameControls } from './components/GameControls/GameControls';
import { MoveHistory } from './components/MoveHistory/MoveHistory';
import { ScorePanel } from './components/ScorePanel/ScorePanel';
import { NewGameDialog } from './components/NewGameDialog/NewGameDialog';
import { GameOverDialog } from './components/GameOverDialog/GameOverDialog';
import { Stone, Color, Position } from './game/types';
import { getLastMove } from './game/gameState';

export default function App() {
  const {
    gameState,
    reviewMode,
    reviewMoveIndex,
    reviewBoard,
    lastMoveMessage,
    score,
    isAiThinking,
    handleIntersectionClick,
    handlePass,
    handleResign,
    handleNewGame,
    handleReviewPrevious,
    handleReviewNext,
    handleReviewJumpTo,
    handleExitReview,
  } = useGoGame();

  const [showNewGameDialog, setShowNewGameDialog] = useState(false);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [gameOverShown, setGameOverShown] = useState(false);

  // Show game over dialog when game ends
  React.useEffect(() => {
    if (gameState.isGameOver && !gameOverShown) {
      setShowGameOverDialog(true);
      setGameOverShown(true);
    }
    if (!gameState.isGameOver) {
      setGameOverShown(false);
    }
  }, [gameState.isGameOver, gameOverShown]);

  const lastMovePosition = useMemo((): Position | null => {
    if (reviewMode) return null;
    const lastMove = getLastMove(gameState);
    if (!lastMove || lastMove.type !== 'play') return null;
    return lastMove.position;
  }, [gameState, reviewMode]);

  const currentPlayerStone = gameState.currentPlayer === Color.BLACK ? Stone.BLACK : Stone.WHITE;
  const isVsComputer = gameState.playerMode === 'human-vs-computer';

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          <span className="title-go">GO</span>
          <span className="title-jp">囲碁</span>
        </h1>
        <button className="btn btn-new-game-header" onClick={() => setShowNewGameDialog(true)}>
          New Game
        </button>
      </header>

      <main className="app-main">
        <div className="board-section">
          <div className="board-container">
            <GoBoard
              board={reviewBoard}
              size={gameState.size}
              onIntersectionClick={handleIntersectionClick}
              lastMovePosition={lastMovePosition}
              currentPlayer={currentPlayerStone}
              disabled={gameState.isGameOver || reviewMode || isAiThinking}
            />
          </div>
          {isAiThinking && (
            <div className="ai-thinking-indicator">
              <span className="thinking-dots">
                <span></span><span></span><span></span>
              </span>
              Computer is thinking...
            </div>
          )}
        </div>

        <div className="sidebar">
          <GameInfo
            gameState={gameState}
            lastMoveMessage={lastMoveMessage}
            reviewMode={reviewMode}
            reviewMoveIndex={reviewMoveIndex}
            isAiThinking={isAiThinking}
          />

          <GameControls
            gameState={gameState}
            reviewMode={reviewMode}
            isAiThinking={isAiThinking}
            onPass={handlePass}
            onResign={handleResign}
            onNewGame={() => setShowNewGameDialog(true)}
            onReviewPrevious={handleReviewPrevious}
            onReviewNext={handleReviewNext}
            onExitReview={handleExitReview}
          />

          {gameState.isGameOver && score && (
            <ScorePanel
              score={score}
              winner={gameState.winner}
              winReason={gameState.winReason}
            />
          )}

          <MoveHistory
            gameState={gameState}
            reviewMode={reviewMode}
            reviewMoveIndex={reviewMoveIndex}
            onJumpToMove={handleReviewJumpTo}
          />
        </div>
      </main>

      {showNewGameDialog && (
        <NewGameDialog
          onNewGame={(config) => {
            handleNewGame(config);
            setShowNewGameDialog(false);
            setShowGameOverDialog(false);
          }}
          onClose={() => setShowNewGameDialog(false)}
        />
      )}

      {showGameOverDialog && gameState.isGameOver && (
        <GameOverDialog
          gameState={gameState}
          score={score}
          onNewGame={() => {
            setShowGameOverDialog(false);
            setShowNewGameDialog(true);
          }}
          onClose={() => setShowGameOverDialog(false)}
        />
      )}
    </div>
  );
}
