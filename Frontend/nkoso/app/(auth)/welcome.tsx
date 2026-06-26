import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80' }}
        style={styles.bgImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(13,27,62,0.7)', '#0D1B3E']}
        style={styles.gradient}
        locations={[0, 0.4, 0.85]}
      />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Nk</Text>
          <Text style={styles.logoAccent}>ɔ</Text>
          <Text style={styles.logo}>so</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.headline}>Invest in businesses.</Text>
          <Text style={styles.headline}>Build the future.</Text>
          <Text style={styles.subtitle}>
            Ghana's first digital marketplace connecting investors with informal
            businesses — transparent, trusted, and legally backed.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>I already have an account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          Regulated investments facilitated through licensed MFI partners.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  bgImage: {
    position: 'absolute',
    width,
    height,
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    width,
    height,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 64,
    paddingBottom: 48,
    justifyContent: 'flex-end',
  },
  logoContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 64,
    left: 28,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  logoAccent: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.accent,
  },
  hero: {
    marginBottom: 40,
  },
  headline: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 14,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: Colors.accent,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  secondaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
});
