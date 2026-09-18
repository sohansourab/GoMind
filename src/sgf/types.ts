/**
 * SGF (Smart Game Format) type definitions
 * SGF is the standard format for recording Go games
 */

export interface SgfGameInfo {
  size: number;
  komi: number;
  blackName?: string;
  whiteName?: string;
  blackRank?: string;
  whiteRank?: string;
  result?: string;
  date?: string;
  eventName?: string;
  round?: string;
  rules?: string;
  timeLimit?: number;
}

export interface SgfMove {
  color: 'B' | 'W';
  position: { x: number; y: number } | null; // null for pass
  moveNumber: number;
}

export interface SgfGame {
  gameInfo: SgfGameInfo;
  moves: SgfMove[];
}

export interface SgfParseResult {
  success: true;
  game: SgfGame;
}

export interface SgfParseError {
  success: false;
  error: string;
  line?: number;
  column?: number;
}

export type SgfParseResponse = SgfParseResult | SgfParseError;
