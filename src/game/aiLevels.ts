/**
 * AI difficulty levels for Go.
 * 
 * Easy: Random-ish play with minimal heuristics. Makes frequent mistakes.
 * Medium: Reasonable heuristic play. Captures, defends, attacks.
 * Hard: Stronger evaluation with look-ahead and better territory sense.
 */

import type { AiDifficulty } from './types';

export type { AiDifficulty };

/**
 * Configuration for each difficulty level.
 * Controls how the AI evaluates and selects moves.
 */
export const AI_CONFIGS: Record<AiDifficulty, AiLevelConfig> = {
  easy: {
    // Capture weight: low (only captures very obvious ones)
    captureWeight: 10,
    // Defense weight: very low (rarely saves own groups)
    defenseWeight: 3,
    // Attack weight: low
    attackWeight: 2,
    // Proximity bonus: minimal
    proximityWeight: 0.5,
    // Influence (wider area): none
    influenceWeight: 0,
    // Star point preference: none
    starPointWeight: 0,
    // Line preference: none
    linePreferenceWeight: 0,
    // Eye avoidance: sometimes fills own eyes (20% chance to ignore)
    eyeAvoidanceStrength: 0.3,
    // Randomness: very high
    randomness: 15,
    // Look-ahead depth: 0 (no search)
    lookAheadDepth: 0,
    // Pass threshold: passes more readily
    passThreshold: -5,
    // Top-N selection pool: wider (more random choices)
    topSelectionPool: 8,
    // Self-atari avoidance: weak
    selfAtariPenalty: 5,
    // Territory estimation: none
    territoryWeight: 0,
  },
  medium: {
    captureWeight: 30,
    defenseWeight: 20,
    attackWeight: 8,
    proximityWeight: 3,
    influenceWeight: 1,
    starPointWeight: 5,
    linePreferenceWeight: 3,
    eyeAvoidanceStrength: 1.0,
    randomness: 2,
    lookAheadDepth: 0,
    passThreshold: -10,
    topSelectionPool: 3,
    selfAtariPenalty: 15,
    territoryWeight: 0,
  },
  hard: {
    captureWeight: 40,
    defenseWeight: 35,
    attackWeight: 15,
    proximityWeight: 4,
    influenceWeight: 2,
    starPointWeight: 6,
    linePreferenceWeight: 4,
    eyeAvoidanceStrength: 1.0,
    randomness: 1,
    lookAheadDepth: 2,
    passThreshold: -15,
    topSelectionPool: 2,
    selfAtariPenalty: 30,
    territoryWeight: 5,
  },
};

export interface AiLevelConfig {
  readonly captureWeight: number;
  readonly defenseWeight: number;
  readonly attackWeight: number;
  readonly proximityWeight: number;
  readonly influenceWeight: number;
  readonly starPointWeight: number;
  readonly linePreferenceWeight: number;
  readonly eyeAvoidanceStrength: number; // 0 = no avoidance, 1 = full avoidance
  readonly randomness: number;
  readonly lookAheadDepth: number; // 0 = no look-ahead, 1-2 = shallow search
  readonly passThreshold: number;
  readonly topSelectionPool: number;
  readonly selfAtariPenalty: number;
  readonly territoryWeight: number;
}
