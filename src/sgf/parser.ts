/**
 * SGF Parser - Convert SGF format to game state
 */

import { GameState, Color, Position } from '../game/types';
import { createGame, playStone, pass } from '../game/gameState';
import { SgfGame, SgfGameInfo, SgfMove, SgfParseResponse } from './types';

/**
 * Convert SGF coordinate to internal position
 * SGF: lowercase letters a-s (a=0)
 * Internal: x,y (0-indexed, y=0 is top)
 */
function sgfCoordToPosition(coord: string, size: number): Position | null {
  if (coord === '' || coord === 'tt') {
    // Empty string or 'tt' is a pass (on any board size)
    return null;
  }
  
  if (coord.length !== 2) {
    throw new Error(`Invalid SGF coordinate: ${coord}`);
  }
  
  const col = coord.charCodeAt(0) - 97; // 97 = 'a'
  const row = coord.charCodeAt(1) - 97;
  
  if (col < 0 || col >= size || row < 0 || row >= size) {
    throw new Error(`SGF coordinate out of bounds: ${coord} for size ${size}`);
  }
  
  return { x: col, y: row };
}

/**
 * Parse SGF properties from a string
 */
function parseProperties(propString: string): Record<string, string[]> {
  const props: Record<string, string[]> = {};
  const regex = /([A-Z]+)\[([^\]]*)\]/g;
  let match;
  
  while ((match = regex.exec(propString)) !== null) {
    const key = match[1];
    const value = match[2];
    
    if (!props[key]) {
      props[key] = [];
    }
    props[key].push(value);
  }
  
  return props;
}

/**
 * Extract game info from SGF properties
 */
function extractGameInfoFromProps(props: Record<string, string[]>): SgfGameInfo {
  const info: SgfGameInfo = {
    size: 19, // Default to 19x19
    komi: 7.5, // Default komi
  };
  
  if (props.SZ) {
    info.size = parseInt(props.SZ[0], 10);
    if (isNaN(info.size) || info.size < 2 || info.size > 25) {
      throw new Error(`Invalid board size: ${props.SZ[0]}`);
    }
  }
  
  if (props.KM) {
    info.komi = parseFloat(props.KM[0]);
    if (isNaN(info.komi)) {
      throw new Error(`Invalid komi: ${props.KM[0]}`);
    }
  }
  
  if (props.PB) {
    info.blackName = props.PB[0];
  }
  
  if (props.PW) {
    info.whiteName = props.PW[0];
  }
  
  if (props.BR) {
    info.blackRank = props.BR[0];
  }
  
  if (props.WR) {
    info.whiteRank = props.WR[0];
  }
  
  if (props.RE) {
    info.result = props.RE[0];
  }
  
  if (props.DT) {
    info.date = props.DT[0];
  }
  
  if (props.EV) {
    info.eventName = props.EV[0];
  }
  
  if (props.RO) {
    info.round = props.RO[0];
  }
  
  if (props.RU) {
    info.rules = props.RU[0];
  }
  
  if (props.TM) {
    info.timeLimit = parseInt(props.TM[0], 10);
  }
  
  return info;
}

/**
 * Parse SGF moves from string
 */
function parseMoves(moveString: string, size: number): SgfMove[] {
  const moves: SgfMove[] = [];
  const moveRegex = /;(B|W)\[([^\]]*)\]/g;
  let match;
  let moveNumber = 1;
  
  while ((match = moveRegex.exec(moveString)) !== null) {
    const color = match[1] as 'B' | 'W';
    const coord = match[2];
    
    try {
      const position = sgfCoordToPosition(coord, size);
      
      moves.push({
        color,
        position,
        moveNumber,
      });
      
      moveNumber++;
    } catch (error) {
      throw new Error(`Error parsing move ${moveNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return moves;
}

/**
 * Parse SGF string to SgfGame object
 */
export function parseSgf(sgfString: string): SgfParseResponse {
  try {
    // Remove whitespace and validate basic structure
    const cleaned = sgfString.trim();
    
    if (!cleaned.startsWith('(') || !cleaned.endsWith(')')) {
      return {
        success: false,
        error: 'SGF must start with "(" and end with ")"',
      };
    }
    
    // Remove outer parentheses
    const content = cleaned.slice(1, -1);
    
    // Find the first semicolon that separates properties from moves
    const firstSemicolon = content.indexOf(';');
    
    if (firstSemicolon === -1) {
      return {
        success: false,
        error: 'Invalid SGF format: no moves found',
      };
    }
    
    // Extract properties (before first semicolon)
    const propString = content.substring(0, firstSemicolon);
    const props = parseProperties(propString);
    
    // Extract moves (after first semicolon)
    const moveString = content.substring(firstSemicolon);
    
    // Parse game info
    const gameInfo = extractGameInfoFromProps(props);
    
    // Parse moves
    const moves = parseMoves(moveString, gameInfo.size);
    
    return {
      success: true,
      game: {
        gameInfo,
        moves,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error',
    };
  }
}

/**
 * Convert SgfGame to GameState by replaying moves through the game engine
 */
export function sgfGameToGameState(sgfGame: SgfGame): GameState {
  const { gameInfo, moves } = sgfGame;
  
  // Create initial game state
  let state = createGame({
    size: gameInfo.size,
    komi: gameInfo.komi,
    ruleset: 'chinese',
  });
  
  // Replay all moves through the game engine
  for (const move of moves) {
    const color = move.color === 'B' ? Color.BLACK : Color.WHITE;
    
    // Verify it's the correct player's turn
    if (state.currentPlayer !== color) {
      throw new Error(`Move ${move.moveNumber}: Expected ${state.currentPlayer} but got ${color}`);
    }
    
    if (move.position === null) {
      // Pass move
      state = pass(state);
    } else {
      // Regular move
      const result = playStone(state, move.position);
      
      if (!result.success) {
        throw new Error(`Move ${move.moveNumber} at (${move.position.x}, ${move.position.y}): ${result.reason}`);
      }
      
      state = result.newState;
    }
  }
  
  return state;
}

/**
 * Parse SGF string directly to GameState
 */
export function parseSgfToGameState(sgfString: string): { success: true; state: GameState } | { success: false; error: string } {
  const parseResult = parseSgf(sgfString);
  
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error,
    };
  }
  
  try {
    const state = sgfGameToGameState(parseResult.game);
    return {
      success: true,
      state,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reconstruct game',
    };
  }
}
