import { Board } from './board';
import { boardHash } from './board';

/**
 * Check if a move violates the ko rule.
 * Simple ko: cannot recreate the previous board position.
 */
export function isKoViolation(newBoard: Board, previousBoardHash: string | null): boolean {
  if (previousBoardHash === null) {
    return false;
  }
  
  const newHash = boardHash(newBoard);
  return newHash === previousBoardHash;
}
