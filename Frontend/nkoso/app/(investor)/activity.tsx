import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { ActivityItem } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { getActivity } from '@/services/api';
import { ActivityIndicator } from 'react-native';

function ActivityRow({ item }: { item: ActivityItem }) {
  const isInvestment = item.type === 'investment_completed';
  const isDividend = item.type === 'dividend_received';
  const isUpdate = item.type === 'business_update';

  return (
    <View style={styles.row}>
      <View style={styles.iconWrapper}>
        {isUpdate ? (
          <Image source={{ uri: item.imageUrl }} style={styles.businessImg} />
        ) : (
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isDividend
                  ? '#F0FDF4'
                  : isInvestment
                  ? '#FFF7ED'
                  : Colors.borderLight,
              },
            ]}
          >
            <Ionicons
              name={isDividend ? 'cash-outline' : 'trending-up-outline'}
              size={18}
              color={isDividend ? Colors.accent : '#EA580C'}
            />
          </View>
        )}
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>
          {isUpdate ? item.businessName : item.description}
        </Text>
        {isUpdate && (
          <Text style={styles.rowDesc} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {!isUpdate && (
          <Text style={styles.rowBusiness}>{item.businessName}</Text>
        )}
        <Text style={styles.rowDate}>{item.date}</Text>
      </View>
      {item.amount !== undefined && (
        <Text
          style={[
            styles.amount,
            { color: item.isCredit ? Colors.accent : Colors.textPrimary },
          ]}
        >
          {item.isCredit ? '+' : '-'}GH₵{item.amount.toLocaleString()}
        </Text>
      )}
    </View>
  );
}

export default function ActivityScreen() {
  const { data: activity = [], isLoading } = useQuery({
    queryKey: ['activity'],
    queryFn: () => getActivity(),
  });

  const grouped: { label: string; items: ActivityItem[] }[] = [];
  const seenLabels = new Set<string>();

  for (const item of activity) {
    if (item.monthLabel && !seenLabels.has(item.monthLabel)) {
      seenLabels.add(item.monthLabel);
      grouped.push({ label: item.monthLabel, items: [] });
    }
    grouped[grouped.length - 1]?.items.push(item);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={activity}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <>
              {item.monthLabel && (
                <Text style={styles.monthLabel}>{item.monthLabel}</Text>
              )}
              <ActivityRow item={item} />
            </>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="pulse-outline" size={44} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No activity yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  businessImg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  rowDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  rowBusiness: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  rowDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
