import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

interface ErrorModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isVisible,
  onClose,
  title = 'Error',
  message,
  buttonText = 'OK',
}) => {
  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
    >
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={onClose}
        style={styles.backdrop}
      />
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {title && (
            <Text style={styles.modalTitle}>{title}</Text>
          )}
          <Text style={styles.modalMessage}>{message}</Text>
          
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626', // Red color for error
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#DC2626', // Red color
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ErrorModal;