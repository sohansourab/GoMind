/**
 * API Module
 * 
 * Centralized API client for Satori backend.
 */

export { apiRequest, API_BASE_URL } from './client';
export { analyzePosition, getAnalysisStatus } from './analysis';
export { getCoaching, getCoachStatus } from './coach';

export type {
  BoardPosition,
  Move,
  AnalysisRequest,
  CandidateMove,
  AnalysisResponse,
  AnalysisStatus,
} from './analysis';

export type {
  CoachingContext,
  CoachRequest,
  CoachResponse,
  CoachStatus,
} from './coach';
