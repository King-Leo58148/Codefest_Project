import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/store/themeStore';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  secure?: boolean;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secure,
  style,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const { colors, isDark } = useTheme();
  const isPassword = secure;

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: colors.inputBg, borderColor: colors.border },
          focused && { borderColor: isDark ? colors.accent : colors.primary },
          error ? styles.inputError : null,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={colors.textMuted}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[styles.input, { color: colors.textPrimary }, style]}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={colors.textMuted}
          {...props}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword((s) => !s)}
            style={styles.rightIconBtn}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIconBtn}
          >
            <Ionicons name={rightIcon} size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
  },
  inputError: {
    borderColor: '#DC2626',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIconBtn: {
    padding: 4,
    marginLeft: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
});
