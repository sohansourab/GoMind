/**
 * Storage types for game persistence
 */

import { GameState, Color, AiDifficulty, PlayerMode } from '../game/types';

export interface SavedGame {
  id: string;
  createdAt: number;
  updatedAt: number;
  isCompleted: boolean;
  
  // Game configuration
  size: number;
  ruleset: 'chinese';
  komi: number;
  playerMode: PlayerMode;
  aiDifficulty?: AiDifficulty;
  humanColor?: Color;
  
  // Game state
  gameState: GameState;
  
  // Result (if completed)
  result?: {
    winner: Color;
    winReason: 'resignation' | 'score';
    margin?: number;
    blackScore?: number;
    whiteScore?: number;
  };
}

export interface GameSummary {
  id: string;
  createdAt: number;
  updatedAt: number;
  isCompleted: boolean;
  size: number;
  playerMode: PlayerMode;
  winner?: Color;
  winReason?: 'resignation' | 'score';
}

export interface UserSettings {
  preferredBoardSize: number;
  preferredPlayerMode: PlayerMode;
  preferredAiDifficulty: AiDifficulty;
  preferredKomi: number;
}
