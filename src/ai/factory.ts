/**
 * AI Player Factory
 * 
 * Creates AI player instances based on configuration.
 * This allows easy switching between different AI implementations.
 */

import { AIPlayer, AiDifficulty, AIPlayerOptions } from './types';
import { HeuristicAI } from './HeuristicAI';

/**
 * Create an AI player instance
 * 
 * @param options - Configuration options for the AI player
 * @returns AIPlayer instance
 * 
 * @example
 * ```typescript
 * const ai = createAIPlayer({ difficulty: 'medium' });
 * const move = await ai.getMove(gameState);
 * ```
 */
export function createAIPlayer(options?: AIPlayerOptions): AIPlayer {
  // For now, we only have the HeuristicAI implementation
  // In the future, this factory can be extended to create different AI types
  // based on options (e.g., KataGo, Gemini, etc.)
  
  return new HeuristicAI({
    difficulty: options?.difficulty ?? 'medium',
  });
}

/**
 * Get available AI types
 * 
 * @returns Array of available AI type identifiers
 */
export function getAvailableAITypes(): string[] {
  return ['heuristic'];
}

/**
 * Get available difficulty levels
 * 
 * @returns Array of available difficulty levels
 */
export function getAvailableDifficulties(): AiDifficulty[] {
  return ['beginner', 'easy', 'medium', 'hard', 'expert'];
}
