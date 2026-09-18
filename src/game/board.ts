import { Stone, Position } from './types';

export type Board = readonly Stone[];

export function createEmptyBoard(size: number): Board {
  return Array(size * size).fill(Stone.EMPTY);
}

export function getStone(board: Board, pos: Position, size: number): Stone {
  if (pos.x < 0 || pos.x >= size || pos.y < 0 || pos.y >= size) {
    return Stone.EMPTY;
  }
  return board[pos.y * size + pos.x];
}

export function setStone(board: Board, pos: Position, size: number, stone: Stone): Board {
  const newBoard = [...board];
  newBoard[pos.y * size + pos.x] = stone;
  return newBoard;
}

export function getNeighbors(pos: Position, size: number): Position[] {
  const neighbors: Position[] = [];
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 },  // right
  ];
  
  for (const dir of directions) {
    const newPos = { x: pos.x + dir.x, y: pos.y + dir.y };
    if (newPos.x >= 0 && newPos.x < size && newPos.y >= 0 && newPos.y < size) {
      neighbors.push(newPos);
    }
  }
  
  return neighbors;
}

export function boardHash(board: Board): string {
  return board.join('');
}
