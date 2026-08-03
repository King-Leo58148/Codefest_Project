import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { cardStyles } from '@/components/ui/Card';
import { FadeInView, SlideInView } from '@/components/ui/FadeInView';
import { PressableScale } from '@/components/ui/PressableScale';

function Row({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.row} activeOpacity={0.72}>
      <View style={[styles.iconContainer, danger && styles.dangerIconContainer]}>
        <Ionicons name={icon} size={18} color={danger ? Colors.accentRed : Colors.primary} />
      </View>
      <Text style={[styles.rowLabel, danger && styles.dangerText]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function OwnerProfileScreen() {
  const { user, logout } = useAuthStore();
  const initials = (user?.name || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const openGhanaCard = () => router.push('/profile/verification?tab=ghana-card' as any);
  const openMomo = () => router.push('/profile/verification?tab=momo' as any);
  const openVerification = () => router.push('/profile/verification' as any);

  const signOut = () =>
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => logout() },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <SlideInView from="left" style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.identity}>
            <Text style={styles.name}>{user?.name || 'Your account'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.roleTag}>
              <Ionicons name="briefcase" size={12} color={Colors.primary} />
              <Text style={styles.roleTagText}>Business Owner Account</Text>
            </View>
          </View>
        </SlideInView>

        {/* Verification status banner */}
        <FadeInView delay={60}>
          <PressableScale onPress={openVerification}>
            <View style={styles.verification}>
              <Status verified={Boolean(user?.ghanaCardVerified)} label="Ghana Card" />
              <Status verified={Boolean(user?.momoVerified)} label="MoMo" />
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </View>
          </PressableScale>
        </FadeInView>

        <Section title="Account Settings">
          <Row icon="person-outline" label="Personal information" onPress={() => router.push('/profile/personal-info' as any)} />
          <Row
            icon="document-text-outline"
            label="Ghana Card"
            value={user?.ghanaCardVerified ? 'Verified' : 'Verify now'}
            onPress={openGhanaCard}
          />
          <Row
            icon="phone-portrait-outline"
            label="MoMo Account"
            value={user?.momoVerified ? 'Verified' : user?.momoNumber || 'Verify now'}
            onPress={openMomo}
          />
        </Section>

        <Section title="Business Management">
          <Row icon="megaphone-outline" label="My pitches" onPress={() => router.push('/(owner)/pitches' as any)} />
          <Row icon="people-outline" label="Active deals" onPress={() => router.push('/(owner)/deals' as any)} />
        </Section>

        <Section title="Support & Help">
          <Row icon="help-circle-outline" label="Help center" onPress={() => router.push('/profile/help' as any)} />
          <Row icon="chatbubble-outline" label="Contact support" onPress={() => router.push('/profile/contact-support' as any)} />
        </Section>

        <View style={[styles.group, styles.logoutGroup]}>
          <Row icon="log-out-outline" label="Log out" danger onPress={signOut} />
        </View>

        <Text style={styles.version}>Nkɔso v1.0.0 · Made in Ghana</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Status({ verified, label }: { verified: boolean; label: string }) {
  return (
    <View style={styles.status}>
      <Ionicons
        name={verified ? 'checkmark-circle' : 'time-outline'}
        size={18}
        color={verified ? Colors.accent : Colors.textMuted}
      />
      <Text style={styles.statusText}>
        {label} {verified ? 'verified' : 'pending'}
      </Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.group}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 30 },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E7FF',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 22 },
  identity: { flex: 1, gap: 2 },
  name: { fontSize: 19, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  email: { fontSize: 13, color: Colors.textSecondary },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  verification: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  status: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center' },
  statusText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  sectionTitle: {
    marginLeft: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.6,
  },
  group: {
    ...cardStyles.surface,
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  logoutGroup: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: '#FEF2F2',
    borderColor: Colors.accentRed + '30',
  },
  row: {
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerIconContainer: {
    backgroundColor: '#FEE2E2',
  },
  rowLabel: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  rowValue: { fontSize: 13, color: Colors.accent, fontWeight: '600' },
  dangerText: { color: Colors.accentRed, fontWeight: '700' },
  version: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
});
