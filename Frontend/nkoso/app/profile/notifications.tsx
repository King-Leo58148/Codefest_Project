import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';

interface NotifSection {
  section: string;
  items: { key: string; label: string; sub: string; icon: keyof typeof Ionicons.glyphMap }[];
}

const NOTIF_CONFIG: NotifSection[] = [
  {
    section: 'Investments',
    items: [
      { key: 'bid_accepted', label: 'Bid accepted', sub: 'When a business owner accepts your bid', icon: 'checkmark-circle-outline' },
      { key: 'bid_rejected', label: 'Bid rejected', sub: 'When a bid you placed is declined', icon: 'close-circle-outline' },
      { key: 'bid_countered', label: 'Counter offer', sub: 'When an owner proposes different terms', icon: 'swap-horizontal-outline' },
      { key: 'repayment_due', label: 'Repayment due', sub: 'Reminders before repayment dates', icon: 'calendar-outline' },
      { key: 'repayment_received', label: 'Repayment received', sub: 'When a return lands in your MoMo', icon: 'cash-outline' },
    ],
  },
  {
    section: 'Deals & pitches',
    items: [
      { key: 'deal_signed', label: 'Deal signed', sub: 'When all parties sign the deal', icon: 'document-text-outline' },
      { key: 'deal_disbursed', label: 'Funds disbursed', sub: 'When funds are released to the business', icon: 'arrow-up-circle-outline' },
      { key: 'new_pitch', label: 'New pitches', sub: 'When new businesses list on Nkɔso', icon: 'megaphone-outline' },
    ],
  },
  {
    section: 'Account',
    items: [
      { key: 'security_alert', label: 'Security alerts', sub: 'Sign-ins and suspicious activity', icon: 'shield-outline' },
      { key: 'promo', label: 'Promotions & news', sub: 'Nkɔso product updates and offers', icon: 'gift-outline' },
    ],
  },
];

export default function NotificationsScreen() {
  const defaultState: Record<string, boolean> = {};
  NOTIF_CONFIG.forEach((s) => s.items.forEach((i) => { defaultState[i.key] = i.key !== 'promo'; }));

  const [prefs, setPrefs] = useState<Record<string, boolean>>(defaultState);
  const [loading, setLoading] = useState(false);

  const toggle = (key: string) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    Alert.alert('Saved', 'Your notification preferences have been updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {NOTIF_CONFIG.map((section) => (
          <View key={section.section}>
            <Text style={styles.sectionLabel}>{section.section}</Text>
            <View style={styles.card}>
              {section.items.map((item, idx) => (
                <View key={item.key}>
                  <View style={styles.row}>
                    <View style={styles.rowLeft}>
                      <View style={styles.iconBox}>
                        <Ionicons name={item.icon} size={18} color={Colors.primary} />
                      </View>
                      <View style={styles.rowText}>
                        <Text style={styles.rowLabel}>{item.label}</Text>
                        <Text style={styles.rowSub}>{item.sub}</Text>
                      </View>
                    </View>
                    <Switch
                      value={prefs[item.key]}
                      onValueChange={() => toggle(item.key)}
                      trackColor={{ false: Colors.border, true: Colors.accent }}
                      thumbColor="#fff"
                    />
                  </View>
                  {idx < section.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        <Button title="Save preferences" onPress={handleSave} loading={loading} />
      </ScrollView>
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
  content: { padding: 20, gap: 8, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  rowSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 64 },
});
