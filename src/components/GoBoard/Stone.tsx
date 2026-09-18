import React from 'react';
import { Stone } from '../../game/types';

interface StoneProps {
  x: number;
  y: number;
  color: Stone.BLACK | Stone.WHITE;
  radius: number;
  isLastMove?: boolean;
}

export function StoneComponent({ x, y, color, radius, isLastMove }: StoneProps) {
  const isBlack = color === Stone.BLACK;

  return (
    <g>
      {/* Shadow */}
      <circle
        cx={x + 1.5}
        cy={y + 1.5}
        r={radius}
        fill="rgba(0,0,0,0.3)"
      />
      {/* Stone body */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={isBlack ? '#1a1a1a' : '#f5f5f0'}
        stroke={isBlack ? '#000' : '#999'}
        strokeWidth={0.5}
      />
      {/* Highlight for 3D effect */}
      {isBlack ? (
        <circle
          cx={x - radius * 0.25}
          cy={y - radius * 0.25}
          r={radius * 0.3}
          fill="rgba(255,255,255,0.15)"
        />
      ) : (
        <circle
          cx={x - radius * 0.25}
          cy={y - radius * 0.25}
          r={radius * 0.35}
          fill="rgba(255,255,255,0.8)"
        />
      )}
      {/* Last move marker */}
      {isLastMove && (
        <circle
          cx={x}
          cy={y}
          r={radius * 0.35}
          fill="none"
          stroke={isBlack ? '#fff' : '#000'}
          strokeWidth={1.5}
        />
      )}
    </g>
  );
}
