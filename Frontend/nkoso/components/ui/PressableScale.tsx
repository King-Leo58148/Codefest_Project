import React, { useRef } from 'react';
import { Animated, ViewStyle, Pressable, GestureResponderEvent } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: (e: GestureResponderEvent) => void;
  scale?: number;
  style?: ViewStyle;
  disabled?: boolean;
  activeOpacity?: number;
}

/**
 * Wraps any component to give a spring-back scale animation on touch.
 */
export function PressableScale({
  children,
  onPress,
  onLongPress,
  scale = 0.965,
  style,
  disabled = false,
  activeOpacity = 0.85,
}: PressableScaleProps) {
  const animScale = useRef(new Animated.Value(1)).current;
  const animOpacity = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.parallel([
      Animated.spring(animScale, {
        toValue: scale,
        useNativeDriver: true,
        damping: 20,
        stiffness: 300,
      }),
      Animated.timing(animOpacity, {
        toValue: activeOpacity,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const pressOut = () => {
    Animated.parallel([
      Animated.spring(animScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 16,
        stiffness: 250,
      }),
      Animated.timing(animOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <AnimatedPressable
      style={[
        style,
        {
          transform: [{ scale: animScale }],
          opacity: animOpacity,
        },
      ]}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
    >
      {children}
    </AnimatedPressable>
  );
}
