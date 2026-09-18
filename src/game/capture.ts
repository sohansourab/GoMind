/**
 * Capture logic for Go.
 * When a stone is placed, opponent groups that have zero liberties are captured.
 */

import { Stone, Position, Board } from './types';
import { getStone, setStone, getNeighbors } from './board';
import { getGroupStones, getGroupLiberties } from './groups';

export interface CaptureResult {
  readonly board: Board;
  readonly capturedPositions: Position[];
}

/**
 * After placing a stone, find and remove all opponent groups with zero liberties.
 * Returns the new board and the list of captured positions.
 */
export function captureOpponentGroups(
  board: Board,
  pos: Position,
  playerColor: Stone,
  size: number
): CaptureResult {
  const opponentColor = playerColor === Stone.BLACK ? Stone.WHITE : Stone.BLACK;
  let currentBoard = board;
  const capturedPositions: Position[] = [];

  // Check all neighboring opponent groups
  const neighbors = getNeighbors(pos, size);
  const checkedGroups = new Set<string>();

  for (const neighbor of neighbors) {
    if (getStone(currentBoard, neighbor, size) !== opponentColor) continue;

    // Get the group for this neighbor
    const groupStones = getGroupStones(currentBoard, neighbor, size);
    const groupKey = groupStones.map(s => `${s.x},${s.y}`).sort().join('|');

    if (checkedGroups.has(groupKey)) continue;
    checkedGroups.add(groupKey);

    // Calculate liberties of this group
    const liberties = getGroupLiberties(currentBoard, groupStones, size);

    if (liberties.length === 0) {
      // Capture this group - remove all stones
      for (const stone of groupStones) {
        currentBoard = setStone(currentBoard, stone, size, Stone.EMPTY);
        capturedPositions.push(stone);
      }
    }
  }

  return { board: currentBoard, capturedPositions };
}
