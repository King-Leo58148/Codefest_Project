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
import { resetPassword } from '@/services/api';

/**
 * Opened by the deep link:
 *   nkoso://reset-password?token=TOKEN&email=EMAIL
 *
 * The backend's GET /auth/reset-password-link validates the token and
 * redirects here with the token pre-filled as a query param. The user just
 * types their new password and submits.
 *
 * Also handles the error case where the link was expired/invalid — in that
 * case the deep link carries ?error=MESSAGE instead of ?token.
 */
export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{
    token?: string | string[];
    email?: string | string[];
    error?: string | string[];
  }>();

  const token = Array.isArray(params.token) ? params.token[0] : (params.token ?? '');
  const email = Array.isArray(params.email) ? params.email[0] : (params.email ?? '');
  const linkError = Array.isArray(params.error) ? params.error[0] : (params.error ?? '');

  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState('');

  // ── Invalid / expired link ──────────────────────────────────────────────────
  if (linkError || !token) {
    return (
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.iconBox}>
            <Ionicons name="close-circle-outline" size={40} color={Colors.accentRed} />
          </View>
          <Text style={styles.title}>Link expired</Text>
          <Text style={styles.subtitle}>
            {linkError || 'This password reset link is invalid or has already been used.'}
            {'\n\n'}Please request a new link from the login screen.
          </Text>
          <Button
            title="Request new link"
            onPress={() => router.replace('/(auth)/forgot-password')}
          />
          <TouchableOpacity
            style={styles.backToLoginBtn}
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.7}
          >
            <Text style={styles.backToLoginText}>Back to sign in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Password form ───────────────────────────────────────────────────────────
  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const response = await resetPassword(email, token, newPassword, confirmPassword);
      Alert.alert(
        'Password updated',
        response.message || 'Your password has been changed. Sign in with your new password.',
        [
          {
            text: 'Sign in',
            onPress: () =>
              router.replace({
                pathname: '/(auth)/login',
                params: email ? { email } : undefined,
              }),
          },
        ]
      );
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : '';
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        setError('This link has expired. Please request a new one.');
      } else {
        setError(msg || 'Could not reset your password. Please try again.');
      }
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
        <View style={styles.iconBox}>
          <Ionicons name="lock-closed-outline" size={40} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Choose a new password</Text>
        <Text style={styles.subtitle}>
          {email ? `Setting a new password for ${email}.` : 'Enter and confirm your new password below.'}
        </Text>

        <View style={styles.form}>
          <Input
            label="New password"
            placeholder="At least 8 characters"
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

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            title="Reset password"
            onPress={handleReset}
            loading={loading}
            disabled={!newPassword || !confirmPassword}
          />
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
    paddingTop: 80,
    paddingBottom: 32,
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
  form: {
    flex: 1,
  },
  errorText: {
    color: Colors.accentRed,
    fontSize: 13,
    marginBottom: 8,
  },
  backToLoginBtn: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
