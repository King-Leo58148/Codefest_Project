import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { ScreenState } from '@/components/ui/ScreenState';
import { FadeInView } from '@/components/ui/FadeInView';
import { NotificationSkeleton } from '@/components/ui/Skeleton';
import { cardStyles } from '@/components/ui/Card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/services/api';

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationsScreen() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, isError, error, refetch, isRefetching } = useQuery({
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

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const getIconForType = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'DEAL_CREATED':
        return 'document-text';
      case 'DEAL_SIGNED':
        return 'create';
      case 'MFI_APPROVED':
        return 'shield-checkmark';
      case 'PAYMENT_RECEIVED':
        return 'cash';
      case 'MESSAGE_RECEIVED':
        return 'chatbubble-ellipses';
      default:
        return 'notifications';
    }
  };

  const getIconBgForType = (type: string, isRead: boolean) => {
    if (isRead) return { bg: Colors.borderLight, color: Colors.textMuted };
    switch (type) {
      case 'DEAL_CREATED':
        return { bg: '#EFF6FF', color: '#2563EB' };
      case 'DEAL_SIGNED':
        return { bg: '#FDF4FF', color: '#9333EA' };
      case 'MFI_APPROVED':
        return { bg: '#F0FDF4', color: '#16A34A' };
      case 'PAYMENT_RECEIVED':
        return { bg: '#FFFBEB', color: '#D97706' };
      case 'MESSAGE_RECEIVED':
        return { bg: '#F5F3FF', color: '#7C3AED' };
      default:
        return { bg: '#EFF6FF', color: Colors.primary };
    }
  };

  const handlePress = (notification: any) => {
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }

    const targetId = notification.chatId || notification.referenceId;
    if (targetId) {
      if (
        notification.type === 'DEAL_CREATED' ||
        notification.type === 'DEAL_SIGNED' ||
        notification.type === 'MFI_APPROVED' ||
        notification.type === 'PAYMENT_RECEIVED' ||
        notification.type === 'MESSAGE_RECEIVED'
      ) {
        router.push(`/chat/${targetId}` as any);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.72}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => markAllReadMutation.mutate()}
          activeOpacity={0.72}
          style={styles.markAllBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="checkmark-done" size={22} color={unreadCount > 0 ? Colors.primary : Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        {isLoading ? (
          <View style={{ gap: 8 }}>
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </View>
        ) : isError ? (
          <ScreenState
            icon="alert-circle-outline"
            title="Could not load notifications"
            detail={error instanceof Error ? error.message : 'Please try again.'}
            action="Retry"
            onPress={() => refetch()}
          />
        ) : notifications.length === 0 ? (
          <ScreenState
            icon="notifications-off-outline"
            title="All caught up"
            detail="You don't have any notifications right now."
          />
        ) : (
          notifications.map((notif: any, index: number) => {
            const iconStyle = getIconBgForType(notif.type, notif.read);
            return (
              <FadeInView key={notif.id} delay={index * 30}>
                <TouchableOpacity
                  style={[styles.notificationCard, !notif.read && styles.unreadCard]}
                  onPress={() => handlePress(notif)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.iconBox, { backgroundColor: iconStyle.bg }]}>
                    <Ionicons
                      name={getIconForType(notif.type)}
                      size={20}
                      color={iconStyle.color}
                    />
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifHeader}>
                      <Text style={[styles.notifTitle, !notif.read && styles.unreadText]} numberOfLines={1}>
                        {notif.title}
                      </Text>
                      <Text style={styles.notifTime}>
                        {formatRelativeTime(notif.createdAt)}
                      </Text>
                    </View>
                    <Text style={styles.notifMessage} numberOfLines={2}>
                      {notif.message}
                    </Text>
                  </View>
                  {!notif.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              </FadeInView>
            );
          })
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
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  markAllBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, lineHeight: 24, fontWeight: '700', color: Colors.textPrimary },
  countBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, gap: 10 },
  notificationCard: {
    ...cardStyles.surface,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 16,
    gap: 12,
    alignItems: 'center',
  },
  unreadCard: {
    backgroundColor: '#F8FAFC',
    borderColor: Colors.primary + '30',
    borderWidth: 1.5,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: { flex: 1, justifyContent: 'center' },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  notifTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginRight: 8,
  },
  unreadText: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  notifTime: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
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
  },
});
