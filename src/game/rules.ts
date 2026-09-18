/**
 * Move validation and application rules for Go.
 * This is the central rules engine that determines if a move is legal.
 */

import { Stone, Color, Position, GameState, Move, MoveResult, Board } from './types';
import { getStone, setStone, boardHash } from './board';
import { getGroupStones, getGroupLiberties } from './groups';
import { captureOpponentGroups } from './capture';
import { isKoViolation } from './ko';
import { calculateScore } from './scoring';

function colorToStone(color: Color): Stone {
  return color === Color.BLACK ? Stone.BLACK : Stone.WHITE;
}

/**
 * Validate and apply a move at the given position.
 * Returns either a new game state or a rejection reason.
 * 
 * Move validation order:
 * 1. Game must not be over
 * 2. Position must be on the board
 * 3. Position must be empty
 * 4. After placing and capturing, the placed stone's group must have liberties (no suicide)
 * 5. The resulting board must not violate ko
 */
export function applyMove(state: GameState, pos: Position): MoveResult {
  // 1. Game must not be over
  if (state.isGameOver) {
    return { success: false, reason: 'Game is over' };
  }

  const { size, board, currentPlayer } = state;

  // 2. Position must be on the board
  if (pos.x < 0 || pos.x >= size || pos.y < 0 || pos.y >= size) {
    return { success: false, reason: 'Position is off the board' };
  }

  // 3. Position must be empty
  if (getStone(board, pos, size) !== Stone.EMPTY) {
    return { success: false, reason: 'Position is already occupied' };
  }

  const stoneColor = colorToStone(currentPlayer);

  // Place the stone tentatively
  let newBoard = setStone(board, pos, size, stoneColor);

  // 4. Capture opponent groups with zero liberties
  const captureResult = captureOpponentGroups(newBoard, pos, stoneColor, size);
  newBoard = captureResult.board;

  // 5. Check suicide: after captures, does the placed stone's group have liberties?
  const ownGroupStones = getGroupStones(newBoard, pos, size);
  const ownLiberties = getGroupLiberties(newBoard, ownGroupStones, size);

  if (ownLiberties.length === 0) {
    return { success: false, reason: 'Illegal move: suicide' };
  }

  // 6. Check ko: does the new board position match the prohibited previous position?
  if (isKoViolation(newBoard, state.previousBoardHash)) {
    return { success: false, reason: 'Illegal move: ko' };
  }

  // Calculate the ko-check hash for the next move.
  // In simple ko, the prohibited position is the board BEFORE this move.
  const koHash = boardHash(board);

  // Build the move record
  const move: Move = {
    moveNumber: state.moveHistory.length + 1,
    color: currentPlayer,
    position: pos,
    capturedStones: captureResult.capturedPositions,
    type: 'play',
  };

  // Calculate captures
  const capturedCount = captureResult.capturedPositions.length;
  const blackCaptures = currentPlayer === Color.BLACK
    ? state.blackCaptures + capturedCount
    : state.blackCaptures;
  const whiteCaptures = currentPlayer === Color.WHITE
    ? state.whiteCaptures + capturedCount
    : state.whiteCaptures;

  // Build new state
  const newState: GameState = {
    ...state,
    board: newBoard,
    currentPlayer: currentPlayer === Color.BLACK ? Color.WHITE : Color.BLACK,
    moveHistory: [...state.moveHistory, move],
    consecutivePasses: 0,
    blackCaptures,
    whiteCaptures,
    previousBoardHash: koHash,
  };

  return { success: true, newState };
}

/**
 * Apply a pass move.
 */
export function applyPass(state: GameState): GameState {
  if (state.isGameOver) return state;

  const move: Move = {
    moveNumber: state.moveHistory.length + 1,
    color: state.currentPlayer,
    position: null,
    capturedStones: [],
    type: 'pass',
  };

  const consecutivePasses = state.consecutivePasses + 1;
  const isGameOver = consecutivePasses >= 2;

  // If game is over by two passes, calculate the winner based on scoring
  let winner: Color | null = state.winner;
  let winReason: 'resignation' | 'score' | null = state.winReason;
  
  if (isGameOver) {
    const score = calculateScore(state.board, state.size, state.komi);
    winner = score.winner;
    winReason = 'score';
  }

  return {
    ...state,
    currentPlayer: state.currentPlayer === Color.BLACK ? Color.WHITE : Color.BLACK,
    moveHistory: [...state.moveHistory, move],
    consecutivePasses,
    isGameOver,
    winner,
    winReason,
  };
}

/**
 * Apply a resignation.
 */
export function applyResign(state: GameState): GameState {
  if (state.isGameOver) return state;

  const move: Move = {
    moveNumber: state.moveHistory.length + 1,
    color: state.currentPlayer,
    position: null,
    capturedStones: [],
    type: 'resign',
  };

  const winner = state.currentPlayer === Color.BLACK ? Color.WHITE : Color.BLACK;

  return {
    ...state,
    moveHistory: [...state.moveHistory, move],
    isGameOver: true,
    winner,
    winReason: 'resignation',
  };
}
