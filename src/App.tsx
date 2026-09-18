import React, { useState, useMemo, useCallback } from 'react';
import { useGoGame } from './hooks/useGoGame';
import { GoBoard } from './components/GoBoard/GoBoard';
import { GameControls } from './components/GameControls/GameControls';
import { MoveHistory } from './components/MoveHistory/MoveHistory';
import { ScorePanel } from './components/ScorePanel/ScorePanel';
import { NewGameDialog } from './components/NewGameDialog/NewGameDialog';
import { GameOverDialog } from './components/GameOverDialog/GameOverDialog';
import { Rulebook } from './components/Rulebook/Rulebook';
import { PlayerPanel } from './components/PlayerPanel/PlayerPanel';
import { GameStatus } from './components/GameStatus/GameStatus';
import { SgfImportDialog } from './components/SgfImportDialog/SgfImportDialog';
import { Stone, Color, Position, GameState } from './game/types';
import { getLastMove } from './game/gameState';
import { downloadSgf } from './sgf';

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
    handleLoadGameState,
    handleReviewPrevious,
    handleReviewNext,
    handleReviewJumpTo,
    handleExitReview,
  } = useGoGame();

  const [showNewGameDialog, setShowNewGameDialog] = useState(false);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [gameOverShown, setGameOverShown] = useState(false);
  const [showRulebook, setShowRulebook] = useState(false);
  const [showSgfImportDialog, setShowSgfImportDialog] = useState(false);

  React.useEffect(() => {
    if (gameState.isGameOver && !gameOverShown) {
      setShowGameOverDialog(true);
      setGameOverShown(true);
    }
    if (!gameState.isGameOver) {
      setGameOverShown(false);
    }
  }, [gameState.isGameOver, gameOverShown]);

  const handleExportSgf = useCallback(() => {
    downloadSgf(gameState);
  }, [gameState]);

  const handleImportSgf = useCallback((state: GameState) => {
    handleLoadGameState(state);
    setShowSgfImportDialog(false);
  }, [handleLoadGameState]);

  const lastMovePosition = useMemo((): Position | null => {
    if (reviewMode) return null;
    const lastMove = getLastMove(gameState);
    if (!lastMove || lastMove.type !== 'play') return null;
    return lastMove.position;
  }, [gameState, reviewMode]);

  const currentPlayerStone = gameState.currentPlayer === Color.BLACK ? Stone.BLACK : Stone.WHITE;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <span className="title-go">Satori</span>
          <span className="title-subtitle">The Game of Go</span>
        </div>
        <div className="header-actions">
          <span className="board-size-badge">{gameState.size}×{gameState.size}</span>
          <button className="btn btn-header" onClick={() => setShowNewGameDialog(true)}>
            New Game
          </button>
        </div>
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
          <button
            className="rulebook-icon-btn"
            onClick={() => setShowRulebook(!showRulebook)}
            title={showRulebook ? 'Hide Rules' : 'How to Play'}
          >
            <span className="rulebook-icon-svg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </span>
            <span className="rulebook-icon-label">
              {showRulebook ? 'Hide Rules' : 'Rules'}
            </span>
          </button>
          {showRulebook && (
            <div className="rulebook-container">
              <Rulebook />
            </div>
          )}
        </div>

        <div className="sidebar">
          {/* Player Panels */}
          <PlayerPanel
            color={Color.BLACK}
            label="Black"
            captures={gameState.blackCaptures}
            isActive={!gameState.isGameOver && gameState.currentPlayer === Color.BLACK && !reviewMode}
          />
          <PlayerPanel
            color={Color.WHITE}
            label={gameState.playerMode === 'human-vs-computer' ? 'Computer' : 'White'}
            captures={gameState.whiteCaptures}
            isActive={!gameState.isGameOver && gameState.currentPlayer === Color.WHITE && !reviewMode}
            isThinking={isAiThinking && gameState.currentPlayer === Color.WHITE}
          />

          {/* Game Status */}
          <GameStatus
            gameState={gameState}
            reviewMode={reviewMode}
            reviewMoveIndex={reviewMoveIndex}
            lastMoveMessage={lastMoveMessage}
            isAiThinking={isAiThinking}
          />

          {/* Controls */}
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
            onExportSgf={handleExportSgf}
            onImportSgf={() => setShowSgfImportDialog(true)}
          />

          {/* Score (when game over) */}
          {gameState.isGameOver && score && (
            <ScorePanel
              score={score}
              winner={gameState.winner}
              winReason={gameState.winReason}
            />
          )}

          {/* Move History */}
          <MoveHistory
            gameState={gameState}
            reviewMode={reviewMode}
            reviewMoveIndex={reviewMoveIndex}
            onJumpToMove={handleReviewJumpTo}
          />
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-credit">
          <span>with</span>
          <span className="footer-heart">❤</span>
          <span>created by</span>
          <span className="footer-name">sohan</span>
        </div>
      </footer>

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

      {showSgfImportDialog && (
        <SgfImportDialog
          onImport={handleImportSgf}
          onClose={() => setShowSgfImportDialog(false)}
        />
      )}
    </div>
  );
}
