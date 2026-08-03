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
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { FadeInView, SlideInView } from '@/components/ui/FadeInView';
import { PressableScale } from '@/components/ui/PressableScale';

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
        <SlideInView from="left" style={styles.logoContainer}>
          <Text style={styles.logo}>Nk</Text>
          <Text style={styles.logoAccent}>ɔ</Text>
          <Text style={styles.logo}>so</Text>
        </SlideInView>

        <FadeInView delay={100} style={styles.hero}>
          <Text style={styles.headline}>Invest in businesses.</Text>
          <Text style={styles.headline}>Build the future.</Text>
          <Text style={styles.subtitle}>
            Ghana's first digital marketplace connecting investors with informal
            businesses — transparent, trusted, and legally backed.
          </Text>

          {/* Trust badges */}
          <View style={styles.trustBadges}>
            <View style={styles.trustBadgeItem}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.accent} />
              <Text style={styles.trustBadgeText}>MFI Partner Regulated</Text>
            </View>
            <View style={styles.trustDot} />
            <View style={styles.trustBadgeItem}>
              <Ionicons name="lock-closed" size={14} color={Colors.accent} />
              <Text style={styles.trustBadgeText}>Ghana Card Verified</Text>
            </View>
          </View>
        </FadeInView>

        <FadeInView delay={200} style={styles.actions}>
          <PressableScale onPress={() => router.push('/(auth)/register')}>
            <View style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </View>
          </PressableScale>

          <PressableScale onPress={() => router.push('/(auth)/login')}>
            <View style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>I already have an account</Text>
            </View>
          </PressableScale>
        </FadeInView>

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
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  logoAccent: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: -0.5,
  },
  hero: {
    marginBottom: 32,
  },
  headline: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 14,
    lineHeight: 22,
  },
  trustBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  trustBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustBadgeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  trustDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  actions: {
    gap: 12,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: Colors.accent,
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
