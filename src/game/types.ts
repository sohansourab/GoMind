export enum Stone {
  EMPTY = 'EMPTY',
  BLACK = 'BLACK',
  WHITE = 'WHITE',
}

export enum Color {
  BLACK = 'BLACK',
  WHITE = 'WHITE',
}

export interface Position {
  x: number;
  y: number;
}

export interface Move {
  position: Position | null;
  color: Color;
  moveNumber: number;
  capturedStones: Position[];
  type: 'play' | 'pass' | 'resign';
}

export interface GameState {
  board: readonly Stone[];
  size: number;
  currentPlayer: Color;
  moveHistory: readonly Move[];
  consecutivePasses: number;
  blackCaptures: number;
  whiteCaptures: number;
  previousBoardHash: string | null;
  isGameOver: boolean;
  winner: Color | null;
  winReason: 'resignation' | 'score' | null;
  komi: number;
  ruleset: 'chinese';
  playerMode: 'human-vs-human' | 'human-vs-computer';
  aiDifficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
}

export interface GameConfig {
  size: number;
  komi: number;
  ruleset: 'chinese';
  playerMode?: 'human-vs-human' | 'human-vs-computer';
  aiDifficulty?: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
}

export interface ScoreResult {
  blackStones: number;
  whiteStones: number;
  blackTerritory: number;
  whiteTerritory: number;
  komi: number;
  blackTotal: number;
  whiteTotal: number;
  winner: Color;
  margin: number;
}

export type AiDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
export type PlayerMode = 'human-vs-human' | 'human-vs-computer';
export type Coordinate = string;
export type Board = readonly Stone[];

export interface MoveResult {
  success: boolean;
  reason?: string;
  newState?: GameState;
}
