import { Stone, Position } from './types';
import { Board, getStone, getNeighbors } from './board';

export interface Group {
  stones: Position[];
  liberties: Position[];
}

export function getGroup(board: Board, pos: Position, size: number): Group {
  const stone = getStone(board, pos, size);
  if (stone === Stone.EMPTY) {
    return { stones: [], liberties: [] };
  }

  const stones: Position[] = [];
  const visited = new Set<string>();
  const queue: Position[] = [pos];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = `${current.x},${current.y}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    
    const currentStone = getStone(board, current, size);
    if (currentStone === stone) {
      stones.push(current);
      
      for (const neighbor of getNeighbors(current, size)) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        if (!visited.has(neighborKey)) {
          queue.push(neighbor);
        }
      }
    }
  }

  const liberties = getGroupLiberties(board, stones, size);
  return { stones, liberties };
}

export function getGroupLiberties(board: Board, stones: Position[], size: number): Position[] {
  const libertySet = new Set<string>();
  const liberties: Position[] = [];

  for (const stone of stones) {
    for (const neighbor of getNeighbors(stone, size)) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (!libertySet.has(key) && getStone(board, neighbor, size) === Stone.EMPTY) {
        libertySet.add(key);
        liberties.push(neighbor);
      }
    }
  }

  return liberties;
}
