import { describe, it, expect } from 'vitest';
import { createGame, playStone, pass, resign, getScore, getBoardAtMove, getLastMove } from '../game/gameState';
import { Color, Stone } from '../game/types';
import { getStone } from '../game/board';

describe('Game State', () => {
  describe('createGame', () => {
    it('creates a game with correct initial state', () => {
      const state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      expect(state.size).toBe(9);
      expect(state.currentPlayer).toBe(Color.BLACK);
      expect(state.moveHistory.length).toBe(0);
      expect(state.consecutivePasses).toBe(0);
      expect(state.blackCaptures).toBe(0);
      expect(state.whiteCaptures).toBe(0);
      expect(state.isGameOver).toBe(false);
      expect(state.winner).toBe(null);
      expect(state.komi).toBe(7.5);
      expect(state.ruleset).toBe('chinese');
    });
  });

  describe('playStone', () => {
    it('places a stone and switches player', () => {
      let state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      const result = playStone(state, { x: 4, y: 4 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.newState.currentPlayer).toBe(Color.WHITE);
        expect(getStone(result.newState.board, { x: 4, y: 4 }, 9)).toBe(Stone.BLACK);
        expect(result.newState.moveHistory.length).toBe(1);
      }
    });

    it('rejects move on occupied position', () => {
      let state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      const result1 = playStone(state, { x: 4, y: 4 });
      expect(result1.success).toBe(true);
      if (result1.success) {
        // White tries to play on the same spot
        const result2 = playStone(result1.newState, { x: 4, y: 4 });
        expect(result2.success).toBe(false);
      }
    });

    it('records captures correctly', () => {
      // Set up a capture scenario
      let state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      // Black plays around white stone in corner
      // B at (1,0), W at (0,0), then B plays (0,1) to capture
      // But we need to alternate turns properly
      
      // Black (0,0)
      let result = playStone(state, { x: 0, y: 0 });
      expect(result.success).toBe(true);
      if (result.success) state = result.newState;
      
      // White (1,0)
      result = playStone(state, { x: 1, y: 0 });
      expect(result.success).toBe(true);
      if (result.success) state = result.newState;
      
      // Black (0,1) - this doesn't capture anything yet
      result = playStone(state, { x: 0, y: 1 });
      expect(result.success).toBe(true);
      if (result.success) state = result.newState;
      
      // White (8,8) - pass-like move elsewhere
      result = playStone(state, { x: 8, y: 8 });
      expect(result.success).toBe(true);
      if (result.success) state = result.newState;
      
      // Black (2,0) - now white at (1,0) has only 1 liberty
      result = playStone(state, { x: 2, y: 0 });
      expect(result.success).toBe(true);
      if (result.success) state = result.newState;
      
      // White (8,7) - elsewhere
      result = playStone(state, { x: 8, y: 7 });
      expect(result.success).toBe(true);
      if (result.success) state = result.newState;
      
      // Black (1,1) - captures white at (1,0)
      result = playStone(state, { x: 1, y: 1 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.newState.blackCaptures).toBe(1);
      }
    });
  });

  describe('Pass', () => {
    it('increments consecutive passes', () => {
      let state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      state = pass(state);
      expect(state.consecutivePasses).toBe(1);
      expect(state.currentPlayer).toBe(Color.WHITE);
      expect(state.moveHistory.length).toBe(1);
      expect(state.moveHistory[0].type).toBe('pass');
    });

    it('ends game after two consecutive passes', () => {
      let state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      state = pass(state);
      state = pass(state);
      expect(state.isGameOver).toBe(true);
      expect(state.consecutivePasses).toBe(2);
    });

    it('resets consecutive passes after a play', () => {
      let state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      state = pass(state);
      expect(state.consecutivePasses).toBe(1);
      
      const result = playStone(state, { x: 4, y: 4 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.newState.consecutivePasses).toBe(0);
      }
    });
  });

  describe('Resignation', () => {
    it('ends the game with opponent as winner', () => {
      let state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      state = resign(state);
      expect(state.isGameOver).toBe(true);
      expect(state.winner).toBe(Color.WHITE); // Black resigned, white wins
      expect(state.winReason).toBe('resignation');
    });

    it('records resignation in move history', () => {
      let state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      state = resign(state);
      expect(state.moveHistory.length).toBe(1);
      expect(state.moveHistory[0].type).toBe('resign');
    });

    it('white resignation means black wins', () => {
      let state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      state = pass(state); // Black passes
      state = resign(state); // White resigns
      expect(state.winner).toBe(Color.BLACK);
    });
  });

  describe('Scoring', () => {
    it('provides score after two passes', () => {
      let state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      state = pass(state);
      state = pass(state);
      const score = getScore(state);
      expect(score).toBeDefined();
      expect(score.blackTotal).toBe(0);
      expect(score.whiteTotal).toBe(7.5);
      expect(score.winner).toBe(Color.WHITE);
    });
  });

  describe('Board reconstruction', () => {
    it('reconstructs initial empty board at move 0', () => {
      let state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      const result = playStone(state, { x: 4, y: 4 });
      if (result.success) {
        const boardAt0 = getBoardAtMove(result.newState, 0);
        expect(boardAt0.every(s => s === Stone.EMPTY)).toBe(true);
      }
    });

    it('reconstructs board at specific move', () => {
      let state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      let result = playStone(state, { x: 4, y: 4 });
      if (result.success) {
        state = result.newState;
        result = playStone(state, { x: 3, y: 3 });
        if (result.success) {
          state = result.newState;
          // Board at move 1 should have only black at (4,4)
          const boardAt1 = getBoardAtMove(state, 1);
          expect(getStone(boardAt1, { x: 4, y: 4 }, 9)).toBe(Stone.BLACK);
          expect(getStone(boardAt1, { x: 3, y: 3 }, 9)).toBe(Stone.EMPTY);
          
          // Board at move 2 should have both stones
          const boardAt2 = getBoardAtMove(state, 2);
          expect(getStone(boardAt2, { x: 4, y: 4 }, 9)).toBe(Stone.BLACK);
          expect(getStone(boardAt2, { x: 3, y: 3 }, 9)).toBe(Stone.WHITE);
        }
      }
    });
  });

  describe('getLastMove', () => {
    it('returns null for empty game', () => {
      const state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      expect(getLastMove(state)).toBe(null);
    });

    it('returns the last move', () => {
      let state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      const result = playStone(state, { x: 4, y: 4 });
      if (result.success) {
        const last = getLastMove(result.newState);
        expect(last).not.toBe(null);
        expect(last!.position).toEqual({ x: 4, y: 4 });
        expect(last!.color).toBe(Color.BLACK);
      }
    });
  });

  describe('Game over prevents moves', () => {
    it('rejects moves after game is over', () => {
      let state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      state = pass(state);
      state = pass(state);
      expect(state.isGameOver).toBe(true);
      
      const result = playStone(state, { x: 4, y: 4 });
      expect(result.success).toBe(false);
    });
  });
});
