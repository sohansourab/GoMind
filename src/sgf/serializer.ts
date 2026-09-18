/**
 * SGF Serializer - Convert game state to SGF format
 */

import { GameState, Color, Move } from '../game/types';
import { SgfGame, SgfGameInfo, SgfMove } from './types';

/**
 * Convert internal position to SGF coordinate
 * Internal: x,y (0-indexed, y=0 is top)
 * SGF: lowercase letters a-s (a=0)
 */
function positionToSgfCoord(pos: { x: number; y: number } | null, size: number): string {
  if (pos === null) {
    return ''; // Pass move
  }
  
  // SGF uses lowercase letters: a=0, b=1, ..., s=18
  const col = String.fromCharCode(97 + pos.x); // 97 = 'a'
  const row = String.fromCharCode(97 + pos.y);
  
  return `${col}${row}`;
}

/**
 * Convert game result to SGF result format
 */
function formatResult(state: GameState): string | undefined {
  if (!state.isGameOver || !state.winner) {
    return undefined;
  }
  
  if (state.winReason === 'resignation') {
    return state.winner === Color.BLACK ? 'B+R' : 'W+R';
  }
  
  // For scoring, we'd need to calculate the actual score
  // For now, just indicate who won
  return state.winner === Color.BLACK ? 'B+' : 'W+';
}

/**
 * Convert a Move to SGF move format
 */
function moveToSgfMove(move: Move): SgfMove {
  return {
    color: move.color === Color.BLACK ? 'B' : 'W',
    position: move.position,
    moveNumber: move.moveNumber,
  };
}

/**
 * Extract game info from game state
 */
function extractGameInfo(state: GameState): SgfGameInfo {
  const info: SgfGameInfo = {
    size: state.size,
    komi: state.komi,
  };
  
  // Add player names based on game mode
  if (state.playerMode === 'human-vs-computer') {
    info.blackName = 'Human';
    info.whiteName = `Satori AI (${state.aiDifficulty})`;
  } else {
    info.blackName = 'Black';
    info.whiteName = 'White';
  }
  
  // Add result if game is over
  const result = formatResult(state);
  if (result) {
    info.result = result;
  }
  
  // Add date
  info.date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  
  return info;
}

/**
 * Convert game state to SGF game object
 */
export function gameStateToSgf(state: GameState): SgfGame {
  const gameInfo = extractGameInfo(state);
  const moves = state.moveHistory.map(moveToSgfMove);
  
  return {
    gameInfo,
    moves,
  };
}

/**
 * Format SGF game info properties
 */
function formatGameInfo(info: SgfGameInfo): string {
  const props: string[] = [];
  
  // Required properties
  props.push('GM[1]'); // Game type: Go
  props.push('FF[4]'); // File format version 4
  props.push('CA[UTF-8]'); // Character encoding
  props.push('AP[Satori]'); // Application name
  props.push(`SZ[${info.size}]`); // Board size
  props.push(`KM[${info.komi}]`); // Komi
  
  // Optional properties
  if (info.blackName) {
    props.push(`PB[${info.blackName}]`);
  }
  if (info.whiteName) {
    props.push(`PW[${info.whiteName}]`);
  }
  if (info.blackRank) {
    props.push(`BR[${info.blackRank}]`);
  }
  if (info.whiteRank) {
    props.push(`WR[${info.whiteRank}]`);
  }
  if (info.result) {
    props.push(`RE[${info.result}]`);
  }
  if (info.date) {
    props.push(`DT[${info.date}]`);
  }
  if (info.eventName) {
    props.push(`EV[${info.eventName}]`);
  }
  if (info.round) {
    props.push(`RO[${info.round}]`);
  }
  if (info.rules) {
    props.push(`RU[${info.rules}]`);
  }
  if (info.timeLimit) {
    props.push(`TM[${info.timeLimit}]`);
  }
  
  return props.join('');
}

/**
 * Format SGF moves
 */
function formatMoves(moves: SgfMove[], size: number): string {
  return moves.map(move => {
    const coord = positionToSgfCoord(move.position, size);
    return `;${move.color}[${coord}]`;
  }).join('');
}

/**
 * Convert game state to SGF string
 */
export function serializeSgf(state: GameState): string {
  const sgfGame = gameStateToSgf(state);
  
  const gameInfo = formatGameInfo(sgfGame.gameInfo);
  const moves = formatMoves(sgfGame.moves, sgfGame.gameInfo.size);
  
  // SGF format: (;properties;moves)
  return `(${gameInfo}${moves})`;
}

/**
 * Download SGF file
 */
export function downloadSgf(state: GameState, filename?: string): void {
  const sgf = serializeSgf(state);
  const blob = new Blob([sgf], { type: 'application/x-go-sgf' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `game-${Date.now()}.sgf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
