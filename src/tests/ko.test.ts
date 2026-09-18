import { describe, it, expect } from 'vitest';
import { applyMove, applyPass } from '../game/rules';
import { createGame } from '../game/gameState';
import { Color, Stone } from '../game/types';
import { setStone, getStone } from '../game/board';

describe('Ko', () => {
  it('prevents immediate ko recapture', () => {
    // Real ko shape:
    // Before black's move:
    //   0 1 2
    // 1 B W B
    // 0 W . W
    //
    // Black plays at (1,0), capturing white at (0,0)
    // White cannot immediately recapture at (0,0) because that would
    // capture black at (1,0) and recreate the previous position
    
    const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
    let board = [...gameState.board];
    
    // Set up the ko position
    // Black at (0,1), (2,1)
    // White at (1,1), (0,0), (2,0)
    const b1 = setStone(board, { x: 0, y: 1 }, 9, Stone.BLACK);
    const b2 = setStone(b1, { x: 2, y: 1 }, 9, Stone.BLACK);
    const b3 = setStone(b2, { x: 1, y: 1 }, 9, Stone.WHITE);
    const b4 = setStone(b3, { x: 0, y: 0 }, 9, Stone.WHITE);
    const b5 = setStone(b4, { x: 2, y: 0 }, 9, Stone.WHITE);
    
    let state = {
      ...gameState,
      board: b5,
      currentPlayer: Color.BLACK,
    };
    
    // Black captures white at (0,0) by playing at (1,0)
    // White at (0,0) has neighbors: (0,1)=B, (1,0)=B (just played)
    // So white at (0,0) has 0 liberties and is captured
    const captureResult = applyMove(state, { x: 1, y: 0 });
    expect(captureResult.success).toBe(true);
    if (captureResult.success) {
      state = captureResult.newState;
      // White stone at (0,0) should be captured
      expect(getStone(state.board, { x: 0, y: 0 }, 9)).toBe(Stone.EMPTY);
      expect(state.blackCaptures).toBe(1);
      
      // Now it's white's turn. White tries to recapture at (0,0)
      // This would capture black at (1,0) and recreate the previous position
      // Should be a ko violation
      const koResult = applyMove(state, { x: 0, y: 0 });
      expect(koResult.success).toBe(false);
      if (!koResult.success) {
        expect(koResult.reason).toBe('Illegal move: ko');
      }
    }
  });

  it('allows recapture after an intervening play', () => {
    // Same ko setup as above, but white plays elsewhere first (ko threat),
    // then black responds, then white can recapture
    
    const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
    let board = [...gameState.board];
    
    // Set up the ko position
    // Black at (0,1), (2,1)
    // White at (1,1), (0,0), (2,0)
    const b1 = setStone(board, { x: 0, y: 1 }, 9, Stone.BLACK);
    const b2 = setStone(b1, { x: 2, y: 1 }, 9, Stone.BLACK);
    const b3 = setStone(b2, { x: 1, y: 1 }, 9, Stone.WHITE);
    const b4 = setStone(b3, { x: 0, y: 0 }, 9, Stone.WHITE);
    const b5 = setStone(b4, { x: 2, y: 0 }, 9, Stone.WHITE);
    
    let state = {
      ...gameState,
      board: b5,
      currentPlayer: Color.BLACK,
    };
    
    // Black captures white at (0,0) by playing at (1,0)
    let result = applyMove(state, { x: 1, y: 0 });
    expect(result.success).toBe(true);
    if (result.success) state = result.newState;
    
    // White plays elsewhere (at (5,5)) - this is the "ko threat"
    result = applyMove(state, { x: 5, y: 5 });
    expect(result.success).toBe(true);
    if (result.success) state = result.newState;
    
    // Black responds elsewhere (at (6,6))
    result = applyMove(state, { x: 6, y: 6 });
    expect(result.success).toBe(true);
    if (result.success) state = result.newState;
    
    // Now white can recapture at (0,0) - the ko position has changed
    // because there have been intervening moves
    result = applyMove(state, { x: 0, y: 0 });
    expect(result.success).toBe(true);
  });
});
