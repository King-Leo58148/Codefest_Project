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

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
  danger = false,
}: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingsRowLeft}>
        <Ionicons name={icon} size={18} color={danger ? Colors.accentRed : Colors.textSecondary} />
        <Text style={[styles.settingsRowLabel, danger && styles.dangerText]}>{label}</Text>
      </View>
      <View style={styles.settingsRowRight}>
        {value && <Text style={styles.settingsRowValue}>{value}</Text>}
        {showArrow && (
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const push = (href: string) => router.push(href as any);

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.7}
              onPress={() => push('/profile/personal-info')}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.section}>
          <SettingsRow icon="person-outline" label="Personal information" onPress={() => push('/profile/personal-info')} />
          <View style={styles.divider} />
          <SettingsRow icon="card-outline" label="Bank account" onPress={() => push('/profile/bank-account')} />
          <View style={styles.divider} />
          <SettingsRow
            icon="card-outline"
            label="Ghana Card"
            value={user?.ghanaCardVerified ? 'Verified' : 'Pending'}
            onPress={() => push('/profile/verification?tab=ghana-card')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="phone-portrait-outline"
            label="MoMo Account"
            value={user?.momoVerified ? 'Verified' : 'Pending'}
            onPress={() => push('/profile/verification?tab=momo')}
          />
          <View style={styles.divider} />
          <SettingsRow icon="document-text-outline" label="Tax documents" onPress={() => push('/profile/tax-documents')} />
        </View>

        {/* Verification status */}
        <TouchableOpacity
          style={styles.verificationCard}
          onPress={() => push('/profile/verification')}
          activeOpacity={0.8}
        >
          <View style={styles.verificationItem}>
            <Ionicons
              name={user?.ghanaCardVerified ? 'checkmark-circle' : 'ellipse-outline'}
              size={18}
              color={user?.ghanaCardVerified ? Colors.accent : Colors.textMuted}
            />
            <Text style={styles.verificationText}>Ghana Card</Text>
          </View>
          <View style={styles.verificationItem}>
            <Ionicons
              name={user?.momoVerified ? 'checkmark-circle' : 'ellipse-outline'}
              size={18}
              color={user?.momoVerified ? Colors.accent : Colors.textMuted}
            />
            <Text style={styles.verificationText}>MoMo Account</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.section}>
          <SettingsRow icon="notifications-outline" label="Notifications" onPress={() => push('/profile/notification-settings')} />
          <View style={styles.divider} />
          <SettingsRow icon="mail-outline" label="Email preferences" onPress={() => push('/profile/email-preferences')} />
          <View style={styles.divider} />
          <SettingsRow icon="card-outline" label="Saved payment methods" onPress={() => push('/profile/payment-methods')} />
        </View>

        {/* Support */}
        <Text style={styles.sectionLabel}>Support</Text>
        <View style={styles.section}>
          <SettingsRow icon="help-circle-outline" label="Help center" onPress={() => push('/profile/help')} />
          <View style={styles.divider} />
          <SettingsRow icon="chatbubble-outline" label="Contact support" onPress={() => push('/profile/contact-support')} />
        </View>

        {/* Logout */}
        <View style={[styles.section, styles.logoutSection]}>
          <SettingsRow
            icon="log-out-outline"
            label="Log out"
            onPress={handleLogout}
            showArrow={false}
            danger
          />
        </View>

        <Text style={styles.version}>Nkɔso v1.0.0 · Made in Ghana</Text>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  profileHeader: {
    backgroundColor: Colors.surface,
    padding: 20,
    marginBottom: 20,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.borderLight,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 14,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutSection: {
    marginBottom: 12,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsRowLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  settingsRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingsRowValue: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 46,
  },
  dangerText: {
    color: Colors.accentRed,
  },
  verificationCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 20,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verificationText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  version: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
});
