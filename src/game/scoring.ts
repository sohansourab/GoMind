import { Stone, Color, Position, ScoreResult } from './types';
import { Board, getStone, getNeighbors } from './board';

/**
 * Calculate score using Chinese area scoring rules.
 * Score = stones on board + territory enclosed
 */
export function calculateScore(board: Board, size: number, komi: number): ScoreResult {
  const territory = calculateTerritory(board, size);
  
  let blackStones = 0;
  let whiteStones = 0;
  
  for (let i = 0; i < board.length; i++) {
    if (board[i] === Stone.BLACK) blackStones++;
    if (board[i] === Stone.WHITE) whiteStones++;
  }
  
  const blackTotal = blackStones + territory.black;
  const whiteTotal = whiteStones + territory.white + komi;
  
  const winner = blackTotal > whiteTotal ? Color.BLACK : Color.WHITE;
  const margin = Math.abs(blackTotal - whiteTotal);
  
  return {
    blackStones,
    whiteStones,
    blackTerritory: territory.black,
    whiteTerritory: territory.white,
    komi,
    blackTotal,
    whiteTotal,
    winner,
    margin,
  };
}

function calculateTerritory(board: Board, size: number): { black: number; white: number } {
  const visited = new Set<string>();
  let blackTerritory = 0;
  let whiteTerritory = 0;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const pos = { x, y };
      const key = `${x},${y}`;
      
      if (visited.has(key)) continue;
      if (getStone(board, pos, size) !== Stone.EMPTY) continue;
      
      // Found an empty point, flood fill to find the entire empty region
      const region: Position[] = [];
      const queue: Position[] = [pos];
      const regionVisited = new Set<string>();
      
      let touchesBlack = false;
      let touchesWhite = false;
      
      while (queue.length > 0) {
        const current = queue.shift()!;
        const currentKey = `${current.x},${current.y}`;
        
        if (regionVisited.has(currentKey)) continue;
        regionVisited.add(currentKey);
        visited.add(currentKey);
        
        const stone = getStone(board, current, size);
        
        if (stone === Stone.EMPTY) {
          region.push(current);
          
          for (const neighbor of getNeighbors(current, size)) {
            const neighborKey = `${neighbor.x},${neighbor.y}`;
            if (!regionVisited.has(neighborKey)) {
              queue.push(neighbor);
            }
          }
        } else if (stone === Stone.BLACK) {
          touchesBlack = true;
        } else if (stone === Stone.WHITE) {
          touchesWhite = true;
        }
      }
      
      // Determine territory ownership
      if (touchesBlack && !touchesWhite) {
        blackTerritory += region.length;
      } else if (touchesWhite && !touchesBlack) {
        whiteTerritory += region.length;
      }
      // If touches both or neither, it's neutral (dame)
    }
  }
  
  return { black: blackTerritory, white: whiteTerritory };
}
