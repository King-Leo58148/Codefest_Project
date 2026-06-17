import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  style?: any;
  visible?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#0066FF',
  style,
  visible = true,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Center the spinner if no custom style is provided
  },
});

export default LoadingSpinner;