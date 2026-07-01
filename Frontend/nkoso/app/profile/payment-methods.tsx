import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface PaymentMethod {
  id: string;
  type: 'momo' | 'card';
  label: string;
  detail: string;
  isDefault: boolean;
}

const INITIAL_METHODS: PaymentMethod[] = [
  { id: '1', type: 'momo', label: 'MTN MoMo', detail: '024 *** 8821', isDefault: true },
  { id: '2', type: 'card', label: 'Visa Debit', detail: '**** **** **** 4221', isDefault: false },
];

export default function PaymentMethodsScreen() {
  const [methods, setMethods] = useState<PaymentMethod[]>(INITIAL_METHODS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'momo' | 'card'>('momo');
  const [momoNumber, setMomoNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [saving, setSaving] = useState(false);

  const setDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  const removeMethod = (id: string) => {
    const target = methods.find((m) => m.id === id);
    if (target?.isDefault) {
      Alert.alert('Cannot remove', 'Set another method as default before removing this one.');
      return;
    }
    Alert.alert('Remove method', 'Are you sure you want to remove this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setMethods((prev) => prev.filter((m) => m.id !== id)),
      },
    ]);
  };

  const handleAdd = async () => {
    if (addType === 'momo' && momoNumber.replace(/\D/g, '').length < 10) {
      Alert.alert('Invalid', 'Enter a valid MoMo number.');
      return;
    }
    if (addType === 'card' && (!cardNumber || !cardName || !expiry)) {
      Alert.alert('Required', 'Fill in all card fields.');
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    const newMethod: PaymentMethod = {
      id: String(Date.now()),
      type: addType,
      label: addType === 'momo' ? 'MTN MoMo' : 'Visa Debit',
      detail:
        addType === 'momo'
          ? momoNumber.slice(0, 3) + ' *** ' + momoNumber.slice(-4)
          : '**** **** **** ' + cardNumber.replace(/\D/g, '').slice(-4),
      isDefault: false,
    };
    setMethods((prev) => [...prev, newMethod]);
    setShowAddModal(false);
    setMomoNumber('');
    setCardNumber('');
    setCardName('');
    setExpiry('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment methods</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Saved methods</Text>

        {methods.map((method) => (
          <View key={method.id} style={styles.methodCard}>
            <View style={styles.methodLeft}>
              <View
                style={[
                  styles.methodIcon,
                  { backgroundColor: method.type === 'momo' ? '#FFF7ED' : '#EFF6FF' },
                ]}
              >
                <Ionicons
                  name={method.type === 'momo' ? 'phone-portrait-outline' : 'card-outline'}
                  size={20}
                  color={method.type === 'momo' ? '#EA580C' : Colors.primary}
                />
              </View>
              <View>
                <Text style={styles.methodLabel}>{method.label}</Text>
                <Text style={styles.methodDetail}>{method.detail}</Text>
              </View>
            </View>

            <View style={styles.methodActions}>
              {method.isDefault ? (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setDefault(method.id)}
                  style={styles.setDefaultBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.setDefaultText}>Set default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => removeMethod(method.id)}
                style={styles.removeBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color={Colors.accentRed} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.addBtnText}>Add payment method</Text>
        </TouchableOpacity>

        <View style={styles.secureNote}>
          <Ionicons name="lock-closed-outline" size={14} color={Colors.accent} />
          <Text style={styles.secureNoteText}>
            Payments processed securely via Paystack and MTN MoMo APIs. Card data is tokenised and
            never stored on Nkɔso servers.
          </Text>
        </View>
      </ScrollView>

      {/* Add method modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add payment method</Text>

            {/* Type selector */}
            <View style={styles.typeRow}>
              {(['momo', 'card'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, addType === t && styles.typeBtnActive]}
                  onPress={() => setAddType(t)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={t === 'momo' ? 'phone-portrait-outline' : 'card-outline'}
                    size={16}
                    color={addType === t ? '#fff' : Colors.textSecondary}
                  />
                  <Text style={[styles.typeBtnText, addType === t && styles.typeBtnTextActive]}>
                    {t === 'momo' ? 'MTN MoMo' : 'Debit card'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {addType === 'momo' ? (
              <Input
                label="MoMo number"
                placeholder="024 XXX XXXX"
                value={momoNumber}
                onChangeText={setMomoNumber}
                keyboardType="phone-pad"
                leftIcon="phone-portrait-outline"
              />
            ) : (
              <>
                <Input
                  label="Card number"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  keyboardType="numeric"
                  leftIcon="card-outline"
                />
                <Input
                  label="Name on card"
                  placeholder="Kwame Mensah"
                  value={cardName}
                  onChangeText={setCardName}
                  leftIcon="person-outline"
                />
                <Input
                  label="Expiry (MM/YY)"
                  placeholder="MM / YY"
                  value={expiry}
                  onChangeText={setExpiry}
                  keyboardType="numeric"
                  leftIcon="calendar-outline"
                />
              </>
            )}

            <View style={styles.modalBtns}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowAddModal(false)}
                style={{ flex: 1 }}
              />
              <Button title="Add" onPress={handleAdd} loading={saving} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
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
  content: { padding: 20, gap: 12, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  methodCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  methodLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  methodIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  methodDetail: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  methodActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  defaultBadge: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  defaultBadgeText: { fontSize: 12, fontWeight: '600', color: Colors.accent },
  setDefaultBtn: {
    backgroundColor: Colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  setDefaultText: { fontSize: 12, fontWeight: '500', color: Colors.textPrimary },
  removeBtn: { padding: 6 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.border,
  },
  addBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  secureNoteText: { flex: 1, fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  typeBtnTextActive: { color: '#fff' },
  modalBtns: { flexDirection: 'row', gap: 12 },
});
