import { describe, it, expect } from 'vitest';
import { getGroup, getGroupStones, getGroupLiberties, getAllGroups } from '../game/groups';
import { createEmptyBoard, setStone } from '../game/board';
import { Stone } from '../game/types';

describe('Groups', () => {
  describe('getGroupStones', () => {
    it('returns single stone for isolated stone', () => {
      let board = createEmptyBoard({ size: 9 });
      board = setStone(board, { x: 4, y: 4 }, 9, Stone.BLACK);
      const stones = getGroupStones(board, { x: 4, y: 4 }, 9);
      expect(stones.length).toBe(1);
      expect(stones[0]).toEqual({ x: 4, y: 4 });
    });

    it('returns horizontal group', () => {
      let board = createEmptyBoard({ size: 9 });
      board = setStone(board, { x: 3, y: 4 }, 9, Stone.BLACK);
      board = setStone(board, { x: 4, y: 4 }, 9, Stone.BLACK);
      board = setStone(board, { x: 5, y: 4 }, 9, Stone.BLACK);
      const stones = getGroupStones(board, { x: 4, y: 4 }, 9);
      expect(stones.length).toBe(3);
    });

    it('returns vertical group', () => {
      let board = createEmptyBoard({ size: 9 });
      board = setStone(board, { x: 4, y: 3 }, 9, Stone.BLACK);
      board = setStone(board, { x: 4, y: 4 }, 9, Stone.BLACK);
      board = setStone(board, { x: 4, y: 5 }, 9, Stone.BLACK);
      const stones = getGroupStones(board, { x: 4, y: 4 }, 9);
      expect(stones.length).toBe(3);
    });

    it('returns complex L-shaped group', () => {
      let board = createEmptyBoard({ size: 9 });
      board = setStone(board, { x: 3, y: 3 }, 9, Stone.BLACK);
      board = setStone(board, { x: 4, y: 3 }, 9, Stone.BLACK);
      board = setStone(board, { x: 4, y: 4 }, 9, Stone.BLACK);
      board = setStone(board, { x: 4, y: 5 }, 9, Stone.BLACK);
      const stones = getGroupStones(board, { x: 3, y: 3 }, 9);
      expect(stones.length).toBe(4);
    });

    it('returns corner group', () => {
      let board = createEmptyBoard({ size: 9 });
      board = setStone(board, { x: 0, y: 0 }, 9, Stone.BLACK);
      board = setStone(board, { x: 1, y: 0 }, 9, Stone.BLACK);
      board = setStone(board, { x: 0, y: 1 }, 9, Stone.BLACK);
      const stones = getGroupStones(board, { x: 0, y: 0 }, 9);
      expect(stones.length).toBe(3);
    });

    it('returns edge group', () => {
      let board = createEmptyBoard({ size: 9 });
      board = setStone(board, { x: 0, y: 3 }, 9, Stone.BLACK);
      board = setStone(board, { x: 0, y: 4 }, 9, Stone.BLACK);
      board = setStone(board, { x: 0, y: 5 }, 9, Stone.BLACK);
      const stones = getGroupStones(board, { x: 0, y: 4 }, 9);
      expect(stones.length).toBe(3);
    });

    it('returns empty array for empty position', () => {
      const board = createEmptyBoard({ size: 9 });
      const stones = getGroupStones(board, { x: 4, y: 4 }, 9);
      expect(stones.length).toBe(0);
    });

    it('does not include different-colored stones', () => {
      let board = createEmptyBoard({ size: 9 });
      board = setStone(board, { x: 3, y: 4 }, 9, Stone.BLACK);
      board = setStone(board, { x: 4, y: 4 }, 9, Stone.BLACK);
      board = setStone(board, { x: 5, y: 4 }, 9, Stone.WHITE);
      const stones = getGroupStones(board, { x: 4, y: 4 }, 9);
      expect(stones.length).toBe(2);
    });
  });

  describe('getGroupLiberties', () => {
    it('returns 4 liberties for center single stone', () => {
      let board = createEmptyBoard({ size: 9 });
      board = setStone(board, { x: 4, y: 4 }, 9, Stone.BLACK);
      const stones = getGroupStones(board, { x: 4, y: 4 }, 9);
      const liberties = getGroupLiberties(board, stones, 9);
      expect(liberties.length).toBe(4);
    });

    it('returns 3 liberties for edge single stone', () => {
      let board = createEmptyBoard({ size: 9 });
      board = setStone(board, { x: 0, y: 4 }, 9, Stone.BLACK);
      const stones = getGroupStones(board, { x: 0, y: 4 }, 9);
      const liberties = getGroupLiberties(board, stones, 9);
      expect(liberties.length).toBe(3);
    });

    it('returns 2 liberties for corner single stone', () => {
      let board = createEmptyBoard({ size: 9 });
      board = setStone(board, { x: 0, y: 0 }, 9, Stone.BLACK);
      const stones = getGroupStones(board, { x: 0, y: 0 }, 9);
      const liberties = getGroupLiberties(board, stones, 9);
      expect(liberties.length).toBe(2);
    });

    it('returns shared liberties without duplicates', () => {
      let board = createEmptyBoard({ size: 9 });
      board = setStone(board, { x: 3, y: 4 }, 9, Stone.BLACK);
      board = setStone(board, { x: 4, y: 4 }, 9, Stone.BLACK);
      const stones = getGroupStones(board, { x: 3, y: 4 }, 9);
      const liberties = getGroupLiberties(board, stones, 9);
      // Two horizontal stones have 6 liberties (not 8, since 2 are shared)
      expect(liberties.length).toBe(6);
    });
  });

  describe('getAllGroups', () => {
    it('finds multiple separate groups', () => {
      let board = createEmptyBoard({ size: 9 });
      board = setStone(board, { x: 0, y: 0 }, 9, Stone.BLACK);
      board = setStone(board, { x: 8, y: 8 }, 9, Stone.BLACK);
      board = setStone(board, { x: 4, y: 4 }, 9, Stone.WHITE);
      const blackGroups = getAllGroups(board, Stone.BLACK, 9);
      expect(blackGroups.length).toBe(2);
      const whiteGroups = getAllGroups(board, Stone.WHITE, 9);
      expect(whiteGroups.length).toBe(1);
    });
  });
});
