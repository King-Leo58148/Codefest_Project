import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Industry } from '@/types';

interface BadgeProps {
  label: string;
  industry?: Industry;
  color?: string;
  bg?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, industry, color, bg, size = 'md' }: BadgeProps) {
  const industryColors = industry ? Colors.industries[industry] : null;
  const textColor = color || industryColors?.text || Colors.textSecondary;
  const bgColor = bg || industryColors?.bg || Colors.borderLight;

  return (
    <View style={[
      styles.badge,
      size === 'sm' && styles.badgeSm,
      { backgroundColor: bgColor, borderColor: textColor + '30' },
    ]}>
      <Text style={[styles.text, size === 'sm' && styles.textSm, { color: textColor }]}>
        {label}
      </Text>
    </View>
  );
}

interface StatusBadgeProps {
  label: string;
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

const statusConfig = {
  success: { color: '#16A34A', bg: '#F0FDF4', dot: '#22C55E' },
  warning: { color: '#D97706', bg: '#FFFBEB', dot: '#F59E0B' },
  error: { color: '#DC2626', bg: '#FEF2F2', dot: '#EF4444' },
  info: { color: '#2563EB', bg: '#EFF6FF', dot: '#3B82F6' },
  neutral: { color: Colors.textSecondary, bg: Colors.borderLight, dot: Colors.textMuted },
};

export function StatusBadge({ label, status }: StatusBadgeProps) {
  const cfg = statusConfig[status];
  return (
    <View style={[styles.badge, styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.dot + '40' }]}>
      <View style={[styles.dot, { backgroundColor: cfg.dot }]} />
      <Text style={[styles.text, { color: cfg.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  textSm: {
    fontSize: 10,
  },
});
