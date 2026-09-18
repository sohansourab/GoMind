/**
 * Game state management.
 * Creates initial game state and provides state transition functions.
 */

import { Color, GameState, GameConfig, Move, Board, Stone, Position, MoveResult, ScoreResult } from './types';
import { createEmptyBoard, setStone } from './board';
import { applyMove, applyPass, applyResign } from './rules';
import { calculateScore } from './scoring';
import { captureOpponentGroups } from './capture';

/**
 * Create a new game with the given configuration.
 */
export function createGame(config: GameConfig): GameState {
  const board = createEmptyBoard({ size: config.size });

  return {
    board,
    size: config.size,
    currentPlayer: Color.BLACK,
    moveHistory: [],
    consecutivePasses: 0,
    blackCaptures: 0,
    whiteCaptures: 0,
    previousBoardHash: null,
    isGameOver: false,
    winner: null,
    winReason: null,
    komi: config.komi,
    ruleset: config.ruleset,
  };
}

/**
 * Attempt to play a stone at the given position.
 */
export function playStone(state: GameState, pos: Position): MoveResult {
  return applyMove(state, pos);
}

/**
 * Pass the current turn.
 */
export function pass(state: GameState): GameState {
  return applyPass(state);
}

/**
 * Resign the game.
 */
export function resign(state: GameState): GameState {
  return applyResign(state);
}

/**
 * Get the score when the game is over (two consecutive passes).
 */
export function getScore(state: GameState): ScoreResult {
  return calculateScore(state.board, state.size, state.komi);
}

/**
 * Reconstruct a board state at a specific move number.
 * Replays the game from the beginning up to the given move.
 */
export function getBoardAtMove(state: GameState, moveNumber: number): Board {
  if (moveNumber === 0) {
    return createEmptyBoard({ size: state.size });
  }

  let board = createEmptyBoard({ size: state.size });

  for (let i = 0; i < moveNumber && i < state.moveHistory.length; i++) {
    const move = state.moveHistory[i];
    if (move.type === 'play' && move.position) {
      const stoneColor = move.color === Color.BLACK ? Stone.BLACK : Stone.WHITE;
      board = setStone(board, move.position, state.size, stoneColor);
      const result = captureOpponentGroups(board, move.position, stoneColor, state.size);
      board = result.board;
    }
  }

  return board;
}

/**
 * Get the last move in the history.
 */
export function getLastMove(state: GameState): Move | null {
  if (state.moveHistory.length === 0) return null;
  return state.moveHistory[state.moveHistory.length - 1];
}
