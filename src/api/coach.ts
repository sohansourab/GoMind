/**
 * Coach API
 * 
 * Frontend API client for AI coaching.
 * Currently returns "not implemented" status.
 */

import { apiRequest } from './client';
import { BoardPosition, AnalysisResponse } from './analysis';

export type CoachingContext = 
  | 'move_explanation'
  | 'position_analysis'
  | 'game_review'
  | 'strategy_advice'
  | 'mistake_explanation';

export interface CoachRequest {
  context: CoachingContext;
  board_size: number;
  board_state: Array<Array<'black' | 'white' | 'empty'>>;
  player_to_move: 'black' | 'white';
  komi: number;
  move_position?: BoardPosition;
  move_color?: 'black' | 'white';
  engine_analysis?: AnalysisResponse;
  question?: string;
  language?: string;
  detail_level?: 'brief' | 'standard' | 'detailed';
}

export interface CoachResponse {
  status: 'ok' | 'error' | 'not_implemented';
  message?: string;
  explanation?: string;
  key_points?: string[];
  suggestions?: string[];
  move_quality?: 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
}

export interface CoachStatus {
  service: string;
  status: string;
  engine: string;
  message: string;
}

/**
 * Request AI coaching
 * 
 * Currently returns "not implemented" status.
 * Will be connected to Gemini in Phase 5.
 */
export async function getCoaching(request: CoachRequest): Promise<CoachResponse> {
  return apiRequest<CoachResponse>('/coach/', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get coaching service status
 */
export async function getCoachStatus(): Promise<CoachStatus> {
  return apiRequest<CoachStatus>('/coach/status');
}
