/**
 * Go AI engine with configurable difficulty levels.
 * 
 * The AI evaluates all legal moves and picks the best one based on
 * weighted heuristics that vary by difficulty level.
 * 
 * Easy: Random play with minimal heuristics. Makes frequent mistakes.
 * Medium: Reasonable heuristic play. Captures, defends, attacks.
 * Hard: Stronger evaluation with look-ahead and territory awareness.
 */

import { GameState, Position, Stone, Color } from './types';
import { getStone, getNeighbors, isOnBoard } from './board';
import { getGroupStones, getGroupLiberties } from './groups';
import { applyMove } from './rules';
import { AiDifficulty, AI_CONFIGS, AiLevelConfig } from './aiLevels';

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
 * Find all groups of a given color that are in atari (1 liberty).
 * Returns array of groups, each group is an array of positions.
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
 * Check if a position is a star point for the given board size.
 */
function isStarPoint(pos: Position, size: number): boolean {
  if (size === 9) {
    return [[4,4], [2,2], [2,6], [6,2], [6,6]].some(([x, y]) => x === pos.x && y === pos.y);
  } else if (size === 13) {
    return [[6,6], [3,3], [3,9], [9,3], [9,9]].some(([x, y]) => x === pos.x && y === pos.y);
  } else if (size === 19) {
    return [[3,3], [3,9], [3,15], [9,3], [9,9], [9,15], [15,3], [15,9], [15,15]]
      .some(([x, y]) => x === pos.x && y === pos.y);
  }
  return false;
}

/**
 * Check if a position is an eye for the given color.
 */
function isEye(board: readonly Stone[], pos: Position, color: Stone, size: number): boolean {
  const orthogonal = getNeighbors(pos, size);
  
  for (const n of orthogonal) {
    if (getStone(board, n, size) !== color) return false;
  }

  const diagonals: Position[] = [
    { x: pos.x - 1, y: pos.y - 1 },
    { x: pos.x + 1, y: pos.y - 1 },
    { x: pos.x - 1, y: pos.y + 1 },
    { x: pos.x + 1, y: pos.y + 1 },
  ];

  let badDiagonals = 0;
  for (const d of diagonals) {
    if (!isOnBoard(d, size)) continue;
    const stone = getStone(board, d, size);
    if (stone !== color) badDiagonals++;
  }

  const isCorner = (pos.x === 0 || pos.x === size - 1) && (pos.y === 0 || pos.y === size - 1);
  const isEdge = pos.x === 0 || pos.x === size - 1 || pos.y === 0 || pos.y === size - 1;
  
  if (isCorner) return badDiagonals === 0;
  if (isEdge) return badDiagonals <= 1;
  return badDiagonals <= 1;
}

/**
 * Check if playing at a position would result in self-atari
 * (the placed stone's group would have exactly 1 liberty).
 */
function isSelfAtari(state: GameState, pos: Position): boolean {
  const result = applyMove(state, pos);
  if (!result.success) return true;
  
  const playerStone = state.currentPlayer === Color.BLACK ? Stone.BLACK : Stone.WHITE;
  const group = getGroupStones(result.newState.board, pos, state.size);
  const liberties = getGroupLiberties(result.newState.board, group, state.size);
  return liberties.length === 1;
}

/**
 * Simple territory estimation: count empty points that are closer to
 * one color than the other (using BFS distance).
 */
function estimateTerritory(board: readonly Stone[], size: number, color: Stone): number {
  const visited = new Set<string>();
  const posKey = (p: Position) => `${p.x},${p.y}`;
  let territory = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const pos = { x, y };
      if (visited.has(posKey(pos))) continue;
      if (getStone(board, pos, size) !== Stone.EMPTY) continue;

      // BFS to find this empty region and its bordering colors
      const region: Position[] = [];
      const queue: Position[] = [pos];
      const regionVisited = new Set<string>();
      regionVisited.add(posKey(pos));

      let bordersBlack = false;
      let bordersWhite = false;

      while (queue.length > 0) {
        const current = queue.shift()!;
        region.push(current);

        for (const n of getNeighbors(current, size)) {
          const stone = getStone(board, n, size);
          if (stone === Stone.BLACK) bordersBlack = true;
          else if (stone === Stone.WHITE) bordersWhite = true;
          else {
            const key = posKey(n);
            if (!regionVisited.has(key)) {
              regionVisited.add(key);
              queue.push(n);
            }
          }
        }
      }

      for (const p of region) visited.add(posKey(p));

      // Count this region for the color if only bordered by that color
      if (color === Stone.BLACK && bordersBlack && !bordersWhite) {
        territory += region.length;
      } else if (color === Stone.WHITE && bordersWhite && !bordersBlack) {
        territory += region.length;
      }
    }
  }

  return territory;
}

/**
 * Score a move based on the configured difficulty heuristics.
 */
function scoreMove(state: GameState, pos: Position, config: AiLevelConfig): number {
  let score = 0;
  const { size, board, currentPlayer } = state;
  const playerStone = currentPlayer === Color.BLACK ? Stone.BLACK : Stone.WHITE;
  const opponentStone = currentPlayer === Color.BLACK ? Stone.WHITE : Stone.BLACK;

  // Simulate the move
  const result = applyMove(state, pos);
  if (!result.success) return -1000;

  const newState = result.newState;

  // 1. Captures
  const oldCaptures = playerStone === Stone.BLACK ? state.blackCaptures : state.whiteCaptures;
  const newCaptures = playerStone === Stone.BLACK ? newState.blackCaptures : newState.whiteCaptures;
  const captures = newCaptures - oldCaptures;
  score += captures * config.captureWeight;

  // 2. Defense: saving own groups in atari
  const ownAtariBefore = getGroupsInAtari(state, playerStone);
  const ownAtariAfter = getGroupsInAtari(newState, playerStone);
  if (ownAtariAfter.length < ownAtariBefore.length) {
    score += config.defenseWeight;
  }

  // 3. Attack: putting opponent groups in atari
  const opponentAtariAfter = getGroupsInAtari(newState, opponentStone);
  score += opponentAtariAfter.length * config.attackWeight;

  // 4. Proximity to existing stones
  const neighbors = getNeighbors(pos, size);
  let friendlyNeighbors = 0;
  let opponentNeighbors = 0;
  
  for (const n of neighbors) {
    const stone = getStone(board, n, size);
    if (stone === playerStone) friendlyNeighbors++;
    else if (stone === opponentStone) opponentNeighbors++;
  }

  score += friendlyNeighbors * config.proximityWeight;
  score += opponentNeighbors * (config.proximityWeight * 0.7);

  // 5. Wider influence
  if (config.influenceWeight > 0) {
    for (const n of neighbors) {
      for (const nn of getNeighbors(n, size)) {
        if (nn.x === pos.x && nn.y === pos.y) continue;
        const stone = getStone(board, nn, size);
        if (stone === playerStone) score += config.influenceWeight;
        else if (stone === opponentStone) score += config.influenceWeight * 0.5;
      }
    }
  }

  // 6. Star points (early game preference)
  const moveCount = state.moveHistory.length;
  if (config.starPointWeight > 0 && moveCount < size * 2) {
    if (isStarPoint(pos, size)) score += config.starPointWeight;
  }

  // 7. Line preference (early game: prefer 3rd/4th line)
  if (config.linePreferenceWeight > 0 && moveCount < size * 2) {
    const edgeDistance = Math.min(pos.x, pos.y, size - 1 - pos.x, size - 1 - pos.y);
    if (edgeDistance === 2 || edgeDistance === 3) score += config.linePreferenceWeight;
    else if (edgeDistance === 0) score -= config.linePreferenceWeight;
    else if (edgeDistance === 1) score -= config.linePreferenceWeight * 0.5;
  }

  // 8. Eye avoidance (don't fill own eyes)
  if (isEye(board, pos, playerStone, size)) {
    score -= 50 * config.eyeAvoidanceStrength;
  }

  // 9. Self-atari penalty
  if (config.selfAtariPenalty > 0 && isSelfAtari(state, pos)) {
    // Only penalize if the group is large (small self-atari might be ok)
    const group = getGroupStones(newState.board, pos, size);
    if (group.length > 2) {
      score -= config.selfAtariPenalty;
    } else if (group.length === 1) {
      score -= config.selfAtariPenalty * 0.5;
    }
  }

  // 10. Territory estimation (hard AI only)
  if (config.territoryWeight > 0 && moveCount > size) {
    const territory = estimateTerritory(newState.board, size, playerStone);
    score += territory * config.territoryWeight * 0.1;
  }

  // 11. Randomness
  score += Math.random() * config.randomness;

  return score;
}

/**
 * Simple look-ahead evaluation for hard AI.
 * Evaluates the position after the move by looking one more move ahead
 * (opponent's best response).
 */
function lookAheadScore(state: GameState, pos: Position, config: AiLevelConfig): number {
  if (config.lookAheadDepth < 1) return 0;

  const result = applyMove(state, pos);
  if (!result.success) return -1000;

  const afterMove = result.newState;
  
  // Get opponent's best response
  const opponentMoves = getLegalMoves(afterMove);
  if (opponentMoves.length === 0) return 100; // Opponent has no moves = great

  // Evaluate opponent's best move (they'll try to maximize their score)
  let bestOpponentScore = -Infinity;
  const sampleSize = Math.min(opponentMoves.length, config.lookAheadDepth >= 2 ? 15 : 8);
  
  // Sample moves to evaluate (don't evaluate all for performance)
  const sampledMoves = opponentMoves
    .sort(() => Math.random() - 0.5)
    .slice(0, sampleSize);

  for (const oppPos of sampledMoves) {
    const oppResult = applyMove(afterMove, oppPos);
    if (!oppResult.success) continue;

    // Simple evaluation: count captures and liberties
    const playerStone = state.currentPlayer === Color.BLACK ? Stone.BLACK : Stone.WHITE;
    const oppStone = playerStone === Stone.BLACK ? Stone.WHITE : Stone.BLACK;
    
    const oppCaptures = oppStone === Stone.BLACK 
      ? oppResult.newState.blackCaptures - afterMove.blackCaptures
      : oppResult.newState.whiteCaptures - afterMove.whiteCaptures;
    
    // Opponent's score from this response
    let oppScore = oppCaptures * 20;
    
    // Check if opponent puts our groups in atari
    const ourAtari = getGroupsInAtari(oppResult.newState, playerStone);
    oppScore += ourAtari.length * 10;
    
    if (oppScore > bestOpponentScore) {
      bestOpponentScore = oppScore;
    }
  }

  // Subtract opponent's best response score (we want to minimize their gain)
  return -bestOpponentScore * 0.5;
}

/**
 * Choose the best move for the AI at the given difficulty level.
 * Returns null if the AI should pass.
 */
export function chooseMove(state: GameState, difficulty: AiDifficulty = 'medium'): Position | null {
  const config = AI_CONFIGS[difficulty];
  const legalMoves = getLegalMoves(state);
  
  if (legalMoves.length === 0) return null;

  // Score all moves
  const scored: MoveScore[] = legalMoves.map(pos => {
    let totalScore = scoreMove(state, pos, config);
    
    // Add look-ahead bonus for hard AI
    if (config.lookAheadDepth > 0) {
      totalScore += lookAheadScore(state, pos, config);
    }
    
    return { position: pos, score: totalScore };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Check pass threshold
  if (scored[0].score < config.passThreshold && state.moveHistory.length > state.size) {
    return null; // Pass
  }

  // Select from top pool
  const topScore = scored[0].score;
  const topMoves = scored.filter(m => m.score >= topScore - config.randomness);
  const pool = topMoves.slice(0, config.topSelectionPool);
  
  if (pool.length > 0) {
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    return chosen.position;
  }

  return scored[0].position;
}

/**
 * Check if the AI should pass instead of playing.
 */
export function shouldPass(state: GameState, difficulty: AiDifficulty = 'medium'): boolean {
  const config = AI_CONFIGS[difficulty];
  const legalMoves = getLegalMoves(state);
  if (legalMoves.length === 0) return true;

  // Late game: check if all moves score poorly
  if (state.moveHistory.length > state.size * 3) {
    const scored = legalMoves.map(pos => scoreMove(state, pos, config));
    const maxScore = Math.max(...scored);
    if (maxScore < config.passThreshold * 0.5) return true;
  }

  return false;
}
