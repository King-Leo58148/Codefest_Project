import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { FadeInView } from '@/components/ui/FadeInView';

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
  return (
    <FadeInView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : (
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={30} color={Colors.textMuted} />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      {action ? (
        <TouchableOpacity style={styles.action} onPress={onPress} activeOpacity={0.72}>
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
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  detail: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  action: {
    minHeight: 44,
    marginTop: 4,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.surface,
  },
});
