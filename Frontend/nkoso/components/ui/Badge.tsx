import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Industry } from '@/types';
import { useTheme } from '@/store/themeStore';

interface BadgeProps {
  label: string;
  industry?: Industry;
  color?: string;
  bg?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function getIndustryIconName(industry?: string): keyof typeof Ionicons.glyphMap {
  if (!industry) return 'briefcase-outline';
  const ind = industry.toLowerCase();
  if (ind.includes('tech')) return 'hardware-chip-outline';
  if (ind.includes('food') || ind.includes('bev')) return 'restaurant-outline';
  if (ind.includes('health') || ind.includes('med')) return 'medical-outline';
  if (ind.includes('sustain') || ind.includes('eco')) return 'leaf-outline';
  if (ind.includes('fit') || ind.includes('sport')) return 'barbell-outline';
  if (ind.includes('agri') || ind.includes('farm')) return 'nutrition-outline';
  if (ind.includes('retail') || ind.includes('shop') || ind.includes('store')) return 'storefront-outline';
  if (ind.includes('trans') || ind.includes('auto') || ind.includes('car')) return 'car-outline';
  if (ind.includes('fashion') || ind.includes('cloth') || ind.includes('apparel')) return 'shirt-outline';
  if (ind.includes('beauty') || ind.includes('cosmetic')) return 'sparkles-outline';
  if (ind.includes('construct') || ind.includes('build')) return 'construct-outline';
  if (ind.includes('edu') || ind.includes('school')) return 'school-outline';
  if (ind.includes('entertain') || ind.includes('media')) return 'film-outline';
  if (ind.includes('hospit') || ind.includes('hotel')) return 'bed-outline';
  if (ind.includes('manufactur') || ind.includes('factory')) return 'cog-outline';
  return 'briefcase-outline';
}

export function Badge({ label, industry, color, bg, size = 'md', showIcon = true }: BadgeProps) {
  const { isDark, colors } = useTheme();
  const industryColors = industry
    ? isDark
      ? Colors.darkIndustries[industry] || Colors.industries[industry]
      : Colors.industries[industry]
    : null;

  const textColor = color || industryColors?.text || colors.textSecondary;
  const bgColor = bg || industryColors?.bg || colors.surfaceSubtle;
  const iconName = industry ? getIndustryIconName(industry) : null;
  const iconSize = size === 'sm' ? 11 : size === 'lg' ? 15 : 13;

  return (
    <View style={[
      styles.badge,
      size === 'sm' && styles.badgeSm,
      size === 'lg' && styles.badgeLg,
      { backgroundColor: bgColor, borderColor: textColor + '35' },
    ]}>
      {showIcon && iconName && (
        <Ionicons name={iconName} size={iconSize} color={textColor} />
      )}
      <Text style={[
        styles.text,
        size === 'sm' && styles.textSm,
        size === 'lg' && styles.textLg,
        { color: textColor },
      ]}>
        {label}
      </Text>
    </View>
  );
}

interface StatusBadgeProps {
  label: string;
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export function StatusBadge({ label, status }: StatusBadgeProps) {
  const { isDark, colors } = useTheme();

  const statusConfig = {
    success: { color: '#16A34A', bg: isDark ? '#052E16' : '#F0FDF4', dot: '#22C55E' },
    warning: { color: isDark ? '#FBBF24' : '#D97706', bg: isDark ? '#451A03' : '#FFFBEB', dot: '#F59E0B' },
    error: { color: isDark ? '#F87171' : '#DC2626', bg: isDark ? '#450A0A' : '#FEF2F2', dot: '#EF4444' },
    info: { color: isDark ? '#60A5FA' : '#2563EB', bg: isDark ? '#172554' : '#EFF6FF', dot: '#3B82F6' },
    neutral: { color: colors.textSecondary, bg: colors.surfaceSubtle, dot: colors.textMuted },
  };

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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  badgeLg: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  textSm: {
    fontSize: 10,
    fontWeight: '700',
  },
  textLg: {
    fontSize: 12,
    fontWeight: '800',
  },
});
