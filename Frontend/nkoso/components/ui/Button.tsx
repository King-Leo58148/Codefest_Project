import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'default' | 'sm' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = true,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const animScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animScale, {
      toValue: 0.965,
      useNativeDriver: true,
      damping: 20,
      stiffness: 300,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animScale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 16,
      stiffness: 250,
    }).start();
  };

  const iconColor =
    variant === 'primary' || variant === 'secondary' || variant === 'danger'
      ? '#fff'
      : variant === 'outline'
      ? Colors.primary
      : Colors.primary;

  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <Animated.View style={[fullWidth && styles.fullWidth, { transform: [{ scale: animScale }] }]}>
      <TouchableOpacity
        style={[
          styles.base,
          size === 'sm' && styles.sizeSm,
          size === 'lg' && styles.sizeLg,
          fullWidth && styles.fullWidth,
          variant === 'primary' && styles.primary,
          variant === 'secondary' && styles.secondary,
          variant === 'outline' && styles.outline,
          variant === 'ghost' && styles.ghost,
          variant === 'danger' && styles.danger,
          isDisabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={1}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' || variant === 'secondary' || variant === 'danger' ? '#fff' : Colors.primary}
            size="small"
          />
        ) : (
          <View style={styles.inner}>
            {leftIcon && (
              <Ionicons name={leftIcon} size={iconSize} color={iconColor} style={styles.leftIcon} />
            )}
            <Text
              style={[
                styles.text,
                size === 'sm' && styles.textSm,
                size === 'lg' && styles.textLg,
                variant === 'primary' && styles.textPrimary,
                variant === 'secondary' && styles.textSecondary,
                variant === 'outline' && styles.textOutline,
                variant === 'ghost' && styles.textGhost,
                variant === 'danger' && styles.textDanger,
                textStyle,
              ]}
            >
              {title}
            </Text>
            {rightIcon && (
              <Ionicons name={rightIcon} size={iconSize} color={iconColor} style={styles.rightIcon} />
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  sizeSm: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  sizeLg: {
    minHeight: 58,
    paddingHorizontal: 28,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.accent,
  },
  danger: {
    backgroundColor: Colors.accentRed,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  disabled: {
    opacity: 0.48,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  leftIcon: {},
  rightIcon: {},
  text: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  textSm: {
    fontSize: 13,
    lineHeight: 18,
  },
  textLg: {
    fontSize: 16,
    lineHeight: 22,
  },
  textPrimary: {
    color: '#fff',
  },
  textSecondary: {
    color: '#fff',
  },
  textDanger: {
    color: '#fff',
  },
  textOutline: {
    color: Colors.primary,
  },
  textGhost: {
    color: Colors.primary,
  },
});
