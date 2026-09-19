import { Stone, Color, Position, GameState, Move, MoveResult } from './types';
import { Board, getStone, setStone, boardHash } from './board';
import { getGroup } from './groups';
import { captureOpponentGroups } from './capture';
import { isKoViolation } from './ko';
import { calculateScore } from './scoring';

export function applyMove(state: GameState, pos: Position): MoveResult {
  // Check if game is over
  if (state.isGameOver) {
    return { success: false, reason: 'Game is over' };
  }
  
  // Check if position is on board
  if (pos.x < 0 || pos.x >= state.size || pos.y < 0 || pos.y >= state.size) {
    return { success: false, reason: 'Position is off the board' };
  }
  
  // Check if position is empty
  if (getStone(state.board, pos, state.size) !== Stone.EMPTY) {
    return { success: false, reason: 'Position is already occupied' };
  }
  
  const stoneColor = state.currentPlayer === Color.BLACK ? Stone.BLACK : Stone.WHITE;
  
  // Place stone tentatively
  let newBoard = setStone(state.board, pos, state.size, stoneColor);
  
  // Capture opponent groups
  const captureResult = captureOpponentGroups(newBoard, pos, stoneColor, state.size);
  newBoard = captureResult.board;
  
  // Check for suicide (own group has no liberties after capture)
  const ownGroup = getGroup(newBoard, pos, state.size);
  if (ownGroup.liberties.length === 0) {
    return { success: false, reason: 'Illegal move: suicide' };
  }
  
  // Check for ko violation
  if (isKoViolation(newBoard, state.previousBoardHash)) {
    return { success: false, reason: 'Illegal move: ko' };
  }
  
  // Create move record
  const move: Move = {
    position: pos,
    color: state.currentPlayer,
    moveNumber: state.moveHistory.length + 1,
    capturedStones: captureResult.capturedStones,
    type: 'play',
  };
  
  // Update captures
  const newBlackCaptures = state.blackCaptures + 
    (state.currentPlayer === Color.BLACK ? captureResult.capturedStones.length : 0);
  const newWhiteCaptures = state.whiteCaptures + 
    (state.currentPlayer === Color.WHITE ? captureResult.capturedStones.length : 0);
  
  // Create new state
  const newState: GameState = {
    ...state,
    board: newBoard,
    currentPlayer: state.currentPlayer === Color.BLACK ? Color.WHITE : Color.BLACK,
    moveHistory: [...state.moveHistory, move],
    consecutivePasses: 0,
    blackCaptures: newBlackCaptures,
    whiteCaptures: newWhiteCaptures,
    previousBoardHash: boardHash(state.board),
  };
  
  return { success: true, newState };
}

export function applyPass(state: GameState): GameState {
  if (state.isGameOver) {
    return state;
  }
  
  const move: Move = {
    position: null,
    color: state.currentPlayer,
    moveNumber: state.moveHistory.length + 1,
    capturedStones: [],
    type: 'pass',
  };
  
  const newConsecutivePasses = state.consecutivePasses + 1;
  const isGameOver = newConsecutivePasses >= 2;
  
  let winner: Color | null = null;
  let winReason: 'resignation' | 'score' | null = null;
  
  if (isGameOver) {
    // Calculate score to determine winner
    const score = calculateScore(state.board, state.size, state.komi);
    winner = score.winner;
    winReason = 'score';
  }
  
  return {
    ...state,
    currentPlayer: state.currentPlayer === Color.BLACK ? Color.WHITE : Color.BLACK,
    moveHistory: [...state.moveHistory, move],
    consecutivePasses: newConsecutivePasses,
    isGameOver,
    winner,
    winReason,
    previousBoardHash: isGameOver ? state.previousBoardHash : boardHash(state.board),
  };
}

export function applyResign(state: GameState): GameState {
  if (state.isGameOver) {
    return state;
  }
  
  const move: Move = {
    position: null,
    color: state.currentPlayer,
    moveNumber: state.moveHistory.length + 1,
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
    previousBoardHash: boardHash(state.board),
  };
}
