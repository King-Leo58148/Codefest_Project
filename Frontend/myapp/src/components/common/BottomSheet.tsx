import React from 'react';
import { Modal, View, TouchableWithoutFeedback, StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isVisible, onClose, children }) => {
  return (
    <Modal
      transparent
      visible={isVisible}
      onRequestClose={onClose}
      animationType="slide"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.bottomSheet}>
        {/* Drag handle */}
        <View style={styles.handle} />
        {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.6, // 60% of screen height
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 2.5,
  },
});

export default BottomSheet;