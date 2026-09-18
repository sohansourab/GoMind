/**
 * Public API for game storage
 */

import { storage } from './indexedDB';
import { SavedGame, GameSummary, UserSettings } from './types';
import { GameState, Color } from '../game/types';
import { calculateScore } from '../game/scoring';

/**
 * Generate a unique game ID
 */
function generateGameId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Save a game to storage
 */
export async function saveGame(
  gameState: GameState,
  isCompleted: boolean = false,
  existingId?: string,
  name?: string
): Promise<string> {
  const now = Date.now();
  const id = existingId || generateGameId();

  const savedGame: SavedGame = {
    id,
    name,
    createdAt: existingId ? now : now, // Will be updated if existing
    updatedAt: now,
    isCompleted,
    size: gameState.size,
    ruleset: gameState.ruleset,
    komi: gameState.komi,
    playerMode: gameState.playerMode,
    aiDifficulty: gameState.aiDifficulty,
    gameState,
  };

  // If completed, add result
  if (isCompleted && gameState.isGameOver && gameState.winner && gameState.winReason) {
    const score = gameState.winReason === 'score' 
      ? calculateScoreFromState(gameState)
      : null;

    savedGame.result = {
      winner: gameState.winner,
      winReason: gameState.winReason,
      margin: score?.margin,
      blackScore: score?.blackTotal,
      whiteScore: score?.whiteTotal,
    };
  }

  // If creating new game, set createdAt
  if (!existingId) {
    savedGame.createdAt = now;
  } else {
    // Load existing to preserve createdAt and name
    const existing = await storage.loadGame(id);
    if (existing) {
      savedGame.createdAt = existing.createdAt;
      // Preserve existing name if not provided
      if (!name && existing.name) {
        savedGame.name = existing.name;
      }
    }
  }

  await storage.saveGame(savedGame);
  return id;
}

/**
 * Load a game from storage
 */
export async function loadGame(id: string): Promise<GameState | null> {
  const savedGame = await storage.loadGame(id);
  return savedGame?.gameState || null;
}

/**
 * Load full saved game data
 */
export async function loadFullGame(id: string): Promise<SavedGame | null> {
  return await storage.loadGame(id);
}

/**
 * List all saved games
 */
export async function listGames(): Promise<GameSummary[]> {
  return await storage.listGames();
}

/**
 * Delete a game
 */
export async function deleteGame(id: string): Promise<void> {
  await storage.deleteGame(id);
}

/**
 * Get the most recent active game
 */
export async function getActiveGame(): Promise<SavedGame | null> {
  return await storage.getActiveGame();
}

/**
 * Save user settings
 */
export async function saveSettings(settings: UserSettings): Promise<void> {
  await storage.saveSettings(settings);
}

/**
 * Load user settings
 */
export async function loadSettings(): Promise<UserSettings | null> {
  return await storage.loadSettings();
}

/**
 * Check if storage is available
 */
export async function isStorageAvailable(): Promise<boolean> {
  return await storage.isAvailable();
}

/**
 * Helper to calculate score from game state
 */
function calculateScoreFromState(gameState: GameState) {
  return calculateScore(gameState.board, gameState.size, gameState.komi);
}

/**
 * Generate a default name for a game
 */
export function generateDefaultGameName(game: SavedGame): string {
  const sizeStr = `${game.size}×${game.size}`;
  const modeStr = game.playerMode === 'human-vs-computer' ? 'vs Computer' : 'vs Human';
  const difficultyStr = game.aiDifficulty ? ` (${game.aiDifficulty})` : '';
  const date = new Date(game.createdAt);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  return `${sizeStr} ${modeStr}${difficultyStr} - ${dateStr}`;
}

/**
 * Rename a game
 */
export async function renameGame(id: string, name: string): Promise<void> {
  const game = await storage.loadGame(id);
  if (!game) {
    throw new Error('Game not found');
  }
  
  game.name = name;
  game.updatedAt = Date.now();
  await storage.saveGame(game);
}

/**
 * Determine if human won
 */
export function didHumanWin(gameState: GameState): boolean | null {
  if (!gameState.isGameOver || !gameState.winner) {
    return null;
  }

  if (gameState.playerMode === 'human-vs-computer') {
    // Human is always Black in current implementation
    return gameState.winner === Color.BLACK;
  }

  // For human vs human, there's no "human" winner
  return null;
}
