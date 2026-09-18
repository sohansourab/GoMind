/**
 * Core types for the Go game engine.
 * The engine is completely independent of React/UI.
 */

export enum Color {
  BLACK = 'BLACK',
  WHITE = 'WHITE',
}

export enum Stone {
  EMPTY = 'EMPTY',
  BLACK = 'BLACK',
  WHITE = 'WHITE',
}

export interface Position {
  readonly x: number;
  readonly y: number;
}

export type Coordinate = string; // e.g., "A1", "T19"

export type Board = readonly Stone[];

export interface BoardConfig {
  readonly size: number; // 9, 13, or 19
}

export type MoveType = 'play' | 'pass' | 'resign';

export interface Move {
  readonly moveNumber: number;
  readonly color: Color;
  readonly position: Position | null; // null for pass/resign
  readonly capturedStones: readonly Position[];
  readonly type: MoveType;
}

export interface GameState {
  readonly board: Board;
  readonly size: number;
  readonly currentPlayer: Color;
  readonly moveHistory: readonly Move[];
  readonly consecutivePasses: number;
  readonly blackCaptures: number;
  readonly whiteCaptures: number;
  readonly previousBoardHash: string | null; // For ko detection
  readonly isGameOver: boolean;
  readonly winner: Color | null;
  readonly winReason: 'resignation' | 'score' | null;
  readonly komi: number;
  readonly ruleset: 'chinese';
  readonly playerMode: PlayerMode;
  readonly aiDifficulty: AiDifficulty;
}

export type PlayerMode = 'human-vs-human' | 'human-vs-computer';
export type AiDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

export interface GameConfig {
  readonly size: number;
  readonly komi: number;
  readonly ruleset: 'chinese';
  readonly playerMode?: PlayerMode;
  readonly aiDifficulty?: AiDifficulty;
}

export interface GameResult {
  readonly winner: Color;
  readonly winReason: 'resignation' | 'score';
  readonly blackScore: number;
  readonly whiteScore: number;
  readonly blackStones: number;
  readonly whiteStones: number;
  readonly blackTerritory: number;
  readonly whiteTerritory: number;
  readonly komi: number;
}

export interface Group {
  readonly stones: readonly Position[];
  readonly liberties: readonly Position[];
}

export type MoveResult =
  | { success: true; newState: GameState }
  | { success: false; reason: string };

export interface ScoreResult {
  readonly blackStones: number;
  readonly whiteStones: number;
  readonly blackTerritory: number;
  readonly whiteTerritory: number;
  readonly komi: number;
  readonly blackTotal: number;
  readonly whiteTotal: number;
  readonly winner: Color;
  readonly margin: number;
}
