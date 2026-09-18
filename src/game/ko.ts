/**
 * Ko rule implementation.
 * 
 * This implements simple ko (positional superko is not used in this version).
 * A player must not recreate the board position that existed immediately before
 * the opponent's last move. This prevents infinite capture-recapture cycles.
 * 
 * NOTE: This is "simple ko" - it only checks the immediately previous board position.
 * For positional/superko (checking all previous positions), the implementation can
 * be extended by storing all board hashes in game history.
 */

import { Board } from './types';
import { boardHash } from './board';

/**
 * Check if placing a stone would violate the ko rule.
 * The ko rule prevents recreating the board position from before the opponent's last move.
 * 
 * @param newBoard The board after the proposed move
 * @param previousBoardHash The hash of the board position before the opponent's last move
 * @returns true if the move violates ko (is illegal)
 */
export function isKoViolation(newBoard: Board, previousBoardHash: string | null): boolean {
  if (previousBoardHash === null) return false;
  const newHash = boardHash(newBoard);
  return newHash === previousBoardHash;
}

/**
 * Get the board hash that should be stored as the "previous board hash" for ko checking.
 * This is the board state BEFORE the current player's move (i.e., after the opponent's move).
 * 
 * In simple ko, we store the position before the opponent's last move.
 * This means: after player A plays, the ko-check position is the board before A's move.
 */
export function getKoCheckHash(boardBeforeMove: Board): string {
  return boardHash(boardBeforeMove);
}
