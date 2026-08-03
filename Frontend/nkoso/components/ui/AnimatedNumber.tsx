import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, TextStyle } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  formatter?: (value: number) => string;
  /** Optional string prepended to the formatted number, e.g. "GH₵" */
  prefix?: string;
  /** Optional string appended to the formatted number */
  suffix?: string;
  duration?: number;
  style?: TextStyle;
}

export function AnimatedNumber({
  value,
  formatter = (current) => Math.round(current).toLocaleString(),
  prefix = '',
  suffix = '',
  duration = 420,
  style,
}: AnimatedNumberProps) {
  const animatedValue = useRef(new Animated.Value(value)).current;
  const previousValue = useRef(value);
  const formatterRef = useRef(formatter);
  const [displayValue, setDisplayValue] = useState(`${prefix}${formatter(value)}${suffix}`);

  useEffect(() => {
    formatterRef.current = formatter;
  }, [formatter]);

  useEffect(() => {
    animatedValue.setValue(previousValue.current);
    const listener = animatedValue.addListener(({ value: current }) => {
      setDisplayValue(`${prefix}${formatterRef.current(current)}${suffix}`);
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start(() => {
      previousValue.current = value;
      setDisplayValue(`${prefix}${formatterRef.current(value)}${suffix}`);
      animatedValue.removeListener(listener);
    });

    return () => animatedValue.removeListener(listener);
  }, [animatedValue, duration, value]);

  return <Text style={style}>{displayValue}</Text>;
}
