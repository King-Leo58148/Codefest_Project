import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ProgressBarProps {
  percent: number;
  showLabel?: boolean;
  height?: number;
  color?: string;
}

export function ProgressBar({
  percent,
  showLabel = false,
  height = 6,
  color = Colors.accent,
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(percent, 0), 100);

  return (
    <View>
      {showLabel && (
        <Text style={styles.label}>{clamped.toFixed(0)}% funded</Text>
      )}
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            { width: `${clamped}%`, height, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent,
    marginBottom: 4,
  },
  track: {
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: 4,
  },
});
