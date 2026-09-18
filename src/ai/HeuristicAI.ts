/**
 * Heuristic AI Player
 * 
 * Wraps the existing heuristic AI implementation from src/game/ai.ts
 * This preserves all existing functionality while conforming to the AIPlayer interface.
 */

import { AIPlayer, AiMoveResult, AiHintResult, AiAnalysis, AiDifficulty } from './types';
import { GameState, Position, Color } from '../game/types';
import type { AiDifficulty as LegacyAiDifficulty } from '../game/types';
import { chooseMove, shouldPass as legacyShouldPass } from '../game/ai';

/**
 * Map new difficulty levels to legacy difficulty levels
 * The legacy AI supports 'beginner', 'easy', 'medium', 'hard', 'expert'
 */
function mapDifficulty(newDifficulty: AiDifficulty): LegacyAiDifficulty {
  // All 5 levels are now supported directly
  return newDifficulty;
}

/**
 * Heuristic AI implementation
 * Uses the existing heuristic algorithm from src/game/ai.ts
 */
export class HeuristicAI implements AIPlayer {
  readonly name = 'Heuristic AI';
  readonly difficulty: AiDifficulty;
  
  constructor(options?: { difficulty?: AiDifficulty }) {
    this.difficulty = options?.difficulty ?? 'medium';
  }
  
  /**
   * Generate a move using the heuristic algorithm
   */
  async getMove(state: GameState): Promise<AiMoveResult> {
    // Map new difficulty to legacy difficulty
    const legacyDifficulty = mapDifficulty(this.difficulty);
    
    // Use the existing chooseMove function
    const position = chooseMove(state, legacyDifficulty);
    
    return {
      position,
      // Heuristic AI doesn't provide confidence scores yet
      // This can be added in the future if needed
    };
  }
  
  /**
   * Generate a hint using the heuristic algorithm
   * For now, this uses the same logic as getMove
   */
  async getHint(state: GameState, forColor: Color): Promise<AiHintResult> {
    // Create a temporary state with the requested color as current player
    // This is a bit of a hack, but it allows us to reuse the existing logic
    const tempState: GameState = {
      ...state,
      currentPlayer: forColor,
    };
    
    const legacyDifficulty = mapDifficulty(this.difficulty);
    const position = chooseMove(tempState, legacyDifficulty);
    
    return {
      position,
      // Heuristic AI doesn't provide detailed explanations yet
      // This can be enhanced in the future
    };
  }
  
  /**
   * Analyze the current position
   * Heuristic AI provides limited analysis
   */
  async analyze(state: GameState): Promise<AiAnalysis> {
    const legacyDifficulty = mapDifficulty(this.difficulty);
    const suggestedMove = chooseMove(state, legacyDifficulty);
    
    return {
      suggestedMove,
      // Heuristic AI doesn't provide win rate, score, or territory
      // These would require engine integration (KataGo)
      source: 'heuristic',
    };
  }
  
  /**
   * Check if the AI should pass
   */
  async shouldPass(state: GameState): Promise<boolean> {
    const legacyDifficulty = mapDifficulty(this.difficulty);
    return legacyShouldPass(state, legacyDifficulty);
  }
}

/**
 * Factory function to create a HeuristicAI instance
 */
export function createHeuristicAI(options?: { difficulty?: AiDifficulty }): AIPlayer {
  return new HeuristicAI(options);
}
