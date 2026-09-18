/**
 * SGF Validation - Validate SGF data structures
 */

import { SgfGame, SgfGameInfo, SgfMove } from './types';

/**
 * Validate board size
 */
export function validateSize(size: number): boolean {
  return size === 9 || size === 13 || size === 19;
}

/**
 * Validate komi value
 */
export function validateKomi(komi: number): boolean {
  return !isNaN(komi) && komi >= 0 && komi <= 100;
}

/**
 * Validate SGF move position
 */
export function validateMovePosition(position: { x: number; y: number } | null, size: number): boolean {
  if (position === null) {
    return true; // Pass is always valid
  }
  
  return position.x >= 0 && position.x < size && position.y >= 0 && position.y < size;
}

/**
 * Validate SGF game info
 */
export function validateGameInfo(info: SgfGameInfo): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!validateSize(info.size)) {
    errors.push(`Unsupported board size: ${info.size}. Supported sizes: 9, 13, 19`);
  }
  
  if (!validateKomi(info.komi)) {
    errors.push(`Invalid komi value: ${info.komi}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate SGF moves
 */
export function validateMoves(moves: SgfMove[], size: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    
    // Check color
    if (move.color !== 'B' && move.color !== 'W') {
      errors.push(`Move ${move.moveNumber}: Invalid color "${move.color}"`);
    }
    
    // Check position
    if (!validateMovePosition(move.position, size)) {
      const pos = move.position;
      errors.push(`Move ${move.moveNumber}: Invalid position (${pos?.x}, ${pos?.y}) for size ${size}`);
    }
    
    // Check move number
    if (move.moveNumber !== i + 1) {
      errors.push(`Move ${i + 1}: Expected move number ${i + 1} but got ${move.moveNumber}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate complete SGF game
 */
export function validateSgfGame(game: SgfGame): { valid: boolean; errors: string[] } {
  const allErrors: string[] = [];
  
  // Validate game info
  const infoValidation = validateGameInfo(game.gameInfo);
  allErrors.push(...infoValidation.errors);
  
  // Validate moves
  const movesValidation = validateMoves(game.moves, game.gameInfo.size);
  allErrors.push(...movesValidation.errors);
  
  // Check turn order (alternating colors starting with black)
  for (let i = 0; i < game.moves.length; i++) {
    const move = game.moves[i];
    const expectedColor = i % 2 === 0 ? 'B' : 'W';
    
    if (move.color !== expectedColor) {
      allErrors.push(`Move ${move.moveNumber}: Expected ${expectedColor} but got ${move.color}`);
    }
  }
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Check if SGF is supported (basic compatibility check)
 */
export function isSgfSupported(sgfString: string): { supported: boolean; reason?: string } {
  // Check for basic SGF structure
  if (!sgfString.trim().startsWith('(') || !sgfString.trim().endsWith(')')) {
    return {
      supported: false,
      reason: 'Invalid SGF format: must start with "(" and end with ")"',
    };
  }
  
  // Check for required properties
  if (!sgfString.includes('GM[')) {
    return {
      supported: false,
      reason: 'Missing game type property (GM)',
    };
  }
  
  // Check if it's a Go game (GM[1])
  const gmMatch = sgfString.match(/GM\[(\d+)\]/);
  if (gmMatch && gmMatch[1] !== '1') {
    return {
      supported: false,
      reason: `Unsupported game type: GM[${gmMatch[1]}]. Only Go (GM[1]) is supported.`,
    };
  }
  
  // Check for variations (not supported yet)
  const variations = sgfString.match(/\([^;]*;[^)]*\)/g);
  if (sgfString.includes(')(') || (variations && variations.length > 1)) {
    return {
      supported: false,
      reason: 'SGF variations are not currently supported',
    };
  }
  
  return {
    supported: true,
  };
}
