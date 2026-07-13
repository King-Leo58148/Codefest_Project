import React, { useState } from 'react';
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
import { forgotPassword, resetPassword } from '@/services/api';
import {
  FORGOT_PASSWORD_NEUTRAL_MESSAGE,
  isSixDigitCode,
  passwordsMatch,
} from '@/services/accountValidation';

type Stage = 'request' | 'reset';

export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const initialEmail = Array.isArray(params.email) ? params.email[0] : params.email;

  const [stage, setStage] = useState<Stage>('request');
  const [email, setEmail] = useState(initialEmail?.trim() ?? '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const getErrorMessage = (value: unknown, fallback: string) => {
    if (value instanceof Error && value.message.trim().length > 0) {
      return value.message;
    }

    return fallback;
  };

  const handleRequestCode = async () => {
    if (!email.trim()) {
      setError('Enter the email address linked to your account.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setMessage(FORGOT_PASSWORD_NEUTRAL_MESSAGE);
      setStage('reset');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (caught) {
      setError(getErrorMessage(caught, 'We could not start password recovery.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Enter the email address linked to your account.');
      return;
    }

    if (!isSixDigitCode(code)) {
      setError('Enter the full six-digit reset code.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Enter and confirm your new password.');
      return;
    }

    if (!passwordsMatch(newPassword, confirmPassword)) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const response = await resetPassword(email, code, newPassword, confirmPassword);
      Alert.alert('Password updated', response.message, [
        {
          text: 'Sign in',
          onPress: () =>
            router.replace({
              pathname: '/(auth)/login',
              params: { email: email.trim() },
            }),
        },
      ]);
    } catch (caught) {
      setError(getErrorMessage(caught, 'We could not reset your password.'));
    } finally {
      setLoading(false);
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
          <Ionicons name="lock-open-outline" size={40} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Forgot your password?</Text>
        <Text style={styles.subtitle}>
          {stage === 'request'
            ? 'Request a reset code and we will email the next steps.'
            : 'Enter the reset code and choose a new password.'}
        </Text>

        {message ? (
          <View style={styles.infoBox}>
            <Ionicons name="mail-outline" size={16} color={Colors.primary} />
            <Text style={styles.infoText}>{message}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Input
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon="mail-outline"
            accessibilityLabel="Email address"
          />

          {stage === 'reset' ? (
            <>
              <Input
                label="Reset code"
                placeholder="123456"
                value={code}
                onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                leftIcon="key-outline"
                accessibilityLabel="Reset code"
              />
              <Input
                label="New password"
                placeholder="Enter a new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secure
                leftIcon="lock-closed-outline"
              />
              <Input
                label="Confirm new password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secure
                leftIcon="lock-closed-outline"
              />
            </>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {stage === 'request' ? (
            <Button
              title="Send Reset Code"
              onPress={handleRequestCode}
              loading={loading}
            />
          ) : (
            <>
              <Button
                title="Reset Password"
                onPress={handleResetPassword}
                loading={loading}
                disabled={!isSixDigitCode(code) || !passwordsMatch(newPassword, confirmPassword)}
              />
              <TouchableOpacity
                style={styles.secondaryAction}
                onPress={() => {
                  setStage('request');
                  setMessage('');
                  setError('');
                  setCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Use a different email"
              >
                <Text style={styles.secondaryActionText}>Request a new code</Text>
              </TouchableOpacity>
            </>
          )}
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
  form: {
    flex: 1,
  },
  errorText: {
    color: Colors.accentRed,
    fontSize: 13,
    marginBottom: 8,
  },
  secondaryAction: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
