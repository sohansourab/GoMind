import React from 'react';

interface StarPointsProps {
  size: number;
  cellSize: number;
  offset: number;
}

function getStarPointPositions(size: number): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];

  if (size === 9) {
    positions.push({ x: 4, y: 4 });
    positions.push({ x: 2, y: 2 });
    positions.push({ x: 2, y: 6 });
    positions.push({ x: 6, y: 2 });
    positions.push({ x: 6, y: 6 });
  } else if (size === 13) {
    positions.push({ x: 6, y: 6 });
    positions.push({ x: 3, y: 3 });
    positions.push({ x: 3, y: 9 });
    positions.push({ x: 9, y: 3 });
    positions.push({ x: 9, y: 9 });
  } else if (size === 19) {
    positions.push({ x: 3, y: 3 });
    positions.push({ x: 3, y: 9 });
    positions.push({ x: 3, y: 15 });
    positions.push({ x: 9, y: 3 });
    positions.push({ x: 9, y: 9 });
    positions.push({ x: 9, y: 15 });
    positions.push({ x: 15, y: 3 });
    positions.push({ x: 15, y: 9 });
    positions.push({ x: 15, y: 15 });
  }

  return positions;
}

export function StarPoints({ size, cellSize, offset }: StarPointsProps) {
  const positions = getStarPointPositions(size);
  const dotRadius = Math.max(2.2, cellSize * 0.1);

  return (
    <g>
      {positions.map((pos, i) => (
        <circle
          key={i}
          cx={offset + pos.x * cellSize}
          cy={offset + pos.y * cellSize}
          r={dotRadius}
          fill="#3a3020"
          opacity={0.85}
        />
      ))}
    </g>
  );
}
