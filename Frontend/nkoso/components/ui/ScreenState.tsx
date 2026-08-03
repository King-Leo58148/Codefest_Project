import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FadeInView } from '@/components/ui/FadeInView';
import { useTheme } from '@/store/themeStore';

interface ScreenStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  detail?: string;
  action?: string;
  loading?: boolean;
  onPress?: () => void;
}

export function ScreenState({
  icon = 'information-circle-outline',
  title,
  detail,
  action,
  loading = false,
  onPress,
}: ScreenStateProps) {
  const { colors, isDark } = useTheme();

  return (
    <FadeInView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={isDark ? colors.accent : colors.primary} />
      ) : (
        <View style={[styles.iconBox, { backgroundColor: colors.surfaceSubtle }]}>
          <Ionicons name={icon} size={30} color={colors.textMuted} />
        </View>
      )}
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {detail ? <Text style={[styles.detail, { color: colors.textSecondary }]}>{detail}</Text> : null}
      {action ? (
        <TouchableOpacity
          style={[styles.action, { backgroundColor: isDark ? colors.accent : colors.primary }]}
          onPress={onPress}
          activeOpacity={0.72}
        >
          <Text style={styles.actionText}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
    gap: 10,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  detail: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  action: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
