import { GameState, Position, Color, Stone, AiDifficulty } from './types';
import { getStone, getNeighbors, setStone } from './board';
import { getGroup } from './groups';
import { captureOpponentGroups } from './capture';
import { applyMove } from './rules';

/**
 * Simple heuristic AI for Go.
 * Evaluates moves based on basic principles:
 * - Capture opponent stones
 * - Defend own groups in atari
 * - Play near existing stones
 * - Avoid suicide
 */
export function chooseMove(state: GameState, difficulty: AiDifficulty): Position | null {
  const legalMoves = getLegalMoves(state);
  
  if (legalMoves.length === 0) {
    return null; // Pass
  }
  
  // Score each legal move
  const scoredMoves = legalMoves.map(pos => ({
    pos,
    score: evaluateMove(state, pos, difficulty),
  }));
  
  // Sort by score descending
  scoredMoves.sort((a, b) => b.score - a.score);
  
  // Add randomness based on difficulty
  const randomness = getDifficultyRandomness(difficulty);
  if (randomness > 0 && scoredMoves.length > 1) {
    // Pick from top N moves with some randomness
    const topN = Math.min(Math.ceil(scoredMoves.length * randomness), scoredMoves.length);
    const randomIndex = Math.floor(Math.random() * topN);
    return scoredMoves[randomIndex].pos;
  }
  
  return scoredMoves[0].pos;
}

function getLegalMoves(state: GameState): Position[] {
  const moves: Position[] = [];
  
  for (let y = 0; y < state.size; y++) {
    for (let x = 0; x < state.size; x++) {
      const pos = { x, y };
      if (getStone(state.board, pos, state.size) === Stone.EMPTY) {
        // Check if move is legal (not suicide)
        const result = applyMove(state, pos);
        if (result.success) {
          moves.push(pos);
        }
      }
    }
  }
  
  return moves;
}

function evaluateMove(state: GameState, pos: Position, difficulty: AiDifficulty): number {
  let score = 0;
  const stoneColor = state.currentPlayer === Color.BLACK ? Stone.BLACK : Stone.WHITE;
  const opponentColor = stoneColor === Stone.BLACK ? Stone.WHITE : Stone.BLACK;
  
  // Simulate the move
  const newBoard = setStone(state.board, pos, state.size, stoneColor);
  
  // 1. Capture bonus - check if we capture opponent stones
  const captureResult = captureOpponentGroups(newBoard, pos, stoneColor, state.size);
  score += captureResult.capturedStones.length * 10;
  
  // 2. Defense bonus - check if we save our own groups
  for (const neighbor of getNeighbors(pos, state.size)) {
    const neighborStone = getStone(state.board, neighbor, state.size);
    if (neighborStone === stoneColor) {
      const group = getGroup(state.board, neighbor, state.size);
      if (group.liberties.length === 1) {
        // This group is in atari, saving it is valuable
        score += 15;
      }
    }
  }
  
  // 3. Atari bonus - check if we put opponent in atari
  for (const neighbor of getNeighbors(pos, state.size)) {
    const neighborStone = getStone(newBoard, neighbor, state.size);
    if (neighborStone === opponentColor) {
      const group = getGroup(newBoard, neighbor, state.size);
      if (group.liberties.length === 1) {
        score += 8;
      }
    }
  }
  
  // 4. Proximity bonus - prefer moves near existing stones
  let friendlyNeighbors = 0;
  let opponentNeighbors = 0;
  
  for (const neighbor of getNeighbors(pos, state.size)) {
    const neighborStone = getStone(state.board, neighbor, state.size);
    if (neighborStone === stoneColor) friendlyNeighbors++;
    if (neighborStone === opponentColor) opponentNeighbors++;
  }
  
  score += friendlyNeighbors * 2;
  score += opponentNeighbors * 1;
  
  // 5. Center bonus - prefer center moves early game
  if (state.moveHistory.length < state.size * 2) {
    const center = Math.floor(state.size / 2);
    const distanceFromCenter = Math.abs(pos.x - center) + Math.abs(pos.y - center);
    score += (state.size - distanceFromCenter) * 0.5;
  }
  
  return score;
}

function getDifficultyRandomness(difficulty: AiDifficulty): number {
  switch (difficulty) {
    case 'beginner': return 0.8; // Very random
    case 'easy': return 0.5;
    case 'medium': return 0.2;
    case 'hard': return 0.05;
    case 'expert': return 0; // No randomness
    default: return 0.2;
  }
}

export function shouldPass(state: GameState, difficulty: AiDifficulty): boolean {
  // Only pass if there are no good moves left
  const legalMoves = getLegalMoves(state);
  
  if (legalMoves.length === 0) {
    return true;
  }
  
  // In late game, consider passing if all moves are bad
  if (state.moveHistory.length > state.size * state.size * 0.7) {
    const bestMove = chooseMove(state, difficulty);
    if (bestMove === null) {
      return true;
    }
    
    // If best move score is very low, consider passing
    const score = evaluateMove(state, bestMove, difficulty);
    if (score < 2) {
      return true;
    }
  }
  
  return false;
}
