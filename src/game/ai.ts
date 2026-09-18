/**
 * Simple heuristic AI for Go.
 * 
 * The AI evaluates all legal moves and picks the best one based on:
 * 1. Capturing opponent stones (highest priority)
 * 2. Saving own groups in atari (high priority)
 * 3. Reducing opponent liberties (medium priority)
 * 4. Playing near existing stones (low-medium priority)
 * 5. Preferring star points and strategic positions (low priority)
 * 6. Random tiebreaker
 * 
 * This is not a strong AI but provides reasonable play for casual games.
 */

import { GameState, Position, Stone, Color } from './types';
import { getStone, getNeighbors, isOnBoard } from './board';
import { getGroupStones, getGroupLiberties } from './groups';
import { applyMove } from './rules';

interface MoveScore {
  position: Position;
  score: number;
}

/**
 * Get all legal moves for the current player.
 */
function getLegalMoves(state: GameState): Position[] {
  const moves: Position[] = [];
  for (let y = 0; y < state.size; y++) {
    for (let x = 0; x < state.size; x++) {
      const pos = { x, y };
      if (getStone(state.board, pos, state.size) !== Stone.EMPTY) continue;
      
      const result = applyMove(state, pos);
      if (result.success) {
        moves.push(pos);
      }
    }
  }
  return moves;
}

/**
 * Check if any group of the given color is in atari (1 liberty).
 * Returns the positions of groups in atari.
 */
function getGroupsInAtari(state: GameState, color: Stone): Position[][] {
  const visited = new Set<string>();
  const atariGroups: Position[][] = [];
  const posKey = (p: Position) => `${p.x},${p.y}`;

  for (let y = 0; y < state.size; y++) {
    for (let x = 0; x < state.size; x++) {
      const pos = { x, y };
      const key = posKey(pos);
      if (visited.has(key)) continue;
      if (getStone(state.board, pos, state.size) !== color) continue;

      const group = getGroupStones(state.board, pos, state.size);
      for (const s of group) visited.add(posKey(s));

      const liberties = getGroupLiberties(state.board, group, state.size);
      if (liberties.length === 1) {
        atariGroups.push(group);
      }
    }
  }

  return atariGroups;
}

/**
 * Score a move based on heuristics.
 */
function scoreMove(state: GameState, pos: Position): number {
  let score = 0;
  const { size, board, currentPlayer } = state;
  const playerStone = currentPlayer === Color.BLACK ? Stone.BLACK : Stone.WHITE;
  const opponentStone = currentPlayer === Color.BLACK ? Stone.WHITE : Stone.BLACK;

  // Simulate the move
  const result = applyMove(state, pos);
  if (!result.success) return -1000;

  const newState = result.newState;

  // 1. Did we capture stones? (very high priority)
  // Compare capture counts between old and new state
  const oldCaptures = playerStone === Stone.BLACK ? state.blackCaptures : state.whiteCaptures;
  const newCaptures = playerStone === Stone.BLACK ? newState.blackCaptures : newState.whiteCaptures;
  const captures = newCaptures - oldCaptures;
  score += captures * 30;

  // 2. Are we saving our own groups in atari?
  const ownAtariBefore = getGroupsInAtari(state, playerStone);
  const ownAtariAfter = getGroupsInAtari(newState, playerStone);
  
  // Check if the placed stone's group was in atari before (it wasn't - it was just placed)
  // Instead, check if we reduced the number of our groups in atari
  if (ownAtariAfter.length < ownAtariBefore.length) {
    score += 20;
  }

  // 3. Are we putting opponent groups in atari?
  const opponentAtariAfter = getGroupsInAtari(newState, opponentStone);
  score += opponentAtariAfter.length * 8;

  // 4. Proximity to existing stones (influence)
  const neighbors = getNeighbors(pos, size);
  let friendlyNeighbors = 0;
  let opponentNeighbors = 0;
  
  for (const n of neighbors) {
    const stone = getStone(board, n, size);
    if (stone === playerStone) friendlyNeighbors++;
    else if (stone === opponentStone) opponentNeighbors++;
  }

  // Being near own stones is good (connection), being near opponent is ok (attack)
  score += friendlyNeighbors * 3;
  score += opponentNeighbors * 2;

  // 5. Check wider area (2 steps away) for influence
  for (const n of neighbors) {
    for (const nn of getNeighbors(n, size)) {
      if (nn.x === pos.x && nn.y === pos.y) continue;
      const stone = getStone(board, nn, size);
      if (stone === playerStone) score += 1;
      else if (stone === opponentStone) score += 0.5;
    }
  }

  // 6. Prefer star points and strategic locations early game
  const moveCount = state.moveHistory.length;
  if (moveCount < size * 2) {
    // Early game: prefer star points and 3rd/4th line
    if (isStarPoint(pos, size)) score += 5;
    
    // Prefer 3rd and 4th line positions
    const edgeDistance = Math.min(pos.x, pos.y, size - 1 - pos.x, size - 1 - pos.y);
    if (edgeDistance === 2 || edgeDistance === 3) score += 3; // 3rd/4th line
    else if (edgeDistance === 0) score -= 2; // 1st line (edge) is bad early
    else if (edgeDistance === 1) score -= 1; // 2nd line is not great early
  }

  // 7. Avoid filling own eyes (very bad)
  if (isEye(board, pos, playerStone, size)) {
    score -= 50;
  }

  // 8. Small random factor for variety
  score += Math.random() * 2;

  return score;
}

/**
 * Check if a position is a star point for the given board size.
 */
function isStarPoint(pos: Position, size: number): boolean {
  if (size === 9) {
    const starPoints = [[4,4], [2,2], [2,6], [6,2], [6,6]];
    return starPoints.some(([x, y]) => x === pos.x && y === pos.y);
  } else if (size === 13) {
    const starPoints = [[6,6], [3,3], [3,9], [9,3], [9,9]];
    return starPoints.some(([x, y]) => x === pos.x && y === pos.y);
  } else if (size === 19) {
    const starPoints = [[3,3], [3,9], [3,15], [9,3], [9,9], [9,15], [15,3], [15,9], [15,15]];
    return starPoints.some(([x, y]) => x === pos.x && y === pos.y);
  }
  return false;
}

/**
 * Check if a position is an eye for the given color.
 * An eye is an empty point where all orthogonal neighbors are the same color,
 * and all diagonal neighbors (on edges/corners with fewer diagonals) are also same color or off-board.
 */
function isEye(board: readonly Stone[], pos: Position, color: Stone, size: number): boolean {
  const orthogonal = getNeighbors(pos, size);
  
  // All orthogonal neighbors must be the player's color
  for (const n of orthogonal) {
    if (getStone(board, n, size) !== color) return false;
  }

  // Check diagonal neighbors - at most 1 can be empty/opponent for a true eye
  const diagonals: Position[] = [
    { x: pos.x - 1, y: pos.y - 1 },
    { x: pos.x + 1, y: pos.y - 1 },
    { x: pos.x - 1, y: pos.y + 1 },
    { x: pos.x + 1, y: pos.y + 1 },
  ];

  let badDiagonals = 0;
  for (const d of diagonals) {
    if (!isOnBoard(d, size)) continue; // Off-board is OK
    const stone = getStone(board, d, size);
    if (stone !== color) badDiagonals++;
  }

  // For edge/corner eyes, allow 0 bad diagonals
  // For center eyes, allow at most 1 bad diagonal
  const isEdge = pos.x === 0 || pos.x === size - 1 || pos.y === 0 || pos.y === size - 1;
  const isCorner = (pos.x === 0 || pos.x === size - 1) && (pos.y === 0 || pos.y === size - 1);
  
  if (isCorner) return badDiagonals === 0;
  if (isEdge) return badDiagonals <= 1;
  return badDiagonals <= 1;
}

/**
 * Choose the best move for the AI.
 * Returns null if the AI should pass.
 */
export function chooseMove(state: GameState): Position | null {
  const legalMoves = getLegalMoves(state);
  
  // If no legal moves, must pass
  if (legalMoves.length === 0) return null;

  // Score all moves
  const scored: MoveScore[] = legalMoves.map(pos => ({
    position: pos,
    score: scoreMove(state, pos),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // If the best move has a very negative score, consider passing
  // (this happens when all moves are bad, like filling eyes)
  if (scored[0].score < -10 && state.moveHistory.length > state.size) {
    // After some moves, if all options are terrible, pass
    return null;
  }

  // Pick from top moves with some randomness (among top 3 if close)
  const topScore = scored[0].score;
  const topMoves = scored.filter(m => m.score >= topScore - 3);
  
  if (topMoves.length > 0) {
    const chosen = topMoves[Math.floor(Math.random() * Math.min(3, topMoves.length))];
    return chosen.position;
  }

  return scored[0].position;
}

/**
 * Check if the AI should pass instead of playing.
 * The AI passes if there are no good moves left (late game with no territory to gain).
 */
export function shouldPass(state: GameState): boolean {
  const legalMoves = getLegalMoves(state);
  if (legalMoves.length === 0) return true;

  // In late game, if all moves score poorly, pass
  if (state.moveHistory.length > state.size * 3) {
    const scored = legalMoves.map(pos => scoreMove(state, pos));
    const maxScore = Math.max(...scored);
    if (maxScore < 2) return true;
  }

  return false;
}
