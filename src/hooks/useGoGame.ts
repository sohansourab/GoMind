/**
 * React hook for managing Go game state.
 * Connects the game engine to the React UI.
 */

import { useState, useCallback, useMemo } from 'react';
import { GameState, GameConfig, Position, ScoreResult, Board } from '../game/types';
import { createGame, playStone, pass, resign, getScore, getBoardAtMove } from '../game/gameState';

export interface UseGoGameReturn {
  gameState: GameState;
  reviewMode: boolean;
  reviewMoveIndex: number;
  reviewBoard: Board;
  lastMoveMessage: string | null;
  score: ScoreResult | null;
  // Actions
  handleIntersectionClick: (pos: Position) => void;
  handlePass: () => void;
  handleResign: () => void;
  handleNewGame: (config: GameConfig) => void;
  handleReviewPrevious: () => void;
  handleReviewNext: () => void;
  handleReviewJumpTo: (moveIndex: number) => void;
  handleExitReview: () => void;
}

const DEFAULT_CONFIG: GameConfig = {
  size: 9,
  komi: 7.5,
  ruleset: 'chinese',
};

export function useGoGame(initialConfig?: GameConfig): UseGoGameReturn {
  const [gameState, setGameState] = useState<GameState>(() =>
    createGame(initialConfig || DEFAULT_CONFIG)
  );
  const [lastMoveMessage, setLastMoveMessage] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewMoveIndex, setReviewMoveIndex] = useState(0);

  const handleIntersectionClick = useCallback((pos: Position) => {
    if (reviewMode) return;

    const result = playStone(gameState, pos);
    if (result.success) {
      setGameState(result.newState);
      setLastMoveMessage(null);
    } else {
      setLastMoveMessage(result.reason);
      // Clear message after 2 seconds
      setTimeout(() => setLastMoveMessage(null), 2000);
    }
  }, [gameState, reviewMode]);

  const handlePass = useCallback(() => {
    if (reviewMode) return;
    const newState = pass(gameState);
    setGameState(newState);
    setLastMoveMessage(null);
  }, [gameState, reviewMode]);

  const handleResign = useCallback(() => {
    if (reviewMode) return;
    const newState = resign(gameState);
    setGameState(newState);
    setLastMoveMessage(null);
  }, [gameState, reviewMode]);

  const handleNewGame = useCallback((config: GameConfig) => {
    setGameState(createGame(config));
    setLastMoveMessage(null);
    setReviewMode(false);
    setReviewMoveIndex(0);
  }, []);

  const handleReviewPrevious = useCallback(() => {
    if (!reviewMode) {
      setReviewMode(true);
      setReviewMoveIndex(gameState.moveHistory.length);
    }
    setReviewMoveIndex(prev => Math.max(0, prev - 1));
  }, [reviewMode, gameState.moveHistory.length]);

  const handleReviewNext = useCallback(() => {
    setReviewMoveIndex(prev => {
      const next = Math.min(gameState.moveHistory.length, prev + 1);
      if (next >= gameState.moveHistory.length) {
        setReviewMode(false);
      }
      return next;
    });
  }, [gameState.moveHistory.length]);

  const handleReviewJumpTo = useCallback((moveIndex: number) => {
    setReviewMode(true);
    setReviewMoveIndex(moveIndex);
  }, []);

  const handleExitReview = useCallback(() => {
    setReviewMode(false);
    setReviewMoveIndex(gameState.moveHistory.length);
  }, [gameState.moveHistory.length]);

  const reviewBoard = useMemo(() => {
    if (!reviewMode) return gameState.board;
    return getBoardAtMove(gameState, reviewMoveIndex);
  }, [reviewMode, gameState, reviewMoveIndex]);

  const score = useMemo(() => {
    if (!gameState.isGameOver) return null;
    if (gameState.winReason === 'resignation') return null;
    return getScore(gameState);
  }, [gameState]);

  return {
    gameState,
    reviewMode,
    reviewMoveIndex,
    reviewBoard,
    lastMoveMessage,
    score,
    handleIntersectionClick,
    handlePass,
    handleResign,
    handleNewGame,
    handleReviewPrevious,
    handleReviewNext,
    handleReviewJumpTo,
    handleExitReview,
  };
}
