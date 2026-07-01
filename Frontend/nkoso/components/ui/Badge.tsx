import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Industry } from '@/types';

interface BadgeProps {
  label: string;
  industry?: Industry;
  color?: string;
  bg?: string;
}

export function Badge({ label, industry, color, bg }: BadgeProps) {
  const industryColors = industry ? Colors.industries[industry] : null;
  const textColor = color || industryColors?.text || Colors.textSecondary;
  const bgColor = bg || industryColors?.bg || Colors.borderLight;

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
