import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Line,
  Text as SvgText,
} from 'react-native-svg';
import { Colors } from '@/constants/Colors';
import { ChartPoint, formatChartCurrency } from './chartUtils';

const { width: SCREEN_W } = Dimensions.get('window');

interface TimelineChartProps {
  data: ChartPoint[];
  lineColor?: string;
  height?: number;
  emptyMessage?: string;
}

export function TimelineChart({
  data,
  lineColor = Colors.accent,
  height = 180,
  emptyMessage = 'No portfolio history yet',
}: TimelineChartProps) {
  const paddingL = 8;
  const paddingR = 8;
  const paddingT = 16;
  const paddingB = 28;
  const chartW   = SCREEN_W - 40 - paddingL - paddingR;
  const chartH   = height - paddingT - paddingB;

  // Animate the path drawing in via strokeDashoffset
  const drawProgress = useRef(new Animated.Value(0)).current;
  const dataKey = data.map(d => d.value).join(',');

  useEffect(() => {
    drawProgress.setValue(0);
    Animated.timing(drawProgress, {
      toValue: 1,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [dataKey]);

  if (!data.length) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const minVal = Math.min(...data.map(d => d.value), 0);
  const range  = maxVal - minVal || 1;

  const toX = (i: number) =>
    paddingL + (i / Math.max(data.length - 1, 1)) * chartW;

  const toY = (v: number) =>
    paddingT + chartH - ((v - minVal) / range) * chartH;

  // Build SVG path strings
  const linePath = data
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(pt.value).toFixed(1)}`)
    .join(' ');

  const firstX = toX(0);
  const lastX  = toX(data.length - 1);
  const bottomY = paddingT + chartH;

  const fillPath = `${linePath} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;

  // Last point (current value) highlight dot
  const lastPt = data[data.length - 1];
  const dotX   = toX(data.length - 1);
  const dotY   = toY(lastPt.value);

  // Approximate path length for stroke-dashoffset trick (no native DOM here)
  // We use a simulated progress via Animated opacity on the area fill
  const areaOpacity = drawProgress.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 0, 0.2],
  });

  // Label count: show at most 5 evenly-spaced labels
  const maxLabels = Math.min(5, data.length);
  const labelIndices = Array.from({ length: maxLabels }, (_, i) =>
    Math.round((i / (maxLabels - 1)) * (data.length - 1))
  );

  return (
    <View style={{ height, overflow: 'hidden' }}>
      {/* Y-axis labels */}
      <View style={[styles.yLabels, { top: paddingT, height: chartH }]}>
        {[1, 0.5, 0].map(frac => (
          <Text key={frac} style={styles.yLabel}>
            {formatChartCurrency(minVal + (maxVal - minVal) * frac)}
          </Text>
        ))}
      </View>

      <Svg
        width={chartW + paddingL + paddingR}
        height={height}
        style={{ marginLeft: 42 }}
      >
        <Defs>
          <LinearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={lineColor} stopOpacity="0.25" />
            <Stop offset="1" stopColor={lineColor} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Horizontal grid */}
        {[0, 0.5, 1].map(frac => {
          const y = paddingT + chartH * (1 - frac);
          return (
            <Line
              key={frac}
              x1={paddingL}
              y1={y}
              x2={chartW + paddingL}
              y2={y}
              stroke={Colors.borderLight}
              strokeWidth={1}
              strokeDasharray={frac === 0 ? undefined : '4,4'}
            />
          );
        })}

        {/* Area fill */}
        <Path d={fillPath} fill="url(#timelineGrad)" />

        {/* Line */}
        <Path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* X-axis labels */}
        {labelIndices.map(i => (
          <SvgText
            key={i}
            x={toX(i)}
            y={height - 4}
            fontSize={9}
            fill={Colors.textMuted}
            textAnchor="middle"
            fontWeight="600"
          >
            {data[i].label}
          </SvgText>
        ))}

        {/* Current value dot */}
        <Circle cx={dotX} cy={dotY} r={5} fill={lineColor} />
        <Circle cx={dotX} cy={dotY} r={9} fill={lineColor} opacity={0.2} />
      </Svg>

      {/* Current value callout */}
      <View style={styles.callout}>
        <Text style={styles.calloutLabel}>Current</Text>
        <Text style={[styles.calloutValue, { color: lineColor }]}>
          {formatChartCurrency(lastPt.value)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  yLabels: {
    position: 'absolute',
    left: 0,
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 4,
  },
  yLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  callout: {
    position: 'absolute',
    top: 4,
    right: 0,
    alignItems: 'flex-end',
  },
  calloutLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  calloutValue: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});
