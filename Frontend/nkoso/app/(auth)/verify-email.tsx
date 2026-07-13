import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { resendSignupCode, verifySignupEmail } from '@/services/api';
import { isSixDigitCode } from '@/services/accountValidation';

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const email = useMemo(() => {
    const value = Array.isArray(params.email) ? params.email[0] : params.email;
    return value?.trim() ?? '';
  }, [params.email]);

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('Enter the six-digit code we sent to your email.');
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const getErrorMessage = (value: unknown, fallback: string) => {
    if (value instanceof Error && value.message.trim().length > 0) {
      return value.message;
    }

    return fallback;
  };

  const handleVerify = async () => {
    if (!email) {
      setError('We need your email to verify this account.');
      return;
    }

    if (!isSixDigitCode(code)) {
      setError('Enter the full six-digit code.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const response = await verifySignupEmail(email, code);
      Alert.alert('Email verified', response.message, [
        {
          text: 'Continue',
          onPress: () =>
            router.replace({
              pathname: '/(auth)/login',
              params: { email },
            }),
        },
      ]);
    } catch (caught) {
      setError(getErrorMessage(caught, 'We could not verify that code. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || secondsRemaining > 0) {
      return;
    }

    setError('');
    setResending(true);
    try {
      const response = await resendSignupCode(email);
      setMessage(response.message);
      setSecondsRemaining(60);
    } catch (caught) {
      setError(getErrorMessage(caught, 'We could not resend the code right now.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.iconBox}>
          <Ionicons name="mail-open-outline" size={40} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          Enter the code sent to keep setting up your Nkoso account.
        </Text>

        <View style={styles.emailCard}>
          <Text style={styles.emailLabel}>Email address</Text>
          <Text style={styles.emailValue}>{email || 'Missing email address'}</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Verification code"
            placeholder="123456"
            value={code}
            onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            leftIcon="key-outline"
            accessibilityLabel="Verification code"
          />

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.infoText}>{message}</Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            title="Verify Email"
            onPress={handleVerify}
            loading={loading}
            disabled={!email || !isSixDigitCode(code)}
          />

          <View style={styles.resendRow}>
            <TouchableOpacity
              onPress={handleResend}
              activeOpacity={0.7}
              disabled={secondsRemaining > 0 || resending || !email}
              accessibilityRole="button"
              accessibilityLabel="Resend verification code"
            >
              <Text
                style={[
                  styles.resendText,
                  (secondsRemaining > 0 || resending || !email) && styles.resendDisabled,
                ]}
              >
                {resending ? 'Sending...' : 'Resend code'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.timerText}>
              {secondsRemaining > 0
                ? `Available in ${formatCountdown(secondsRemaining)}`
                : 'You can request another code now'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  emailCard: {
    backgroundColor: Colors.borderLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  emailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  form: {
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primary,
    lineHeight: 18,
  },
  errorText: {
    color: Colors.accentRed,
    fontSize: 13,
    marginBottom: 8,
  },
  resendRow: {
    marginTop: 18,
    alignItems: 'center',
    gap: 8,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  resendDisabled: {
    color: Colors.textMuted,
  },
  timerText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
