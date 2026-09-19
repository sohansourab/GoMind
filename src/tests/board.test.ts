import { describe, it, expect } from 'vitest';
import { createEmptyBoard, setStone, getStone, getNeighbors, boardHash } from '../game/board';
import { Stone } from '../game/types';

describe('Board', () => {
  describe('createEmptyBoard', () => {
    it('creates empty board of correct size', () => {
      const board = createEmptyBoard(9);
      expect(board.length).toBe(81);
      expect(board.every(s => s === Stone.EMPTY)).toBe(true);
    });

    it('creates 13x13 board', () => {
      const board = createEmptyBoard(13);
      expect(board.length).toBe(169);
    });

    it('creates 19x19 board', () => {
      const board = createEmptyBoard(19);
      expect(board.length).toBe(361);
    });
  });

  describe('getStone', () => {
    it('returns EMPTY for empty position', () => {
      const board = createEmptyBoard(9);
      expect(getStone(board, { x: 0, y: 0 }, 9)).toBe(Stone.EMPTY);
    });

    it('returns correct stone', () => {
      let board = createEmptyBoard(9);
      board = setStone(board, { x: 4, y: 4 }, 9, Stone.BLACK);
      expect(getStone(board, { x: 4, y: 4 }, 9)).toBe(Stone.BLACK);
    });

    it('returns EMPTY for out of bounds', () => {
      const board = createEmptyBoard(9);
      expect(getStone(board, { x: -1, y: 0 }, 9)).toBe(Stone.EMPTY);
      expect(getStone(board, { x: 9, y: 0 }, 9)).toBe(Stone.EMPTY);
    });
  });

  describe('setStone', () => {
    it('sets stone on board', () => {
      let board = createEmptyBoard(9);
      board = setStone(board, { x: 0, y: 0 }, 9, Stone.BLACK);
      expect(getStone(board, { x: 0, y: 0 }, 9)).toBe(Stone.BLACK);
    });

    it('does not mutate original board', () => {
      const board = createEmptyBoard(9);
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

    it('returns 2 neighbors for corner', () => {
      const neighbors = getNeighbors({ x: 0, y: 0 }, 9);
      expect(neighbors.length).toBe(2);
    });

    it('returns 3 neighbors for edge', () => {
      const neighbors = getNeighbors({ x: 0, y: 4 }, 9);
      expect(neighbors.length).toBe(3);
    });

    it('returns correct neighbor positions', () => {
      const neighbors = getNeighbors({ x: 4, y: 4 }, 9);
      expect(neighbors).toContainEqual({ x: 4, y: 3 });
      expect(neighbors).toContainEqual({ x: 4, y: 5 });
      expect(neighbors).toContainEqual({ x: 3, y: 4 });
      expect(neighbors).toContainEqual({ x: 5, y: 4 });
    });
  });

  describe('boardHash', () => {
    it('creates hash from board', () => {
      const board = createEmptyBoard(9);
      const hash = boardHash(board);
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(81);
    });

    it('different boards have different hashes', () => {
      let board1 = createEmptyBoard(9);
      let board2 = createEmptyBoard(9);
      board2 = setStone(board2, { x: 0, y: 0 }, 9, Stone.BLACK);
      
      expect(boardHash(board1)).not.toBe(boardHash(board2));
    });
  });
});
