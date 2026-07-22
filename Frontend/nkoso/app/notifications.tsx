import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/services/api';

export default function NotificationsScreen() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getIconForType = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'DEAL_CREATED':
        return 'document-text-outline';
      case 'DEAL_SIGNED':
        return 'create-outline';
      case 'MFI_APPROVED':
        return 'shield-checkmark-outline';
      case 'PAYMENT_RECEIVED':
        return 'cash-outline';
      case 'MESSAGE_RECEIVED':
        return 'chatbubble-outline';
      default:
        return 'notifications-outline';
    }
  };

  const handlePress = (notification: any) => {
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }

    if (notification.referenceId) {
      if (notification.type === 'DEAL_CREATED' || notification.type === 'DEAL_SIGNED' || notification.type === 'MFI_APPROVED' || notification.type === 'PAYMENT_RECEIVED' || notification.type === 'MESSAGE_RECEIVED') {
        router.push(`/deal/${notification.referenceId}` as any);
      } else {
        // Fallback for other types that have a reference ID
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          onPress={() => markAllReadMutation.mutate()}
          activeOpacity={0.7}
          style={styles.markAllBtn}
        >
          <Ionicons name="checkmark-done" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="notifications-off-outline" size={32} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptyText}>You don't have any notifications right now.</Text>
          </View>
        ) : (
          notifications.map((notif: any) => (
            <TouchableOpacity
              key={notif.id}
              style={[styles.notificationCard, !notif.read && styles.unreadCard]}
              onPress={() => handlePress(notif)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, !notif.read && styles.unreadIconBox]}>
                <Ionicons
                  name={getIconForType(notif.type)}
                  size={20}
                  color={!notif.read ? Colors.primary : Colors.textSecondary}
                />
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifHeader}>
                  <Text style={[styles.notifTitle, !notif.read && styles.unreadText]}>
                    {notif.title}
                  </Text>
                  <Text style={styles.notifTime}>
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.notifMessage} numberOfLines={2}>
                  {notif.message}
                </Text>
              </View>
              {!notif.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  markAllBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  unreadCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadIconBox: {
    backgroundColor: '#E0E7FF',
  },
  notifContent: { flex: 1, justifyContent: 'center' },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notifTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginRight: 8,
  },
  unreadText: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  notifTime: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  notifMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
