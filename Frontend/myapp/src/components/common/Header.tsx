import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface HeaderProps {
  title: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  containerStyle?: any;
  titleStyle?: any;
  leftComponentStyle?: any;
  rightComponentStyle?: any;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  leftComponent,
  rightComponent,
  containerStyle,
  titleStyle,
  leftComponentStyle,
  rightComponentStyle,
  showBackButton = true,
  onBackPress,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {showBackButton || leftComponent ? (
        <View style={[styles.leftContainer, leftComponentStyle]}>
          {showBackButton && !leftComponent ? (
            <TouchableOpacity onPress={onBackPress}>
              <Image
                source={require('../../../assets/icons/back.png')} // Placeholder - adjust path as needed
                style={styles.backIcon}
              />
            </TouchableOpacity>
          ) : (
            leftComponent
          )}
        </View>
      ) : null}
      
      <View style={[styles.titleContainer, titleStyle]}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
      </View>
      
      {rightComponent ? (
        <View style={[styles.rightContainer, rightComponentStyle]}>
          {rightComponent}
        </View>
      ) : (
        <View style={[styles.rightContainer, rightComponentStyle]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    height: 56, // Standard header height
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#666666',
  },
});

export default Header;