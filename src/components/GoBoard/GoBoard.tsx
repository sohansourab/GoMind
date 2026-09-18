import React, { useState, useCallback, useMemo, useRef } from 'react';
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
}

export function GoBoard({
  board,
  size,
  onIntersectionClick,
  lastMovePosition,
  currentPlayer,
  disabled = false,
}: GoBoardProps) {
  const [hoverPos, setHoverPos] = useState<Position | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate dimensions
  const padding = 20;
  const totalSize = 500; // SVG viewBox size
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

    // Convert to SVG coordinates
    const scaleX = totalSize / rect.width;
    const scaleY = totalSize / rect.height;
    const svgX = (clientX - rect.left) * scaleX;
    const svgY = (clientY - rect.top) * scaleY;

    // Convert to board position
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
    // Use the last known position from touch move
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

  const stoneRadius = cellSize * 0.45;

  // Render stones
  const stones = useMemo(() => {
    const elements: React.ReactElement[] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const stone = board[y * size + x];
        if (stone === Stone.EMPTY) continue;

        const isLast = lastMovePosition !== null &&
          positionsEqual(lastMovePosition, { x, y });

        elements.push(
          <StoneComponent
            key={`${x}-${y}`}
            x={offset + x * cellSize}
            y={offset + y * cellSize}
            color={stone}
            radius={stoneRadius}
            isLastMove={isLast}
          />
        );
      }
    }
    return elements;
  }, [board, size, cellSize, offset, stoneRadius, lastMovePosition]);

  // Hover indicator
  const hoverIndicator = useMemo(() => {
    if (!hoverPos || disabled) return null;
    const idx = hoverPos.y * size + hoverPos.x;
    if (board[idx] !== Stone.EMPTY) return null;

    return (
      <circle
        cx={offset + hoverPos.x * cellSize}
        cy={offset + hoverPos.y * cellSize}
        r={stoneRadius}
        fill={currentPlayer === Stone.BLACK ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)'}
        stroke={currentPlayer === Stone.BLACK ? 'rgba(0,0,0,0.5)' : 'rgba(150,150,150,0.5)'}
        strokeWidth={1}
        style={{ pointerEvents: 'none' }}
      />
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
    >
      {/* Board background - wood texture */}
      <rect
        x={0}
        y={0}
        width={totalSize}
        height={totalSize}
        rx={8}
        fill="#dcb35c"
      />
      {/* Subtle wood grain overlay */}
      <rect
        x={0}
        y={0}
        width={totalSize}
        height={totalSize}
        rx={8}
        fill="url(#woodGrain)"
        opacity={0.1}
      />

      {/* Wood grain pattern */}
      <defs>
        <pattern id="woodGrain" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <line x1="0" y1="10" x2="100" y2="12" stroke="#a08030" strokeWidth="0.5" opacity="0.3" />
          <line x1="0" y1="30" x2="100" y2="28" stroke="#a08030" strokeWidth="0.3" opacity="0.2" />
          <line x1="0" y1="50" x2="100" y2="52" stroke="#a08030" strokeWidth="0.5" opacity="0.3" />
          <line x1="0" y1="70" x2="100" y2="68" stroke="#a08030" strokeWidth="0.3" opacity="0.2" />
          <line x1="0" y1="90" x2="100" y2="92" stroke="#a08030" strokeWidth="0.5" opacity="0.3" />
        </pattern>
      </defs>

      {/* Grid */}
      <BoardGrid size={size} cellSize={cellSize} offset={offset} />

      {/* Star points */}
      <StarPoints size={size} cellSize={cellSize} offset={offset} />

      {/* Hover indicator */}
      {hoverIndicator}

      {/* Stones */}
      {stones}
    </svg>
  );
}
