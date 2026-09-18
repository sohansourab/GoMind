import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateDefaultGameName, renameGame } from '../storage/api';
import { SavedGame } from '../storage/types';
import { Color } from '../game/types';

// Mock the storage module
vi.mock('../storage/indexedDB', () => ({
  storage: {
    init: vi.fn().mockResolvedValue(undefined),
    saveGame: vi.fn().mockResolvedValue(undefined),
    loadGame: vi.fn(),
    deleteGame: vi.fn().mockResolvedValue(undefined),
    listGames: vi.fn(),
    getActiveGame: vi.fn(),
    saveSettings: vi.fn().mockResolvedValue(undefined),
    loadSettings: vi.fn(),
    isAvailable: vi.fn().mockResolvedValue(true),
  },
}));

describe('Game Library API', () => {
  describe('generateDefaultGameName', () => {
    it('generates name for Human vs Computer game', () => {
      const game: SavedGame = {
        id: 'test-1',
        createdAt: new Date('2024-01-15').getTime(),
        updatedAt: Date.now(),
        isCompleted: false,
        size: 9,
        ruleset: 'chinese',
        komi: 7.5,
        playerMode: 'human-vs-computer',
        aiDifficulty: 'medium',
        gameState: {} as any,
      };

      const name = generateDefaultGameName(game);
      expect(name).toBe('9×9 vs Computer (medium) - Jan 15');
    });

    it('generates name for Human vs Human game', () => {
      const game: SavedGame = {
        id: 'test-2',
        createdAt: new Date('2024-02-20').getTime(),
        updatedAt: Date.now(),
        isCompleted: true,
        size: 13,
        ruleset: 'chinese',
        komi: 6.5,
        playerMode: 'human-vs-human',
        gameState: {} as any,
      };

      const name = generateDefaultGameName(game);
      expect(name).toBe('13×13 vs Human - Feb 20');
    });

    it('generates name for 19x19 game', () => {
      const game: SavedGame = {
        id: 'test-3',
        createdAt: new Date('2024-03-10').getTime(),
        updatedAt: Date.now(),
        isCompleted: false,
        size: 19,
        ruleset: 'chinese',
        komi: 7.5,
        playerMode: 'human-vs-computer',
        aiDifficulty: 'hard',
        gameState: {} as any,
      };

      const name = generateDefaultGameName(game);
      expect(name).toBe('19×19 vs Computer (hard) - Mar 10');
    });
  });

  describe('renameGame', () => {
    it('renames a game successfully', async () => {
      const { storage } = await import('../storage/indexedDB');
      const mockLoadGame = vi.mocked(storage.loadGame);
      const mockSaveGame = vi.mocked(storage.saveGame);

      const existingGame: SavedGame = {
        id: 'test-1',
        createdAt: Date.now() - 1000,
        updatedAt: Date.now() - 1000,
        isCompleted: false,
        size: 9,
        ruleset: 'chinese',
        komi: 7.5,
        playerMode: 'human-vs-computer',
        gameState: {} as any,
      };

      mockLoadGame.mockResolvedValue(existingGame);

      await renameGame('test-1', 'My Custom Game');

      expect(mockLoadGame).toHaveBeenCalledWith('test-1');
      expect(mockSaveGame).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-1',
          name: 'My Custom Game',
        })
      );
    });

    it('throws error when game not found', async () => {
      const { storage } = await import('../storage/indexedDB');
      const mockLoadGame = vi.mocked(storage.loadGame);

      mockLoadGame.mockResolvedValue(null);

      await expect(renameGame('non-existent', 'New Name')).rejects.toThrow('Game not found');
    });

    it('updates updatedAt timestamp when renaming', async () => {
      const { storage } = await import('../storage/indexedDB');
      const mockLoadGame = vi.mocked(storage.loadGame);
      const mockSaveGame = vi.mocked(storage.saveGame);

      const oldTimestamp = Date.now() - 10000;
      const existingGame: SavedGame = {
        id: 'test-1',
        createdAt: oldTimestamp,
        updatedAt: oldTimestamp,
        isCompleted: false,
        size: 9,
        ruleset: 'chinese',
        komi: 7.5,
        playerMode: 'human-vs-computer',
        gameState: {} as any,
      };

      mockLoadGame.mockResolvedValue(existingGame);

      const beforeRename = Date.now();
      await renameGame('test-1', 'New Name');
      const afterRename = Date.now();

      const savedGame = mockSaveGame.mock.calls[0][0];
      expect(savedGame.updatedAt).toBeGreaterThanOrEqual(beforeRename);
      expect(savedGame.updatedAt).toBeLessThanOrEqual(afterRename);
    });
  });
});
