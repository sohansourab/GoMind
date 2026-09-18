/**
 * Analysis API
 * 
 * Frontend API client for position analysis.
 * Currently returns "not implemented" status.
 */

import { apiRequest } from './client';

export interface BoardPosition {
  x: number;
  y: number;
}

export interface Move {
  color: 'black' | 'white' | 'empty';
  position: BoardPosition | null;
  move_number: number;
}

export interface AnalysisRequest {
  board_size: number;
  board_state: Array<Array<'black' | 'white' | 'empty'>>;
  player_to_move: 'black' | 'white';
  komi: number;
  move_history?: Move[];
  analysis_type?: 'standard' | 'deep' | 'quick';
  max_visits?: number;
}

export interface CandidateMove {
  position: BoardPosition;
  win_rate: number;
  score_estimate: number;
  visits: number;
}

export interface AnalysisResponse {
  status: 'ok' | 'error' | 'not_implemented';
  message?: string;
  best_move?: CandidateMove;
  win_rate?: number;
  score_estimate?: number;
  candidate_moves?: CandidateMove[];
  principal_variation?: BoardPosition[];
}

export interface AnalysisStatus {
  service: string;
  status: string;
  engine: string;
  message: string;
}

/**
 * Request position analysis
 * 
 * Currently returns "not implemented" status.
 * Will be connected to KataGo in Phase 4.
 */
export async function analyzePosition(request: AnalysisRequest): Promise<AnalysisResponse> {
  return apiRequest<AnalysisResponse>('/analysis/', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get analysis service status
 */
export async function getAnalysisStatus(): Promise<AnalysisStatus> {
  return apiRequest<AnalysisStatus>('/analysis/status');
}
