import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/store/themeStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FadeInView, SlideInView } from '@/components/ui/FadeInView';
import { useAuthStore } from '@/store/authStore';
import { loginUser } from '@/services/api';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors, toggleTheme } = useTheme();
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const routeEmail = Array.isArray(params.email) ? params.email[0] : params.email;

  const [email, setEmail] = useState(routeEmail?.trim() ?? '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, setToken } = useAuthStore();

  const getErrorMessage = (value: unknown, fallback: string) => {
    if (value instanceof Error && value.message.trim().length > 0) {
      return value.message;
    }
    return fallback;
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in your email address and password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await loginUser(email.trim(), password);
      setToken(res.token);
      setUser(res.user);

      const destination = res.user?.role === 'OWNER' ? '/(owner)' : '/(investor)';
      router.replace(destination);
    } catch (caught) {
      setError(getErrorMessage(caught, 'Invalid email or password. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };



  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.topAccentBar, { backgroundColor: isDark ? colors.accent : colors.primary }]} />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: Math.max(insets.top + 12, 32), paddingBottom: Math.max(insets.bottom + 24, 32) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Row */}
        <View style={styles.topNavRow}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
            onPress={() => router.back()}
            activeOpacity={0.72}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.themeToggleBtn, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={isDark ? '#F59E0B' : '#0F172A'} />
          </TouchableOpacity>
        </View>

        {/* Title Header */}
        <SlideInView from="left" style={styles.header}>
          <View style={styles.logoBadgeGroup}>
            <View style={[styles.logoIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
              <Ionicons name="trending-up" size={24} color="#16A34A" />
            </View>
            <Text style={styles.logoText}>
              <Text style={{ color: isDark ? '#FFFFFF' : '#0D1B3E' }}>Nk</Text>
              <Text style={{ color: '#16A34A' }}>ɔ</Text>
              <Text style={{ color: isDark ? '#FFFFFF' : '#0D1B3E' }}>so</Text>
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in to access your deals, portfolio, and pitch room
          </Text>
        </SlideInView>

        {/* Main Form */}
        <FadeInView delay={80} style={styles.form}>
          <Input
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
          />

          <Input
            label="Password"
            placeholder="Enter your account password"
            value={password}
            onChangeText={setPassword}
            secure
            leftIcon="lock-closed-outline"
          />

          {/* Remember Me & Options Row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberGroup}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={rememberMe ? 'checkbox' : 'square-outline'}
                size={20}
                color={rememberMe ? '#16A34A' : colors.textMuted}
              />
              <Text style={[styles.rememberText, { color: colors.textPrimary }]}>Remember me</Text>
            </TouchableOpacity>


          </View>

          {/* Error Banner */}
          {error ? (
            <FadeInView offset={4}>
              <View style={[styles.errorBox, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2', borderColor: isDark ? '#B91C1C' : '#FCA5A5' }]}>
                <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </FadeInView>
          ) : null}

          {/* Sign In CTA Button */}
          <Button
            title="Sign In to Account"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
            rightIcon="arrow-forward"
          />



        </FadeInView>

        {/* Footer */}
        <FadeInView delay={140} style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')} activeOpacity={0.72}>
            <Text style={[styles.footerLink, { color: isDark ? colors.accent : colors.primary }]}>Create one now</Text>
          </TouchableOpacity>
        </FadeInView>
      </ScrollView>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topAccentBar: {
    height: 4,
    width: '100%',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
  },
  logoBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  logoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    flex: 1,
    gap: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rememberGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberText: {
    fontSize: 13,
    fontWeight: '600',
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  loginBtn: {
    marginTop: 8,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '800',
  },
});
