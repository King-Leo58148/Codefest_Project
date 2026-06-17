import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Pressable, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  className = '',
}) => {
  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.container,
        styles[variant],
        className && styles.custom,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="white" style={styles.loading} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconContainer}>{icon}</View>
          )}
          <Text style={[
            styles.text,
            variant === 'outline' && styles.textOutline,
            disabled && styles.textDisabled,
          ]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconContainer}>{icon}</View>
          )}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: '#0066FF',
  },
  secondary: {
    backgroundColor: '#6C757D',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0066FF',
  },
  custom: {
    // Additional custom styles can be added here
  },
  text: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  textOutline: {
    color: '#0066FF',
  },
  textDisabled: {
    color: '#CCCCCC',
  },
  iconContainer: {
    marginHorizontal: 8,
  },
  loading: {
    position: 'absolute',
  },
});

export default Button;