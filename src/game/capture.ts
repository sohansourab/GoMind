import { Stone, Position } from './types';
import { Board, getStone, setStone } from './board';
import { getGroup } from './groups';

export interface CaptureResult {
  board: Board;
  capturedStones: Position[];
}

export function captureOpponentGroups(
  board: Board,
  pos: Position,
  stoneColor: Stone,
  size: number
): CaptureResult {
  const opponentColor = stoneColor === Stone.BLACK ? Stone.WHITE : Stone.BLACK;
  let newBoard = board;
  const capturedStones: Position[] = [];

  // Check all neighboring positions for opponent groups
  const checkedGroups = new Set<string>();
  
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (Math.abs(dx) + Math.abs(dy) !== 1) continue; // Only orthogonal
      
      const neighborPos = { x: pos.x + dx, y: pos.y + dy };
      if (neighborPos.x < 0 || neighborPos.x >= size || 
          neighborPos.y < 0 || neighborPos.y >= size) continue;
      
      const neighborStone = getStone(newBoard, neighborPos, size);
      if (neighborStone !== opponentColor) continue;
      
      const groupKey = `${neighborPos.x},${neighborPos.y}`;
      if (checkedGroups.has(groupKey)) continue;
      
      const group = getGroup(newBoard, neighborPos, size);
      
      // Mark all stones in this group as checked
      for (const stone of group.stones) {
        checkedGroups.add(`${stone.x},${stone.y}`);
      }
      
      // If group has no liberties, capture it
      if (group.liberties.length === 0) {
        for (const stone of group.stones) {
          newBoard = setStone(newBoard, stone, size, Stone.EMPTY);
          capturedStones.push(stone);
        }
      }
    }
  }

  return { board: newBoard, capturedStones };
}
