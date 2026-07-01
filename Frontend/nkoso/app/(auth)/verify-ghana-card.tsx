import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { verifyGhanaCard } from '@/services/api';

export default function VerifyGhanaCardScreen() {
  const [ghanaCardNumber, setGhanaCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, setUser } = useAuthStore();

  const handleVerify = async () => {
    const cleaned = ghanaCardNumber.replace(/\s/g, '').toUpperCase();
    if (!cleaned || cleaned.length < 10) {
      setError('Please enter a valid Ghana Card number (e.g. GHA-123456789-1).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const verified = await verifyGhanaCard(cleaned);
      if (verified && user) {
        setUser({ ...user, ghanaCardVerified: true, ghanaCardNumber: cleaned });
        router.push('/(auth)/verify-momo');
      }
    } catch {
      setError('Verification failed. Please check your Ghana Card number and try again.');
    } finally {
      setLoading(false);
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
        <View style={[styles.stepDot, styles.stepActive]} />
        <View style={styles.stepLine} />
        <View style={styles.stepDot} />
      </View>

      <View style={styles.iconBox}>
        <Ionicons name="card-outline" size={44} color={Colors.primary} />
      </View>

      <Text style={styles.title}>Verify your identity</Text>
      <Text style={styles.subtitle}>
        Enter your Ghana Card number to confirm your identity. This is required by
        our MFI partner for all platform users.
      </Text>

      <View style={styles.form}>
        <Input
          label="Ghana Card Number"
          placeholder="GHA-XXXXXXXXX-X"
          value={ghanaCardNumber}
          onChangeText={setGhanaCardNumber}
          autoCapitalize="characters"
          leftIcon="card-outline"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.accent} />
          <Text style={styles.infoText}>
            Verified via Appruve API. Your information is securely encrypted and
            never shared without your consent.
          </Text>
        </View>

        <Button
          title="Verify Ghana Card"
          onPress={handleVerify}
          loading={loading}
          style={styles.btn}
        />
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.push('/(auth)/verify-momo')}
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
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#16A34A',
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
