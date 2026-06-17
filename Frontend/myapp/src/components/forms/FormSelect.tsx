import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';

interface FormSelectProps {
  label: string;
  placeholder?: string;
  value?: string | number;
  options: Array<{ label: string; value: string | number }>;
  onValueChange?: (value: string | number) => void;
  disabled?: boolean;
  containerStyle?: any;
  labelStyle?: any;
  selectContainerStyle?: any;
  selectTextStyle?: any;
  placeholderTextColor?: string;
  modalStyle?: any;
  optionContainerStyle?: any;
  optionTextStyle?: any;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  placeholder,
  value,
  options,
  onValueChange,
  disabled = false,
  containerStyle,
  labelStyle,
  selectContainerStyle,
  selectTextStyle,
  placeholderTextColor,
  modalStyle,
  optionContainerStyle,
  optionTextStyle,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [localValue, setLocalValue] = useState<string | number>(value || '');

  const handleValueChange = (newValue: string | number) => {
    setLocalValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
    setModalVisible(false);
  };

  const renderPlaceholder = () => {
    const selectedOption = options.find(
      (option) => option.value === localValue
    );
    
    if (selectedOption) {
      return selectedOption.label;
    }
    
    return placeholder || 'Select an option';
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        style={[styles.selectContainer, selectContainerStyle, disabled && styles.disabledContainer]}
      >
        <Text 
          style={[
            styles.selectText, 
            selectTextStyle, 
            disabled && styles.disabledText,
            localValue ? {} : { color: placeholderTextColor || '#C7CBD4' }
          ]}
        >
          {renderPlaceholder()}
        </Text>
        {/* Dropdown arrow */}
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        style={modalStyle}
      >
        <TouchableOpacity 
          activeOpacity={0.5}
          onPress={() => setModalVisible(false)}
          style={styles.backdrop}
        />
        <View style={[styles.modalContent, modalStyle]}>
          <FlatList
            data={options}
            keyExtractor={(item) => String(item.value)}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleValueChange(item.value)}
                style={[
                  styles.optionContainer,
                  optionContainerStyle,
                  item.value === localValue && styles.selectedOptionContainer
                ]}
              >
                <Text 
                  style={[
                    styles.optionText,
                    optionTextStyle,
                    item.value === localValue && styles.selectedOptionText
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No options available</Text>
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    color: '#A3A8B3',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  selectContainer: {
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    paddingHorizontal: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disabledContainer: {
    opacity: 0.5,
  },
  selectText: {
    color: '#111827',
    fontSize: 14,
    flexShrink: 1,
  },
  disabledText: {
    color: '#C7CBD4',
  },
  dropdownArrow: {
    color: '#666666',
    fontSize: 18,
  },
  backdrop: {
    ...StyleSheet.absoluteFill, // Changed from absoluteFillObject
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 8,
    maxHeight: '60%',
  },
  optionContainer: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F2F5',
  },
  selectedOptionContainer: {
    backgroundColor: '#F0F7FF',
  },
  optionText: {
    color: '#111827',
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#0066FF',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#A3A8B3',
    fontSize: 14,
  },
});

export default FormSelect;