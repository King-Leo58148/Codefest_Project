import React from 'react';
import { View } from 'react-native';
import Svg, { Polyline, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showFill?: boolean;
}

export function MiniChart({
  data,
  width = 200,
  height = 60,
  color = '#22C55E',
  showFill = false,
}: MiniChartProps) {
  if (!data || data.length < 2) return <View style={{ width, height }} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 4;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const polylinePoints = points.join(' ');

  // polygon includes bottom corners for fill
  const fillPoints = [
    points[0],
    ...points,
    `${width - padding},${height - padding}`,
    `${padding},${height - padding}`,
  ].join(' ');

  return (
    <Svg width={width} height={height}>
      {showFill && (
        <Defs>
          <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.3" />
            <Stop offset="1" stopColor={color} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>
      )}
      {showFill && (
        <Polygon points={fillPoints} fill="url(#chartGradient)" />
      )}
      <Polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}
