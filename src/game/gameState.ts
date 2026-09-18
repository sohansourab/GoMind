import { GameState, GameConfig, Color, Position, MoveResult, Move, Stone } from './types';
import { createEmptyBoard, setStone } from './board';
import { applyMove, applyPass, applyResign } from './rules';
import { calculateScore } from './scoring';
import { captureOpponentGroups } from './capture';

export function createGame(config: GameConfig): GameState {
  return {
    board: createEmptyBoard(config.size),
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
    playerMode: config.playerMode || 'human-vs-human',
    aiDifficulty: config.aiDifficulty || 'medium',
  };
}

export function playStone(state: GameState, pos: Position): MoveResult {
  return applyMove(state, pos);
}

export function pass(state: GameState): GameState {
  return applyPass(state);
}

export function resign(state: GameState): GameState {
  return applyResign(state);
}

export function getScore(state: GameState) {
  return calculateScore(state.board, state.size, state.komi);
}

export function getLastMove(state: GameState): Move | null {
  if (state.moveHistory.length === 0) {
    return null;
  }
  return state.moveHistory[state.moveHistory.length - 1];
}

export function getBoardAtMove(state: GameState, moveIndex: number): readonly Stone[] {
  if (moveIndex === 0) {
    return createEmptyBoard(state.size);
  }
  
  let board = createEmptyBoard(state.size);
  
  for (let i = 0; i < moveIndex && i < state.moveHistory.length; i++) {
    const move = state.moveHistory[i];
    if (move.type === 'play' && move.position) {
      const stoneColor = move.color === Color.BLACK ? Stone.BLACK : Stone.WHITE;
      board = setStone(board, move.position, state.size, stoneColor);
      
      // Handle captures
      const captureResult = captureOpponentGroups(board, move.position, stoneColor, state.size);
      board = captureResult.board;
    }
  }
  
  return board;
}
