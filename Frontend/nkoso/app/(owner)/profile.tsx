import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <Ionicons
          name={icon}
          size={18}
          color={danger ? Colors.accentRed : Colors.textSecondary}
        />
        <Text style={[styles.rowLabel, danger && { color: Colors.accentRed }]}>
          {label}
        </Text>
      </View>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {showArrow && (
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function OwnerProfileScreen() {
  const { user, logout } = useAuthStore();

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.name}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              <View style={styles.roleBadge}>
                <Ionicons name="business-outline" size={12} color={Colors.primary} />
                <Text style={styles.roleText}>Business Owner</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Verification */}
        <View style={styles.verificationCard}>
          <View style={styles.verificationItem}>
            <Ionicons
              name={user?.ghanaCardVerified ? 'checkmark-circle' : 'ellipse-outline'}
              size={18}
              color={user?.ghanaCardVerified ? Colors.accent : Colors.textMuted}
            />
            <Text style={styles.verificationText}>Ghana Card Verified</Text>
          </View>
          <View style={styles.verificationItem}>
            <Ionicons
              name={user?.momoVerified ? 'checkmark-circle' : 'ellipse-outline'}
              size={18}
              color={user?.momoVerified ? Colors.accent : Colors.textMuted}
            />
            <Text style={styles.verificationText}>MoMo Verified</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.section}>
          <SettingsRow icon="person-outline" label="Personal information" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsRow
            icon="phone-portrait-outline"
            label="MoMo account"
            value={user?.momoNumber ?? 'Not linked'}
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsRow icon="card-outline" label="Ghana Card" value="Verified" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsRow icon="document-text-outline" label="Business documents" onPress={() => {}} />
        </View>

        <Text style={styles.sectionLabel}>Business</Text>
        <View style={styles.section}>
          <SettingsRow icon="megaphone-outline" label="My pitches" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsRow icon="people-outline" label="Active deals" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsRow icon="analytics-outline" label="Performance" onPress={() => {}} />
        </View>

        <Text style={styles.sectionLabel}>Support</Text>
        <View style={styles.section}>
          <SettingsRow icon="help-circle-outline" label="Help center" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsRow icon="chatbubble-outline" label="Contact support" onPress={() => {}} />
        </View>

        <View style={[styles.section, { marginBottom: 12 }]}>
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
  profileCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    marginBottom: 16,
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
  profileInfo: { flex: 1, gap: 2 },
  name: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  email: { fontSize: 13, color: Colors.textSecondary },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
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
  verificationCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    gap: 10,
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 46,
  },
  version: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
});
