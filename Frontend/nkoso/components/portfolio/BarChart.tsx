import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/Colors';
import { ChartPoint, formatChartCurrency } from './chartUtils';

const { width: SCREEN_W } = Dimensions.get('window');

interface BarChartProps {
  data: ChartPoint[];
  barColor?: string;
  accentColor?: string;
  height?: number;
  emptyMessage?: string;
}

/**
 * Each bar is rendered as a plain Rect with a height computed from
 * a shared Animated.Value (progress 0→1). We avoid AnimatedRect
 * to keep SVG compatibility clean across RN versions.
 */
export function BarChart({
  data,
  barColor = Colors.primary,
  accentColor = Colors.accent,
  height = 180,
  emptyMessage = 'No data for this period',
}: BarChartProps) {
  const paddingL = 8;
  const paddingR = 8;
  const paddingT = 12;
  const paddingB = 32;
  const chartW   = SCREEN_W - 40 - paddingL - paddingR;
  const chartH   = height - paddingT - paddingB;

  // Single shared animation progress (0 → 1)
  const progress = useRef(new Animated.Value(0)).current;

  // Re-animate whenever data changes
  const dataKey = data.map(d => d.value).join(',');
  useEffect(() => {
    progress.setValue(0);
    Animated.spring(progress, {
      toValue: 1,
      useNativeDriver: false,
      damping: 18,
      stiffness: 140,
    }).start();
  }, [dataKey]);

  // Display state: we redraw on every frame by listening to progress
  const [tick, setTick] = React.useState(0);
  useEffect(() => {
    const id = progress.addListener(() => setTick(t => t + 1));
    return () => progress.removeListener(id);
  }, [progress]);

  if (!data.length) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  const maxVal  = Math.max(...data.map(d => d.value), 1);
  const barW    = Math.max(8, (chartW / data.length) * 0.55);
  const gap     = chartW / data.length;
  const maxIdx  = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  const prog    = (progress as any)._value as number; // live value for SVG

  return (
    <View style={{ height, overflow: 'hidden' }}>
      {/* Y-axis labels */}
      <View style={[styles.yLabels, { top: paddingT, height: chartH }]}>
        {[1, 0.5, 0].map(frac => (
          <Text key={frac} style={styles.yLabel}>
            {formatChartCurrency(maxVal * frac)}
          </Text>
        ))}
      </View>

      <Svg width={chartW + paddingL + paddingR} height={height} style={{ marginLeft: 42 }}>
        <Defs>
          <LinearGradient id="barAccent" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={accentColor} stopOpacity="1" />
            <Stop offset="1" stopColor={accentColor} stopOpacity="0.4" />
          </LinearGradient>
          <LinearGradient id="barNorm" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={barColor} stopOpacity="0.85" />
            <Stop offset="1" stopColor={barColor} stopOpacity="0.3" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map(frac => {
          const y = paddingT + chartH * (1 - frac);
          return (
            <Line
              key={frac}
              x1={paddingL} y1={y}
              x2={chartW + paddingL} y2={y}
              stroke={Colors.borderLight}
              strokeWidth={1}
              strokeDasharray={frac === 0 ? undefined : '4,4'}
            />
          );
        })}

        {/* Bars */}
        {data.map((point, i) => {
          const isAccent  = i === maxIdx && point.value > 0;
          const x         = paddingL + i * gap + gap / 2 - barW / 2;
          const maxBarH   = chartH - 2;
          const targetH   = point.value > 0 ? Math.max(4, (point.value / maxVal) * maxBarH) : 0;
          const barH      = targetH * prog;
          const y         = paddingT + chartH - barH;

          return (
            <React.Fragment key={point.date + i}>
              <Rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={barW / 4}
                fill={isAccent ? 'url(#barAccent)' : 'url(#barNorm)'}
              />
              <SvgText
                x={x + barW / 2}
                y={height - 6}
                fontSize={9}
                fill={Colors.textMuted}
                textAnchor="middle"
                fontWeight="600"
              >
                {point.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 13, color: Colors.textMuted },
  yLabels: {
    position: 'absolute', left: 0, width: 40,
    justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 4,
  },
  yLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '500' },
});
