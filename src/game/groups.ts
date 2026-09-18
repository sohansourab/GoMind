/**
 * Group detection using BFS (flood fill).
 * A group is a set of orthogonally connected stones of the same color.
 */

import { Stone, Position, Board, Group } from './types';
import { getStone, getNeighbors } from './board';

/**
 * Find all stones in the group containing the stone at `pos`.
 * Uses BFS to find all connected stones of the same color.
 */
export function getGroupStones(board: Board, pos: Position, size: number): Position[] {
  const stone = getStone(board, pos, size);
  if (stone === Stone.EMPTY) return [];

  const visited = new Set<string>();
  const group: Position[] = [];
  const queue: Position[] = [pos];
  const posKey = (p: Position) => `${p.x},${p.y}`;

  visited.add(posKey(pos));

  while (queue.length > 0) {
    const current = queue.shift()!;
    group.push(current);

    for (const neighbor of getNeighbors(current, size)) {
      const key = posKey(neighbor);
      if (visited.has(key)) continue;

      const neighborStone = getStone(board, neighbor, size);
      if (neighborStone === stone) {
        visited.add(key);
        queue.push(neighbor);
      }
    }
  }

  return group;
}

/**
 * Find all liberties of a group.
 * Liberties are empty intersections orthogonally adjacent to any stone in the group.
 */
export function getGroupLiberties(board: Board, groupStones: Position[], size: number): Position[] {
  const libertySet = new Set<string>();
  const liberties: Position[] = [];
  const posKey = (p: Position) => `${p.x},${p.y}`;

  // Also track which positions are in the group to exclude them
  const groupSet = new Set(groupStones.map(posKey));

  for (const stone of groupStones) {
    for (const neighbor of getNeighbors(stone, size)) {
      const key = posKey(neighbor);
      if (groupSet.has(key)) continue;
      if (libertySet.has(key)) continue;

      if (getStone(board, neighbor, size) === Stone.EMPTY) {
        libertySet.add(key);
        liberties.push(neighbor);
      }
    }
  }

  return liberties;
}

/**
 * Get the complete group (stones + liberties) for a position.
 */
export function getGroup(board: Board, pos: Position, size: number): Group {
  const stones = getGroupStones(board, pos, size);
  const liberties = getGroupLiberties(board, stones, size);
  return { stones, liberties };
}

/**
 * Check if a position contains a stone of the given color.
 */
export function isColor(board: Board, pos: Position, size: number, color: Stone): boolean {
  return getStone(board, pos, size) === color;
}

/**
 * Find all groups of a given color on the board.
 */
export function getAllGroups(board: Board, color: Stone, size: number): Group[] {
  const visited = new Set<string>();
  const groups: Group[] = [];
  const posKey = (p: Position) => `${p.x},${p.y}`;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const pos = { x, y };
      const key = posKey(pos);
      if (visited.has(key)) continue;

      const stone = getStone(board, pos, size);
      if (stone !== color) continue;

      const group = getGroup(board, pos, size);
      for (const s of group.stones) {
        visited.add(posKey(s));
      }
      groups.push(group);
    }
  }

  return groups;
}
