import React from 'react';
import { Stone } from '../../game/types';

interface StoneProps {
  x: number;
  y: number;
  color: Stone.BLACK | Stone.WHITE;
  radius: number;
  isLastMove?: boolean;
  isNew?: boolean;
}

export function StoneComponent({ x, y, color, radius, isLastMove, isNew }: StoneProps) {
  const isBlack = color === Stone.BLACK;
  const id = `stone-${x}-${y}`;

  return (
    <g className={isNew ? 'stone-enter' : ''}>
      {/* Shadow */}
      <circle
        cx={x + 1.2}
        cy={y + 1.5}
        r={radius}
        fill="rgba(0,0,0,0.35)"
      />
      {/* Stone body with gradient */}
      {isBlack ? (
        <>
          <defs>
            <radialGradient id={`${id}-grad`} cx="38%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#4a4a4a" />
              <stop offset="50%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
          </defs>
          <circle
            cx={x}
            cy={y}
            r={radius}
            fill={`url(#${id}-grad)`}
          />
          {/* Subtle highlight */}
          <circle
            cx={x - radius * 0.28}
            cy={y - radius * 0.28}
            r={radius * 0.22}
            fill="rgba(255,255,255,0.08)"
          />
        </>
      ) : (
        <>
          <defs>
            <radialGradient id={`${id}-grad`} cx="38%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#f0ece4" />
              <stop offset="100%" stopColor="#d0ccc0" />
            </radialGradient>
          </defs>
          <circle
            cx={x}
            cy={y}
            r={radius}
            fill={`url(#${id}-grad)`}
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={0.5}
          />
          {/* Subtle highlight */}
          <circle
            cx={x - radius * 0.25}
            cy={y - radius * 0.25}
            r={radius * 0.28}
            fill="rgba(255,255,255,0.6)"
          />
        </>
      )}
      {/* Last move marker - subtle ring */}
      {isLastMove && (
        <circle
          cx={x}
          cy={y}
          r={radius * 0.32}
          fill="none"
          stroke={isBlack ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'}
          strokeWidth={1.2}
        />
      )}
    </g>
  );
}
