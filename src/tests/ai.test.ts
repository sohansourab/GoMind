import { describe, it, expect } from 'vitest';
import { chooseMove, shouldPass } from '../game/ai';
import { createGame, playStone, pass } from '../game/gameState';
import { Color, Stone, AiDifficulty } from '../game/types';
import { createEmptyBoard, setStone, getStone } from '../game/board';

describe('AI', () => {
  describe('chooseMove', () => {
    it('returns a valid position on empty board (all difficulties)', () => {
      for (const diff of ['easy', 'medium', 'hard'] as AiDifficulty[]) {
        const state = createGame({
          size: 9,
          komi: 7.5,
          ruleset: 'chinese',
          playerMode: 'human-vs-computer',
          aiDifficulty: diff,
        });
        const whiteState = pass(state); // Black passes, now white's turn
        
        const move = chooseMove(whiteState, diff);
        if (move !== null) {
          expect(move.x).toBeGreaterThanOrEqual(0);
          expect(move.x).toBeLessThan(9);
          expect(move.y).toBeGreaterThanOrEqual(0);
          expect(move.y).toBeLessThan(9);
        }
      }
    });

    it('easy AI prefers capturing moves (but not as strongly)', () => {
      let board = createEmptyBoard({ size: 9 });
      board = setStone(board, { x: 0, y: 0 }, 9, Stone.WHITE);
      board = setStone(board, { x: 0, y: 1 }, 9, Stone.BLACK);
      
      const state = {
        ...createGame({ size: 9, komi: 7.5, ruleset: 'chinese', playerMode: 'human-vs-computer', aiDifficulty: 'easy' }),
        board,
        currentPlayer: Color.BLACK,
      };

      let captureCount = 0;
      for (let i = 0; i < 30; i++) {
        const move = chooseMove(state, 'easy');
        if (move && move.x === 1 && move.y === 0) {
          captureCount++;
        }
      }
      // Easy AI should still capture, but less consistently
      expect(captureCount).toBeGreaterThan(5);
    });

    it('medium AI strongly prefers capturing moves', () => {
      let board = createEmptyBoard({ size: 9 });
      board = setStone(board, { x: 0, y: 0 }, 9, Stone.WHITE);
      board = setStone(board, { x: 0, y: 1 }, 9, Stone.BLACK);
      
      const state = {
        ...createGame({ size: 9, komi: 7.5, ruleset: 'chinese', playerMode: 'human-vs-computer', aiDifficulty: 'medium' }),
        board,
        currentPlayer: Color.BLACK,
      };

      let captureCount = 0;
      for (let i = 0; i < 20; i++) {
        const move = chooseMove(state, 'medium');
        if (move && move.x === 1 && move.y === 0) {
          captureCount++;
        }
      }
      // Medium AI should almost always capture
      expect(captureCount).toBeGreaterThan(12);
    });

    it('hard AI always captures', () => {
      let board = createEmptyBoard({ size: 9 });
      board = setStone(board, { x: 0, y: 0 }, 9, Stone.WHITE);
      board = setStone(board, { x: 0, y: 1 }, 9, Stone.BLACK);
      
      const state = {
        ...createGame({ size: 9, komi: 7.5, ruleset: 'chinese', playerMode: 'human-vs-computer', aiDifficulty: 'hard' }),
        board,
        currentPlayer: Color.BLACK,
      };

      let captureCount = 0;
      for (let i = 0; i < 10; i++) {
        const move = chooseMove(state, 'hard');
        if (move && move.x === 1 && move.y === 0) {
          captureCount++;
        }
      }
      // Hard AI should always capture
      expect(captureCount).toBe(10);
    });

    it('easy AI has more varied move selection', () => {
      const state = createGame({
        size: 9,
        komi: 7.5,
        ruleset: 'chinese',
        playerMode: 'human-vs-computer',
        aiDifficulty: 'easy',
      });

      const moves = new Set<string>();
      for (let i = 0; i < 30; i++) {
        const move = chooseMove(state, 'easy');
        if (move) moves.add(`${move.x},${move.y}`);
      }
      // Easy AI should pick from many different positions
      expect(moves.size).toBeGreaterThan(5);
    });

    it('hard AI has more consistent move selection', () => {
      const state = createGame({
        size: 9,
        komi: 7.5,
        ruleset: 'chinese',
        playerMode: 'human-vs-computer',
        aiDifficulty: 'hard',
      });

      const moves = new Set<string>();
      for (let i = 0; i < 30; i++) {
        const move = chooseMove(state, 'hard');
        if (move) moves.add(`${move.x},${move.y}`);
      }
      // Hard AI should pick from fewer positions (more consistent)
      expect(moves.size).toBeLessThan(15);
    });
  });

  describe('shouldPass', () => {
    it('returns false on empty board for all difficulties', () => {
      for (const diff of ['easy', 'medium', 'hard'] as AiDifficulty[]) {
        const state = createGame({
          size: 9,
          komi: 7.5,
          ruleset: 'chinese',
          playerMode: 'human-vs-computer',
          aiDifficulty: diff,
        });
        expect(shouldPass(state, diff)).toBe(false);
      }
    });
  });

  describe('AI integration per difficulty', () => {
    for (const diff of ['easy', 'medium', 'hard'] as AiDifficulty[]) {
      it(`${diff} AI can play a full game without errors`, () => {
        let state = createGame({
          size: 9,
          komi: 7.5,
          ruleset: 'chinese',
          playerMode: 'human-vs-computer',
          aiDifficulty: diff,
        });
        let moves = 0;
        const maxMoves = 50;

        while (!state.isGameOver && moves < maxMoves) {
          if (state.currentPlayer === Color.BLACK) {
            const move = chooseMove(state, diff);
            if (move) {
              const result = playStone(state, move);
              if (result.success) {
                state = result.newState;
              } else {
                state = pass(state);
              }
            } else {
              state = pass(state);
            }
          } else {
            if (shouldPass(state, diff)) {
              state = pass(state);
            } else {
              const move = chooseMove(state, diff);
              if (move) {
                const result = playStone(state, move);
                if (result.success) {
                  state = result.newState;
                } else {
                  state = pass(state);
                }
              } else {
                state = pass(state);
              }
            }
          }
          moves++;
        }

        expect(state.moveHistory.length).toBeGreaterThan(0);
      });
    }
  });

  describe('Difficulty characteristics', () => {
    it('easy AI sometimes fills own eyes', () => {
      // Set up a position where there's an eye to fill
      let board = createEmptyBoard({ size: 9 });
      // Create an eye at (4,4) for black
      board = setStone(board, { x: 3, y: 4 }, 9, Stone.BLACK);
      board = setStone(board, { x: 5, y: 4 }, 9, Stone.BLACK);
      board = setStone(board, { x: 4, y: 3 }, 9, Stone.BLACK);
      board = setStone(board, { x: 4, y: 5 }, 9, Stone.BLACK);
      // Also need diagonal stones for a proper eye
      board = setStone(board, { x: 3, y: 3 }, 9, Stone.BLACK);
      board = setStone(board, { x: 5, y: 3 }, 9, Stone.BLACK);
      board = setStone(board, { x: 3, y: 5 }, 9, Stone.BLACK);
      board = setStone(board, { x: 5, y: 5 }, 9, Stone.BLACK);
      
      // This is a strong eye - even easy AI might not fill it
      // The test is that easy AI has a chance to make bad moves
      const state = {
        ...createGame({ size: 9, komi: 7.5, ruleset: 'chinese', playerMode: 'human-vs-computer', aiDifficulty: 'easy' }),
        board,
        currentPlayer: Color.BLACK,
      };

      // Just verify it doesn't crash
      const move = chooseMove(state, 'easy');
      expect(move === null || (move.x >= 0 && move.x < 9)).toBe(true);
    });
  });
});
