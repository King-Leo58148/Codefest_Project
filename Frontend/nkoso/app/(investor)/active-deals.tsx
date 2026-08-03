import React, { useState, useMemo } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { getMyDeals } from '@/services/api';
import type { Deal } from '@/types';

const DEAL_FILTERS = ['All', 'ACTIVE', 'PENDING_SIGNATURES', 'PENDING_MFI', 'MFI_APPROVED'] as const;
type DealFilter = typeof DEAL_FILTERS[number];

const ACTIVE_STATUSES = [
  'PENDING_SIGNATURES', 'PENDING_MFI', 'MFI_APPROVED',
  'PAYMENT_PENDING', 'FUNDED', 'ACTIVE',
];

const getStatusBadgeConfig = (status: string, isDark: boolean) => {
  switch (status) {
    case 'ACTIVE':
    case 'FUNDED':
      return { label: 'Active Escrow', bg: isDark ? '#052E16' : '#DCFCE7', color: isDark ? '#4ADE80' : '#15803D', icon: 'shield-checkmark' as const };
    case 'MFI_APPROVED':
      return { label: 'MFI Approved', bg: isDark ? '#064E3B' : '#D1FAE5', color: isDark ? '#34D399' : '#047857', icon: 'checkmark-done-circle' as const };
    case 'PENDING_SIGNATURES':
      return { label: 'Awaiting Signatures', bg: isDark ? '#451A03' : '#FEF3C7', color: isDark ? '#FBBF24' : '#B45309', icon: 'create-outline' as const };
    case 'PENDING_MFI':
      return { label: 'In MFI Audit', bg: isDark ? '#172554' : '#DBEAFE', color: isDark ? '#60A5FA' : '#1E40AF', icon: 'document-text-outline' as const };
    default:
      return { label: status.replace(/_/g, ' '), bg: isDark ? '#1E293B' : '#F1F5F9', color: isDark ? '#94A3B8' : '#475569', icon: 'ellipsis-horizontal' as const };
  }
};

function InvestorDealCard({ deal }: { deal: Deal }) {
  const { isDark, colors } = useTheme();
  const statusCfg = getStatusBadgeConfig(deal.status, isDark);
  const returnTypeFormatted =
    deal.returnType === 'REVENUE_SHARE'
      ? 'Revenue Share'
      : deal.returnType === 'EQUITY'
      ? 'Equity Stake'
      : 'Fixed Return';

  const returnTypeColor =
    deal.returnType === 'EQUITY'
      ? (isDark ? '#34D399' : '#059669')
      : deal.returnType === 'FIXED'
      ? (isDark ? '#60A5FA' : '#2563EB')
      : (isDark ? '#FBBF24' : '#D97706');

  const initials = (deal.businessName || 'D')[0].toUpperCase();

  return (
    <TouchableOpacity
      style={[styles.dealCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push(`/deal/${deal.id}`)}
      activeOpacity={0.88}
    >
      <View style={styles.dealHeaderRow}>
        <View style={styles.dealAvatarGroup}>
          <View style={styles.dealAvatar}>
            <Text style={styles.dealAvatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={[styles.dealBusinessName, { color: colors.textPrimary }]} numberOfLines={1}>
              {deal.businessName || 'Investment Deal'}
            </Text>
            <Text style={[styles.dealContractId, { color: colors.textSecondary }]}>Contract #{deal.id.slice(0, 8)}</Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Ionicons name={statusCfg.icon} size={13} color={statusCfg.color} />
          <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>
            {statusCfg.label}
          </Text>
        </View>
      </View>

      <View style={[styles.dealMetricsBox, { backgroundColor: colors.surfaceSubtle }]}>
        <View style={styles.metricCol}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>CAPITAL DEPLOYED</Text>
          <Text style={[styles.metricValuePrimary, { color: colors.textPrimary }]}>GH₵{deal.amount.toLocaleString()}</Text>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
        <View style={styles.metricCol}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>TERMS / RETURN</Text>
          <Text style={[styles.metricValueReturn, { color: returnTypeColor }]}>
            {returnTypeFormatted} ({deal.returnValue}%)
          </Text>
        </View>
      </View>

      <View style={styles.dealFooterRow}>
        <View style={styles.dateGroup}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : 'Active Contract'}
          </Text>
        </View>

        <View style={styles.actionGroupRow}>
          <TouchableOpacity
            style={styles.repayScheduleLink}
            onPress={() => router.push(`/repayments/${deal.pitchId || deal.id}` as any)}
          >
            <Ionicons name="time" size={14} color="#16A34A" />
            <Text style={styles.repayScheduleLinkText}>Payback Schedule</Text>
          </TouchableOpacity>
          <View style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>View Agreement</Text>
            <Ionicons name="chevron-forward" size={14} color="#16A34A" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ActiveDealsScreen() {
  const { isDark, colors } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<DealFilter>('All');

  const {
    data: deals = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['myDeals'],
    queryFn: () => getMyDeals(),
  });

  const activeDealsList = useMemo(() => {
    return deals.filter((d) => ACTIVE_STATUSES.includes(d.status));
  }, [deals]);

  const filteredDeals = useMemo(() => {
    if (selectedFilter === 'All') return activeDealsList;
    return activeDealsList.filter((d) => d.status === selectedFilter);
  }, [activeDealsList, selectedFilter]);

  const totalCapitalCommitted = useMemo(() => {
    return activeDealsList.reduce((sum, d) => sum + d.amount, 0);
  }, [activeDealsList]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <ScreenState loading title="Loading deals portfolio..." />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <ScreenState
          icon="alert-circle-outline"
          title="Could not load deals"
          detail={(error as Error)?.message || 'Check connection'}
          action="Try Again"
          onPress={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* 1. Header Navigation */}
      <View style={[styles.headerNav, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Deals Portfolio</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Active equity & return commitments</Text>
        </View>
        <TouchableOpacity style={styles.refreshIconBtn} onPress={() => refetch()}>
          <Ionicons name="refresh" size={18} color="#16A34A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={isDark ? '#38BDF8' : '#0D1B3E'} />
        }
      >
        {/* 2. Hero Portfolio Stat Card */}
        <View style={[styles.heroStatCard, { backgroundColor: isDark ? '#0F1A34' : '#0D1B3E' }]}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroChip}>
              <View style={styles.heroPulseDot} />
              <Text style={styles.heroChipText}>ACTIVE CAPITAL DEPLOYED</Text>
            </View>
            <Text style={styles.heroActiveCountText}>
              {activeDealsList.length} Active Contracts
            </Text>
          </View>

          <Text style={styles.heroCapitalVal}>GH₵{totalCapitalCommitted.toLocaleString()}</Text>
          <Text style={styles.heroCapitalSub}>Escrowed across active business deals</Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatVal}>
                {activeDealsList.filter((d) => d.status === 'ACTIVE' || d.status === 'FUNDED').length}
              </Text>
              <Text style={styles.heroStatLabel}>Funded Deals</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatVal}>
                {activeDealsList.filter((d) => d.status === 'PENDING_SIGNATURES').length}
              </Text>
              <Text style={styles.heroStatLabel}>Pending Signatures</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatVal}>
                {activeDealsList.filter((d) => d.status === 'PENDING_MFI' || d.status === 'MFI_APPROVED').length}
              </Text>
              <Text style={styles.heroStatLabel}>In MFI Audit</Text>
            </View>
          </View>
        </View>

        {/* 3. Filter Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {DEAL_FILTERS.map((filter) => {
            const active = selectedFilter === filter;
            const label = filter === 'All' ? 'All Active' : filter.replace(/_/g, ' ');
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                  active && { backgroundColor: isDark ? colors.accent : colors.primary, borderColor: isDark ? colors.accent : colors.primary },
                ]}
                onPress={() => setSelectedFilter(filter)}
                activeOpacity={0.82}
              >
                <Text style={[styles.filterPillText, { color: colors.textSecondary }, active && { color: '#FFFFFF', fontWeight: '800' }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 4. Deals Stack */}
        {filteredDeals.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="briefcase-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Deals Found</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              {selectedFilter === 'All'
                ? 'Your accepted bids and signed contracts will show up here.'
                : `No active contracts under ${selectedFilter.replace(/_/g, ' ')}.`}
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.push('/(investor)/explore')}
            >
              <Text style={styles.exploreBtnText}>Explore Pitches to Bid</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.dealsStack}>
            {filteredDeals.map((deal) => (
              <InvestorDealCard key={deal.id} deal={deal} />
            ))}
          </View>
        )}

        <View style={{ height: 36 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  headerNav: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },
  refreshIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  heroStatCard: {
    borderRadius: 24,
    padding: 20,
    marginTop: 16,
    shadowColor: '#0D1B3E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  heroChipText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  heroActiveCountText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  heroCapitalVal: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 12,
    letterSpacing: -0.8,
  },
  heroCapitalSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  filterScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dealsStack: {
    gap: 14,
  },
  dealCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  dealHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dealAvatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dealAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D1B3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  dealBusinessName: {
    fontSize: 15,
    fontWeight: '800',
  },
  dealContractId: {
    fontSize: 11,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  dealMetricsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 14,
    padding: 12,
  },
  metricCol: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
  },
  metricValuePrimary: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  metricValueReturn: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
  },
  dealFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
  },
  actionGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  repayScheduleLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  repayScheduleLinkText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  emptyContainer: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 6,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
  },
  exploreBtn: {
    marginTop: 8,
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
