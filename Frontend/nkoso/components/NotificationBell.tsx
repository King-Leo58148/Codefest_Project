import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getUnreadNotificationCount } from '@/services/api';
import { Colors } from '@/constants/Colors';

export function NotificationBell() {
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const unreadCount = data?.unread || 0;

  return (
    <TouchableOpacity
      style={styles.bellBtn}
      activeOpacity={0.7}
      onPress={() => router.push('/notifications')}
    >
      <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
