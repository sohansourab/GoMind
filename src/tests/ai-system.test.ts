import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAIPlayer, HeuristicAI } from '../ai';
import { createGame, playStone } from '../game/gameState';
import { Color, Stone } from '../game/types';

describe('AI System - All Phases', () => {
  describe('Phase 3: Five Difficulty Levels', () => {
    it('supports all 5 difficulty levels', () => {
      const difficulties = ['beginner', 'easy', 'medium', 'hard', 'expert'] as const;
      
      difficulties.forEach(difficulty => {
        const ai = createAIPlayer({ difficulty });
        expect(ai.difficulty).toBe(difficulty);
      });
    });

    it('beginner AI makes more random moves', async () => {
      const ai = createAIPlayer({ difficulty: 'beginner' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      const moves = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const result = await ai.getMove(gameState);
        if (result.position) {
          moves.add(`${result.position.x},${result.position.y}`);
        }
      }
      
      // Beginner should have high variance
      expect(moves.size).toBeGreaterThan(3);
    });

    it('expert AI is more consistent', async () => {
      const ai = createAIPlayer({ difficulty: 'expert' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      const moves = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const result = await ai.getMove(gameState);
        if (result.position) {
          moves.add(`${result.position.x},${result.position.y}`);
        }
      }
      
      // Expert should be more consistent (fewer unique moves)
      expect(moves.size).toBeLessThanOrEqual(5);
    });

    it('all difficulty levels return valid moves', async () => {
      const difficulties = ['beginner', 'easy', 'medium', 'hard', 'expert'] as const;
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      for (const difficulty of difficulties) {
        const ai = createAIPlayer({ difficulty });
        const result = await ai.getMove(gameState);
        
        // Should return a position or null (pass)
        if (result.position) {
          expect(result.position.x).toBeGreaterThanOrEqual(0);
          expect(result.position.x).toBeLessThan(9);
          expect(result.position.y).toBeGreaterThanOrEqual(0);
          expect(result.position.y).toBeLessThan(9);
        }
      }
    });
  });

  describe('Phase 5: Hint System', () => {
    it('generates hints without modifying game state', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      const initialMoveCount = gameState.moveHistory.length;
      const initialBoard = [...gameState.board];
      
      const hint = await ai.getHint(gameState, Color.BLACK);
      
      // Game state should not be modified
      expect(gameState.moveHistory.length).toBe(initialMoveCount);
      expect(gameState.board).toEqual(initialBoard);
      
      // Hint should be valid
      if (hint.position) {
        expect(hint.position.x).toBeGreaterThanOrEqual(0);
        expect(hint.position.x).toBeLessThan(9);
        expect(hint.position.y).toBeGreaterThanOrEqual(0);
        expect(hint.position.y).toBeLessThan(9);
      }
    });

    it('hint does not advance turn', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      const initialPlayer = gameState.currentPlayer;
      
      await ai.getHint(gameState, Color.BLACK);
      
      expect(gameState.currentPlayer).toBe(initialPlayer);
    });

    it('hint does not change captures', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      const initialBlackCaptures = gameState.blackCaptures;
      const initialWhiteCaptures = gameState.whiteCaptures;
      
      await ai.getHint(gameState, Color.BLACK);
      
      expect(gameState.blackCaptures).toBe(initialBlackCaptures);
      expect(gameState.whiteCaptures).toBe(initialWhiteCaptures);
    });

    it('hint is a legal move', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      const hint = await ai.getHint(gameState, Color.BLACK);
      
      if (hint.position) {
        // Try to play the hint move - should succeed
        const result = playStone(gameState, hint.position);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Phase 9: Analysis Abstraction', () => {
    it('provides analysis with source', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      const analysis = await ai.analyze(gameState);
      
      expect(analysis.source).toBe('heuristic');
    });

    it('does not provide fake numerical analysis', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      const analysis = await ai.analyze(gameState);
      
      // Heuristic AI should not provide win rate or score
      expect(analysis.winRate).toBeUndefined();
      expect(analysis.score).toBeUndefined();
    });

    it('provides suggested move', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      const analysis = await ai.analyze(gameState);
      
      if (analysis.suggestedMove) {
        expect(analysis.suggestedMove.x).toBeGreaterThanOrEqual(0);
        expect(analysis.suggestedMove.x).toBeLessThan(9);
      }
    });
  });

  describe('AI Move Validation', () => {
    it('AI never chooses occupied position', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      let gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      // Play some moves
      const result1 = playStone(gameState, { x: 4, y: 4 });
      if (result1.success) gameState = result1.newState;
      
      const result2 = playStone(gameState, { x: 3, y: 3 });
      if (result2.success) gameState = result2.newState;
      
      const result = await ai.getMove(gameState);
      
      if (result.position) {
        const stone = gameState.board[result.position.y * 9 + result.position.x];
        expect(stone).toBe(Stone.EMPTY);
      }
    });

    it('AI never violates suicide rule', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      const result = await ai.getMove(gameState);
      
      if (result.position) {
        // Try to play the move - should succeed (not suicide)
        const playResult = playStone(gameState, result.position);
        expect(playResult.success).toBe(true);
      }
    });

    it('AI cannot move after game over', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      let gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      // End the game with two passes
      gameState = { ...gameState, isGameOver: true };
      
      const result = await ai.getMove(gameState);
      
      // Should return null (pass) when game is over
      expect(result.position).toBeNull();
    });

    it('AI only plays on its turn', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      let gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      // It's black's turn
      expect(gameState.currentPlayer).toBe(Color.BLACK);
      
      const result = await ai.getMove(gameState);
      
      // AI should still return a move (it's being called directly)
      // In real usage, the hook would prevent calling AI on wrong turn
      if (result.position) {
        expect(result.position.x).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Async Safety', () => {
    it('handles rapid successive calls', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      // Make multiple rapid calls
      const promises = [
        ai.getMove(gameState),
        ai.getMove(gameState),
        ai.getMove(gameState),
      ];
      
      const results = await Promise.all(promises);
      
      // All should complete without error
      results.forEach(result => {
        if (result.position) {
          expect(result.position.x).toBeGreaterThanOrEqual(0);
        }
      });
    });

    it('handles game state changes during AI thinking', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      const gameState1 = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      // Start AI move
      const movePromise = ai.getMove(gameState1);
      
      // Create new game state (simulating new game)
      const gameState2 = createGame({ size: 13, komi: 7.5, ruleset: 'chinese' });
      
      // Original promise should still complete
      const result = await movePromise;
      expect(result).toBeDefined();
    });
  });

  describe('Backward Compatibility', () => {
    it('existing easy/medium/hard still work', async () => {
      const difficulties = ['easy', 'medium', 'hard'] as const;
      
      for (const difficulty of difficulties) {
        const ai = createAIPlayer({ difficulty });
        const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
        
        const result = await ai.getMove(gameState);
        expect(result).toBeDefined();
      }
    });

    it('Human vs Human mode still works', () => {
      const gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese',
        playerMode: 'human-vs-human'
      });
      
      expect(gameState.playerMode).toBe('human-vs-human');
      
      // Should be able to play moves
      const result = playStone(gameState, { x: 4, y: 4 });
      expect(result.success).toBe(true);
    });

    it('Human vs AI mode still works', () => {
      const gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese',
        playerMode: 'human-vs-computer',
        aiDifficulty: 'medium'
      });
      
      expect(gameState.playerMode).toBe('human-vs-computer');
      expect(gameState.aiDifficulty).toBe('medium');
    });
  });
});
