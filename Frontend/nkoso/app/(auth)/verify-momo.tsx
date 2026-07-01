import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { verifyMomo } from '@/services/api';

export default function VerifyMomoScreen() {
  const [momoNumber, setMomoNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, setUser } = useAuthStore();

  const handleVerify = async () => {
    const cleaned = momoNumber.replace(/\D/g, '');
    if (!cleaned || cleaned.length < 10) {
      setError('Please enter a valid MTN MoMo number (10 digits).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const verified = await verifyMomo(cleaned);
      if (verified && user) {
        setUser({ ...user, momoVerified: true, momoNumber: cleaned });
        Alert.alert(
          'Verification Complete!',
          'Your identity and MoMo account have been verified. Welcome to Nkɔso!',
          [
            {
              text: 'Continue',
              onPress: () => {
                if (user.role === 'OWNER') {
                  router.replace('/(owner)');
                } else {
                  router.replace('/(investor)');
                }
              },
            },
          ]
        );
      }
    } catch {
      setError('MoMo verification failed. Please check your number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (user?.role === 'OWNER') {
      router.replace('/(owner)');
    } else {
      router.replace('/(investor)');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.stepRow}>
        <View style={[styles.stepDot, styles.stepDone]}>
          <Ionicons name="checkmark" size={6} color="#fff" />
        </View>
        <View style={[styles.stepLine, styles.stepLineDone]} />
        <View style={[styles.stepDot, styles.stepActive]} />
      </View>

      <View style={styles.iconBox}>
        <Ionicons name="phone-portrait-outline" size={44} color={Colors.primary} />
      </View>

      <Text style={styles.title}>Link your MoMo</Text>
      <Text style={styles.subtitle}>
        Connect your MTN Mobile Money account for seamless payments and repayment
        collection on this platform.
      </Text>

      <View style={styles.form}>
        <Input
          label="MTN MoMo Number"
          placeholder="024 XXX XXXX"
          value={momoNumber}
          onChangeText={setMomoNumber}
          keyboardType="phone-pad"
          leftIcon="phone-portrait-outline"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
          <Text style={styles.infoText}>
            We verify your MoMo account is active and matches your Ghana Card name.
            Repayments are collected automatically on agreed dates.
          </Text>
        </View>

        <Button
          title="Verify MoMo Account"
          onPress={handleVerify}
          loading={loading}
          style={styles.btn}
        />
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDone: {
    backgroundColor: Colors.accent,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  stepActive: {
    backgroundColor: Colors.primary,
    width: 28,
    borderRadius: 5,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 6,
  },
  stepLineDone: {
    backgroundColor: Colors.accent,
  },
  iconBox: {
    width: 80,
    height: 80,
    backgroundColor: '#EFF6FF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 28,
  },
  form: {},
  errorText: {
    color: Colors.accentRed,
    fontSize: 13,
    marginBottom: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primary,
    lineHeight: 18,
  },
  btn: {},
  skipBtn: {
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
  },
  skipText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
