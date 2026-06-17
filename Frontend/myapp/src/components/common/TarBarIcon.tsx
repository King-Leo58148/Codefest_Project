import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface TarBarIconProps {
  icon: React.ReactElement; // Changed from React.ReactNode to React.ReactElement
  label?: string;
  active?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  onPress?: () => void;
  testID?: string;
  accessibilityLabel?: string;
  containerStyle?: any;
  iconStyle?: any;
  labelStyle?: any;
}

const TarBarIcon: React.FC<TarBarIconProps> = ({
  icon,
  label,
  active = false,
  activeColor = '#0066FF',
  inactiveColor = '#6C757D',
  onPress,
  testID,
  accessibilityLabel,
  containerStyle,
  iconStyle,
  labelStyle,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  // Clone the icon with type assertion
  const clonedIcon = React.isValidElement(icon)
    ? React.cloneElement(icon, {
        color: active ? activeColor : inactiveColor,
      } as any) // Type assertion to bypass type checking
    : icon;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      style={[styles.container, containerStyle]}
    >
      {icon && (
        <View style={[styles.iconContainer, iconStyle]}>
          {clonedIcon}
        </View>
      )}
      {label && (
        <Text style={[styles.label, labelStyle, { color: active ? activeColor : inactiveColor }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  iconContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    textAlign: 'center',
  },
});

export default TarBarIcon;