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
import { useTheme } from '@/store/themeStore';
import { ScreenState } from '@/components/ui/ScreenState';
import { FadeInView } from '@/components/ui/FadeInView';
import { NotificationSkeleton } from '@/components/ui/Skeleton';
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
  const { isDark, colors } = useTheme();
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
    if (isRead) return { bg: colors.surfaceSubtle, color: colors.textMuted };
    switch (type) {
      case 'DEAL_CREATED':
        return { bg: isDark ? '#172554' : '#EFF6FF', color: isDark ? '#60A5FA' : '#2563EB' };
      case 'DEAL_SIGNED':
        return { bg: isDark ? '#3B0764' : '#F3E8FF', color: isDark ? '#C084FC' : '#9333EA' };
      case 'MFI_APPROVED':
        return { bg: isDark ? '#064E3B' : '#ECFDF5', color: isDark ? '#34D399' : '#16A34A' };
      case 'PAYMENT_RECEIVED':
        return { bg: isDark ? '#052E16' : '#F0FDF4', color: isDark ? '#4ADE80' : '#15803D' };
      case 'MESSAGE_RECEIVED':
        return { bg: isDark ? '#451A03' : '#FFF7ED', color: isDark ? '#FBBF24' : '#EA580C' };
      default:
        return { bg: isDark ? '#172554' : '#EFF6FF', color: isDark ? '#60A5FA' : '#2563EB' };
    }
  };

  const handleNotificationPress = (notification: any) => {
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.targetScreen) {
      router.push(notification.targetScreen as any);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={{ flex: 1, padding: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <NotificationSkeleton key={i} />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScreenState
          icon="alert-circle-outline"
          title="Could not load notifications"
          detail={(error as Error)?.message || 'Check your connection'}
          action="Try Again"
          onPress={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity
            onPress={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <Text style={styles.markAllReadText}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {notifications.length === 0 ? (
        <ScreenState
          icon="notifications-off-outline"
          title="No notifications yet"
          detail="You'll be notified when there's an update on your bids, pitches, or deals."
        />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={isDark ? '#38BDF8' : '#0D1B3E'} />
          }
        >
          {notifications.map((n: any, index: number) => {
            const iconInfo = getIconBgForType(n.type, n.read);
            return (
              <FadeInView key={n.id || index} delay={index * 40}>
                <TouchableOpacity
                  style={[
                    styles.notificationCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    !n.read && { backgroundColor: isDark ? '#112244' : '#F0F9FF', borderColor: isDark ? '#1E3A8A' : '#BAE6FD' },
                  ]}
                  onPress={() => handleNotificationPress(n)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconContainer, { backgroundColor: iconInfo.bg }]}>
                    <Ionicons name={getIconForType(n.type)} size={20} color={iconInfo.color} />
                  </View>

                  <View style={styles.contentContainer}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.title, { color: colors.textPrimary }, !n.read && styles.unreadTitle]}>
                        {n.title}
                      </Text>
                      {!n.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={[styles.message, { color: colors.textSecondary }]}>{n.message}</Text>
                    <Text style={[styles.timestamp, { color: colors.textMuted }]}>{formatRelativeTime(n.createdAt)}</Text>
                  </View>

                  {n.targetScreen && (
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={styles.chevron} />
                  )}
                </TouchableOpacity>
              </FadeInView>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  markAllReadText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  scrollContent: {
    padding: 16,
    gap: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '800',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 2,
  },
  chevron: {
    alignSelf: 'center',
  },
});
