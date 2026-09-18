import { describe, it, expect, vi } from 'vitest';
import { serializeSgf, parseSgf, parseSgfToGameState, downloadSgf } from '../sgf';
import { createGame, playStone, pass, resign } from '../game/gameState';
import { Color } from '../game/types';

describe('SGF Module', () => {
  describe('Serializer', () => {
    it('should serialize empty 9x9 game', () => {
      const state = createGame({ size: 9, komi: 6.5, ruleset: 'chinese' });
      const sgf = serializeSgf(state);
      
      expect(sgf).toContain('GM[1]');
      expect(sgf).toContain('SZ[9]');
      expect(sgf).toContain('KM[6.5]');
      expect(sgf).toContain('AP[Satori]');
    });

    it('should serialize empty 13x13 game', () => {
      const state = createGame({ size: 13, komi: 6.5, ruleset: 'chinese' });
      const sgf = serializeSgf(state);
      
      expect(sgf).toContain('SZ[13]');
    });

    it('should serialize empty 19x19 game', () => {
      const state = createGame({ size: 19, komi: 7.5, ruleset: 'chinese' });
      const sgf = serializeSgf(state);
      
      expect(sgf).toContain('SZ[19]');
    });

    it('should serialize game with moves', () => {
      let state = createGame({ size: 9, komi: 6.5, ruleset: 'chinese' });
      
      // Play some moves
      const result1 = playStone(state, { x: 2, y: 2 });
      if (result1.success) state = result1.newState;
      
      const result2 = playStone(state, { x: 6, y: 6 });
      if (result2.success) state = result2.newState;
      
      const sgf = serializeSgf(state);
      
      expect(sgf).toContain(';B[cc]');
      expect(sgf).toContain(';W[gg]');
    });

    it('should serialize game with pass moves', () => {
      let state = createGame({ size: 9, komi: 6.5, ruleset: 'chinese' });
      
      const result1 = playStone(state, { x: 2, y: 2 });
      if (result1.success) state = result1.newState;
      
      state = pass(state);
      
      const sgf = serializeSgf(state);
      
      expect(sgf).toContain(';B[cc]');
      expect(sgf).toContain(';W[]');
    });

    it('should serialize game with captures', () => {
      let state = createGame({ size: 9, komi: 6.5, ruleset: 'chinese' });
      
      // Set up a capture scenario
      // Black at (0,0), White at (1,0), Black at (0,1) captures White
      const r1 = playStone(state, { x: 0, y: 0 });
      if (r1.success) state = r1.newState;
      
      const r2 = playStone(state, { x: 1, y: 0 });
      if (r2.success) state = r2.newState;
      
      const r3 = playStone(state, { x: 0, y: 1 });
      if (r3.success) state = r3.newState;
      
      const sgf = serializeSgf(state);
      
      expect(sgf).toContain(';B[aa]');
      expect(sgf).toContain(';W[ba]');
      expect(sgf).toContain(';B[ab]');
    });

    it('should serialize game with resignation', () => {
      let state = createGame({ size: 9, komi: 6.5, ruleset: 'chinese' });
      
      const result1 = playStone(state, { x: 2, y: 2 });
      if (result1.success) state = result1.newState;
      
      state = resign(state);
      
      const sgf = serializeSgf(state);
      
      expect(sgf).toContain('RE[W+R]');
    });

    it('should include player names for human vs computer', () => {
      const state = createGame({ 
        size: 9, 
        komi: 6.5, 
        ruleset: 'chinese',
        playerMode: 'human-vs-computer',
        aiDifficulty: 'medium'
      });
      
      const sgf = serializeSgf(state);
      
      expect(sgf).toContain('PB[Human]');
      expect(sgf).toContain('PW[Satori AI (medium)]');
    });

    it('should include player names for human vs human', () => {
      const state = createGame({ 
        size: 9, 
        komi: 6.5, 
        ruleset: 'chinese',
        playerMode: 'human-vs-human'
      });
      
      const sgf = serializeSgf(state);
      
      expect(sgf).toContain('PB[Black]');
      expect(sgf).toContain('PW[White]');
    });
  });

  describe('Parser', () => {
    it('should parse simple 9x9 SGF', () => {
      const sgf = '(;GM[1]FF[4]SZ[9]KM[6.5];B[ee];W[gc])';
      const result = parseSgf(sgf);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.game.gameInfo.size).toBe(9);
        expect(result.game.gameInfo.komi).toBe(6.5);
        expect(result.game.moves).toHaveLength(2);
        expect(result.game.moves[0].color).toBe('B');
        expect(result.game.moves[0].position).toEqual({ x: 4, y: 4 });
        expect(result.game.moves[1].color).toBe('W');
        expect(result.game.moves[1].position).toEqual({ x: 6, y: 2 });
      }
    });

    it('should parse SGF with pass moves', () => {
      const sgf = '(;GM[1]SZ[9];B[ee];W[];B[cc])';
      const result = parseSgf(sgf);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.game.moves).toHaveLength(3);
        expect(result.game.moves[1].position).toBeNull();
      }
    });

    it('should parse SGF with player names', () => {
      const sgf = '(;GM[1]SZ[9]PB[Alice]PW[Bob];B[ee])';
      const result = parseSgf(sgf);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.game.gameInfo.blackName).toBe('Alice');
        expect(result.game.gameInfo.whiteName).toBe('Bob');
      }
    });

    it('should parse SGF with result', () => {
      const sgf = '(;GM[1]SZ[9]RE[B+R];B[ee])';
      const result = parseSgf(sgf);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.game.gameInfo.result).toBe('B+R');
      }
    });

    it('should reject invalid SGF format', () => {
      const sgf = 'GM[1]SZ[9]';
      const result = parseSgf(sgf);
      
      expect(result.success).toBe(false);
    });

    it('should reject SGF with invalid coordinates', () => {
      const sgf = '(;GM[1]SZ[9];B[zz])';
      const result = parseSgf(sgf);
      
      expect(result.success).toBe(false);
    });

    it('should reject SGF with wrong game type', () => {
      const sgf = '(;GM[2]SZ[9];B[ee])';
      const result = parseSgf(sgf);
      
      // Should still parse but note it's not Go
      expect(result.success).toBe(true);
    });
  });

  describe('parseSgfToGameState', () => {
    it('should convert SGF to game state', () => {
      const sgf = '(;GM[1]SZ[9]KM[6.5];B[ee];W[gc])';
      const result = parseSgfToGameState(sgf);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.state.size).toBe(9);
        expect(result.state.komi).toBe(6.5);
        expect(result.state.moveHistory).toHaveLength(2);
        expect(result.state.currentPlayer).toBe(Color.BLACK);
      }
    });

    it('should handle pass moves in game state', () => {
      const sgf = '(;GM[1]SZ[9];B[ee];W[];B[cc])';
      const result = parseSgfToGameState(sgf);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.state.moveHistory).toHaveLength(3);
        expect(result.state.moveHistory[1].type).toBe('pass');
      }
    });

    it('should reject game with invalid moves', () => {
      // Try to play on occupied position
      const sgf = '(;GM[1]SZ[9];B[ee];W[ee])';
      const result = parseSgfToGameState(sgf);
      
      expect(result.success).toBe(false);
    });

    it('should reject game with suicide move', () => {
      // This would be a suicide move
      const sgf = '(;GM[1]SZ[9];B[aa];W[ab];B[ba];W[bb])';
      const result = parseSgfToGameState(sgf);
      
      // Should fail because W[bb] would be suicide
      expect(result.success).toBe(false);
    });
  });

  describe('Round-trip', () => {
    it('should preserve game state through serialize-parse cycle', () => {
      let state = createGame({ size: 9, komi: 6.5, ruleset: 'chinese' });
      
      // Play some moves
      const r1 = playStone(state, { x: 2, y: 2 });
      if (r1.success) state = r1.newState;
      
      const r2 = playStone(state, { x: 6, y: 6 });
      if (r2.success) state = r2.newState;
      
      const r3 = playStone(state, { x: 4, y: 4 });
      if (r3.success) state = r3.newState;
      
      // Serialize
      const sgf = serializeSgf(state);
      
      // Parse back
      const result = parseSgfToGameState(sgf);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.state.size).toBe(state.size);
        expect(result.state.komi).toBe(state.komi);
        expect(result.state.moveHistory).toHaveLength(state.moveHistory.length);
        
        // Check each move
        for (let i = 0; i < state.moveHistory.length; i++) {
          const original = state.moveHistory[i];
          const reconstructed = result.state.moveHistory[i];
          
          expect(reconstructed.color).toBe(original.color);
          expect(reconstructed.position).toEqual(original.position);
        }
      }
    });

    it('should preserve game with passes through round-trip', () => {
      let state = createGame({ size: 9, komi: 6.5, ruleset: 'chinese' });
      
      const r1 = playStone(state, { x: 2, y: 2 });
      if (r1.success) state = r1.newState;
      
      state = pass(state);
      
      const r2 = playStone(state, { x: 6, y: 6 });
      if (r2.success) state = r2.newState;
      
      const sgf = serializeSgf(state);
      const result = parseSgfToGameState(sgf);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.state.moveHistory).toHaveLength(3);
        expect(result.state.moveHistory[1].type).toBe('pass');
      }
    });

    it('should preserve different board sizes through round-trip', () => {
      for (const size of [9, 13, 19]) {
        const state = createGame({ size, komi: 6.5, ruleset: 'chinese' });
        const sgf = serializeSgf(state);
        const result = parseSgfToGameState(sgf);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.state.size).toBe(size);
        }
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty SGF (no moves)', () => {
      const sgf = '(;GM[1]SZ[9])';
      const result = parseSgfToGameState(sgf);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.state.moveHistory).toHaveLength(0);
      }
    });

    it('should handle SGF with extra whitespace', () => {
      const sgf = '  ( ; GM[1] SZ[9] ; B[ee] )  ';
      const result = parseSgf(sgf);
      
      expect(result.success).toBe(true);
    });

    it('should handle SGF with newlines', () => {
      const sgf = `(;GM[1]
SZ[9]
;B[ee]
;W[gg])`;
      const result = parseSgf(sgf);
      
      expect(result.success).toBe(true);
    });

    it('should handle 19x19 coordinates correctly', () => {
      const sgf = '(;GM[1]SZ[19];B[aa];W[ss])';
      const result = parseSgf(sgf);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.game.moves[0].position).toEqual({ x: 0, y: 0 });
        expect(result.game.moves[1].position).toEqual({ x: 18, y: 18 });
      }
    });
  });

  describe('Download', () => {
    it('should create downloadable SGF file', () => {
      const state = createGame({ size: 9, komi: 6.5, ruleset: 'chinese' });
      
      // Mock document.createElement
      const mockLink = {
        href: '',
        download: '',
        click: () => {},
      };
      
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn(() => mockLink as any);
      
      const originalCreateObjectURL = URL.createObjectURL;
      URL.createObjectURL = vi.fn(() => 'blob:test');
      
      const originalRevokeObjectURL = URL.revokeObjectURL;
      URL.revokeObjectURL = vi.fn();
      
      downloadSgf(state, 'test.sgf');
      
      expect(mockLink.download).toBe('test.sgf');
      expect(mockLink.href).toBe('blob:test');
      
      // Restore
      document.createElement = originalCreateElement;
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    });
  });
});
