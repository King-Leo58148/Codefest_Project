import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  PanResponder, 
  Animated,
  Dimensions 
} from 'react-native';

interface FormSliderProps {
  label: string;
  value: number;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  thumbTintColor?: string;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  containerStyle?: any;
  labelStyle?: any;
  valueLabelStyle?: any;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
}

const FormSlider: React.FC<FormSliderProps> = ({
  label,
  value,
  minimumValue = 0,
  maximumValue = 1,
  step = 0.1,
  onValueChange,
  thumbTintColor = '#0066FF',
  minimumTrackTintColor = '#0066FF',
  maximumTrackTintColor = '#CCCCCC',
  containerStyle,
  labelStyle,
  valueLabelStyle,
  showValue = true,
  valueFormatter,
}) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const pan = useRef(new Animated.Value(0)).current;
  const [currentValue, setCurrentValue] = useState(value);

  const formattedValue = valueFormatter ? valueFormatter(value) : value.toFixed(2);

  const getValueFromPosition = (position: number) => {
    const percentage = position / sliderWidth;
    const range = maximumValue - minimumValue;
    let newValue = minimumValue + (percentage * range);
    
    // Apply step
    if (step > 0) {
      newValue = Math.round(newValue / step) * step;
    }
    
    return Math.min(Math.max(newValue, minimumValue), maximumValue);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX } = evt.nativeEvent;
        const newValue = getValueFromPosition(locationX);
        setCurrentValue(newValue);
        onValueChange?.(newValue);
      },
      onPanResponderMove: (evt) => {
        const { locationX } = evt.nativeEvent;
        const newValue = getValueFromPosition(locationX);
        setCurrentValue(newValue);
        onValueChange?.(newValue);
      },
    })
  ).current;

  const getPositionFromValue = (value: number) => {
    const range = maximumValue - minimumValue;
    const percentage = (value - minimumValue) / range;
    return percentage * sliderWidth;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        {showValue && (
          <Text style={[styles.valueLabel, valueLabelStyle]}>
            {formattedValue}
          </Text>
        )}
      </View>
      
      <View 
        style={styles.trackContainer}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setSliderWidth(width);
        }}
      >
        <View 
          style={[styles.track, { backgroundColor: maximumTrackTintColor }]}
          {...panResponder.panHandlers}
        >
          <View 
            style={[
              styles.trackFill, 
              { 
                backgroundColor: minimumTrackTintColor,
                width: sliderWidth > 0 ? getPositionFromValue(value) : 0
              }
            ]}
          />
          <View 
            style={[
              styles.thumb, 
              { 
                backgroundColor: thumbTintColor,
                left: sliderWidth > 0 ? getPositionFromValue(value) - 10 : 0
              }
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: '#A3A8B3',
    fontSize: 16,
    fontWeight: '600',
  },
  valueLabel: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
  },
  trackContainer: {
    paddingVertical: 10,
  },
  track: {
    height: 4,
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    top: -8,
  },
});

export default FormSlider;