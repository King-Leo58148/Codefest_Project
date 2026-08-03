import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/store/themeStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const BANKS = ['GCB Bank', 'Ecobank Ghana', 'Absa Ghana', 'Stanbic Bank', 'Standard Chartered', 'Fidelity Bank'];

export default function BankAccountScreen() {
  const { isDark, colors } = useTheme();
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!bankName || !accountNumber || !accountName) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSaved(true);
    Alert.alert('Bank account saved', 'Your bank account has been linked successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Bank Account Details</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.infoBox, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={18} color={isDark ? colors.accent : colors.primary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Bank details are used for receiving investment returns or loan proceeds securely.
            </Text>
          </View>

          <Text style={[styles.label, { color: colors.textPrimary }]}>Select Commercial Bank</Text>
          <TouchableOpacity
            style={[styles.bankSelector, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
            onPress={() => setShowBankPicker(!showBankPicker)}
            activeOpacity={0.8}
          >
            <Text style={[styles.bankSelectorText, { color: bankName ? colors.textPrimary : colors.textMuted }]}>
              {bankName || 'Choose Bank'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {showBankPicker && (
            <View style={[styles.pickerList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {BANKS.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setBankName(b);
                    setShowBankPicker(false);
                  }}
                >
                  <Text style={[styles.pickerText, { color: colors.textPrimary }]}>{b}</Text>
                  {bankName === b && <Ionicons name="checkmark" size={16} color="#16A34A" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Input
            label="Account Number"
            value={accountNumber}
            onChangeText={setAccountNumber}
            placeholder="e.g. 1041123456789"
            keyboardType="number-pad"
            leftIcon="card-outline"
          />

          <Input
            label="Account Holder Name"
            value={accountName}
            onChangeText={setAccountName}
            placeholder="Name as it appears on bank statement"
            leftIcon="person-outline"
          />

          <Button
            title="Link Bank Account"
            onPress={handleSave}
            loading={loading}
            style={{ marginTop: 12 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: -8,
  },
  bankSelector: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankSelectorText: {
    fontSize: 15,
    fontWeight: '500',
  },
  pickerList: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: -8,
  },
  pickerItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
