import { describe, it, expect } from 'vitest';
import { createGame, playStone, pass, resign, getScore } from '../game/gameState';
import { Color, Stone } from '../game/types';
import { didHumanWin } from '../storage/api';

describe('Game Result Experience', () => {
  describe('Human vs Computer', () => {
    it('Human Black wins by score', () => {
      // Create a game where Black has more territory
      let gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese',
        playerMode: 'human-vs-computer'
      });
      
      // Play moves that give Black more territory
      const moves = [
        { x: 0, y: 0 }, // Black
        { x: 8, y: 8 }, // White
        { x: 0, y: 1 }, // Black
        { x: 8, y: 7 }, // White
        { x: 0, y: 2 }, // Black
        { x: 8, y: 6 }, // White
      ];
      
      for (const move of moves) {
        const result = playStone(gameState, move);
        if (result.success) {
          gameState = result.newState;
        }
      }
      
      // End game with two passes
      gameState = pass(gameState);
      gameState = pass(gameState);
      
      // Calculate score
      const score = getScore(gameState);
      
      // Verify game is over
      expect(gameState.isGameOver).toBe(true);
      expect(gameState.winner).toBeDefined();
      
      // Check if human (Black) won
      const humanWon = didHumanWin(gameState);
      expect(humanWon).toBe(gameState.winner === Color.BLACK);
    });

    it('Human Black loses by score', () => {
      // Create a game where White has more territory (with komi)
      let gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese',
        playerMode: 'human-vs-computer'
      });
      
      // Play minimal moves
      let result = playStone(gameState, { x: 4, y: 4 });
      if (result.success) gameState = result.newState;
      result = playStone(gameState, { x: 4, y: 3 });
      if (result.success) gameState = result.newState;
      
      // End game with two passes
      gameState = pass(gameState);
      gameState = pass(gameState);
      
      // With komi 7.5, White should win on empty board
      const score = getScore(gameState);
      expect(gameState.isGameOver).toBe(true);
      expect(gameState.winner).toBe(Color.WHITE);
      
      // Human (Black) should lose
      const humanWon = didHumanWin(gameState);
      expect(humanWon).toBe(false);
    });

    it('Human wins by opponent resignation', () => {
      let gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese',
        playerMode: 'human-vs-computer'
      });
      
      // Human plays a move
      let result = playStone(gameState, { x: 4, y: 4 });
      if (result.success) gameState = result.newState;
      
      // Computer resigns (White resigns)
      gameState = resign(gameState);
      
      expect(gameState.isGameOver).toBe(true);
      expect(gameState.winner).toBe(Color.BLACK);
      expect(gameState.winReason).toBe('resignation');
      
      // Human (Black) should win
      const humanWon = didHumanWin(gameState);
      expect(humanWon).toBe(true);
    });

    it('Human loses by resignation', () => {
      let gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese',
        playerMode: 'human-vs-computer'
      });
      
      // Human resigns (Black resigns)
      gameState = resign(gameState);
      
      expect(gameState.isGameOver).toBe(true);
      expect(gameState.winner).toBe(Color.WHITE);
      expect(gameState.winReason).toBe('resignation');
      
      // Human (Black) should lose
      const humanWon = didHumanWin(gameState);
      expect(humanWon).toBe(false);
    });

    it('Result not displayed while game is active', () => {
      const gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese',
        playerMode: 'human-vs-computer'
      });
      
      expect(gameState.isGameOver).toBe(false);
      expect(gameState.winner).toBeNull();
      
      const humanWon = didHumanWin(gameState);
      expect(humanWon).toBeNull();
    });
  });

  describe('Human vs Human', () => {
    it('Black wins', () => {
      let gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese',
        playerMode: 'human-vs-human'
      });
      
      // Play some moves
      let result = playStone(gameState, { x: 0, y: 0 });
      if (result.success) gameState = result.newState;
      result = playStone(gameState, { x: 8, y: 8 });
      if (result.success) gameState = result.newState;
      
      // End game
      gameState = pass(gameState);
      gameState = pass(gameState);
      
      expect(gameState.isGameOver).toBe(true);
      expect(gameState.winner).toBeDefined();
      
      // For human vs human, didHumanWin should return null
      const humanWon = didHumanWin(gameState);
      expect(humanWon).toBeNull();
    });

    it('White wins', () => {
      let gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese',
        playerMode: 'human-vs-human'
      });
      
      // Play minimal moves - White should win with komi
      let result = playStone(gameState, { x: 4, y: 4 });
      if (result.success) gameState = result.newState;
      
      // End game
      gameState = pass(gameState);
      gameState = pass(gameState);
      
      expect(gameState.isGameOver).toBe(true);
      expect(gameState.winner).toBe(Color.WHITE);
      
      // For human vs human, didHumanWin should return null
      const humanWon = didHumanWin(gameState);
      expect(humanWon).toBeNull();
    });

    it('Black wins by resignation', () => {
      let gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese',
        playerMode: 'human-vs-human'
      });
      
      // White resigns
      let result = playStone(gameState, { x: 4, y: 4 });
      if (result.success) gameState = result.newState;
      gameState = resign(gameState);
      
      expect(gameState.isGameOver).toBe(true);
      expect(gameState.winner).toBe(Color.BLACK);
      expect(gameState.winReason).toBe('resignation');
    });

    it('White wins by resignation', () => {
      let gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese',
        playerMode: 'human-vs-human'
      });
      
      // Black resigns
      gameState = resign(gameState);
      
      expect(gameState.isGameOver).toBe(true);
      expect(gameState.winner).toBe(Color.WHITE);
      expect(gameState.winReason).toBe('resignation');
    });
  });

  describe('Game End Reasons', () => {
    it('Two consecutive passes ends game', () => {
      let gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese'
      });
      
      expect(gameState.isGameOver).toBe(false);
      
      gameState = pass(gameState);
      expect(gameState.isGameOver).toBe(false);
      expect(gameState.consecutivePasses).toBe(1);
      
      gameState = pass(gameState);
      expect(gameState.isGameOver).toBe(true);
      expect(gameState.consecutivePasses).toBe(2);
    });

    it('Pass then play resets consecutive passes', () => {
      let gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese'
      });
      
      gameState = pass(gameState);
      expect(gameState.consecutivePasses).toBe(1);
      
      let result = playStone(gameState, { x: 4, y: 4 });
      if (result.success) gameState = result.newState;
      expect(gameState.consecutivePasses).toBe(0);
      expect(gameState.isGameOver).toBe(false);
    });

    it('Resignation ends game immediately', () => {
      let gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese'
      });
      
      expect(gameState.isGameOver).toBe(false);
      
      gameState = resign(gameState);
      
      expect(gameState.isGameOver).toBe(true);
      expect(gameState.winReason).toBe('resignation');
    });
  });

  describe('Score Calculation', () => {
    it('Empty board - White wins by komi', () => {
      let gameState = createGame({ 
        size: 9, 
        komi: 7.5, 
        ruleset: 'chinese'
      });
      
      gameState = pass(gameState);
      gameState = pass(gameState);
      
      const score = getScore(gameState);
      
      expect(score.blackTotal).toBe(0);
      expect(score.whiteTotal).toBe(7.5);
      expect(score.winner).toBe(Color.WHITE);
      expect(score.margin).toBe(7.5);
    });

    it('Score includes territory and stones', () => {
      let gameState = createGame({ 
        size: 9, 
        komi: 0, 
        ruleset: 'chinese'
      });
      
      // Create territory for Black
      const blackMoves = [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 0 },
      ];
      
      for (const move of blackMoves) {
        const result = playStone(gameState, move);
        if (result.success) {
          gameState = result.newState;
        }
      }
      
      gameState = pass(gameState);
      gameState = pass(gameState);
      
      const score = getScore(gameState);
      
      // Black should have stones + territory
      expect(score.blackStones).toBeGreaterThan(0);
      expect(score.blackTotal).toBeGreaterThan(0);
    });
  });
});
