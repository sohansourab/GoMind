import { describe, it, expect } from 'vitest';
import { calculateScore } from '../game/scoring';
import { createEmptyBoard, setStone } from '../game/board';
import { Stone, Color } from '../game/types';

describe('Scoring (Chinese Area)', () => {
  it('scores an empty board as 0-0 (white wins by komi)', () => {
    const board = createEmptyBoard({ size: 9 });
    const score = calculateScore(board, 9, 7.5);
    expect(score.blackStones).toBe(0);
    expect(score.whiteStones).toBe(0);
    expect(score.blackTerritory).toBe(0);
    expect(score.whiteTerritory).toBe(0);
    expect(score.blackTotal).toBe(0);
    expect(score.whiteTotal).toBe(7.5);
    expect(score.winner).toBe(Color.WHITE);
  });

  it('counts stones correctly', () => {
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 0, y: 0 }, 9, Stone.BLACK);
    board = setStone(board, { x: 1, y: 0 }, 9, Stone.BLACK);
    board = setStone(board, { x: 8, y: 8 }, 9, Stone.WHITE);
    
    const score = calculateScore(board, 9, 0);
    expect(score.blackStones).toBe(2);
    expect(score.whiteStones).toBe(1);
  });

  it('identifies simple territory', () => {
    // Black surrounds the top-left corner
    // . . . . .
    // . . . . .
    // . . B B B
    // . . B . .
    // . . B . .
    // Actually let me use a simpler enclosed territory
    
    // On a 9x9 board, black surrounds corner (0,0):
    // Black at (1,0), (0,1) - this encloses (0,0) as black territory
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 1, y: 0 }, 9, Stone.BLACK);
    board = setStone(board, { x: 0, y: 1 }, 9, Stone.BLACK);
    
    const score = calculateScore(board, 9, 0);
    expect(score.blackStones).toBe(2);
    expect(score.blackTerritory).toBe(1); // (0,0) is black territory
    expect(score.blackTotal).toBe(3);
  });

  it('identifies neutral (dame) points', () => {
    // A point between black and white stones is neutral
    let board = createEmptyBoard({ size: 9 });
    // Black at (3,4), White at (5,4) - (4,4) should be neutral
    // Actually (4,4) is adjacent to neither directly... let me think
    // For (4,4) to be neutral, it needs to be reachable from both colors
    // through empty space. On an otherwise empty board, all empty points
    // are adjacent to both colors if both exist.
    
    // Let me create a clear dame point:
    // Black wall and White wall with a gap
    // Actually on an empty board with just 2 stones far apart,
    // all empty space is one region adjacent to both = neutral
    
    board = setStone(board, { x: 0, y: 0 }, 9, Stone.BLACK);
    board = setStone(board, { x: 8, y: 8 }, 9, Stone.WHITE);
    
    const score = calculateScore(board, 9, 0);
    // All 79 empty points are in one region adjacent to both colors
    expect(score.blackTerritory).toBe(0);
    expect(score.whiteTerritory).toBe(0);
    // Total empty = 81 - 2 = 79, all neutral
    expect(score.blackStones).toBe(1);
    expect(score.whiteStones).toBe(1);
  });

  it('applies komi correctly', () => {
    const board = createEmptyBoard({ size: 9 });
    const score7 = calculateScore(board, 9, 7.5);
    expect(score7.whiteTotal).toBe(7.5);
    expect(score7.komi).toBe(7.5);
    
    const score6 = calculateScore(board, 9, 6.5);
    expect(score6.whiteTotal).toBe(6.5);
    expect(score6.komi).toBe(6.5);
  });

  it('scores a mixed position correctly', () => {
    // Create a position with clear territories
    let board = createEmptyBoard({ size: 9 });
    
    // Black territory in top-left corner (enclosed)
    // B B B . .
    // B . B . .
    // B B B . .
    board = setStone(board, { x: 0, y: 0 }, 9, Stone.BLACK);
    board = setStone(board, { x: 1, y: 0 }, 9, Stone.BLACK);
    board = setStone(board, { x: 2, y: 0 }, 9, Stone.BLACK);
    board = setStone(board, { x: 0, y: 1 }, 9, Stone.BLACK);
    board = setStone(board, { x: 2, y: 1 }, 9, Stone.BLACK);
    board = setStone(board, { x: 0, y: 2 }, 9, Stone.BLACK);
    board = setStone(board, { x: 1, y: 2 }, 9, Stone.BLACK);
    board = setStone(board, { x: 2, y: 2 }, 9, Stone.BLACK);
    // (1,1) is black territory
    
    // White territory in bottom-right corner (enclosed)
    // . . . W W W
    // . . . W . W
    // . . . W W W
    board = setStone(board, { x: 6, y: 6 }, 9, Stone.WHITE);
    board = setStone(board, { x: 7, y: 6 }, 9, Stone.WHITE);
    board = setStone(board, { x: 8, y: 6 }, 9, Stone.WHITE);
    board = setStone(board, { x: 6, y: 7 }, 9, Stone.WHITE);
    board = setStone(board, { x: 8, y: 7 }, 9, Stone.WHITE);
    board = setStone(board, { x: 6, y: 8 }, 9, Stone.WHITE);
    board = setStone(board, { x: 7, y: 8 }, 9, Stone.WHITE);
    board = setStone(board, { x: 8, y: 8 }, 9, Stone.WHITE);
    // (7,7) is white territory
    
    const score = calculateScore(board, 9, 0);
    expect(score.blackStones).toBe(8);
    expect(score.whiteStones).toBe(8);
    expect(score.blackTerritory).toBe(1); // (1,1)
    expect(score.whiteTerritory).toBe(1); // (7,7)
    // The rest is neutral (dame)
  });
});
