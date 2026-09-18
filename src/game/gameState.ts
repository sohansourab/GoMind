import { GameState, GameConfig, Color, Position, MoveResult, Move } from './types';
import { createEmptyBoard } from './board';
import { applyMove, applyPass, applyResign } from './rules';
import { calculateScore } from './scoring';

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
