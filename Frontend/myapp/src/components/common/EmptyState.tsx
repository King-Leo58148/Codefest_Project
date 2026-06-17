import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';

interface EmptyStateProps {
  message: string;
  illustration?: React.ReactNode;
  containerStyle?: any;
  messageStyle?: any;
  illustrationStyle?: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  illustration,
  containerStyle,
  messageStyle,
  illustrationStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {illustration && (
        <View style={[styles.illustrationContainer, illustrationStyle]}>
          {illustration}
        </View>
      )}
      <Text style={[styles.message, messageStyle]}>{message}</Text>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 20,
  },
  illustrationContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 16,
    maxWidth: width * 0.8,
  },
});

export default EmptyState;