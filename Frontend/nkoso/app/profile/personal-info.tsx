import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/store/themeStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getCurrentUser, updateProfile } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { buildProfileUpdate, didMomoChange } from '@/services/profileHelpers';

export default function PersonalInfoScreen() {
  const { isDark, colors } = useTheme();
  const { user, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [momoNumber, setMomoNumber] = useState(user?.momoNumber || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const momoChanged = useMemo(() => didMomoChange(user?.momoNumber, momoNumber), [user?.momoNumber, momoNumber]);

  const save = async () => {
    if (!name.trim()) return Alert.alert('Name required', 'Enter your display name.');
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) return Alert.alert('Password required', 'Enter your current password and confirm the new password.');
      if (newPassword !== confirmPassword) return Alert.alert('Passwords do not match', 'Enter matching new passwords.');
    }
    if (momoNumber.trim() && momoNumber.replace(/\D/g, '').length !== 10) return Alert.alert('Invalid MoMo number', 'Enter a 10-digit MoMo number.');
    setLoading(true);
    try {
      const updated = await updateProfile(buildProfileUpdate({ name, momoNumber, currentPassword, newPassword, confirmPassword }));
      const serverUser = await getCurrentUser().catch(() => updated);
      setUser(serverUser);
      setEditing(false);
      if (momoChanged) {
        Alert.alert('MoMo verification needed', 'Your changed MoMo number must be verified again.', [{ text: 'Verify now', onPress: () => router.replace('/profile/verification') }]);
      } else Alert.alert('Saved', 'Your personal information has been updated.');
    } catch (error) { Alert.alert('Could not save', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.icon}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Personal Information</Text>
          <TouchableOpacity onPress={() => setEditing((value) => !value)} style={styles.edit}>
            <Text style={[styles.editText, { color: isDark ? colors.accent : colors.primary }]}>{editing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Field label="Email address" value={user?.email || ''} icon="mail-outline" />
          <Field label="Account role" value={user?.role || ''} icon="business-outline" />
          {editing ? (
            <>
              <Input label="Display name" value={name} onChangeText={setName} leftIcon="person-outline" />
              <Input label="MoMo number" value={momoNumber} onChangeText={setMomoNumber} keyboardType="phone-pad" leftIcon="phone-portrait-outline" />
              {momoChanged ? <Text style={styles.note}>Changing this number requires MoMo verification again.</Text> : null}
              <Text style={[styles.subheading, { color: colors.textPrimary }]}>Change Password</Text>
              <Input label="Current password" value={currentPassword} onChangeText={setCurrentPassword} secure leftIcon="lock-closed-outline" />
              <Input label="New password" value={newPassword} onChangeText={setNewPassword} secure leftIcon="lock-closed-outline" />
              <Input label="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} secure leftIcon="lock-closed-outline" />
              <Button title="Save Changes" onPress={save} loading={loading} />
            </>
          ) : (
            <>
              <Field label="Display name" value={user?.name || ''} icon="person-outline" />
              <Field label="MoMo number" value={user?.momoNumber || 'Not added'} icon="phone-portrait-outline" />
              <Text style={[styles.hint, { color: colors.textSecondary }]}>Use Edit to update your display name, password, or MoMo number.</Text>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) {
  const { colors } = useTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.fieldValue, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
        <Ionicons name={icon} size={17} color={colors.textMuted} />
        <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    height: 62,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  icon: {
    width: 40,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },
  edit: {
    width: 52,
    alignItems: 'flex-end',
  },
  editText: {
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    gap: 14,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  fieldValue: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  value: {
    fontSize: 15,
    flex: 1,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
  },
  note: {
    fontSize: 13,
    color: '#B45309',
    lineHeight: 18,
  },
  subheading: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '700',
  },
});
