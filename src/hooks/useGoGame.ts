/**
 * React hook for managing Go game state.
 * Connects the game engine to the React UI.
 * Handles AI turns when in human-vs-computer mode.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { GameState, GameConfig, Position, ScoreResult, Board, Color, AiDifficulty } from '../game/types';
import { createGame, playStone, pass, resign, getScore, getBoardAtMove } from '../game/gameState';
import { chooseMove, shouldPass } from '../game/ai';
import { createAIPlayer, type AIPlayer, type AiStatus } from '../ai';

export interface AiSettings {
  thinkingSpeed: 'natural' | 'fast';
  hintsEnabled: boolean;
  explanationsEnabled: boolean;
}

export interface UseGoGameReturn {
  gameState: GameState;
  reviewMode: boolean;
  reviewMoveIndex: number;
  reviewBoard: Board;
  lastMoveMessage: string | null;
  score: ScoreResult | null;
  isAiThinking: boolean;
  aiStatus: AiStatus;
  aiPlayer: AIPlayer | null;
  hintPosition: Position | null;
  aiSettings: AiSettings;
  // Actions
  handleIntersectionClick: (pos: Position) => void;
  handlePass: () => void;
  handleResign: () => void;
  handleNewGame: (config: GameConfig) => void;
  handleLoadGameState: (state: GameState) => void;
  handleReviewPrevious: () => void;
  handleReviewNext: () => void;
  handleReviewJumpTo: (moveIndex: number) => void;
  handleExitReview: () => void;
  handleRequestHint: () => void;
  handleClearHint: () => void;
  handleUpdateAiSettings: (settings: Partial<AiSettings>) => void;
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

  // AI State Management
  const [aiStatus, setAiStatus] = useState<AiStatus>('idle');
  const [aiPlayer, setAiPlayer] = useState<AIPlayer | null>(null);
  const [hintPosition, setHintPosition] = useState<Position | null>(null);
  const [aiSettings, setAiSettings] = useState<AiSettings>({
    thinkingSpeed: 'natural',
    hintsEnabled: true,
    explanationsEnabled: true,
  });

  // Initialize AI player when game mode changes
  useEffect(() => {
    if (gameState.playerMode === 'human-vs-computer') {
      const player = createAIPlayer({ difficulty: gameState.aiDifficulty });
      setAiPlayer(player);
    } else {
      setAiPlayer(null);
    }
  }, [gameState.playerMode, gameState.aiDifficulty]);

  // Check if it's the AI's turn
  const isAiTurn = useMemo(() => {
    if (gameState.isGameOver) return false;
    if (gameState.playerMode !== 'human-vs-computer') return false;
    // AI plays as White
    return gameState.currentPlayer === Color.WHITE;
  }, [gameState.isGameOver, gameState.playerMode, gameState.currentPlayer]);

  // AI turn handler
  useEffect(() => {
    if (!isAiTurn || reviewMode || !aiPlayer) return;

    setIsAiThinking(true);

    // Calculate delay based on difficulty and thinking speed setting
    const getDelayConfig = (difficulty: AiDifficulty, speed: 'natural' | 'fast') => {
      const speedMultiplier = speed === 'fast' ? 0.3 : 1.0;
      
      switch (difficulty) {
        case 'beginner':
          return { base: 300 * speedMultiplier, variance: 200 * speedMultiplier };
        case 'easy':
          return { base: 400 * speedMultiplier, variance: 300 * speedMultiplier };
        case 'medium':
          return { base: 500 * speedMultiplier, variance: 400 * speedMultiplier };
        case 'hard':
          return { base: 600 * speedMultiplier, variance: 500 * speedMultiplier };
        case 'expert':
          return { base: 800 * speedMultiplier, variance: 600 * speedMultiplier };
        default:
          return { base: 400 * speedMultiplier, variance: 300 * speedMultiplier };
      }
    };

    const { base: baseDelay, variance: delayVariance } = getDelayConfig(
      gameState.aiDifficulty,
      aiSettings.thinkingSpeed
    );

    aiTimeoutRef.current = setTimeout(async () => {
      try {
        // Use AI abstraction layer
        const shouldPassResult = await aiPlayer.shouldPass(gameState);
        
        setGameState(prevState => {
          if (prevState.isGameOver) return prevState;
          if (prevState.currentPlayer !== Color.WHITE) return prevState;

          if (shouldPassResult) {
            return pass(prevState);
          }

          // Get move from AI (synchronous for now, will be async with engine integration)
          const move = chooseMove(prevState, prevState.aiDifficulty);
          if (move === null) {
            return pass(prevState);
          }

          const result = playStone(prevState, move);
          if (result.success) {
            return result.newState;
          }

          return pass(prevState);
        });
      } catch (error) {
        console.error('AI move failed:', error);
        // Fallback to pass on error
        setGameState(prevState => {
          if (prevState.isGameOver) return prevState;
          return pass(prevState);
        });
      } finally {
        setIsAiThinking(false);
      }
    }, baseDelay + Math.random() * delayVariance);

    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, [isAiTurn, reviewMode, aiPlayer, aiSettings.thinkingSpeed, gameState.aiDifficulty, gameState]);

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
    setAiStatus('idle');
    setHintPosition(null);
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }
  }, []);

  const handleLoadGameState = useCallback((state: GameState) => {
    setGameState(state);
    setLastMoveMessage(null);
    setReviewMode(false);
    setReviewMoveIndex(0);
    setIsAiThinking(false);
    setAiStatus('idle');
    setHintPosition(null);
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

  // Update AI status based on game state
  useEffect(() => {
    if (gameState.isGameOver) {
      setAiStatus('game-over');
    } else if (isAiThinking) {
      setAiStatus('thinking');
    } else if (gameState.playerMode === 'human-vs-computer' && gameState.currentPlayer === Color.WHITE) {
      setAiStatus('playing');
    } else {
      setAiStatus('idle');
    }
  }, [gameState.isGameOver, isAiThinking, gameState.playerMode, gameState.currentPlayer]);

  // Clear hint when game state changes
  useEffect(() => {
    setHintPosition(null);
  }, [gameState.moveHistory.length, gameState.currentPlayer]);

  // Request hint from AI
  const handleRequestHint = useCallback(async () => {
    if (!aiPlayer || !aiSettings.hintsEnabled || gameState.isGameOver || isAiThinking) {
      return;
    }

    try {
      const hint = await aiPlayer.getHint(gameState, gameState.currentPlayer);
      setHintPosition(hint.position);
    } catch (error) {
      console.error('Failed to get hint:', error);
      setHintPosition(null);
    }
  }, [aiPlayer, aiSettings.hintsEnabled, gameState, isAiThinking]);

  // Clear hint
  const handleClearHint = useCallback(() => {
    setHintPosition(null);
  }, []);

  // Update AI settings
  const handleUpdateAiSettings = useCallback((settings: Partial<AiSettings>) => {
    setAiSettings(prev => ({ ...prev, ...settings }));
  }, []);

  return {
    gameState,
    reviewMode,
    reviewMoveIndex,
    reviewBoard,
    lastMoveMessage,
    score,
    isAiThinking,
    aiStatus,
    aiPlayer,
    hintPosition,
    aiSettings,
    handleIntersectionClick,
    handlePass,
    handleResign,
    handleNewGame,
    handleLoadGameState,
    handleReviewPrevious,
    handleReviewNext,
    handleReviewJumpTo,
    handleExitReview,
    handleRequestHint,
    handleClearHint,
    handleUpdateAiSettings,
  };
}
