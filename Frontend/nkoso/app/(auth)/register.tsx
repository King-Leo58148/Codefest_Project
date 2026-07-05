import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { registerUser } from '@/services/api';

type Role = 'INVESTOR' | 'OWNER';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('INVESTOR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, setToken } = useAuthStore();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await registerUser(name.trim(), email.trim(), password, role);
      setToken(res.token);
      setUser(res.user);
      router.push('/(auth)/verify-ghana-card');
    } catch {
      setError('Registration failed. Please try again.');
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
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>
            Join Nkɔso and start connecting with opportunities
          </Text>
        </View>

        <Text style={styles.roleLabel}>I want to</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleCard, role === 'INVESTOR' && styles.roleCardActive]}
            onPress={() => setRole('INVESTOR')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="trending-up-outline"
              size={28}
              color={role === 'INVESTOR' ? Colors.primary : Colors.textMuted}
            />
            <Text
              style={[
                styles.roleTitle,
                role === 'INVESTOR' && styles.roleTitleActive,
              ]}
            >
              Invest
            </Text>
            <Text style={styles.roleDesc}>Browse and fund businesses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleCard, role === 'OWNER' && styles.roleCardActive]}
            onPress={() => setRole('OWNER')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="business-outline"
              size={28}
              color={role === 'OWNER' ? Colors.primary : Colors.textMuted}
            />
            <Text
              style={[
                styles.roleTitle,
                role === 'OWNER' && styles.roleTitleActive,
              ]}
            >
              Raise Capital
            </Text>
            <Text style={styles.roleDesc}>Post your business pitch</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Input
            label="Full name"
            placeholder="Kwame Mensah"
            value={name}
            onChangeText={setName}
            leftIcon="person-outline"
          />
          <Input
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
          />
          <Input
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            secure
            leftIcon="lock-closed-outline"
          />
          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secure
            leftIcon="lock-closed-outline"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            title="Continue"
            onPress={handleRegister}
            loading={loading}
            style={styles.btn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleCard: {
    flex: 1,
    backgroundColor: Colors.borderLight,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: Colors.primary,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  roleTitleActive: {
    color: Colors.primary,
  },
  roleDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  form: {},
  errorText: {
    color: Colors.accentRed,
    fontSize: 13,
    marginBottom: 8,
  },
  btn: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
  terms: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
});
