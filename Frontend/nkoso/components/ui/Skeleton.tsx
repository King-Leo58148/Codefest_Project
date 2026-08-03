import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.9],
  });

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: Colors.borderLight, opacity },
        style,
      ]}
    />
  );
}

// Skeleton card for pitch list loading
export function PitchCardSkeleton() {
  return (
    <View style={skStyles.card}>
      <Skeleton width="100%" height={180} borderRadius={0} />
      <View style={skStyles.body}>
        <Skeleton width={72} height={22} borderRadius={11} />
        <Skeleton width="70%" height={20} borderRadius={6} style={{ marginTop: 8 }} />
        <Skeleton width="90%" height={14} borderRadius={4} style={{ marginTop: 6 }} />
        <Skeleton width="60%" height={14} borderRadius={4} style={{ marginTop: 4 }} />
        <View style={skStyles.footer}>
          <Skeleton width={80} height={28} borderRadius={6} />
          <Skeleton width={100} height={36} borderRadius={18} />
        </View>
      </View>
    </View>
  );
}

// Skeleton for notification items
export function NotificationSkeleton() {
  return (
    <View style={skStyles.notifCard}>
      <Skeleton width={44} height={44} borderRadius={22} />
      <View style={{ flex: 1, gap: 6 }}>
        <Skeleton width="60%" height={14} borderRadius={4} />
        <Skeleton width="90%" height={12} borderRadius={4} />
      </View>
    </View>
  );
}

const skStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  body: {
    padding: 16,
    gap: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  notifCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
});
