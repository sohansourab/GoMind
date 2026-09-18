import { describe, it, expect } from 'vitest';
import { getGroup, getGroupStones, getGroupLiberties } from '../game/groups';
import { createEmptyBoard, setStone } from '../game/board';
import { Stone } from '../game/types';

describe('Liberties', () => {
  it('corner stone has 2 liberties', () => {
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 0, y: 0 }, 9, Stone.BLACK);
    const group = getGroup(board, { x: 0, y: 0 }, 9);
    expect(group.liberties.length).toBe(2);
  });

  it('edge stone has 3 liberties', () => {
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 0, y: 4 }, 9, Stone.BLACK);
    const group = getGroup(board, { x: 0, y: 4 }, 9);
    expect(group.liberties.length).toBe(3);
  });

  it('center stone has 4 liberties', () => {
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 4, y: 4 }, 9, Stone.BLACK);
    const group = getGroup(board, { x: 4, y: 4 }, 9);
    expect(group.liberties.length).toBe(4);
  });

  it('connected group shares liberties', () => {
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 3, y: 4 }, 9, Stone.BLACK);
    board = setStone(board, { x: 4, y: 4 }, 9, Stone.BLACK);
    const group = getGroup(board, { x: 3, y: 4 }, 9);
    // Two horizontal stones in center: 6 liberties (not 8)
    expect(group.stones.length).toBe(2);
    expect(group.liberties.length).toBe(6);
  });

  it('group with reduced liberties', () => {
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 4, y: 4 }, 9, Stone.BLACK);
    board = setStone(board, { x: 3, y: 4 }, 9, Stone.WHITE);
    board = setStone(board, { x: 5, y: 4 }, 9, Stone.WHITE);
    // Black at center with 2 white neighbors - should have 2 liberties (up and down)
    const group = getGroup(board, { x: 4, y: 4 }, 9);
    expect(group.liberties.length).toBe(2);
  });

  it('group in atari has 1 liberty', () => {
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 0, y: 0 }, 9, Stone.BLACK);
    board = setStone(board, { x: 1, y: 0 }, 9, Stone.WHITE);
    // Black at corner with 1 white neighbor - 1 liberty left at (0,1)
    const group = getGroup(board, { x: 0, y: 0 }, 9);
    expect(group.liberties.length).toBe(1);
    expect(group.liberties[0]).toEqual({ x: 0, y: 1 });
  });

  it('group with 0 liberties (dead)', () => {
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 0, y: 0 }, 9, Stone.BLACK);
    board = setStone(board, { x: 1, y: 0 }, 9, Stone.WHITE);
    board = setStone(board, { x: 0, y: 1 }, 9, Stone.WHITE);
    // Black at corner completely surrounded - 0 liberties
    const group = getGroup(board, { x: 0, y: 0 }, 9);
    expect(group.liberties.length).toBe(0);
  });

  it('large group liberties', () => {
    let board = createEmptyBoard({ size: 9 });
    // 3x3 block in center
    for (let x = 3; x <= 5; x++) {
      for (let y = 3; y <= 5; y++) {
        board = setStone(board, { x, y }, 9, Stone.BLACK);
      }
    }
    const group = getGroup(board, { x: 4, y: 4 }, 9);
    expect(group.stones.length).toBe(9);
    // 3x3 block has 12 liberties (4 sides * 3 each)
    expect(group.liberties.length).toBe(12);
  });
});
