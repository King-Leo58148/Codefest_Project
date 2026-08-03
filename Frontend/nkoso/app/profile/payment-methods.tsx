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
import { useTheme } from '@/store/themeStore';
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
  { id: '1', type: 'momo', label: 'MTN Mobile Money', detail: '024 *** 8821', isDefault: true },
  { id: '2', type: 'card', label: 'Visa Debit Card', detail: '**** **** **** 4221', isDefault: false },
];

export default function PaymentMethodsScreen() {
  const { isDark, colors } = useTheme();
  const [methods, setMethods] = useState<PaymentMethod[]>(INITIAL_METHODS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'momo' | 'card'>('momo');
  const [momoNumber, setMomoNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
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
    if (addType === 'momo' && !momoNumber.trim()) {
      Alert.alert('Required', 'Please enter a MoMo number.');
      return;
    }
    if (addType === 'card' && (!cardNumber.trim() || !cardName.trim())) {
      Alert.alert('Required', 'Please enter card number and holder name.');
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);

    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: addType,
      label: addType === 'momo' ? 'Mobile Money Account' : 'Debit Card',
      detail: addType === 'momo' ? momoNumber : `**** **** **** ${cardNumber.slice(-4)}`,
      isDefault: methods.length === 0,
    };

    setMethods((prev) => [...prev, newMethod]);
    setShowAddModal(false);
    setMomoNumber('');
    setCardNumber('');
    setCardName('');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Payment Methods</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="#16A34A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Linked Methods</Text>

        <View style={styles.methodsStack}>
          {methods.map((item) => (
            <View key={item.id} style={[styles.methodCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.methodTop}>
                <View style={[styles.typeIconBox, { backgroundColor: colors.surfaceSubtle }]}>
                  <Ionicons
                    name={item.type === 'momo' ? 'phone-portrait-outline' : 'card-outline'}
                    size={22}
                    color={isDark ? colors.accent : colors.primary}
                  />
                </View>

                <View style={styles.methodTextCol}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.methodLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                    {item.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>DEFAULT</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.methodDetail, { color: colors.textSecondary }]}>{item.detail}</Text>
                </View>
              </View>

              <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                {!item.isDefault ? (
                  <TouchableOpacity onPress={() => setDefault(item.id)}>
                    <Text style={[styles.footerBtnText, { color: isDark ? colors.accent : colors.primary }]}>Set as Default</Text>
                  </TouchableOpacity>
                ) : (
                  <View />
                )}

                <TouchableOpacity onPress={() => removeMethod(item.id)}>
                  <Text style={[styles.footerBtnText, { color: '#DC2626' }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Payment Method Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add Payment Method</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.typeSelector, { backgroundColor: colors.surfaceSubtle }]}>
              <TouchableOpacity
                style={[styles.typeTab, addType === 'momo' && { backgroundColor: isDark ? colors.accent : colors.primary }]}
                onPress={() => setAddType('momo')}
              >
                <Text style={[styles.typeTabText, { color: colors.textSecondary }, addType === 'momo' && { color: '#FFFFFF', fontWeight: '800' }]}>
                  Mobile Money
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeTab, addType === 'card' && { backgroundColor: isDark ? colors.accent : colors.primary }]}
                onPress={() => setAddType('card')}
              >
                <Text style={[styles.typeTabText, { color: colors.textSecondary }, addType === 'card' && { color: '#FFFFFF', fontWeight: '800' }]}>
                  Debit Card
                </Text>
              </TouchableOpacity>
            </View>

            {addType === 'momo' ? (
              <Input
                label="MoMo Phone Number"
                value={momoNumber}
                onChangeText={setMomoNumber}
                placeholder="e.g. 0241234567"
                keyboardType="phone-pad"
                leftIcon="phone-portrait-outline"
              />
            ) : (
              <>
                <Input
                  label="Card Number"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  placeholder="**** **** **** ****"
                  keyboardType="number-pad"
                  leftIcon="card-outline"
                />
                <Input
                  label="Cardholder Name"
                  value={cardName}
                  onChangeText={setCardName}
                  placeholder="Name on card"
                  leftIcon="person-outline"
                />
              </>
            )}

            <Button
              title="Add Payment Method"
              onPress={handleAdd}
              loading={saving}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>
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
  addBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  methodsStack: {
    gap: 12,
  },
  methodCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  methodTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTextCol: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  methodLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  defaultBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '800',
  },
  methodDetail: {
    fontSize: 13,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 16,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  typeSelector: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
