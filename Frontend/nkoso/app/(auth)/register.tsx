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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/store/themeStore';
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
  const { colors, isDark } = useTheme();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('INVESTOR');
  
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
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
    if (!agreedTerms) {
      setError('Please agree to the Terms of Service & Privacy Policy to proceed.');
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
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: Math.max(insets.top + 16, 40), paddingBottom: Math.max(insets.bottom + 24, 32) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.surfaceSubtle }]}
          onPress={() => router.back()}
          activeOpacity={0.72}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={isDark ? '#16A34A' : '#15803D'} />
        </TouchableOpacity>

        <SlideInView from="left" style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Create your account
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Join Nkɔso and start connecting with <Text style={{ color: isDark ? colors.accent : colors.primary, fontWeight: '700' }}>opportunities.</Text>
            </Text>
          </View>
        </SlideInView>

        <FadeInView delay={60}>
          <Text style={[styles.roleLabel, { color: colors.textPrimary }]}>I want to</Text>
          <View style={styles.roleRow}>
            <PressableScale
              style={{ flex: 1 }}
              onPress={() => setRole('INVESTOR')}
            >
              <View style={[
                styles.roleCard, 
                { backgroundColor: colors.surface, borderColor: colors.border },
                role === 'INVESTOR' && { borderColor: isDark ? colors.accent : colors.primary, backgroundColor: isDark ? 'rgba(22, 163, 74, 0.1)' : '#F0FDF4' }
              ]}>
                <View style={styles.radioTopRight}>
                  {role === 'INVESTOR' ? (
                    <Ionicons name="checkmark-circle" size={24} color={isDark ? colors.accent : colors.primary} />
                  ) : (
                    <Ionicons name="ellipse-outline" size={24} color={colors.border} />
                  )}
                </View>
                <View style={[styles.roleIconBox, { backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC' }]}>
                  <Ionicons name="trending-up-outline" size={28} color={isDark ? colors.accent : colors.primary} />
                </View>
                <Text style={[styles.roleTitle, { color: colors.textPrimary }]}>Invest</Text>
                <Text style={[styles.roleDesc, { color: colors.textSecondary }]}>Browse and fund businesses</Text>
              </View>
            </PressableScale>

            <PressableScale
              style={{ flex: 1 }}
              onPress={() => setRole('OWNER')}
            >
              <View style={[
                styles.roleCard, 
                { backgroundColor: colors.surface, borderColor: colors.border },
                role === 'OWNER' && { borderColor: isDark ? colors.accent : colors.primary, backgroundColor: isDark ? 'rgba(22, 163, 74, 0.1)' : '#F0FDF4' }
              ]}>
                <View style={styles.radioTopRight}>
                  {role === 'OWNER' ? (
                    <Ionicons name="checkmark-circle" size={24} color={isDark ? colors.accent : colors.primary} />
                  ) : (
                    <Ionicons name="ellipse-outline" size={24} color={colors.border} />
                  )}
                </View>
                <View style={[styles.roleIconBox, { backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC' }]}>
                  <Ionicons name="business-outline" size={28} color={isDark ? colors.accent : colors.primary} />
                </View>
                <Text style={[styles.roleTitle, { color: colors.textPrimary }]}>Raise Capital</Text>
                <Text style={[styles.roleDesc, { color: colors.textSecondary }]}>Post your business pitch</Text>
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
              <View style={[styles.errorBox, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2', borderColor: isDark ? '#B91C1C' : '#FCA5A5' }]}>
                <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </FadeInView>
          ) : null}

          {/* Terms and Conditions Section */}
          <View style={[styles.termsContainer, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.termsCheckRow}
              onPress={() => setAgreedTerms(!agreedTerms)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={agreedTerms ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={agreedTerms ? '#16A34A' : colors.textMuted}
              />
              <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                I agree to the{' '}
                <Text
                  style={[styles.termsLink, { color: isDark ? colors.accent : colors.primary }]}
                  onPress={() => setShowTermsModal(true)}
                >
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text
                  style={[styles.termsLink, { color: isDark ? colors.accent : colors.primary }]}
                  onPress={() => setShowTermsModal(true)}
                >
                  Privacy Policy
                </Text>.
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.btn}
            rightIcon="arrow-forward"
          />
        </FadeInView>

        <FadeInView delay={160}>
           <View style={styles.orDivider}>
             <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
             <Text style={[styles.orText, { color: colors.textMuted }]}>or</Text>
             <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
           </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.72}>
              <Text style={[styles.footerLink, { color: isDark ? colors.accent : colors.primary }]}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </FadeInView>

      </ScrollView>

      {/* Terms & Conditions Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>Terms of Service & Regulatory Policy</Text>
            <TouchableOpacity onPress={() => setShowTermsModal(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={[styles.termsNoticeBox, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}>
              <Ionicons name="shield-checkmark" size={22} color="#15803D" />
              <Text style={styles.noticeText}>
                Nkɔso is operated in compliance with the Data Protection Act (Act 843) of Ghana and Bank of Ghana Mobile Money regulations.
              </Text>
            </View>

            <Text style={[styles.termsHeading, { color: colors.textPrimary }]}>1. General Platform Usage</Text>
            <Text style={[styles.termsParagraph, { color: colors.textSecondary }]}>
              By accessing Nkɔso, you agree that you are at least 18 years old and possess a valid Ghana Card and verified Mobile Money account. Users must provide truthful information when creating pitches or placing investment bids.
            </Text>

            <Text style={[styles.termsHeading, { color: colors.textPrimary }]}>2. Investment Disclosures & Risk</Text>
            <Text style={[styles.termsParagraph, { color: colors.textSecondary }]}>
              Investing in micro-businesses and informal enterprises carries inherent financial risk. Historical returns do not guarantee future performance. Nkɔso provides escrow security via Paystack but does not guarantee business profitability.
            </Text>

            <Text style={[styles.termsHeading, { color: colors.textPrimary }]}>3. Paystack Escrow & Disbursements</Text>
            <Text style={[styles.termsParagraph, { color: colors.textSecondary }]}>
              All capital deposits are held in regulated Paystack escrow accounts. Funds are only disbursed to business owners upon digital execution of legal contracts and completion of MFI due diligence audits.
            </Text>

            <Text style={[styles.termsHeading, { color: colors.textPrimary }]}>4. User Privacy & Data Protection</Text>
            <Text style={[styles.termsParagraph, { color: colors.textSecondary }]}>
              We encrypt sensitive biometric and financial data. Your Ghana Card details and Mobile Money numbers are encrypted and never shared with third parties without explicit authorization.
            </Text>

            <Button
              title="I Accept Terms & Conditions"
              onPress={() => {
                setAgreedTerms(true);
                setShowTermsModal(false);
              }}
              style={{ marginTop: 20 }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 24 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  header: { 
    marginBottom: 28,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 16,
    paddingTop: 10,
  },
  title: { 
    fontSize: 32, 
    lineHeight: 38, 
    fontWeight: '900', 
    marginBottom: 12, 
    letterSpacing: -0.5 
  },
  subtitle: { 
    fontSize: 15, 
    lineHeight: 22 
  },

  roleLabel: { 
    fontSize: 16, 
    fontWeight: '800', 
    marginBottom: 16, 
  },
  roleRow: { flexDirection: 'row', gap: 16, marginBottom: 28 },
  roleCard: {
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    position: 'relative',
  },
  radioTopRight: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  roleIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  roleTitle: { fontSize: 16, fontWeight: '800' },
  roleDesc: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
  form: {
    gap: 12,
  },
  errorText: { flex: 1, color: '#DC2626', fontSize: 13, lineHeight: 18, fontWeight: '600' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  btn: { marginTop: 16, paddingVertical: 16, borderRadius: 16 },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '800' },
  termsContainer: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  termsCheckRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  modalSafe: {
    flex: 1,
  },
  modalHeader: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    gap: 14,
  },
  termsNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  noticeText: {
    flex: 1,
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  termsHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 6,
  },
  termsParagraph: {
    fontSize: 13,
    lineHeight: 20,
  },
});
