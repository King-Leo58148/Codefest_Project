import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';

interface ConfirmModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  loading?: boolean;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isVisible,
  onCancel,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  loading = false,
  confirmButtonColor = '#0066FF',
  cancelButtonColor = '#6C757D',
}) => {
  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
    >
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={onCancel}
        style={styles.backdrop}
      />
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {title && (
            <Text style={styles.modalTitle}>{title}</Text>
          )}
          <Text style={styles.modalMessage}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onCancel}
              disabled={loading}
              style={[
                styles.cancelButton,
                !loading && { backgroundColor: cancelButtonColor },
                loading && styles.buttonDisabled
              ]}
            >
              <Text style={[
                styles.buttonText,
                !loading && { color: '#FFFFFF' },
                loading && styles.buttonTextDisabled
              ]}>
                {loading ? 'Cancelling...' : cancelButtonText}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onConfirm}
              disabled={loading}
              style={[
                styles.confirmButton,
                !loading && { backgroundColor: confirmButtonColor },
                loading && styles.buttonDisabled
              ]}
            >
              <Text style={[
                styles.buttonText,
                !loading && { color: '#FFFFFF' },
                loading && styles.buttonTextDisabled
              ]}>
                {loading ? 'Confirming...' : confirmButtonText}
              </Text>
            </TouchableOpacity>
          </View>
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
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 12,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextDisabled: {
    color: '#CCCCCC',
  },
});

export default ConfirmModal;