import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  elevated?: boolean;
  radius?: number;
  backgroundColor?: string;
  padding?: number;
  margin?: number;
  onPress?: () => void;
  borderWidth?: number;
  borderColor?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  elevated = false,
  radius = 8,
  backgroundColor = '#FFFFFF',
  padding = 16,
  margin = 0,
  onPress,
  borderWidth = 0,
  borderColor = '#CCCCCC',
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      style={[
        styles.container,
        {
          borderRadius: radius,
          backgroundColor,
          padding,
          margin,
          borderWidth,
          borderColor,
          ...(elevated && styles.elevated),
        },
      ]}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    // Base styles
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default Card;