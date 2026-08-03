import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export type ChartScope = 'weekly' | 'monthly' | 'yearly';

interface ChartScopeToggleProps {
  value: ChartScope;
  onChange: (scope: ChartScope) => void;
}

const SCOPES: { key: ChartScope; label: string }[] = [
  { key: 'weekly', label: 'Week' },
  { key: 'monthly', label: 'Month' },
  { key: 'yearly', label: 'Year' },
];

export function ChartScopeToggle({ value, onChange }: ChartScopeToggleProps) {
  const scaleRefs = useRef<Record<ChartScope, Animated.Value>>({
    weekly: new Animated.Value(1),
    monthly: new Animated.Value(1),
    yearly: new Animated.Value(1),
  }).current;

  const handlePress = (key: ChartScope) => {
    if (key === value) return;
    Animated.sequence([
      Animated.timing(scaleRefs[key], { toValue: 0.9, duration: 60, useNativeDriver: true }),
      Animated.spring(scaleRefs[key], { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 300 }),
    ]).start();
    onChange(key);
  };

  return (
    <View style={styles.container}>
      {SCOPES.map(({ key, label }) => {
        const isActive = value === key;
        return (
          <Animated.View key={key} style={{ transform: [{ scale: scaleRefs[key] }] }}>
            <TouchableOpacity
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => handlePress(key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{label}</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.borderLight,
    borderRadius: 20,
    padding: 3,
    alignSelf: 'flex-start',
    gap: 2,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 17,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: '#fff',
  },
});
