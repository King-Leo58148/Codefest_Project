import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  type?: string;
  message: string;
  createdAt?: string;
  read: boolean;
  referenceId?: string;
}

type Filter = 'All' | 'Unread';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso?: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** Returns icon + tint colour for each notification type. */
function notifStyle(type?: string): { icon: keyof typeof Ionicons.glyphMap; bg: string; tint: string } {
  switch (type) {
    case 'BID_RECEIVED':
    case 'BID_PLACED':
      return { icon: 'pricetag-outline', bg: '#EFF6FF', tint: '#3B82F6' };
    case 'BID_ACCEPTED':
      return { icon: 'checkmark-circle-outline', bg: '#F0FDF4', tint: '#16A34A' };
    case 'BID_REJECTED':
    case 'BID_COUNTERED':
      return { icon: 'arrow-undo-outline', bg: '#FFF7ED', tint: '#EA580C' };
    case 'DEAL_SIGNED':
    case 'DEAL_CREATED':
      return { icon: 'document-text-outline', bg: '#F5F3FF', tint: '#7C3AED' };
    case 'PAYMENT_RECEIVED':
    case 'PAYMENT_CONFIRMED':
      return { icon: 'cash-outline', bg: '#F0FDF4', tint: '#16A34A' };
    case 'REPAYMENT_DUE':
    case 'REPAYMENT_COLLECTED':
      return { icon: 'calendar-outline', bg: '#FFF7ED', tint: '#D97706' };
    case 'PITCH_APPROVED':
    case 'PITCH_REJECTED':
      return { icon: 'megaphone-outline', bg: '#FEF2F2', tint: '#DC2626' };
    default:
      return { icon: 'notifications-outline', bg: Colors.borderLight, tint: Colors.textSecondary };
  }
}

/** Navigate to the relevant screen when a notification is tapped. */
function navigateFromNotification(notif: Notification) {
  if (!notif.referenceId) return;
  const type = notif.type ?? '';
  if (type.startsWith('BID')) {
    router.push(`/bid/${notif.referenceId}` as any);
  } else if (type.startsWith('DEAL') || type.startsWith('PAYMENT') || type.startsWith('REPAYMENT')) {
    router.push(`/deal/${notif.referenceId}` as any);
  } else if (type.startsWith('PITCH')) {
    router.push(`/pitch/${notif.referenceId}` as any);
  }
}

// ─── NotifRow ─────────────────────────────────────────────────────────────────

function NotifRow({
  item,
  onPress,
}: {
  item: Notification;
  onPress: () => void;
}) {
  const { icon, bg, tint } = notifStyle(item.type);

  return (
    <TouchableOpacity
      style={[styles.row, !item.read && styles.rowUnread]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Icon circle */}
      <View style={[styles.iconCircle, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={20} color={tint} />
      </View>

      {/* Content */}
      <View style={styles.rowBody}>
        <Text style={[styles.rowMessage, !item.read && styles.rowMessageBold]} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.rowTime}>{relativeTime(item.createdAt)}</Text>
      </View>

      {/* Unread dot */}
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('All');

  const {
    data: raw = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const notifications: Notification[] = (raw as any[]).map((n) => ({
    id: String(n.id),
    type: n.type ?? undefined,
    message: n.message ?? n.text ?? 'You have a new notification',
    createdAt: n.createdAt ?? undefined,
    read: Boolean(n.read),
    referenceId: n.referenceId ? String(n.referenceId) : undefined,
  }));

  const displayed =
    filter === 'Unread' ? notifications.filter((n) => !n.read) : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    },
  });

  const handlePress = useCallback(
    (item: Notification) => {
      if (!item.read) markReadMutation.mutate(item.id);
      navigateFromNotification(item);
    },
    [markReadMutation]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.title}>Notifications</Text>

        <TouchableOpacity
          onPress={() => markAllMutation.mutate()}
          disabled={markAllMutation.isPending || unreadCount === 0}
          activeOpacity={0.7}
          style={styles.markAllBtn}
        >
          <Text
            style={[
              styles.markAllText,
              (markAllMutation.isPending || unreadCount === 0) && styles.markAllDisabled,
            ]}
          >
            Mark all read
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Filter tabs ── */}
      <View style={styles.filterRow}>
        {(['All', 'Unread'] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
              {f}
              {f === 'Unread' && unreadCount > 0 ? `  ${unreadCount}` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── List ── */}
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 48 }} />
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item }) => (
            <NotifRow item={item} onPress={() => handlePress(item)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={40} color={Colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>
                {filter === 'Unread' ? 'All caught up!' : 'No notifications yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'Unread'
                  ? 'You have no unread notifications.'
                  : 'Investment activity and platform updates will appear here.'}
              </Text>
              {filter === 'Unread' && (
                <TouchableOpacity onPress={() => setFilter('All')} activeOpacity={0.8}>
                  <Text style={styles.emptyAction}>View all notifications</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginLeft: -38, // optical centre — compensates for the back button width
  },
  markAllBtn: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  markAllDisabled: {
    color: Colors.textMuted,
  },

  // Filter row
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.borderLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#ffffff',
  },

  // List
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  separator: {
    height: 8,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  rowUnread: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.15)',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowMessage: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  rowMessageBold: {
    fontWeight: '600',
  },
  rowTime: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
    flexShrink: 0,
  },

  // Empty state
  empty: {
    alignItems: 'center',
    paddingTop: 72,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyAction: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 4,
  },
});
