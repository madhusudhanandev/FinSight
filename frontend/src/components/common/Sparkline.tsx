import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  isPositive?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 120,
  height = 36,
  isPositive = true
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const strokeColor = isPositive ? '#10b981' : '#ef4444';
  const fillColor = isPositive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)';

  const firstX = 0;
  const lastX = width;
  const bottomY = height;
  const areaPoints = `${firstX},${bottomY} ${points} ${lastX},${bottomY}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polygon points={areaPoints} fill={fillColor} />
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* End point dot */}
      {data.length > 0 && (
        <circle
          cx={width}
          cy={height - ((data[data.length - 1] - min) / range) * (height - 8) - 4}
          r="3"
          fill={strokeColor}
        />
      )}
    </svg>
  );
};
