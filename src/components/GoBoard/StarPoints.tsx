import React from 'react';

interface StarPointsProps {
  size: number;
  cellSize: number;
  offset: number;
}

/**
 * Returns star point positions for the given board size.
 * 9x9: center + 4 corners of the 3rd lines
 * 13x13: center + 4 corners + 4 edge points
 * 19x19: 4 corners + 4 edge points + center (traditional 9 points)
 */
function getStarPointPositions(size: number): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];

  if (size === 9) {
    // 9x9: 5 star points
    // Center: (4, 4)
    // Four at 3rd line intersections: (2,2), (2,6), (6,2), (6,6)
    positions.push({ x: 4, y: 4 });
    positions.push({ x: 2, y: 2 });
    positions.push({ x: 2, y: 6 });
    positions.push({ x: 6, y: 2 });
    positions.push({ x: 6, y: 6 });
  } else if (size === 13) {
    // 13x13: 5 star points (same pattern as 9x9 but on 13x13)
    // Center: (6, 6)
    // Four at 4th line: (3,3), (3,9), (9,3), (9,9)
    positions.push({ x: 6, y: 6 });
    positions.push({ x: 3, y: 3 });
    positions.push({ x: 3, y: 9 });
    positions.push({ x: 9, y: 3 });
    positions.push({ x: 9, y: 9 });
  } else if (size === 19) {
    // 19x19: 9 star points
    // Corners of the 4th line: (3,3), (3,9), (3,15), (9,3), (9,9), (9,15), (15,3), (15,9), (15,15)
    // Center: (9, 9)
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
  const dotRadius = Math.max(2, cellSize * 0.1);

  return (
    <g>
      {positions.map((pos, i) => (
        <circle
          key={i}
          cx={offset + pos.x * cellSize}
          cy={offset + pos.y * cellSize}
          r={dotRadius}
          fill="#333"
        />
      ))}
    </g>
  );
}
