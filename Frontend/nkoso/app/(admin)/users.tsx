import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/store/themeStore';

export default function AdminUsersScreen() {
  const { isDark, colors } = useTheme();
  const users: any[] = [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>User Management</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Review user accounts and verifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {users.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="people-outline" size={36} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Users Registered</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>User accounts and identity verifications will appear here.</Text>
          </View>
        ) : (
          users.map((user) => (
            <View key={user.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={[styles.name, { color: colors.textPrimary }]}>{user.name}</Text>
                  <Text style={[styles.role, { color: colors.textSecondary }]}>{user.role.replace('_', ' ')}</Text>
                </View>
              </View>
              
              <View style={styles.statusRow}>
                <View style={user.status === 'VERIFIED' ? styles.badgeSuccess : styles.badgeWarning}>
                  <Text style={user.status === 'VERIFIED' ? styles.badgeTextSuccess : styles.badgeTextWarning}>
                    {user.status}
                  </Text>
                </View>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>View Profile</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyBox: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 6,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D1B3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  userDetails: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
  },
  role: {
    fontSize: 12,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTextSuccess: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTextWarning: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '800',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
