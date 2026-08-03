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
import { useTheme } from '@/store/themeStore';
import { Button } from '@/components/ui/Button';

interface NotifSection {
  section: string;
  items: { key: string; label: string; sub: string; icon: keyof typeof Ionicons.glyphMap }[];
}

const NOTIF_CONFIG: NotifSection[] = [
  {
    section: 'Investments',
    items: [
      { key: 'bid_accepted', label: 'Bid Accepted', sub: 'When a business owner accepts your bid', icon: 'checkmark-circle-outline' },
      { key: 'bid_rejected', label: 'Bid Rejected', sub: 'When a bid you placed is declined', icon: 'close-circle-outline' },
      { key: 'bid_countered', label: 'Counter Offer', sub: 'When an owner proposes different terms', icon: 'swap-horizontal-outline' },
      { key: 'repayment_due', label: 'Repayment Due', sub: 'Reminders before repayment dates', icon: 'calendar-outline' },
      { key: 'repayment_received', label: 'Repayment Received', sub: 'When a return lands in your MoMo', icon: 'cash-outline' },
    ],
  },
  {
    section: 'Deals & Pitches',
    items: [
      { key: 'deal_signed', label: 'Deal Signed', sub: 'When all parties sign the deal', icon: 'document-text-outline' },
      { key: 'deal_disbursed', label: 'Funds Disbursed', sub: 'When funds are released to the business', icon: 'arrow-up-circle-outline' },
      { key: 'new_pitch', label: 'New Pitches', sub: 'When new businesses list on Nkɔso', icon: 'megaphone-outline' },
    ],
  },
  {
    section: 'Account Security',
    items: [
      { key: 'security_alert', label: 'Security Alerts', sub: 'Sign-ins and security notifications', icon: 'shield-outline' },
      { key: 'promo', label: 'Promotions & Updates', sub: 'Nkɔso product updates and offers', icon: 'gift-outline' },
    ],
  },
];

export default function NotificationSettingsScreen() {
  const { isDark, colors } = useTheme();
  const defaultState: Record<string, boolean> = {};
  NOTIF_CONFIG.forEach((s) => s.items.forEach((i) => { defaultState[i.key] = i.key !== 'promo'; }));

  const [prefs, setPrefs] = useState<Record<string, boolean>>(defaultState);
  const [loading, setLoading] = useState(false);

  const toggle = (key: string) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    Alert.alert('Preferences Saved', 'Notification settings updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notification Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {NOTIF_CONFIG.map((sec) => (
          <View key={sec.section} style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{sec.section}</Text>

            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {sec.items.map((item, idx) => (
                <View
                  key={item.key}
                  style={[
                    styles.row,
                    idx < sec.items.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                  ]}
                >
                  <View style={[styles.iconBox, { backgroundColor: colors.surfaceSubtle }]}>
                    <Ionicons name={item.icon} size={20} color={isDark ? colors.accent : colors.primary} />
                  </View>

                  <View style={styles.textCol}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{item.label}</Text>
                    <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{item.sub}</Text>
                  </View>

                  <Switch
                    value={prefs[item.key] ?? false}
                    onValueChange={() => toggle(item.key)}
                    trackColor={{ false: isDark ? '#1E293B' : '#E2E8F0', true: '#16A34A' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        <Button
          title="Save Notification Settings"
          onPress={handleSave}
          loading={loading}
          style={{ marginTop: 12 }}
        />
      </ScrollView>
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
    gap: 20,
  },
  sectionBlock: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
