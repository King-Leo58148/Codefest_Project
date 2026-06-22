import React, { useEffect, useRef } from 'react';
import { View, Image, Text, ActivityIndicator, StyleSheet, Animated, Easing } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter } from 'expo-router'; // ✅ Import from expo-router instead
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreenContainer = () => {
  const router = useRouter(); // ✅ Use useRouter instead of useNavigation
  const splashAnim = useRef(new Animated.Value(0));

  // Animation for logo (fade-in + scale)
  useEffect(() => {
    Animated.parallel([
      Animated.timing(splashAnim.current, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();

        const authToken = await AsyncStorage.getItem('@auth_token');
        
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        if (authToken) {
          router.replace('/(business)');
        } else {
          router.replace('/(auth)/choose-role');
        }
      } catch (error) {
        console.error('Splash screen error:', error);
        router.replace('/(auth)/choose-role');
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    checkAuthAndNavigate();
  }, [router]);

  const logoStyle = {
    ...styles.logo,
    transform: [
      { scale: splashAnim.current.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) },
    ],
    opacity: splashAnim.current,
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../../assets/logo.png')} 
        style={logoStyle} 
        resizeMode="contain"
      />
      
      <Text style={styles.appName}>InvestorMatch</Text>
      <Text style={styles.tagline}>Connecting Investors and Innovators</Text>
      
      <ActivityIndicator 
        size="large" 
        color="#fff" 
        style={styles.indicator} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 32,
  },
  indicator: {},
});

export default SplashScreenContainer;