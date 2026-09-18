import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Stone, Position } from '../../game/types';
import { BoardGrid } from './BoardGrid';
import { StoneComponent } from './Stone';
import { StarPoints } from './StarPoints';
import { positionsEqual } from '../../game/board';

interface GoBoardProps {
  board: readonly Stone[];
  size: number;
  onIntersectionClick: (pos: Position) => void;
  lastMovePosition: Position | null;
  currentPlayer: Stone.BLACK | Stone.WHITE;
  disabled?: boolean;
  hintPosition?: Position | null;
}

export function GoBoard({
  board,
  size,
  onIntersectionClick,
  lastMovePosition,
  currentPlayer,
  disabled = false,
  hintPosition = null,
}: GoBoardProps) {
  const [hoverPos, setHoverPos] = useState<Position | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const padding = 22;
  const totalSize = 500;
  const cellSize = (totalSize - 2 * padding) / (size - 1);
  const offset = padding;

  const getPositionFromEvent = useCallback((e: React.MouseEvent | React.TouchEvent): Position | null => {
    if (!svgRef.current) return null;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();

    let clientX: number, clientY: number;
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = totalSize / rect.width;
    const scaleY = totalSize / rect.height;
    const svgX = (clientX - rect.left) * scaleX;
    const svgY = (clientY - rect.top) * scaleY;

    const x = Math.round((svgX - offset) / cellSize);
    const y = Math.round((svgY - offset) / cellSize);

    if (x < 0 || x >= size || y < 0 || y >= size) return null;
    return { x, y };
  }, [cellSize, offset, size]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    const pos = getPositionFromEvent(e);
    if (pos) onIntersectionClick(pos);
  }, [disabled, getPositionFromEvent, onIntersectionClick]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    if (hoverPos) {
      onIntersectionClick(hoverPos);
    }
  }, [disabled, hoverPos, onIntersectionClick]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    const pos = getPositionFromEvent(e);
    setHoverPos(pos);
  }, [disabled, getPositionFromEvent]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    const pos = getPositionFromEvent(e);
    setHoverPos(pos);
  }, [disabled, getPositionFromEvent]);

  const handleMouseLeave = useCallback(() => {
    setHoverPos(null);
  }, []);

  const stoneRadius = cellSize * 0.46;

  // Track which stones are "new" (just placed) for animation
  const prevBoardRef = useRef<readonly Stone[]>(board);
  const [newStones, setNewStones] = useState<Set<string>>(new Set());

  // Calculate new stones and update ref in useEffect (not useMemo)
  useEffect(() => {
    const newOnes = new Set<string>();
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = y * size + x;
        if (board[idx] !== Stone.EMPTY && prevBoardRef.current[idx] === Stone.EMPTY) {
          newOnes.add(`${x}-${y}`);
        }
      }
    }
    setNewStones(newOnes);
    
    // Update ref after a delay to allow animation to complete
    const timeoutId = setTimeout(() => {
      prevBoardRef.current = board;
    }, 200);
    
    // Cleanup timeout on unmount or when board changes
    return () => clearTimeout(timeoutId);
  }, [board, size]);

  // Render stones
  const stones = useMemo(() => {
    const elements: React.ReactElement[] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const stone = board[y * size + x];
        if (stone === Stone.EMPTY) continue;

        const isLast = lastMovePosition !== null &&
          positionsEqual(lastMovePosition, { x, y });
        const isNew = newStones.has(`${x}-${y}`);

        elements.push(
          <StoneComponent
            key={`${x}-${y}`}
            x={offset + x * cellSize}
            y={offset + y * cellSize}
            color={stone}
            radius={stoneRadius}
            isLastMove={isLast}
            isNew={isNew}
          />
        );
      }
    }
    return elements;
  }, [board, size, cellSize, offset, stoneRadius, lastMovePosition, newStones]);

  // Ghost stone (hover indicator)
  const hoverIndicator = useMemo(() => {
    if (!hoverPos || disabled) return null;
    const idx = hoverPos.y * size + hoverPos.x;
    if (board[idx] !== Stone.EMPTY) return null;

    const isBlack = currentPlayer === Stone.BLACK;

    return (
      <g style={{ pointerEvents: 'none' }}>
        {/* Ghost stone */}
        <circle
          cx={offset + hoverPos.x * cellSize}
          cy={offset + hoverPos.y * cellSize}
          r={stoneRadius}
          fill={isBlack ? 'rgba(0,0,0,0.25)' : 'rgba(240,236,228,0.45)'}
          stroke={isBlack ? 'rgba(0,0,0,0.35)' : 'rgba(180,175,165,0.4)'}
          strokeWidth={0.8}
        />
      </g>
    );
  }, [hoverPos, disabled, board, size, cellSize, offset, stoneRadius, currentPlayer]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      className="go-board-svg"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="img"
      aria-label={`Go board, ${size} by ${size}`}
    >
      <defs>
        {/* Wood grain pattern */}
        <pattern id="woodGrain" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          {/* Base warm wood */}
          <rect width="200" height="200" fill="#dcb35c" />
          {/* Grain lines - subtle, organic */}
          <line x1="0" y1="15" x2="200" y2="18" stroke="#c9a04a" strokeWidth="0.6" opacity="0.25" />
          <line x1="0" y1="35" x2="200" y2="32" stroke="#c9a04a" strokeWidth="0.4" opacity="0.18" />
          <line x1="0" y1="55" x2="200" y2="58" stroke="#c9a04a" strokeWidth="0.7" opacity="0.22" />
          <line x1="0" y1="78" x2="200" y2="75" stroke="#c9a04a" strokeWidth="0.4" opacity="0.15" />
          <line x1="0" y1="98" x2="200" y2="100" stroke="#c9a04a" strokeWidth="0.6" opacity="0.2" />
          <line x1="0" y1="120" x2="200" y2="118" stroke="#c9a04a" strokeWidth="0.5" opacity="0.18" />
          <line x1="0" y1="142" x2="200" y2="145" stroke="#c9a04a" strokeWidth="0.4" opacity="0.15" />
          <line x1="0" y1="165" x2="200" y2="162" stroke="#c9a04a" strokeWidth="0.6" opacity="0.22" />
          <line x1="0" y1="185" x2="200" y2="188" stroke="#c9a04a" strokeWidth="0.4" opacity="0.18" />
        </pattern>
        
        {/* Board edge shadow */}
        <linearGradient id="boardEdge" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
        </linearGradient>
      </defs>

      {/* Board background - warm wood */}
      <rect
        x={0}
        y={0}
        width={totalSize}
        height={totalSize}
        rx={6}
        fill="url(#woodGrain)"
      />
      
      {/* Subtle edge gradient for depth */}
      <rect
        x={0}
        y={0}
        width={totalSize}
        height={totalSize}
        rx={6}
        fill="url(#boardEdge)"
        opacity={0.5}
      />

      {/* Grid */}
      <BoardGrid size={size} cellSize={cellSize} offset={offset} />

      {/* Star points */}
      <StarPoints size={size} cellSize={cellSize} offset={offset} />

      {/* Hover indicator (ghost stone) */}
      {hoverIndicator}

      {/* Stones */}
      {stones}

      {/* Hint marker */}
      {hintPosition && !disabled && (
        <circle
          cx={offset + hintPosition.x * cellSize}
          cy={offset + hintPosition.y * cellSize}
          r={stoneRadius * 0.7}
          fill="none"
          stroke="rgba(201, 165, 90, 0.8)"
          strokeWidth={2}
          strokeDasharray="4 2"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </svg>
  );
}
