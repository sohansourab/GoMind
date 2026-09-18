/**
 * React hook for managing Go game state.
 * Connects the game engine to the React UI.
 * Handles AI turns when in human-vs-computer mode.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { GameState, GameConfig, Position, ScoreResult, Board, Color } from '../game/types';
import { createGame, playStone, pass, resign, getScore, getBoardAtMove } from '../game/gameState';
import { chooseMove, shouldPass } from '../game/ai';
import { saveGame, loadSettings, saveSettings, getActiveGame } from '../storage';

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
  handleLoadGameState: (state: GameState) => void;
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
  const [gameId, setGameId] = useState<string | null>(null);
  const aiMoveVersionRef = useRef(0);
  const isInitialized = useRef(false);

  // Load saved game on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const loadSavedGame = async () => {
      try {
        const activeGame = await getActiveGame();
        if (activeGame) {
          setGameState(activeGame.gameState);
          setGameId(activeGame.id);
        }
      } catch (error) {
        console.error('Failed to load saved game:', error);
        // Continue with default game
      }
    };

    loadSavedGame();
  }, []);

  const handleIntersectionClick = useCallback((pos: Position) => {
    if (reviewMode) return;
    if (isAiThinking) return; // Prevent moves while AI is thinking

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
    if (reviewMode) return;
    if (isAiThinking) return; // Prevent pass while AI is thinking
    const newState = pass(gameState);
    setGameState(newState);
    setLastMoveMessage(null);
  }, [gameState, reviewMode, isAiThinking]);

  const handleResign = useCallback(() => {
    if (reviewMode) return;
    if (isAiThinking) return; // Prevent resign while AI is thinking
    const newState = resign(gameState);
    setGameState(newState);
    setLastMoveMessage(null);
  }, [gameState, reviewMode, isAiThinking]);

  const handleNewGame = useCallback((config: GameConfig) => {
    // Invalidate any pending AI moves
    aiMoveVersionRef.current++;
    setIsAiThinking(false);
    setGameState(createGame(config));
    setLastMoveMessage(null);
    setReviewMode(false);
    setReviewMoveIndex(0);
    setGameId(null); // Clear game ID so a new game is created
  }, []);

  const handleLoadGameState = useCallback((state: GameState) => {
    setGameState(state);
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

  // AI turn handler
  useEffect(() => {
    // Only trigger AI if it's human-vs-computer mode and computer's turn
    if (gameState.playerMode !== 'human-vs-computer') return;
    if (gameState.currentPlayer !== Color.WHITE) return;
    if (gameState.isGameOver) return;
    if (reviewMode) return;

    // Increment version to invalidate any pending AI moves
    const currentVersion = ++aiMoveVersionRef.current;
    setIsAiThinking(true);

    // Small delay for UX (makes thinking indicator visible)
    const timeoutId = setTimeout(() => {
      // Check if this AI move is still valid (not invalidated by new game, etc.)
      if (currentVersion !== aiMoveVersionRef.current) return;

      setGameState(prevState => {
        // Double-check conditions with latest state
        if (prevState.playerMode !== 'human-vs-computer') return prevState;
        if (prevState.currentPlayer !== Color.WHITE) return prevState;
        if (prevState.isGameOver) return prevState;

        // Check if AI should pass
        if (shouldPass(prevState, prevState.aiDifficulty)) {
          setIsAiThinking(false);
          return pass(prevState);
        }

        // Get AI move
        const aiMove = chooseMove(prevState, prevState.aiDifficulty);
        
        if (aiMove === null) {
          // AI wants to pass
          setIsAiThinking(false);
          return pass(prevState);
        }

        // Execute AI move through rules engine
        const result = playStone(prevState, aiMove);
        setIsAiThinking(false);
        
        if (result.success) {
          return result.newState;
        } else {
          // AI returned illegal move - this shouldn't happen, but handle gracefully
          console.error('AI returned illegal move:', aiMove, result.reason);
          // Pass as fallback
          return pass(prevState);
        }
      });
    }, 300);

    // Cleanup: clear timeout if component unmounts or dependencies change
    return () => {
      clearTimeout(timeoutId);
    };
  }, [gameState.playerMode, gameState.currentPlayer, gameState.isGameOver, gameState.moveHistory.length, reviewMode]);

  // Reset AI thinking state when game changes
  useEffect(() => {
    if (gameState.isGameOver || gameState.playerMode === 'human-vs-human') {
      setIsAiThinking(false);
    }
  }, [gameState.isGameOver, gameState.playerMode]);

  // Auto-save game state after important changes
  useEffect(() => {
    // Don't save during initialization
    if (!isInitialized.current) return;

    // Don't save during review mode
    if (reviewMode) return;

    const saveCurrentGame = async () => {
      try {
        const id = await saveGame(gameState, gameState.isGameOver, gameId || undefined);
        if (!gameId) {
          setGameId(id);
        }
      } catch (error) {
        console.error('Failed to save game:', error);
        // Continue without crashing
      }
    };

    // Save after a short delay to avoid too many writes
    const timeoutId = setTimeout(saveCurrentGame, 500);
    return () => clearTimeout(timeoutId);
  }, [gameState.moveHistory.length, gameState.isGameOver, gameState.winner]);

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
    handleLoadGameState,
    handleReviewPrevious,
    handleReviewNext,
    handleReviewJumpTo,
    handleExitReview,
  };
}
