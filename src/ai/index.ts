/**
 * AI System Exports
 * 
 * Central export point for the AI system.
 */

// Types
export type {
  AIPlayer,
  AiDifficulty,
  AiStatus,
  AiConfig,
  AiMoveResult,
  AiHintResult,
  AiAnalysis,
  AnalysisSource,
  AIPlayerOptions,
} from './types';

// Implementations
export { HeuristicAI, createHeuristicAI } from './HeuristicAI';

// Factory
export { createAIPlayer } from './factory';

// Coach (Future Gemini Integration)
export { GeminiCoach, createGeminiCoach } from './GeminiCoach';
export type { CoachExplanation, MoveExplanation, PositionAnalysis } from './GeminiCoach';
