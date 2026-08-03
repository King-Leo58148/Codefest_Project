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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FadeInView, SlideInView } from '@/components/ui/FadeInView';
import { PressableScale } from '@/components/ui/PressableScale';
import { registerUser, loginUser } from '@/services/api';
import { passwordsMatch } from '@/services/accountValidation';
import { useAuthStore } from '@/store/authStore';

type Role = 'INVESTOR' | 'OWNER';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('INVESTOR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, setToken } = useAuthStore();

  const getErrorMessage = (value: unknown, fallback: string) => {
    if (value instanceof Error && value.message.trim().length > 0) return value.message;
    return fallback;
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (!passwordsMatch(password, confirmPassword)) {
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
      await registerUser(name.trim(), email.trim(), password, role);
      const session = await loginUser(email.trim(), password);
      setUser(session.user);
      setToken(session.token);
      router.replace('/(auth)/verify-ghana-card');
    } catch (caught) {
      setError(getErrorMessage(caught, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.topAccentBar} />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: Math.max(insets.top + 16, 40), paddingBottom: Math.max(insets.bottom + 24, 32) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.72}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <SlideInView from="left" style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join Nkɔso and start connecting with opportunities</Text>
        </SlideInView>

        <FadeInView delay={60}>
          <Text style={styles.roleLabel}>I want to</Text>
          <View style={styles.roleRow}>
            <PressableScale
              style={{ flex: 1 }}
              onPress={() => setRole('INVESTOR')}
            >
              <View style={[styles.roleCard, role === 'INVESTOR' && styles.roleCardActive]}>
                <View style={[styles.roleIconBox, role === 'INVESTOR' && styles.roleIconBoxActive]}>
                  <Ionicons name="trending-up-outline" size={24} color={role === 'INVESTOR' ? Colors.primary : Colors.textMuted} />
                </View>
                <Text style={[styles.roleTitle, role === 'INVESTOR' && styles.roleTitleActive]}>Invest</Text>
                <Text style={styles.roleDesc}>Browse and fund businesses</Text>
              </View>
            </PressableScale>

            <PressableScale
              style={{ flex: 1 }}
              onPress={() => setRole('OWNER')}
            >
              <View style={[styles.roleCard, role === 'OWNER' && styles.roleCardActive]}>
                <View style={[styles.roleIconBox, role === 'OWNER' && styles.roleIconBoxActive]}>
                  <Ionicons name="business-outline" size={24} color={role === 'OWNER' ? Colors.primary : Colors.textMuted} />
                </View>
                <Text style={[styles.roleTitle, role === 'OWNER' && styles.roleTitleActive]}>Raise Capital</Text>
                <Text style={styles.roleDesc}>Post your business pitch</Text>
              </View>
            </PressableScale>
          </View>
        </FadeInView>

        <FadeInView delay={100} style={styles.form}>
          <Input label="Full name" placeholder="Kwame Mensah" value={name} onChangeText={setName} leftIcon="person-outline" />
          <Input label="Email address" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" leftIcon="mail-outline" />
          <Input label="Password" placeholder="At least 6 characters" value={password} onChangeText={setPassword} secure leftIcon="lock-closed-outline" />
          <Input label="Confirm Password" placeholder="Re-enter your password" value={confirmPassword} onChangeText={setConfirmPassword} secure leftIcon="lock-closed-outline" />

          {error ? (
            <FadeInView offset={4}>
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={18} color={Colors.accentRed} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </FadeInView>
          ) : null}

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.btn}
            rightIcon="arrow-forward"
          />
        </FadeInView>

        <FadeInView delay={160} style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.72}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </FadeInView>

        <Text style={styles.terms}>By continuing, you agree to our Terms of Service and Privacy Policy.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  topAccentBar: {
    height: 4,
    backgroundColor: Colors.primary,
    width: '100%',
  },
  container: { flexGrow: 1, paddingHorizontal: 24 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  header: { marginBottom: 24 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  roleLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  roleCard: {
    backgroundColor: Colors.borderLight,
    borderRadius: 16,
    padding: 16,
    minHeight: 128,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleCardActive: { backgroundColor: '#EFF6FF', borderColor: Colors.primary },
  roleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconBoxActive: {
    backgroundColor: '#DBEAFE',
  },
  roleTitle: { fontSize: 14, fontWeight: '700', color: Colors.textMuted },
  roleTitleActive: { color: Colors.primary },
  roleDesc: { fontSize: 11, lineHeight: 15, color: Colors.textMuted, textAlign: 'center' },
  form: {},
  errorText: { flex: 1, color: Colors.accentRed, fontSize: 13, lineHeight: 18, fontWeight: '500' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: Colors.accentRed + '40',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  btn: { marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: Colors.textSecondary },
  footerLink: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
  terms: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginTop: 16, lineHeight: 16 },
});
