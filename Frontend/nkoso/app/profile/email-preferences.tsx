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
    label: 'Weekly Digest',
    sub: 'A roundup of your portfolio and new pitches every Monday',
    icon: 'newspaper-outline',
    default: true,
    frequency: 'Every Monday',
  },
  {
    key: 'monthly_statement',
    label: 'Monthly Statement',
    sub: 'Your full investment activity and returns summary for the month',
    icon: 'calendar-number-outline',
    default: true,
    frequency: 'End of month',
  },
  {
    key: 'deal_updates',
    label: 'Deal Milestone Updates',
    sub: 'Emails when a deal you are part of has a major milestone or payback',
    icon: 'briefcase-outline',
    default: true,
  },
  {
    key: 'pitch_recommendations',
    label: 'Pitch Recommendations',
    sub: 'Curated business pitches tailored to your investment preferences',
    icon: 'bulb-outline',
    default: true,
    frequency: 'Up to 3× / week',
  },
  {
    key: 'bid_activity',
    label: 'Bid Activity Alerts',
    sub: 'Immediate emails when a bid is accepted, countered, or rejected',
    icon: 'notifications-outline',
    default: true,
  },
  {
    key: 'marketing',
    label: 'Nkɔso News & Announcements',
    sub: 'Product updates, webinars, and platform news',
    icon: 'megaphone-outline',
    default: false,
  },
];

export default function EmailPreferencesScreen() {
  const { isDark, colors } = useTheme();
  const defaultState: Record<string, boolean> = {};
  EMAIL_PREFS.forEach((p) => { defaultState[p.key] = p.default; });

  const [prefs, setPrefs] = useState<Record<string, boolean>>(defaultState);
  const [loading, setLoading] = useState(false);

  const toggle = (key: string) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    Alert.alert('Preferences Saved', 'Email preferences updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Email Preferences</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoBox, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
          <Ionicons name="mail-unread-outline" size={20} color={isDark ? colors.accent : colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Control which email notifications and summaries you receive in your inbox.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {EMAIL_PREFS.map((item, idx) => (
            <View
              key={item.key}
              style={[
                styles.row,
                idx < EMAIL_PREFS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.surfaceSubtle }]}>
                <Ionicons name={item.icon} size={20} color={isDark ? colors.accent : colors.primary} />
              </View>

              <View style={styles.textCol}>
                <View style={styles.labelRow}>
                  <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{item.label}</Text>
                  {item.frequency ? (
                    <Text style={[styles.freqBadge, { backgroundColor: colors.surfaceSubtle, color: colors.textSecondary }]}>
                      {item.frequency}
                    </Text>
                  ) : null}
                </View>
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

        <Button
          title="Save Email Preferences"
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
    gap: 16,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  card: {
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  freqBadge: {
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  itemSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
});
