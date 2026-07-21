import React, { useState } from 'react';
import {
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
import { forgotPassword } from '@/services/api';

export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const initialEmail = Array.isArray(params.email) ? params.email[0] : params.email;

  const [email, setEmail]     = useState(initialEmail?.trim() ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);

  const getErrorMessage = (value: unknown, fallback: string) => {
    if (value instanceof Error && value.message.trim().length > 0) {
      return value.message;
    }
    return fallback;
  };

  const handleSend = async () => {
    if (!email.trim()) {
      setError('Enter the email address linked to your account.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (caught) {
      // Show generic message so we don't reveal whether the email exists.
      // Only show the real error if it's something actionable (e.g. cooldown).
      const msg = caught instanceof Error ? caught.message : '';
      if (msg.toLowerCase().includes('recently') || msg.toLowerCase().includes('cooldown')) {
        setError(msg);
      } else {
        setSent(true); // still show success UI for anti-enumeration
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Sent state ──────────────────────────────────────────────────────────────
  if (sent) {
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
          >
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.iconBox}>
            <Ionicons name="mail-outline" size={40} color={Colors.accent} />
          </View>

          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            If an account exists for <Text style={styles.emailHighlight}>{email}</Text>,
            we've sent a password reset link. Tap the button in the email to choose
            a new password — the link opens the app directly.
          </Text>

          <View style={styles.tipCard}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.tipText}>
              The link expires in 30 minutes. Check your spam folder if you don't see it
              within a few minutes.
            </Text>
          </View>

          <Button
            title="Back to sign in"
            onPress={() =>
              router.replace({
                pathname: '/(auth)/login',
                params: email.trim() ? { email: email.trim() } : undefined,
              })
            }
          />

          <TouchableOpacity
            style={styles.retryLink}
            onPress={() => { setSent(false); setError(''); }}
            activeOpacity={0.7}
          >
            <Text style={styles.retryLinkText}>Didn't receive it? Try again</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Request state ───────────────────────────────────────────────────────────
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
          Enter your email address and we'll send you a link to reset your password.
        </Text>

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

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            title="Send reset link"
            onPress={handleSend}
            loading={loading}
            disabled={!email.trim()}
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
  emailHighlight: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  form: {
    flex: 1,
  },
  errorText: {
    color: Colors.accentRed,
    fontSize: 13,
    marginBottom: 8,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.primary,
    lineHeight: 19,
  },
  retryLink: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  retryLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
