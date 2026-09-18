import React from 'react';

interface BoardGridProps {
  size: number;
  cellSize: number;
  offset: number;
}

export function BoardGrid({ size, cellSize, offset }: BoardGridProps) {
  const boardPixelSize = (size - 1) * cellSize;
  const lines: React.ReactElement[] = [];

  // Horizontal lines
  for (let i = 0; i < size; i++) {
    const y = offset + i * cellSize;
    const isBorder = i === 0 || i === size - 1;
    lines.push(
      <line
        key={`h-${i}`}
        x1={offset}
        y1={y}
        x2={offset + boardPixelSize}
        y2={y}
        stroke="#3a3020"
        strokeWidth={isBorder ? 1.0 : 0.65}
        opacity={isBorder ? 0.9 : 0.75}
      />
    );
  }

  // Vertical lines
  for (let i = 0; i < size; i++) {
    const x = offset + i * cellSize;
    const isBorder = i === 0 || i === size - 1;
    lines.push(
      <line
        key={`v-${i}`}
        x1={x}
        y1={offset}
        x2={x}
        y2={offset + boardPixelSize}
        stroke="#3a3020"
        strokeWidth={isBorder ? 1.0 : 0.65}
        opacity={isBorder ? 0.9 : 0.75}
      />
    );
  }

  return <g>{lines}</g>;
}
