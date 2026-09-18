/**
 * Go coordinate system.
 * Columns: A B C D E F G H J K L M N O P Q R S T (no I)
 * Rows: 1 to size (bottom to top in display, but internally y=0 is top)
 */

import { Position, Coordinate } from './types';

const COLUMN_LETTERS = 'ABCDEFGHJKLMNOPQRST'; // No 'I'

export function positionToCoordinate(pos: Position, size: number): Coordinate {
  if (pos.x < 0 || pos.x >= size || pos.y < 0 || pos.y >= size) {
    throw new Error(`Invalid position (${pos.x}, ${pos.y}) for board size ${size}`);
  }
  const col = COLUMN_LETTERS[pos.x];
  const row = size - pos.y; // Row 1 is at the bottom (y = size - 1)
  return `${col}${row}`;
}

export function coordinateToPosition(coord: Coordinate, size: number): Position {
  const col = coord[0].toUpperCase();
  const row = parseInt(coord.slice(1), 10);

  const x = COLUMN_LETTERS.indexOf(col);
  if (x === -1 || x >= size) {
    throw new Error(`Invalid column '${col}' for board size ${size}`);
  }

  if (isNaN(row) || row < 1 || row > size) {
    throw new Error(`Invalid row '${row}' for board size ${size}`);
  }

  const y = size - row;
  return { x, y };
}

export function isValidCoordinate(coord: string, size: number): boolean {
  try {
    coordinateToPosition(coord, size);
    return true;
  } catch {
    return false;
  }
}
