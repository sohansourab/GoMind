import { describe, it, expect } from 'vitest';
import {
  createEmptyBoard,
  getStone,
  setStone,
  isOnBoard,
  getNeighbors,
  getIndex,
  getPosition,
  positionsEqual,
} from '../game/board';
import { Stone } from '../game/types';

describe('Board', () => {
  describe('createEmptyBoard', () => {
    it('creates an empty 9x9 board', () => {
      const board = createEmptyBoard({ size: 9 });
      expect(board.length).toBe(81);
      expect(board.every(s => s === Stone.EMPTY)).toBe(true);
    });

    it('creates an empty 13x13 board', () => {
      const board = createEmptyBoard({ size: 13 });
      expect(board.length).toBe(169);
    });

    it('creates an empty 19x19 board', () => {
      const board = createEmptyBoard({ size: 19 });
      expect(board.length).toBe(361);
    });
  });

  describe('isOnBoard', () => {
    it('returns true for valid positions', () => {
      expect(isOnBoard({ x: 0, y: 0 }, 9)).toBe(true);
      expect(isOnBoard({ x: 8, y: 8 }, 9)).toBe(true);
      expect(isOnBoard({ x: 4, y: 4 }, 9)).toBe(true);
    });

    it('returns false for invalid positions', () => {
      expect(isOnBoard({ x: -1, y: 0 }, 9)).toBe(false);
      expect(isOnBoard({ x: 0, y: -1 }, 9)).toBe(false);
      expect(isOnBoard({ x: 9, y: 0 }, 9)).toBe(false);
      expect(isOnBoard({ x: 0, y: 9 }, 9)).toBe(false);
    });
  });

  describe('getStone / setStone', () => {
    it('gets empty stone from empty board', () => {
      const board = createEmptyBoard({ size: 9 });
      expect(getStone(board, { x: 0, y: 0 }, 9)).toBe(Stone.EMPTY);
      expect(getStone(board, { x: 4, y: 4 }, 9)).toBe(Stone.EMPTY);
    });

    it('sets and gets a black stone', () => {
      let board = createEmptyBoard({ size: 9 });
      board = setStone(board, { x: 3, y: 3 }, 9, Stone.BLACK);
      expect(getStone(board, { x: 3, y: 3 }, 9)).toBe(Stone.BLACK);
    });

    it('sets and gets a white stone', () => {
      let board = createEmptyBoard({ size: 9 });
      board = setStone(board, { x: 5, y: 5 }, 9, Stone.WHITE);
      expect(getStone(board, { x: 5, y: 5 }, 9)).toBe(Stone.WHITE);
    });

    it('does not modify the original board (immutability)', () => {
      const board = createEmptyBoard({ size: 9 });
      const newBoard = setStone(board, { x: 0, y: 0 }, 9, Stone.BLACK);
      expect(getStone(board, { x: 0, y: 0 }, 9)).toBe(Stone.EMPTY);
      expect(getStone(newBoard, { x: 0, y: 0 }, 9)).toBe(Stone.BLACK);
    });
  });

  describe('getNeighbors', () => {
    it('returns 4 neighbors for center position', () => {
      const neighbors = getNeighbors({ x: 4, y: 4 }, 9);
      expect(neighbors.length).toBe(4);
    });

    it('returns 3 neighbors for edge position', () => {
      const neighbors = getNeighbors({ x: 0, y: 4 }, 9);
      expect(neighbors.length).toBe(3);
    });

    it('returns 2 neighbors for corner position', () => {
      const neighbors = getNeighbors({ x: 0, y: 0 }, 9);
      expect(neighbors.length).toBe(2);
    });

    it('returns correct neighbor positions for corner (0,0)', () => {
      const neighbors = getNeighbors({ x: 0, y: 0 }, 9);
      expect(neighbors).toContainEqual({ x: 1, y: 0 });
      expect(neighbors).toContainEqual({ x: 0, y: 1 });
      expect(neighbors.length).toBe(2);
    });

    it('does not include diagonal positions', () => {
      const neighbors = getNeighbors({ x: 4, y: 4 }, 9);
      expect(neighbors).not.toContainEqual({ x: 3, y: 3 });
      expect(neighbors).not.toContainEqual({ x: 5, y: 5 });
      expect(neighbors).not.toContainEqual({ x: 3, y: 5 });
      expect(neighbors).not.toContainEqual({ x: 5, y: 3 });
    });
  });

  describe('getIndex / getPosition', () => {
    it('converts position to index correctly', () => {
      expect(getIndex({ x: 0, y: 0 }, 9)).toBe(0);
      expect(getIndex({ x: 1, y: 0 }, 9)).toBe(1);
      expect(getIndex({ x: 0, y: 1 }, 9)).toBe(9);
      expect(getIndex({ x: 8, y: 8 }, 9)).toBe(80);
    });

    it('converts index to position correctly', () => {
      expect(getPosition(0, 9)).toEqual({ x: 0, y: 0 });
      expect(getPosition(1, 9)).toEqual({ x: 1, y: 0 });
      expect(getPosition(9, 9)).toEqual({ x: 0, y: 1 });
      expect(getPosition(80, 9)).toEqual({ x: 8, y: 8 });
    });
  });

  describe('positionsEqual', () => {
    it('returns true for equal positions', () => {
      expect(positionsEqual({ x: 3, y: 4 }, { x: 3, y: 4 })).toBe(true);
    });

    it('returns false for different positions', () => {
      expect(positionsEqual({ x: 3, y: 4 }, { x: 4, y: 3 })).toBe(false);
    });
  });
});
