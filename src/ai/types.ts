/**
 * AI System Types
 * 
 * Defines the interface and types for the AI system.
 * This abstraction allows multiple AI implementations (heuristic, KataGo, etc.)
 * to be used interchangeably.
 */

import { GameState, Position, Color } from '../game/types';

/**
 * AI difficulty levels
 */
export type AiDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

/**
 * AI thinking status
 */
export type AiStatus = 'idle' | 'thinking' | 'playing' | 'error' | 'game-over';

/**
 * Source of AI analysis
 */
export type AnalysisSource = 'heuristic' | 'engine' | 'gemini';

/**
 * AI move result
 */
export interface AiMoveResult {
  position: Position | null; // null means pass
  confidence?: number; // Optional: 0-1 confidence score (not implemented yet)
  reasoning?: string; // Optional: explanation of why this move was chosen
}

/**
 * AI hint result
 */
export interface AiHintResult {
  position: Position | null;
  explanation?: string;
}

/**
 * AI analysis result
 * Note: Most fields are optional as they require engine integration
 */
export interface AiAnalysis {
  suggestedMove?: Position | null;
  winRate?: number; // Only available with engine (KataGo)
  score?: number; // Only available with engine (KataGo)
  territory?: {
    black: number;
    white: number;
  };
  explanation?: string;
  source: AnalysisSource;
}

/**
 * AI configuration
 */
export interface AiConfig {
  difficulty: AiDifficulty;
  thinkingTime?: number; // milliseconds (for future engine integration)
}

/**
 * AI Player Interface
 * 
 * All AI implementations must implement this interface.
 * This allows the React layer to work with any AI backend.
 */
export interface AIPlayer {
  /**
   * Get the AI's name/identifier
   */
  readonly name: string;
  
  /**
   * Get the AI's difficulty level
   */
  readonly difficulty: AiDifficulty;
  
  /**
   * Generate a move for the current game state
   * 
   * @param state - Current game state
   * @returns Promise resolving to move result
   */
  getMove(state: GameState): Promise<AiMoveResult>;
  
  /**
   * Generate a hint for the current player
   * 
   * @param state - Current game state
   * @param forColor - Color to generate hint for
   * @returns Promise resolving to hint result
   */
  getHint(state: GameState, forColor: Color): Promise<AiHintResult>;
  
  /**
   * Analyze the current position
   * 
   * @param state - Current game state
   * @returns Promise resolving to analysis result
   */
  analyze(state: GameState): Promise<AiAnalysis>;
  
  /**
   * Check if the AI should pass instead of playing
   * 
   * @param state - Current game state
   * @returns Promise resolving to boolean
   */
  shouldPass(state: GameState): Promise<boolean>;
}

/**
 * AI Player constructor options
 */
export interface AIPlayerOptions {
  difficulty?: AiDifficulty;
  config?: Partial<AiConfig>;
}
