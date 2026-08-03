import React from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { cardStyles } from '@/components/ui/Card';
import { FadeInView, SlideInView } from '@/components/ui/FadeInView';
import { PressableScale } from '@/components/ui/PressableScale';
import { useQuery } from '@tanstack/react-query';
import { getMyDeals } from '@/services/api';

// ─── settings row ─────────────────────────────────────────────────────────────

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

function SettingsRow({ icon, label, value, onPress, showArrow = true, danger = false }: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.72}>
      <View style={styles.settingsRowLeft}>
        <View style={[styles.iconContainer, danger && styles.dangerIconContainer]}>
          <Ionicons name={icon} size={18} color={danger ? Colors.accentRed : Colors.primary} />
        </View>
        <Text style={[styles.settingsRowLabel, danger && styles.dangerText]}>{label}</Text>
      </View>
      <View style={styles.settingsRowRight}>
        {value && <Text style={styles.settingsRowValue}>{value}</Text>}
        {showArrow && <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />}
      </View>
    </TouchableOpacity>
  );
}

// ─── verification timeline ────────────────────────────────────────────────────
/**
 * 3-step progress strip instead of a flat row of icons.
 * Principle: "status shown as a timeline/progress not a data dump" +
 * goal-gradient (highlights the next incomplete step).
 */
function VerificationTimeline({ ghanaCardVerified, momoVerified }: { ghanaCardVerified: boolean; momoVerified: boolean }) {
  const steps = [
    { label: 'Profile Created', icon: 'person-circle-outline' as const, done: true },
    { label: 'Ghana Card',       icon: 'card-outline' as const,          done: ghanaCardVerified },
    { label: 'MoMo Account',    icon: 'phone-portrait-outline' as const, done: momoVerified },
  ];
  const completedCount = steps.filter(s => s.done).length;
  const progressPct    = Math.round((completedCount / steps.length) * 100);

  return (
    <PressableScale onPress={() => router.push('/profile/verification' as any)}>
      <View style={vStyles.card}>
        <View style={vStyles.header}>
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.accent} />
          <Text style={vStyles.title}>Identity Verification</Text>
          <View style={vStyles.pctBadge}>
            <Text style={vStyles.pctText}>{progressPct}%</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={vStyles.barBg}>
          <View style={[vStyles.barFill, { width: `${progressPct}%` as any }]} />
        </View>

        {/* Steps */}
        <View style={vStyles.stepsRow}>
          {steps.map((step, i) => {
            const isNext = !step.done && (i === 0 || steps[i - 1].done);
            return (
              <React.Fragment key={step.label}>
                <View style={vStyles.step}>
                  <View style={[
                    vStyles.stepDot,
                    step.done && vStyles.stepDotDone,
                    isNext && vStyles.stepDotNext,
                  ]}>
                    <Ionicons
                      name={step.done ? 'checkmark' : step.icon}
                      size={step.done ? 12 : 14}
                      color={step.done ? '#fff' : isNext ? Colors.primary : Colors.textMuted}
                    />
                  </View>
                  <Text style={[
                    vStyles.stepLabel,
                    step.done && vStyles.stepLabelDone,
                    isNext && vStyles.stepLabelNext,
                  ]}>
                    {step.label}
                  </Text>
                </View>
                {i < steps.length - 1 && (
                  <View style={[vStyles.stepConnector, steps[i + 1].done && vStyles.stepConnectorDone]} />
                )}
              </React.Fragment>
            );
          })}
        </View>

        {!ghanaCardVerified || !momoVerified ? (
          <Text style={vStyles.cta}>
            {!ghanaCardVerified ? 'Complete Ghana Card verification to unlock investing →' : 'Add MoMo to enable instant transfers →'}
          </Text>
        ) : (
          <Text style={vStyles.ctaDone}>✓ Full verification complete — you can invest freely</Text>
        )}
      </View>
    </PressableScale>
  );
}

const push = (href: string) => router.push(href as any);

// ─── main screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const { data: deals = [] } = useQuery({
    queryKey: ['myDeals'],
    queryFn: () => getMyDeals(),
  });

  const ACTIVE_STATUSES = ['PENDING_SIGNATURES', 'PENDING_MFI', 'MFI_APPROVED', 'PAYMENT_PENDING', 'FUNDED', 'ACTIVE'];
  const activeDeals    = deals.filter(d => ACTIVE_STATUSES.includes(d.status));
  const totalInvested  = activeDeals.reduce((s, d) => s + d.amount, 0);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  const isFullyVerified = user?.ghanaCardVerified && user?.momoVerified;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── Profile header ── */}
        <SlideInView from="left" style={styles.profileHeader}>
          <View style={styles.avatarRow}>
            {/* Avatar with optional verification ring */}
            <View style={[styles.avatarWrap, isFullyVerified && styles.avatarWrapVerified]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <View style={styles.roleTag}>
                <Ionicons name="shield-checkmark" size={12} color={Colors.accent} />
                <Text style={styles.roleTagText}>Investor Account</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.72} onPress={() => push('/profile/personal-info')}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* 2-stat strip — reciprocity: surface value immediately */}
          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>GH₵{totalInvested.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Invested</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeDeals.length}</Text>
              <Text style={styles.statLabel}>Active Deals</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{isFullyVerified ? '100%' : user?.ghanaCardVerified ? '67%' : '33%'}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
          </View>
        </SlideInView>

        {/* ── Verification timeline ── */}
        <FadeInView delay={60} style={{ marginHorizontal: 20, marginBottom: 20 }}>
          <VerificationTimeline
            ghanaCardVerified={user?.ghanaCardVerified ?? false}
            momoVerified={user?.momoVerified ?? false}
          />
        </FadeInView>

        {/* ── Account ── */}
        <Text style={styles.sectionLabel}>Account Settings</Text>
        <View style={styles.section}>
          <SettingsRow icon="person-outline" label="Personal information" onPress={() => push('/profile/personal-info')} />
          <View style={styles.divider} />
          <SettingsRow icon="card-outline" label="Bank account" onPress={() => push('/profile/bank-account')} />
          <View style={styles.divider} />
          <SettingsRow
            icon="document-text-outline"
            label="Ghana Card Verification"
            value={user?.ghanaCardVerified ? 'Verified ✓' : 'Pending'}
            onPress={() => push('/profile/verification?tab=ghana-card')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="phone-portrait-outline"
            label="MoMo Account"
            value={user?.momoVerified ? 'Verified ✓' : 'Pending'}
            onPress={() => push('/profile/verification?tab=momo')}
          />
        </View>

        {/* ── Preferences ── */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.section}>
          <SettingsRow icon="notifications-outline" label="Notifications"        onPress={() => push('/profile/notification-settings')} />
          <View style={styles.divider} />
          <SettingsRow icon="mail-outline"          label="Email preferences"    onPress={() => push('/profile/email-preferences')} />
          <View style={styles.divider} />
          <SettingsRow icon="wallet-outline"        label="Saved payment methods" onPress={() => push('/profile/payment-methods')} />
        </View>

        {/* ── Support ── */}
        <Text style={styles.sectionLabel}>Support & Info</Text>
        <View style={styles.section}>
          <SettingsRow icon="help-circle-outline" label="Help center"     onPress={() => push('/profile/help')} />
          <View style={styles.divider} />
          <SettingsRow icon="chatbubble-outline"  label="Contact support" onPress={() => push('/profile/contact-support')} />
        </View>

        {/* ── Logout ── */}
        <View style={[styles.section, styles.logoutSection]}>
          <SettingsRow icon="log-out-outline" label="Log out" onPress={handleLogout} showArrow={false} danger />
        </View>

        <Text style={styles.version}>Nkɔso v1.0.0 · Made in Ghana 🇬🇭</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── verification timeline styles ─────────────────────────────────────────────

const vStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: 18,
    padding: 16, borderWidth: 1, borderColor: '#BBF7D0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, gap: 12,
  },
  header:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title:     { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  pctBadge:  { backgroundColor: Colors.accent + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  pctText:   { fontSize: 11, fontWeight: '700', color: Colors.accent },
  barBg:     { height: 4, backgroundColor: Colors.borderLight, borderRadius: 2, overflow: 'hidden' },
  barFill:   { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
  stepsRow:  { flexDirection: 'row', alignItems: 'center' },
  step:      { alignItems: 'center', flex: 1 },
  stepDot: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.borderLight, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  stepDotDone: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  stepDotNext: { borderColor: Colors.primary, borderWidth: 2, backgroundColor: '#EFF6FF' },
  stepLabel:     { fontSize: 10, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },
  stepLabelDone: { color: Colors.accent },
  stepLabelNext: { color: Colors.primary },
  stepConnector: { height: 2, flex: 0.4, backgroundColor: Colors.borderLight, marginBottom: 22 },
  stepConnectorDone: { backgroundColor: Colors.accent },
  cta:     { fontSize: 11, color: Colors.primary, fontWeight: '600', lineHeight: 16 },
  ctaDone: { fontSize: 11, color: Colors.accent, fontWeight: '600' },
});

// ─── main styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 30 },

  profileHeader: {
    backgroundColor: Colors.surface, paddingHorizontal: 20,
    paddingVertical: 20, marginBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border,
  },
  avatarRow:  { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatarWrap: { padding: 2, borderRadius: 34, borderWidth: 2, borderColor: 'transparent' },
  // Gradient-style ring when fully verified — distinct from a plain border
  avatarWrapVerified: {
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 4,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText:   { fontSize: 22, fontWeight: '800', color: '#fff' },
  profileInfo:  { flex: 1, gap: 2 },
  profileName:  { fontSize: 19, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  profileEmail: { fontSize: 13, color: Colors.textSecondary },
  roleTag:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  roleTagText:  { fontSize: 11, fontWeight: '600', color: Colors.accent },
  editBtn: {
    minHeight: 38, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
    backgroundColor: Colors.borderLight, borderWidth: 1, borderColor: Colors.border,
  },
  editBtnText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },

  statsStrip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.background, borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 8,
  },
  statItem:    { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.border },
  statValue:   { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.2 },
  statLabel:   { fontSize: 10, color: Colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },

  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: Colors.textMuted,
    paddingHorizontal: 20, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6,
  },
  section: {
    ...cardStyles.surface,
    backgroundColor: Colors.surface, marginHorizontal: 20, borderRadius: 16, marginBottom: 20, overflow: 'hidden',
  },
  logoutSection: { marginBottom: 12, backgroundColor: '#FEF2F2', borderColor: Colors.accentRed + '30' },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, minHeight: 56, paddingVertical: 12,
  },
  settingsRowLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer:     { width: 34, height: 34, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  dangerIconContainer: { backgroundColor: '#FEE2E2' },
  settingsRowLabel:  { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  settingsRowRight:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingsRowValue:  { fontSize: 13, color: Colors.accent, fontWeight: '600' },
  divider:           { height: 1, backgroundColor: Colors.borderLight, marginLeft: 62 },
  dangerText:        { color: Colors.accentRed, fontWeight: '700' },
  version:           { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginBottom: 8 },
});
