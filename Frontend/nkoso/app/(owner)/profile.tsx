import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/store/themeStore';
import { FadeInView, SlideInView } from '@/components/ui/FadeInView';
import { PressableScale } from '@/components/ui/PressableScale';

function Row({
  icon,
  label,
  value,
  onPress,
  danger,
  rightComponent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  rightComponent?: React.ReactNode;
}) {
  const { isDark, colors } = useTheme();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      disabled={!onPress}
      style={styles.row}
      activeOpacity={0.72}
    >
      <View style={[styles.iconContainer, { backgroundColor: danger ? '#FEF2F2' : colors.surfaceSubtle }]}>
        <Ionicons name={icon} size={18} color={danger ? '#DC2626' : (isDark ? colors.accent : colors.primary)} />
      </View>
      <Text style={[styles.rowLabel, { color: danger ? '#DC2626' : colors.textPrimary }]}>{label}</Text>
      {value ? <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text> : null}
      {rightComponent ? (
        rightComponent
      ) : (
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function OwnerProfileScreen() {
  const { user, logout } = useAuthStore();
  const { isDark, colors, toggleTheme } = useTheme();

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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <SlideInView from="left" style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.identity}>
            <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.name || 'Your account'}</Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
            <View style={[styles.roleTag, { backgroundColor: colors.surfaceSubtle }]}>
              <Ionicons name="briefcase" size={12} color={isDark ? colors.accent : colors.primary} />
              <Text style={[styles.roleTagText, { color: colors.textPrimary }]}>Business Owner Account</Text>
            </View>
          </View>
        </SlideInView>

        {/* Verification Status Card */}
        <FadeInView delay={100} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Verification & MoMo Setup</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Required for receiving investor payouts</Text>
            </View>
            <PressableScale style={styles.manageBtn} onPress={openVerification}>
              <Text style={styles.manageBtnText}>Manage</Text>
            </PressableScale>
          </View>

          <View style={styles.verificationList}>
            <TouchableOpacity style={styles.vItem} onPress={openGhanaCard} activeOpacity={0.75}>
              <Ionicons
                name={user?.ghanaCardVerified ? 'checkmark-circle' : 'alert-circle'}
                size={20}
                color={user?.ghanaCardVerified ? '#16A34A' : '#D97706'}
              />
              <View style={styles.vItemContent}>
                <Text style={[styles.vItemTitle, { color: colors.textPrimary }]}>Ghana Card Identity</Text>
                <Text style={[styles.vItemSub, { color: colors.textSecondary }]}>
                  {user?.ghanaCardVerified ? 'Verified & Approved' : 'Action Required'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.vDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.vItem} onPress={openMomo} activeOpacity={0.75}>
              <Ionicons
                name={user?.momoVerified ? 'checkmark-circle' : 'wallet-outline'}
                size={20}
                color={user?.momoVerified ? '#16A34A' : '#D97706'}
              />
              <View style={styles.vItemContent}>
                <Text style={[styles.vItemTitle, { color: colors.textPrimary }]}>Mobile Money Account</Text>
                <Text style={[styles.vItemSub, { color: colors.textSecondary }]}>
                  {user?.momoNumber ? `${user.momoNumber} (${user.momoProvider})` : 'Set up disbursement MoMo'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </FadeInView>

        {/* Appearance & Theme Section */}
        <FadeInView delay={150} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Appearance</Text>
          <Row
            icon={isDark ? 'moon' : 'sunny'}
            label="Dark Mode Theme"
            rightComponent={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#CBD5E1', true: '#16A34A' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </FadeInView>

        {/* Preferences Section */}
        <FadeInView delay={200} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Preferences & Settings</Text>
          <Row
            icon="person-outline"
            label="Personal Details"
            onPress={() => router.push('/profile/personal-info')}
          />
          <Row
            icon="notifications-outline"
            label="Notification Alerts"
            onPress={() => router.push('/profile/notification-settings')}
          />
          <Row
            icon="mail-outline"
            label="Email Subscriptions"
            onPress={() => router.push('/profile/email-preferences')}
          />
        </FadeInView>

        {/* Support Section */}
        <FadeInView delay={250} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Support & Help</Text>
          <Row icon="help-circle-outline" label="Help Center" onPress={() => router.push('/profile/help')} />
          <Row icon="headset-outline" label="Contact Support" onPress={() => router.push('/profile/contact-support')} />
        </FadeInView>

        {/* Danger Action */}
        <FadeInView delay={300} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Row icon="log-out-outline" label="Sign Out" danger onPress={signOut} />
        </FadeInView>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0D1B3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  identity: {
    gap: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
  },
  email: {
    fontSize: 13,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  manageBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  manageBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  verificationList: {
    gap: 10,
    marginTop: 4,
  },
  vItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vItemContent: {
    flex: 1,
  },
  vItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  vItemSub: {
    fontSize: 12,
  },
  vDivider: {
    height: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 13,
  },
});
