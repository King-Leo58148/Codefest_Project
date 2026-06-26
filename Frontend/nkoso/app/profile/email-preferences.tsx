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

interface EmailPref {
  key: string;
  label: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
  default: boolean;
  frequency?: string;
}

const EMAIL_PREFS: EmailPref[] = [
  {
    key: 'weekly_digest',
    label: 'Weekly digest',
    sub: 'A roundup of your portfolio and new pitches every Monday',
    icon: 'newspaper-outline',
    default: true,
    frequency: 'Every Monday',
  },
  {
    key: 'monthly_statement',
    label: 'Monthly statement',
    sub: 'Your full investment activity for the month',
    icon: 'calendar-number-outline',
    default: true,
    frequency: 'End of month',
  },
  {
    key: 'deal_updates',
    label: 'Deal updates',
    sub: 'Emails when a deal you are part of has a major milestone',
    icon: 'briefcase-outline',
    default: true,
  },
  {
    key: 'pitch_recommendations',
    label: 'Pitch recommendations',
    sub: 'Curated pitches based on your investment history',
    icon: 'bulb-outline',
    default: true,
    frequency: 'Up to 3× / week',
  },
  {
    key: 'bid_activity',
    label: 'Bid activity emails',
    sub: 'Email confirmation for every bid placed or received',
    icon: 'pricetag-outline',
    default: true,
  },
  {
    key: 'marketing',
    label: 'Marketing & promotions',
    sub: 'Product news, feature launches, and special offers',
    icon: 'megaphone-outline',
    default: false,
  },
];

export default function EmailPreferencesScreen() {
  const initState: Record<string, boolean> = {};
  EMAIL_PREFS.forEach((p) => { initState[p.key] = p.default; });

  const [prefs, setPrefs] = useState<Record<string, boolean>>(initState);
  const [loading, setLoading] = useState(false);

  const toggle = (key: string) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    Alert.alert('Saved', 'Your email preferences have been updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Email preferences</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Ionicons name="mail-outline" size={18} color={Colors.primary} />
          <Text style={styles.infoText}>
            Choose which emails Nkɔso sends you. Transactional emails required by law (receipts,
            security alerts) cannot be disabled.
          </Text>
        </View>

        <View style={styles.card}>
          {EMAIL_PREFS.map((pref, idx) => (
            <View key={pref.key}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconBox}>
                    <Ionicons name={pref.icon} size={18} color={Colors.primary} />
                  </View>
                  <View style={styles.rowText}>
                    <View style={styles.rowTitleRow}>
                      <Text style={styles.rowLabel}>{pref.label}</Text>
                      {pref.frequency && (
                        <View style={styles.freqBadge}>
                          <Text style={styles.freqText}>{pref.frequency}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.rowSub}>{pref.sub}</Text>
                  </View>
                </View>
                <Switch
                  value={prefs[pref.key]}
                  onValueChange={() => toggle(pref.key)}
                  trackColor={{ false: Colors.border, true: Colors.accent }}
                  thumbColor="#fff"
                />
              </View>
              {idx < EMAIL_PREFS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Button title="Save preferences" onPress={handleSave} loading={loading} />

        <Text style={styles.unsubNote}>
          To unsubscribe from all marketing emails, tap the unsubscribe link in any email footer.
        </Text>
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
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.primary, lineHeight: 19 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
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
  rowLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  rowText: { flex: 1 },
  rowTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  rowLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  freqBadge: {
    backgroundColor: Colors.borderLight,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  freqText: { fontSize: 11, color: Colors.textSecondary },
  rowSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 3, lineHeight: 16 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 64 },
  unsubNote: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 17,
  },
});
