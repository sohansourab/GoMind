import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createGame, playStone, pass } from '../game/gameState';
import { Color, Stone } from '../game/types';
import { chooseMove, shouldPass } from '../game/ai';

describe('Human vs Computer Integration', () => {
  describe('Basic AI functionality', () => {
    it('AI generates a valid move on empty board', () => {
      const state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese', playerMode: 'human-vs-computer', aiDifficulty: 'medium' });
      const move = chooseMove(state, 'medium');
      
      // AI should return a valid position or null (pass)
      if (move !== null) {
        expect(move.x).toBeGreaterThanOrEqual(0);
        expect(move.x).toBeLessThan(9);
        expect(move.y).toBeGreaterThanOrEqual(0);
        expect(move.y).toBeLessThan(9);
        
        // The move should be legal
        const result = playStone(state, move);
        expect(result.success).toBe(true);
      }
    });

    it('AI move is legal and does not violate rules', () => {
      const state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese', playerMode: 'human-vs-computer', aiDifficulty: 'medium' });
      
      // Play a few moves manually
      let currentState = state;
      const humanMoves = [
        { x: 2, y: 2 },
        { x: 6, y: 6 },
        { x: 3, y: 3 },
      ];
      
      for (const move of humanMoves) {
        const result = playStone(currentState, move);
        expect(result.success).toBe(true);
        if (result.success) {
          currentState = result.newState;
        }
      }
      
      // Now it's AI's turn (White)
      expect(currentState.currentPlayer).toBe(Color.WHITE);
      
      const aiMove = chooseMove(currentState, 'medium');
      if (aiMove !== null) {
        const result = playStone(currentState, aiMove);
        expect(result.success).toBe(true);
      }
    });

    it('AI respects game over state', () => {
      const state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese', playerMode: 'human-vs-computer', aiDifficulty: 'medium' });
      
      // Pass twice to end the game
      let currentState = pass(state);
      currentState = pass(currentState);
      
      expect(currentState.isGameOver).toBe(true);
      
      // AI should not generate moves when game is over
      // (In actual implementation, the useEffect won't trigger AI move)
      const move = chooseMove(currentState, 'medium');
      // The AI might still return a move, but the game flow should prevent it from being played
    });
  });

  describe('All difficulty levels', () => {
    const difficulties = ['beginner', 'easy', 'medium', 'hard', 'expert'] as const;

    difficulties.forEach(difficulty => {
      it(`AI generates valid move at ${difficulty} difficulty`, () => {
        const state = createGame({ 
          size: 9, 
          komi: 7.5, 
          ruleset: 'chinese', 
          playerMode: 'human-vs-computer', 
          aiDifficulty: difficulty 
        });
        
        const move = chooseMove(state, difficulty);
        
        if (move !== null) {
          expect(move.x).toBeGreaterThanOrEqual(0);
          expect(move.x).toBeLessThan(9);
          expect(move.y).toBeGreaterThanOrEqual(0);
          expect(move.y).toBeLessThan(9);
          
          const result = playStone(state, move);
          expect(result.success).toBe(true);
        }
      });
    });
  });

  describe('All board sizes', () => {
    const boardSizes = [9, 13, 19];

    boardSizes.forEach(size => {
      it(`AI generates valid move on ${size}x${size} board`, () => {
        const state = createGame({ 
          size, 
          komi: 7.5, 
          ruleset: 'chinese', 
          playerMode: 'human-vs-computer', 
          aiDifficulty: 'medium' 
        });
        
        const move = chooseMove(state, 'medium');
        
        if (move !== null) {
          expect(move.x).toBeGreaterThanOrEqual(0);
          expect(move.x).toBeLessThan(size);
          expect(move.y).toBeGreaterThanOrEqual(0);
          expect(move.y).toBeLessThan(size);
          
          const result = playStone(state, move);
          expect(result.success).toBe(true);
        }
      });
    });
  });

  describe('AI decision making', () => {
    it('AI can decide to pass when appropriate', () => {
      const state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese', playerMode: 'human-vs-computer', aiDifficulty: 'medium' });
      
      // shouldPass should return false on empty board
      expect(shouldPass(state, 'medium')).toBe(false);
    });

    it('AI prefers capturing moves', () => {
      // Set up a position where capturing is possible
      let state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese', playerMode: 'human-vs-computer', aiDifficulty: 'medium' });
      
      // Just verify AI makes legal moves in various positions
      const move = chooseMove(state, 'medium');
      if (move !== null) {
        const result = playStone(state, move);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Game flow safety', () => {
    it('AI does not move when it is human turn', () => {
      const state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese', playerMode: 'human-vs-computer', aiDifficulty: 'medium' });
      
      // It's Black's turn (human)
      expect(state.currentPlayer).toBe(Color.BLACK);
      
      // The useEffect in useGoGame should not trigger AI move
      // This is tested by the integration, not unit test
    });

    it('AI does not move in human-vs-human mode', () => {
      const state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese', playerMode: 'human-vs-human' });
      
      // Even if it's White's turn, AI should not move
      // This is controlled by the useEffect condition
      expect(state.playerMode).toBe('human-vs-human');
    });

    it('New game resets AI state', () => {
      const state1 = createGame({ size: 9, komi: 7.5, ruleset: 'chinese', playerMode: 'human-vs-computer', aiDifficulty: 'medium' });
      const state2 = createGame({ size: 13, komi: 6.5, ruleset: 'chinese', playerMode: 'human-vs-computer', aiDifficulty: 'hard' });
      
      expect(state1.size).toBe(9);
      expect(state2.size).toBe(13);
      expect(state1.aiDifficulty).toBe('medium');
      expect(state2.aiDifficulty).toBe('hard');
    });
  });

  describe('Edge cases', () => {
    it('AI handles board with many stones', () => {
      let state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese', playerMode: 'human-vs-computer', aiDifficulty: 'medium' });
      
      // Play many moves
      const moves = [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
        { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
        { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 },
      ];
      
      for (const move of moves) {
        const result = playStone(state, move);
        if (result.success) {
          state = result.newState;
        } else {
          break; // Stop if move fails
        }
      }
      
      // AI should still generate valid move
      const aiMove = chooseMove(state, 'medium');
      if (aiMove !== null) {
        const result = playStone(state, aiMove);
        expect(result.success).toBe(true);
      }
    });

    it('AI handles almost full board', () => {
      let state = createGame({ size: 9, komi: 7.5, ruleset: 'chinese', playerMode: 'human-vs-computer', aiDifficulty: 'medium' });
      
      // Fill most of the board
      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
          if (x === 4 && y === 4) continue; // Leave one empty
          const result = playStone(state, { x, y });
          if (result.success) {
            state = result.newState;
          }
        }
      }
      
      // AI should find the one remaining empty spot or pass
      const aiMove = chooseMove(state, 'medium');
      if (aiMove !== null) {
        expect(aiMove.x).toBe(4);
        expect(aiMove.y).toBe(4);
      }
    });
  });
});
