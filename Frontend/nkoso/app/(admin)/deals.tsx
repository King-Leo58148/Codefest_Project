import React from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/store/themeStore';
import { approveMfiDeal, getAdminDeals, rejectMfiDeal } from '@/services/api';
import type { Deal } from '@/types';

const REVIEW_STATUSES = ['PENDING_MFI', 'PAYMENT_PENDING', 'ACTIVE'] as const;

function showError(error: unknown, fallbackMessage: string) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  Alert.alert('Action Failed', message);
}

function State({
  icon,
  title,
  action,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.state}>
      <Ionicons name={icon} size={42} color={colors.textMuted} />
      <Text style={[styles.stateText, { color: colors.textPrimary }]}>{title}</Text>
      {action && onPress ? (
        <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
          <Text style={styles.actionBtnText}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function AdminDealsScreen() {
  const { isDark, colors } = useTheme();
  const queryClient = useQueryClient();

  const {
    data: deals = [],
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['adminDeals'],
    queryFn: getAdminDeals,
  });

  const approveMutation = useMutation({
    mutationFn: approveMfiDeal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminDeals'] }),
    onError: (error) => showError(error, 'Could not approve MFI review.'),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectMfiDeal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminDeals'] }),
    onError: (error) => showError(error, 'Could not reject this deal.'),
  });

  const visibleDeals = deals.filter((deal) => REVIEW_STATUSES.includes(deal.status as any));
  const busyDealId = approveMutation.variables ?? rejectMutation.variables;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>MFI Workflow</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Review signed deals before investor payment</Text>
      </View>

      {isLoading ? (
        <State icon="hourglass-outline" title="Loading deals" />
      ) : isError ? (
        <State icon="alert-circle-outline" title="Could not load deals" action="Retry" onPress={() => refetch()} />
      ) : visibleDeals.length === 0 ? (
        <State icon="checkmark-circle-outline" title="No deals awaiting MFI review" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={isDark ? '#38BDF8' : '#0D1B3E'} />
          }
        >
          {visibleDeals.map((deal: Deal) => {
            const isPendingMfi = deal.status === 'PENDING_MFI';
            const busy = busyDealId === deal.id;

            return (
              <View key={deal.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.businessName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {deal.businessName || 'Business Deal'}
                    </Text>
                    <Text style={[styles.contractId, { color: colors.textSecondary }]}>Contract #{deal.id.slice(0, 8)}</Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: isPendingMfi ? (isDark ? '#451A03' : '#FEF3C7') : (isDark ? '#052E16' : '#DCFCE7') }]}>
                    <Text style={[styles.statusBadgeText, { color: isPendingMfi ? (isDark ? '#FBBF24' : '#B45309') : (isDark ? '#4ADE80' : '#15803D') }]}>
                      {deal.status.replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>

                <View style={[styles.metrics, { backgroundColor: colors.surfaceSubtle }]}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Amount</Text>
                    <Text style={[styles.metricValue, { color: colors.textPrimary }]}>GH₵{deal.amount?.toLocaleString()}</Text>
                  </View>
                  <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Return Terms</Text>
                    <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{deal.returnType} ({deal.returnValue}%)</Text>
                  </View>
                </View>

                {isPendingMfi ? (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.btn, styles.rejectBtn, busy && styles.disabled]}
                      onPress={() => rejectMutation.mutate(deal.id)}
                      disabled={busy}
                    >
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.btn, styles.approveBtn, busy && styles.disabled]}
                      onPress={() => approveMutation.mutate(deal.id)}
                      disabled={busy}
                    >
                      {busy ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.approveText}>Approve MFI</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.viewBtn, { borderColor: colors.border }]}
                    onPress={() => router.push(`/deal/${deal.id}`)}
                  >
                    <Text style={[styles.viewBtnText, { color: colors.textPrimary }]}>Open Deal Room</Text>
                  </TouchableOpacity>
                )}
              </View>
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
  content: {
    padding: 20,
    paddingBottom: 100,
    gap: 16,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  stateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  businessName: {
    fontSize: 16,
    fontWeight: '800',
  },
  contractId: {
    fontSize: 11,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 10,
    borderRadius: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtn: {
    backgroundColor: '#16A34A',
  },
  approveText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  rejectBtn: {
    backgroundColor: '#FEE2E2',
  },
  rejectText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 12,
  },
  viewBtn: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
});
