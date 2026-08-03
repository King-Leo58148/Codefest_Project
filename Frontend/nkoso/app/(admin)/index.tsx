import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/store/themeStore';

export default function AdminDashboardScreen() {
  const { isDark, colors, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Admin Portal</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Overview of platform activity</Text>
            </View>

            <TouchableOpacity
              style={[styles.themeBtn, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
              onPress={toggleTheme}
            >
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={isDark ? '#F59E0B' : '#0F172A'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="document-text" size={24} color={isDark ? colors.accent : colors.primary} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending Pitches</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="people" size={24} color={isDark ? colors.accent : colors.primary} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending Verifications</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="briefcase" size={24} color={isDark ? colors.accent : colors.primary} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Deals</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="cash" size={24} color={isDark ? colors.accent : colors.primary} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>---</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Platform Volume</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
          <Text style={{ color: colors.textMuted }}>No recent activity to show.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    gap: 20,
  },
  header: {
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
});
