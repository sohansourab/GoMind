import { describe, it, expect } from 'vitest';
import { positionToCoordinate, coordinateToPosition, isValidCoordinate } from '../game/coordinates';

describe('Coordinates', () => {
  describe('9x9 board', () => {
    it('converts (0,0) to A9', () => {
      expect(positionToCoordinate({ x: 0, y: 0 }, 9)).toBe('A9');
    });

    it('converts (8,8) to J1', () => {
      expect(positionToCoordinate({ x: 8, y: 8 }, 9)).toBe('J1');
    });

    it('converts (4,4) to E5', () => {
      expect(positionToCoordinate({ x: 4, y: 4 }, 9)).toBe('E5');
    });

    it('converts A9 back to (0,0)', () => {
      expect(coordinateToPosition('A9', 9)).toEqual({ x: 0, y: 0 });
    });

    it('converts J1 back to (8,8)', () => {
      expect(coordinateToPosition('J1', 9)).toEqual({ x: 8, y: 8 });
    });

    it('skips letter I', () => {
      // Column I is skipped, so after H comes J
      // On 9x9: A B C D E F G H J (no I)
      expect(positionToCoordinate({ x: 7, y: 0 }, 9)).toBe('H9');
      expect(positionToCoordinate({ x: 8, y: 0 }, 9)).toBe('J9');
    });
  });

  describe('13x13 board', () => {
    it('converts (0,0) to A13', () => {
      expect(positionToCoordinate({ x: 0, y: 0 }, 13)).toBe('A13');
    });

    it('converts (12,12) to N1', () => {
      expect(positionToCoordinate({ x: 12, y: 12 }, 13)).toBe('N1');
    });

    it('converts (6,6) to G7', () => {
      expect(positionToCoordinate({ x: 6, y: 6 }, 13)).toBe('G7');
    });

    it('round-trips correctly', () => {
      for (let x = 0; x < 13; x++) {
        for (let y = 0; y < 13; y++) {
          const coord = positionToCoordinate({ x, y }, 13);
          const pos = coordinateToPosition(coord, 13);
          expect(pos).toEqual({ x, y });
        }
      }
    });
  });

  describe('19x19 board', () => {
    it('converts (0,0) to A19', () => {
      expect(positionToCoordinate({ x: 0, y: 0 }, 19)).toBe('A19');
    });

    it('converts (18,18) to T1', () => {
      expect(positionToCoordinate({ x: 18, y: 18 }, 19)).toBe('T1');
    });

    it('converts (9,9) to K10', () => {
      // x=9 -> column K (skipping I: A B C D E F G H J K)
      expect(positionToCoordinate({ x: 9, y: 9 }, 19)).toBe('K10');
    });

    it('converts (3,3) to D16 (star point)', () => {
      expect(positionToCoordinate({ x: 3, y: 3 }, 19)).toBe('D16');
    });

    it('round-trips all positions', () => {
      for (let x = 0; x < 19; x++) {
        for (let y = 0; y < 19; y++) {
          const coord = positionToCoordinate({ x, y }, 19);
          const pos = coordinateToPosition(coord, 19);
          expect(pos).toEqual({ x, y });
        }
      }
    });
  });

  describe('isValidCoordinate', () => {
    it('returns true for valid coordinates', () => {
      expect(isValidCoordinate('A1', 9)).toBe(true);
      expect(isValidCoordinate('J9', 9)).toBe(true);
      expect(isValidCoordinate('T19', 19)).toBe(true);
    });

    it('returns false for invalid coordinates', () => {
      expect(isValidCoordinate('K1', 9)).toBe(false); // K is off 9x9
      expect(isValidCoordinate('A0', 9)).toBe(false); // Row 0 doesn't exist
      expect(isValidCoordinate('A10', 9)).toBe(false); // Row 10 doesn't exist on 9x9
      expect(isValidCoordinate('I1', 9)).toBe(false); // I is not used
    });
  });

  describe('Error handling', () => {
    it('throws for invalid position', () => {
      expect(() => positionToCoordinate({ x: -1, y: 0 }, 9)).toThrow();
      expect(() => positionToCoordinate({ x: 9, y: 0 }, 9)).toThrow();
    });

    it('throws for invalid coordinate', () => {
      expect(() => coordinateToPosition('Z1', 9)).toThrow();
      expect(() => coordinateToPosition('A0', 9)).toThrow();
    });
  });
});
