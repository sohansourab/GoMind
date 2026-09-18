import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { storage } from '../storage/indexedDB';
import { saveGame, loadGame, listGames, deleteGame, getActiveGame, didHumanWin } from '../storage/api';
import { createGame, playStone, pass, resign } from '../game/gameState';
import { Color } from '../game/types';

describe('Storage Layer', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('satori-go-games');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });

  afterEach(() => {
    // Clean up after each test
  });

  describe('saveGame', () => {
    it('saves a new game with unique ID', async () => {
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      const id = await saveGame(gameState, false);
      
      expect(id).toBeDefined();
      expect(id).toMatch(/^game_\d+_[a-z0-9]+$/);
    });

    it('updates existing game when ID provided', async () => {
      const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      const id = await saveGame(gameState, false);
      
      // Play a move
      const newState = playStone(gameState, { x: 3, y: 3 });
      if (newState.success) {
        const updatedId = await saveGame(newState.newState, false, id);
        expect(updatedId).toBe(id);
      }
    });

    it('marks completed games correctly', async () => {
      let gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
      
      // End game with two passes
      gameState = pass(gameState);
      gameState = pass(gameState);
      
      const id = await saveGame(gameState, true);
      expect(id).toBeDefined();
    });
  });

  describe('loadGame', () => {
    it('returns null for non-existent game', async () => {
      const result = await loadGame('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('listGames', () => {
    it('returns empty array when no games saved', async () => {
      const games = await listGames();
      expect(games).toEqual([]);
    });
  });

  describe('deleteGame', () => {
    it('deletes game without error', async () => {
      await expect(deleteGame('some-id')).resolves.not.toThrow();
    });
  });

  describe('getActiveGame', () => {
    it('returns null when no active games', async () => {
      const result = await getActiveGame();
      expect(result).toBeNull();
    });
  });

  describe('didHumanWin', () => {
    it('returns null for active game', () => {
      const gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese',
        playerMode: 'human-vs-computer'
      });
      
      const result = didHumanWin(gameState);
      expect(result).toBeNull();
    });

    it('returns true when human (Black) wins vs computer', () => {
      let gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese',
        playerMode: 'human-vs-computer'
      });
      
      // End game with Black winning
      gameState = pass(gameState);
      gameState = pass(gameState);
      gameState = { ...gameState, isGameOver: true, winner: Color.BLACK, winReason: 'score' };
      
      const result = didHumanWin(gameState);
      expect(result).toBe(true);
    });

    it('returns false when human (Black) loses vs computer', () => {
      let gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese',
        playerMode: 'human-vs-computer'
      });
      
      // End game with White winning
      gameState = pass(gameState);
      gameState = pass(gameState);
      gameState = { ...gameState, isGameOver: true, winner: Color.WHITE, winReason: 'score' };
      
      const result = didHumanWin(gameState);
      expect(result).toBe(false);
    });

    it('returns null for human vs human game', () => {
      let gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese',
        playerMode: 'human-vs-human'
      });
      
      gameState = pass(gameState);
      gameState = pass(gameState);
      gameState = { ...gameState, isGameOver: true, winner: Color.BLACK, winReason: 'score' };
      
      const result = didHumanWin(gameState);
      expect(result).toBeNull();
    });
  });
});
