import React, { useEffect, useState, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function CustomSplashScreen() {
  const { user, isLoading } = useAuthStore();
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        })
      ]),
      Animated.delay(500)
    ]).start(() => {
      setIsAnimationDone(true);
    });
  }, []);

  useEffect(() => {
    if (isAnimationDone && !isLoading) {
      if (user) {
        if (user.role === 'OWNER') {
          router.replace('/(owner)');
        } else {
          router.replace('/(investor)');
        }
      } else {
        router.replace('/(auth)/welcome');
      }
    }
  }, [isAnimationDone, isLoading, user]);

  return (
    <View style={styles.container}>
      <Animated.Image 
        source={require('../assets/images/nkoso-app-icon.png')} 
        style={[styles.logo, { transform: [{ scale }], opacity }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  }
});
