import { describe, it, expect } from 'vitest';
import { applyMove, applyPass } from '../game/rules';
import { createGame } from '../game/gameState';
import { Color, Stone } from '../game/types';
import { setStone, getStone } from '../game/board';

describe('Ko', () => {
  it('prevents immediate ko recapture', () => {
    // Classic ko shape:
    // . B W .
    // B . B W
    // . B W .
    // 
    // If black captures at the ko point, white cannot immediately recapture
    
    // Let's set up a simple ko position on a 9x9 board
    // We'll build it step by step using the engine
    
    // Actually, let's set up the board directly for clarity
    const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
    let board = [...gameState.board];
    
    // Ko shape around position (3,3):
    //     (3,2)=W
    // (2,3)=B (3,3)=empty (4,3)=B
    //     (3,4)=W
    // Additional: (4,2)=W to prevent self-atari issues
    // And (2,4)=B for symmetry
    
    // Set up: White can capture black at (3,3) if black is there
    // Let me use a simpler approach - set up a ko fight position
    
    // Position:
    //   2 3 4
    // 2 . W .
    // 3 B . B
    // 4 . W .
    // With additional stones to make it a real ko:
    //   1 2 3 4 5
    // 2 . . W . .
    // 3 . B . B .
    // 4 . . W . .
    // 5 . B . B .  <- extra black stones for support
    // 6 . . W . .  <- extra white stones for support
    
    // Actually, the simplest ko:
    // Black at (2,3), (4,3). White at (3,2), (3,4).
    // Black captures at (3,3) -> now white wants to recapture at (3,3) but can't (ko)
    
    // Let's set up so black just captured at (3,3):
    // Board state after black captures white at (3,3):
    // Before capture: White had a stone at (3,3) with black surrounding it
    // After black plays (3,3): captures white, now the board hash is stored
    
    // Let me build this more carefully:
    // Initial setup (before the ko capture):
    // Black at (2,3), (4,3), (3,4)
    // White at (3,2), (3,3)
    // Black plays (3,3) is not possible - it's occupied
    // 
    // OK let me think about this differently. A ko position:
    // After black captures a single white stone, white cannot immediately recapture.
    
    // Setup: 
    //   2 3 4
    // 3 B W B  <- black at (2,3) and (4,3), white at (3,3)
    // 4 . B .  <- black at (3,4)
    // 
    // White at (3,3) has liberties: (3,2) only (since (2,3)=B, (4,3)=B, (3,4)=B)
    // Wait, (3,2) is empty. So white has 1 liberty.
    // Black plays at (3,2) to capture white at (3,3).
    // After capture: Black at (3,2), board shows black stones around where white was.
    // Now the ko rule: White cannot play at (3,3) because that would recreate
    // the board position from before black's move.
    
    const b1 = setStone(board, { x: 2, y: 3 }, 9, Stone.BLACK);
    const b2 = setStone(b1, { x: 4, y: 3 }, 9, Stone.BLACK);
    const b3 = setStone(b2, { x: 3, y: 4 }, 9, Stone.BLACK);
    const b4 = setStone(b3, { x: 3, y: 3 }, 9, Stone.WHITE);
    // White at (3,3) has 1 liberty at (3,2)
    
    let state = {
      ...gameState,
      board: b4,
      currentPlayer: Color.BLACK,
    };
    
    // Black captures by playing at (3,2)
    const captureResult = applyMove(state, { x: 3, y: 2 });
    expect(captureResult.success).toBe(true);
    if (captureResult.success) {
      state = captureResult.newState;
      // White stone at (3,3) should be captured
      expect(getStone(state.board, { x: 3, y: 3 }, 9)).toBe(Stone.EMPTY);
      expect(state.blackCaptures).toBe(1);
      
      // Now it's white's turn. White tries to recapture at (3,3) - should be ko violation
      const koResult = applyMove(state, { x: 3, y: 3 });
      expect(koResult.success).toBe(false);
      if (!koResult.success) {
        expect(koResult.reason).toBe('Illegal move: ko');
      }
    }
  });

  it('allows recapture after an intervening play', () => {
    // Same setup as above, but white plays elsewhere first, then black responds,
    // then white can recapture
    
    const gameState = createGame({ size: 9, komi: 7.5, ruleset: 'chinese' });
    let board = [...gameState.board];
    
    const b1 = setStone(board, { x: 2, y: 3 }, 9, Stone.BLACK);
    const b2 = setStone(b1, { x: 4, y: 3 }, 9, Stone.BLACK);
    const b3 = setStone(b2, { x: 3, y: 4 }, 9, Stone.BLACK);
    const b4 = setStone(b3, { x: 3, y: 3 }, 9, Stone.WHITE);
    
    let state = {
      ...gameState,
      board: b4,
      currentPlayer: Color.BLACK,
    };
    
    // Black captures at (3,2)
    let result = applyMove(state, { x: 3, y: 2 });
    expect(result.success).toBe(true);
    if (result.success) state = result.newState;
    
    // White plays elsewhere (e.g., at (0,0)) - this is the "ko threat"
    result = applyMove(state, { x: 0, y: 0 });
    expect(result.success).toBe(true);
    if (result.success) state = result.newState;
    
    // Black responds elsewhere (e.g., at (8,8))
    result = applyMove(state, { x: 8, y: 8 });
    expect(result.success).toBe(true);
    if (result.success) state = result.newState;
    
    // Now white can recapture at (3,3) - the ko position has changed
    result = applyMove(state, { x: 3, y: 3 });
    expect(result.success).toBe(true);
  });
});
