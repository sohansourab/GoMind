/**
 * Board operations for Go.
 * Board is represented as a flat array of Stone values.
 * Index = y * size + x
 */

import { Stone, Position, Board, BoardConfig } from './types';

export function createEmptyBoard(config: BoardConfig): Board {
  const length = config.size * config.size;
  return Array(length).fill(Stone.EMPTY);
}

export function getIndex(pos: Position, size: number): number {
  return pos.y * size + pos.x;
}

export function getPosition(index: number, size: number): Position {
  return { x: index % size, y: Math.floor(index / size) };
}

export function getStone(board: Board, pos: Position, size: number): Stone {
  if (!isOnBoard(pos, size)) return Stone.EMPTY;
  return board[getIndex(pos, size)];
}

export function setStone(board: Board, pos: Position, size: number, stone: Stone): Board {
  const newBoard = [...board];
  newBoard[getIndex(pos, size)] = stone;
  return newBoard;
}

export function isOnBoard(pos: Position, size: number): boolean {
  return pos.x >= 0 && pos.x < size && pos.y >= 0 && pos.y < size;
}

/**
 * Returns orthogonal neighbors (up, down, left, right).
 * Only returns positions that are on the board.
 */
export function getNeighbors(pos: Position, size: number): Position[] {
  const directions: Position[] = [
    { x: 0, y: -1 }, // up
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 },  // right
  ];
  return directions
    .map(d => ({ x: pos.x + d.x, y: pos.y + d.y }))
    .filter(p => isOnBoard(p, size));
}

export function boardToString(board: Board, size: number): string {
  return board.map(s => s === Stone.BLACK ? 'B' : s === Stone.WHITE ? 'W' : '.').join('');
}

export function boardHash(board: Board): string {
  return boardToString(board, Math.sqrt(board.length));
}

export function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}
