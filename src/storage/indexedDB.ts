/**
 * IndexedDB storage implementation for game persistence
 */

import { SavedGame, GameSummary, UserSettings } from './types';

const DB_NAME = 'satori-go-games';
const DB_VERSION = 1;
const GAMES_STORE = 'games';
const SETTINGS_STORE = 'settings';

class StorageLayer {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the database connection
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create games store
        if (!db.objectStoreNames.contains(GAMES_STORE)) {
          const gamesStore = db.createObjectStore(GAMES_STORE, { keyPath: 'id' });
          gamesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          gamesStore.createIndex('isCompleted', 'isCompleted', { unique: false });
        }

        // Create settings store
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Save a game
   */
  async saveGame(game: SavedGame): Promise<void> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([GAMES_STORE], 'readwrite');
      const store = transaction.objectStore(GAMES_STORE);
      const request = store.put(game);

      request.onerror = () => {
        console.error('Failed to save game:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Load a game by ID
   */
  async loadGame(id: string): Promise<SavedGame | null> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([GAMES_STORE], 'readonly');
      const store = transaction.objectStore(GAMES_STORE);
      const request = store.get(id);

      request.onerror = () => {
        console.error('Failed to load game:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  }

  /**
   * List all saved games (summaries only)
   */
  async listGames(): Promise<GameSummary[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([GAMES_STORE], 'readonly');
      const store = transaction.objectStore(GAMES_STORE);
      const request = store.getAll();

      request.onerror = () => {
        console.error('Failed to list games:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        const games: SavedGame[] = request.result;
        const summaries: GameSummary[] = games.map(game => ({
          id: game.id,
          createdAt: game.createdAt,
          updatedAt: game.updatedAt,
          isCompleted: game.isCompleted,
          size: game.size,
          playerMode: game.playerMode,
          winner: game.result?.winner,
          winReason: game.result?.winReason,
        }));
        
        // Sort by updatedAt descending (most recent first)
        summaries.sort((a, b) => b.updatedAt - a.updatedAt);
        
        resolve(summaries);
      };
    });
  }

  /**
   * Delete a game by ID
   */
  async deleteGame(id: string): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([GAMES_STORE], 'readwrite');
      const store = transaction.objectStore(GAMES_STORE);
      const request = store.delete(id);

      request.onerror = () => {
        console.error('Failed to delete game:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Save user settings
   */
  async saveSettings(settings: UserSettings): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SETTINGS_STORE], 'readwrite');
      const store = transaction.objectStore(SETTINGS_STORE);
      const request = store.put({ key: 'userSettings', ...settings });

      request.onerror = () => {
        console.error('Failed to save settings:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Load user settings
   */
  async loadSettings(): Promise<UserSettings | null> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SETTINGS_STORE], 'readonly');
      const store = transaction.objectStore(SETTINGS_STORE);
      const request = store.get('userSettings');

      request.onerror = () => {
        console.error('Failed to load settings:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const { key, ...settings } = result;
          resolve(settings as UserSettings);
        } else {
          resolve(null);
        }
      };
    });
  }

  /**
   * Get the most recent active (non-completed) game
   */
  async getActiveGame(): Promise<SavedGame | null> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([GAMES_STORE], 'readonly');
      const store = transaction.objectStore(GAMES_STORE);
      const index = store.index('isCompleted');
      const request = index.getAll(IDBKeyRange.only(0));

      request.onerror = () => {
        console.error('Failed to get active game:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        const games: SavedGame[] = request.result;
        if (games.length === 0) {
          resolve(null);
        } else {
          // Return the most recently updated active game
          games.sort((a, b) => b.updatedAt - a.updatedAt);
          resolve(games[0]);
        }
      };
    });
  }

  /**
   * Check if storage is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.init();
      return this.db !== null;
    } catch (error) {
      console.error('Storage not available:', error);
      return false;
    }
  }
}

// Export singleton instance
export const storage = new StorageLayer();
