import { describe, it, expect } from 'vitest';
import { applyMove } from '../game/rules';
import { createGame } from '../game/gameState';
import { Color, Stone, GameState } from '../game/types';
import { createEmptyBoard, setStone } from '../game/board';

function stateWithBoard(size: number, board: readonly Stone[], player: Color): GameState {
  const base = createGame({ size, komi: 7.5, ruleset: 'chinese' });
  return { ...base, board, currentPlayer: player };
}

describe('Suicide Prevention', () => {
  it('rejects direct suicide in corner', () => {
    // Black at (1,0) and (0,1) surround corner (0,0)
    // White tries to play at (0,0) - suicide
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 1, y: 0 }, 9, Stone.BLACK);
    board = setStone(board, { x: 0, y: 1 }, 9, Stone.BLACK);

    const state = stateWithBoard(9, board, Color.WHITE);
    const result = applyMove(state, { x: 0, y: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('Illegal move: suicide');
    }
  });

  it('allows move that captures to create liberties', () => {
    // White at (0,0), Black at (0,1). White has 1 liberty at (1,0).
    // Black plays (1,0) to capture white - this is legal because
    // after capture, black at (1,0) has liberties.
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 0, y: 0 }, 9, Stone.WHITE);
    board = setStone(board, { x: 0, y: 1 }, 9, Stone.BLACK);

    const state = stateWithBoard(9, board, Color.BLACK);
    const result = applyMove(state, { x: 1, y: 0 });
    expect(result.success).toBe(true);
    if (result.success) {
      // White stone should be captured
      expect(result.newState.blackCaptures).toBe(1);
    }
  });

  it('rejects group suicide', () => {
    // Black surrounds (1,1) from all 4 sides
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 1, y: 0 }, 9, Stone.BLACK);
    board = setStone(board, { x: 0, y: 1 }, 9, Stone.BLACK);
    board = setStone(board, { x: 2, y: 1 }, 9, Stone.BLACK);
    board = setStone(board, { x: 1, y: 2 }, 9, Stone.BLACK);

    const state = stateWithBoard(9, board, Color.WHITE);
    const result = applyMove(state, { x: 1, y: 1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('Illegal move: suicide');
    }
  });

  it('allows filling last liberty when it captures', () => {
    // White group at (0,0)-(1,0) with black surrounding except (2,0)
    // White: (0,0), (1,0). Black: (0,1), (1,1).
    // White's liberties: (2,0) only (and that's it for the group)
    // Actually let's verify: 
    // (0,0) neighbors: (1,0)=W, (0,1)=B -> no empty
    // (1,0) neighbors: (0,0)=W, (2,0)=empty, (1,1)=B -> 1 liberty
    // So white group has 1 liberty at (2,0)
    // Black plays (2,0) to capture - legal because after capture black has liberties
    
    let board = createEmptyBoard({ size: 9 });
    board = setStone(board, { x: 0, y: 0 }, 9, Stone.WHITE);
    board = setStone(board, { x: 1, y: 0 }, 9, Stone.WHITE);
    board = setStone(board, { x: 0, y: 1 }, 9, Stone.BLACK);
    board = setStone(board, { x: 1, y: 1 }, 9, Stone.BLACK);

    const state = stateWithBoard(9, board, Color.BLACK);
    const result = applyMove(state, { x: 2, y: 0 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.newState.blackCaptures).toBe(2);
    }
  });
});
