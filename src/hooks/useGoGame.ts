/**
 * React hook for managing Go game state.
 * Connects the game engine to the React UI.
 * Handles AI turns when in human-vs-computer mode.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { GameState, GameConfig, Position, ScoreResult, Board, Color } from '../game/types';
import { createGame, playStone, pass, resign, getScore, getBoardAtMove } from '../game/gameState';
import { chooseMove, shouldPass } from '../game/ai';

export interface UseGoGameReturn {
  gameState: GameState;
  reviewMode: boolean;
  reviewMoveIndex: number;
  reviewBoard: Board;
  lastMoveMessage: string | null;
  score: ScoreResult | null;
  isAiThinking: boolean;
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
  playerMode: 'human-vs-human',
};

export function useGoGame(initialConfig?: GameConfig): UseGoGameReturn {
  const [gameState, setGameState] = useState<GameState>(() =>
    createGame(initialConfig || DEFAULT_CONFIG)
  );
  const [lastMoveMessage, setLastMoveMessage] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewMoveIndex, setReviewMoveIndex] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if it's the AI's turn
  const isAiTurn = useMemo(() => {
    if (gameState.isGameOver) return false;
    if (gameState.playerMode !== 'human-vs-computer') return false;
    // AI plays as White
    return gameState.currentPlayer === Color.WHITE;
  }, [gameState.isGameOver, gameState.playerMode, gameState.currentPlayer]);

  // AI turn handler
  useEffect(() => {
    if (!isAiTurn || reviewMode) return;

    setIsAiThinking(true);

    // Add a delay so the AI doesn't play instantly (feels more natural)
    // Hard AI takes longer to "think"
    const baseDelay = gameState.aiDifficulty === 'hard' ? 600 : 400;
    const delayVariance = gameState.aiDifficulty === 'hard' ? 600 : 400;

    aiTimeoutRef.current = setTimeout(() => {
      setGameState(prevState => {
        if (prevState.isGameOver) return prevState;
        if (prevState.currentPlayer !== Color.WHITE) return prevState;

        const difficulty = prevState.aiDifficulty;

        // Check if AI should pass
        if (shouldPass(prevState, difficulty)) {
          return pass(prevState);
        }

        // Choose and apply AI move
        const move = chooseMove(prevState, difficulty);
        if (move === null) {
          return pass(prevState);
        }

        const result = playStone(prevState, move);
        if (result.success) {
          return result.newState;
        }

        return pass(prevState);
      });
      setIsAiThinking(false);
    }, baseDelay + Math.random() * delayVariance);

    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, [isAiTurn, reviewMode]);

  const handleIntersectionClick = useCallback((pos: Position) => {
    if (reviewMode || isAiThinking) return;

    const result = playStone(gameState, pos);
    if (result.success) {
      setGameState(result.newState);
      setLastMoveMessage(null);
    } else {
      setLastMoveMessage(result.reason);
      // Clear message after 2 seconds
      setTimeout(() => setLastMoveMessage(null), 2000);
    }
  }, [gameState, reviewMode, isAiThinking]);

  const handlePass = useCallback(() => {
    if (reviewMode || isAiThinking) return;
    const newState = pass(gameState);
    setGameState(newState);
    setLastMoveMessage(null);
  }, [gameState, reviewMode, isAiThinking]);

  const handleResign = useCallback(() => {
    if (reviewMode || isAiThinking) return;
    const newState = resign(gameState);
    setGameState(newState);
    setLastMoveMessage(null);
  }, [gameState, reviewMode, isAiThinking]);

  const handleNewGame = useCallback((config: GameConfig) => {
    setGameState(createGame(config));
    setLastMoveMessage(null);
    setReviewMode(false);
    setReviewMoveIndex(0);
    setIsAiThinking(false);
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }
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
    isAiThinking,
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
