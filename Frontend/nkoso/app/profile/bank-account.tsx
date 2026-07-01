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
import { Colors } from '@/constants/Colors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const BANKS = ['GCB Bank', 'Ecobank Ghana', 'Absa Ghana', 'Stanbic Bank', 'Standard Chartered', 'Fidelity Bank'];

export default function BankAccountScreen() {
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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bank account</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>
              Your bank account is used for dividend payouts and deal returns. All transactions are
              processed securely through Paystack.
            </Text>
          </View>

          {/* Bank picker */}
          <Text style={styles.fieldLabel}>Bank name</Text>
          <TouchableOpacity
            style={styles.pickerBtn}
            onPress={() => setShowBankPicker((v) => !v)}
            activeOpacity={0.8}
          >
            <Ionicons name="business-outline" size={16} color={Colors.textMuted} />
            <Text style={[styles.pickerText, bankName ? styles.pickerTextFilled : {}]}>
              {bankName || 'Select your bank'}
            </Text>
            <Ionicons
              name={showBankPicker ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {showBankPicker && (
            <View style={styles.bankList}>
              {BANKS.map((bank) => (
                <TouchableOpacity
                  key={bank}
                  style={[styles.bankItem, bankName === bank && styles.bankItemActive]}
                  onPress={() => { setBankName(bank); setShowBankPicker(false); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.bankItemText, bankName === bank && styles.bankItemTextActive]}>
                    {bank}
                  </Text>
                  {bankName === bank && (
                    <Ionicons name="checkmark" size={16} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Input
            label="Account number"
            value={accountNumber}
            onChangeText={setAccountNumber}
            placeholder="0000000000"
            keyboardType="numeric"
            leftIcon="card-outline"
          />
          <Input
            label="Account name"
            value={accountName}
            onChangeText={setAccountName}
            placeholder="As it appears on your bank account"
            leftIcon="person-outline"
          />

          <View style={styles.secureNote}>
            <Ionicons name="lock-closed-outline" size={14} color={Colors.accent} />
            <Text style={styles.secureNoteText}>
              Your bank details are encrypted and never shared with third parties.
            </Text>
          </View>

          <Button title="Save bank account" onPress={handleSave} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  content: { padding: 20, paddingBottom: 40, gap: 4 },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.primary, lineHeight: 19 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
    marginBottom: 16,
  },
  pickerText: { flex: 1, fontSize: 15, color: Colors.textMuted },
  pickerTextFilled: { color: Colors.textPrimary },
  bankList: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
    marginTop: -12,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  bankItemActive: { backgroundColor: '#EFF6FF' },
  bankItemText: { fontSize: 14, color: Colors.textPrimary },
  bankItemTextActive: { fontWeight: '600', color: Colors.primary },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    marginTop: 4,
  },
  secureNoteText: { flex: 1, fontSize: 12, color: Colors.accent },
});
