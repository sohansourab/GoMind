import { describe, it, expect } from 'vitest';
import { captureOpponentGroups } from '../game/capture';
import { createEmptyBoard, setStone, getStone } from '../game/board';
import { Stone } from '../game/types';

describe('Capture', () => {
  it('captures a single stone in the corner', () => {
    // Black at (0,0). White at (1,0). White plays (0,1) to capture.
    // After placing white at (0,1), black at (0,0) has 0 liberties.
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 0, y: 0 }, 9, Stone.BLACK);
    board = setStone(board, { x: 1, y: 0 }, 9, Stone.WHITE);
    // Place white at (0,1) - now check captures
    board = setStone(board, { x: 0, y: 1 }, 9, Stone.WHITE);
    const result = captureOpponentGroups(board, { x: 0, y: 1 }, Stone.WHITE, 9);
    expect(result.capturedPositions.length).toBe(1);
    expect(result.capturedPositions[0]).toEqual({ x: 0, y: 0 });
    expect(getStone(result.board, { x: 0, y: 0 }, 9)).toBe(Stone.EMPTY);
  });

  it('captures a single stone on the edge', () => {
    // Black at (0,4). White at (0,3), (0,5), and placing at (1,4).
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 0, y: 4 }, 9, Stone.BLACK);
    board = setStone(board, { x: 0, y: 3 }, 9, Stone.WHITE);
    board = setStone(board, { x: 0, y: 5 }, 9, Stone.WHITE);
    board = setStone(board, { x: 1, y: 4 }, 9, Stone.WHITE);
    const result = captureOpponentGroups(board, { x: 1, y: 4 }, Stone.WHITE, 9);
    expect(result.capturedPositions.length).toBe(1);
    expect(getStone(result.board, { x: 0, y: 4 }, 9)).toBe(Stone.EMPTY);
  });

  it('captures multiple stones', () => {
    // Two black stones at (3,4) and (4,4), surrounded by white
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 3, y: 4 }, 9, Stone.BLACK);
    board = setStone(board, { x: 4, y: 4 }, 9, Stone.BLACK);
    board = setStone(board, { x: 2, y: 4 }, 9, Stone.WHITE);
    board = setStone(board, { x: 3, y: 3 }, 9, Stone.WHITE);
    board = setStone(board, { x: 4, y: 3 }, 9, Stone.WHITE);
    board = setStone(board, { x: 3, y: 5 }, 9, Stone.WHITE);
    board = setStone(board, { x: 4, y: 5 }, 9, Stone.WHITE);
    // Place white at (5,4) - completes the surround
    board = setStone(board, { x: 5, y: 4 }, 9, Stone.WHITE);
    const result = captureOpponentGroups(board, { x: 5, y: 4 }, Stone.WHITE, 9);
    expect(result.capturedPositions.length).toBe(2);
  });

  it('does not capture groups with liberties', () => {
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 4, y: 4 }, 9, Stone.BLACK);
    board = setStone(board, { x: 3, y: 4 }, 9, Stone.WHITE);
    // Black still has 3 liberties, no capture
    board = setStone(board, { x: 3, y: 4 }, 9, Stone.WHITE); // already placed
    const result = captureOpponentGroups(board, { x: 3, y: 4 }, Stone.WHITE, 9);
    expect(result.capturedPositions.length).toBe(0);
  });

  it('captures in the center', () => {
    // Black at (4,4) surrounded by white on 3 sides, white completes at (4,5)
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 4, y: 4 }, 9, Stone.BLACK);
    board = setStone(board, { x: 3, y: 4 }, 9, Stone.WHITE);
    board = setStone(board, { x: 5, y: 4 }, 9, Stone.WHITE);
    board = setStone(board, { x: 4, y: 3 }, 9, Stone.WHITE);
    board = setStone(board, { x: 4, y: 5 }, 9, Stone.WHITE);
    const result = captureOpponentGroups(board, { x: 4, y: 5 }, Stone.WHITE, 9);
    expect(result.capturedPositions.length).toBe(1);
    expect(getStone(result.board, { x: 4, y: 4 }, 9)).toBe(Stone.EMPTY);
  });

  it('does not capture own stones', () => {
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 4, y: 4 }, 9, Stone.WHITE);
    board = setStone(board, { x: 3, y: 4 }, 9, Stone.WHITE);
    // Placing white at (3,4) should not capture the white group
    const result = captureOpponentGroups(board, { x: 3, y: 4 }, Stone.WHITE, 9);
    expect(result.capturedPositions.length).toBe(0);
  });
});
