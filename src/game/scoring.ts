/**
 * Chinese-style area scoring for Go.
 * 
 * In Chinese scoring:
 * - A player's score = stones on board + territory (empty points surrounded)
 * - Komi is added to White's score
 * 
 * Territory determination:
 * An empty point belongs to a player if it is only adjacent (via empty paths)
 * to stones of that player's color. If an empty region is adjacent to both
 * colors, it is neutral (dame).
 */

import { Stone, Color, Position, Board, ScoreResult } from './types';
import { getStone, getNeighbors } from './board';

/**
 * Find all empty regions on the board and determine their ownership.
 * An empty region is owned by a color if all stones adjacent to it are of that color.
 * If adjacent to both colors or neither, it's neutral (dame).
 * 
 * IMPORTANT: A region is only territory if it's ENCLOSED by one color.
 * If a region is too large (more than 20% of the board), it's considered neutral.
 */
function findTerritory(board: Board, size: number): {
  blackTerritory: Position[];
  whiteTerritory: Position[];
  neutralPoints: Position[];
} {
  const visited = new Set<string>();
  const blackTerritory: Position[] = [];
  const whiteTerritory: Position[] = [];
  const neutralPoints: Position[] = [];
  const posKey = (p: Position) => `${p.x},${p.y}`;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const pos = { x, y };
      const key = posKey(pos);
      if (visited.has(key)) continue;

      const stone = getStone(board, pos, size);
      if (stone !== Stone.EMPTY) continue;

      // BFS to find the entire empty region
      const region: Position[] = [];
      const queue: Position[] = [pos];
      const regionVisited = new Set<string>();
      regionVisited.add(key);

      let adjacentToBlack = false;
      let adjacentToWhite = false;

      while (queue.length > 0) {
        const current = queue.shift()!;
        region.push(current);

        for (const neighbor of getNeighbors(current, size)) {
          const nStone = getStone(board, neighbor, size);
          if (nStone === Stone.BLACK) {
            adjacentToBlack = true;
          } else if (nStone === Stone.WHITE) {
            adjacentToWhite = true;
          } else {
            const nKey = posKey(neighbor);
            if (!regionVisited.has(nKey)) {
              regionVisited.add(nKey);
              queue.push(neighbor);
            }
          }
        }
      }

      // Mark all positions in region as visited
      for (const p of region) {
        visited.add(posKey(p));
      }

      // Determine ownership
      // A region is territory only if it's enclosed by one color
      // If it's too large (more than 20% of the board), it's probably not territory
      const onlyBlack = adjacentToBlack && !adjacentToWhite;
      const onlyWhite = adjacentToWhite && !adjacentToBlack;
      const maxTerritorySize = Math.floor(size * size * 0.2);
      const isSmallEnough = region.length <= maxTerritorySize;
      
      if (onlyBlack && isSmallEnough) {
        blackTerritory.push(...region);
      } else if (onlyWhite && isSmallEnough) {
        whiteTerritory.push(...region);
      } else {
        neutralPoints.push(...region);
      }
    }
  }

  return { blackTerritory, whiteTerritory, neutralPoints };
}

/**
 * Count stones of a given color on the board.
 */
function countStones(board: Board, color: Stone): number {
  return board.filter(s => s === color).length;
}

/**
 * Calculate the final score using Chinese area scoring.
 */
export function calculateScore(board: Board, size: number, komi: number): ScoreResult {
  const blackStones = countStones(board, Stone.BLACK);
  const whiteStones = countStones(board, Stone.WHITE);

  const { blackTerritory, whiteTerritory } = findTerritory(board, size);

  const blackTotal = blackStones + blackTerritory.length;
  const whiteTotal = whiteStones + whiteTerritory.length + komi;

  const winner = blackTotal > whiteTotal ? Color.BLACK : Color.WHITE;
  const margin = Math.abs(blackTotal - whiteTotal);

  return {
    blackStones,
    whiteStones,
    blackTerritory: blackTerritory.length,
    whiteTerritory: whiteTerritory.length,
    komi,
    blackTotal,
    whiteTotal,
    winner,
    margin,
  };
}
