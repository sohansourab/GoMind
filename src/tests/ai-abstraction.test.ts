/**
 * Tests for AI Abstraction Layer
 * 
 * Tests the new AI interface and HeuristicAI implementation.
 */

import { describe, it, expect } from 'vitest';
import { createAIPlayer, HeuristicAI, createHeuristicAI } from '../ai';
import { createGame } from '../game/gameState';
import { Color } from '../game/types';

describe('AI Abstraction Layer', () => {
  describe('createAIPlayer', () => {
    it('creates a HeuristicAI instance by default', () => {
      const ai = createAIPlayer();
      expect(ai).toBeInstanceOf(HeuristicAI);
      expect(ai.name).toBe('Heuristic AI');
      expect(ai.difficulty).toBe('medium');
    });

    it('creates AI with specified difficulty', () => {
      const ai = createAIPlayer({ difficulty: 'hard' });
      expect(ai.difficulty).toBe('hard');
    });

    it('supports all difficulty levels', () => {
      const difficulties = ['beginner', 'easy', 'medium', 'hard', 'expert'] as const;
      
      for (const difficulty of difficulties) {
        const ai = createAIPlayer({ difficulty });
        expect(ai.difficulty).toBe(difficulty);
      }
    });
  });

  describe('createHeuristicAI', () => {
    it('creates a HeuristicAI instance', () => {
      const ai = createHeuristicAI();
      expect(ai).toBeInstanceOf(HeuristicAI);
    });

    it('creates AI with specified difficulty', () => {
      const ai = createHeuristicAI({ difficulty: 'expert' });
      expect(ai.difficulty).toBe('expert');
    });
  });

  describe('HeuristicAI.getMove', () => {
    it('returns a valid move on empty board', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      const result = await ai.getMove(gameState);
      
      // Should return a position or null (pass)
      if (result.position !== null) {
        expect(result.position.x).toBeGreaterThanOrEqual(0);
        expect(result.position.x).toBeLessThan(9);
        expect(result.position.y).toBeGreaterThanOrEqual(0);
        expect(result.position.y).toBeLessThan(9);
      }
    });

    it('returns a move for all difficulty levels', async () => {
      const difficulties = ['beginner', 'easy', 'medium', 'hard', 'expert'] as const;
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      for (const difficulty of difficulties) {
        const ai = createAIPlayer({ difficulty });
        const result = await ai.getMove(gameState);
        
        // Should return a position or null (pass)
        if (result.position !== null) {
          expect(result.position.x).toBeGreaterThanOrEqual(0);
          expect(result.position.x).toBeLessThan(9);
        }
      }
    });

    it('maps beginner to easy internally', async () => {
      const ai = createAIPlayer({ difficulty: 'beginner' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      // Should work without errors
      const result = await ai.getMove(gameState);
      expect(result).toBeDefined();
    });

    it('maps expert to hard internally', async () => {
      const ai = createAIPlayer({ difficulty: 'expert' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      // Should work without errors
      const result = await ai.getMove(gameState);
      expect(result).toBeDefined();
    });
  });

  describe('HeuristicAI.getHint', () => {
    it('returns a hint for black', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      const result = await ai.getHint(gameState, Color.BLACK);
      
      if (result.position !== null) {
        expect(result.position.x).toBeGreaterThanOrEqual(0);
        expect(result.position.x).toBeLessThan(9);
      }
    });

    it('returns a hint for white', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      const result = await ai.getHint(gameState, Color.WHITE);
      
      if (result.position !== null) {
        expect(result.position.x).toBeGreaterThanOrEqual(0);
        expect(result.position.x).toBeLessThan(9);
      }
    });
  });

  describe('HeuristicAI.analyze', () => {
    it('returns analysis with heuristic source', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      const result = await ai.analyze(gameState);
      
      expect(result.source).toBe('heuristic');
      // Heuristic AI doesn't provide win rate or score yet
      expect(result.winRate).toBeUndefined();
      expect(result.score).toBeUndefined();
    });

    it('provides a suggested move', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      const result = await ai.analyze(gameState);
      
      if (result.suggestedMove !== null && result.suggestedMove !== undefined) {
        expect(result.suggestedMove.x).toBeGreaterThanOrEqual(0);
        expect(result.suggestedMove.x).toBeLessThan(9);
      }
    });
  });

  describe('HeuristicAI.shouldPass', () => {
    it('returns false on empty board', async () => {
      const ai = createAIPlayer({ difficulty: 'medium' });
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      const result = await ai.shouldPass(gameState);
      expect(result).toBe(false);
    });
  });

  describe('AI Interface Compliance', () => {
    it('all AI implementations have required methods', () => {
      const ai = createAIPlayer();
      
      expect(typeof ai.getMove).toBe('function');
      expect(typeof ai.getHint).toBe('function');
      expect(typeof ai.analyze).toBe('function');
      expect(typeof ai.shouldPass).toBe('function');
      expect(typeof ai.name).toBe('string');
      expect(typeof ai.difficulty).toBe('string');
    });

    it('all methods return promises', async () => {
      const ai = createAIPlayer();
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      const movePromise = ai.getMove(gameState);
      const hintPromise = ai.getHint(gameState, Color.BLACK);
      const analyzePromise = ai.analyze(gameState);
      const shouldPassPromise = ai.shouldPass(gameState);
      
      expect(movePromise).toBeInstanceOf(Promise);
      expect(hintPromise).toBeInstanceOf(Promise);
      expect(analyzePromise).toBeInstanceOf(Promise);
      expect(shouldPassPromise).toBeInstanceOf(Promise);
      
      // Wait for all promises to resolve
      await Promise.all([movePromise, hintPromise, analyzePromise, shouldPassPromise]);
    });
  });
});
