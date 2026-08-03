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

const getStatusBadgeConfig = (status: string) => {
  switch (status) {
    case 'ACTIVE':
    case 'FUNDED':
      return { label: 'Active Escrow', bg: '#DCFCE7', color: '#15803D', icon: 'shield-checkmark' as const };
    case 'MFI_APPROVED':
      return { label: 'MFI Approved', bg: '#D1FAE5', color: '#047857', icon: 'checkmark-done-circle' as const };
    case 'PENDING_SIGNATURES':
      return { label: 'Awaiting Signatures', bg: '#FEF3C7', color: '#B45309', icon: 'create-outline' as const };
    case 'PENDING_MFI':
      return { label: 'In MFI Audit', bg: '#DBEAFE', color: '#1E40AF', icon: 'document-text-outline' as const };
    default:
      return { label: status.replace(/_/g, ' '), bg: '#F1F5F9', color: '#475569', icon: 'ellipsis-horizontal' as const };
  }
};

function InvestorDealCard({ deal }: { deal: Deal }) {
  const statusCfg = getStatusBadgeConfig(deal.status);
  const returnTypeFormatted =
    deal.returnType === 'REVENUE_SHARE'
      ? 'Revenue Share'
      : deal.returnType === 'EQUITY'
      ? 'Equity Stake'
      : 'Fixed Return';

  const returnTypeColor =
    deal.returnType === 'EQUITY'
      ? '#059669'
      : deal.returnType === 'FIXED'
      ? '#2563EB'
      : '#D97706';

  const initials = (deal.businessName || 'D')[0].toUpperCase();

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={() => router.push(`/deal/${deal.id}`)}
      style={styles.contractCard}
    >
      {/* 1. Contract Top Header Ribbon */}
      <View style={styles.contractRibbon}>
        <View style={styles.ribbonLeft}>
          <Ionicons name="document-text-outline" size={13} color="#64748B" />
          <Text style={styles.ribbonCode}>
            AGREEMENT · NK-{deal.id.slice(0, 6).toUpperCase()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Ionicons name={statusCfg.icon} size={12} color={statusCfg.color} />
          <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>
            {statusCfg.label}
          </Text>
        </View>
      </View>

      {/* 2. Main Contract Body */}
      <View style={styles.contractBody}>
        {/* Parties Identity */}
        <View style={styles.partiesRow}>
          <View style={styles.avatarContainer}>
            <View style={styles.blueAvatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.badgeCheck}>
              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.partiesMeta}>
            <Text style={styles.businessTitle}>{deal.businessName || 'Business Investment'}</Text>
            <Text style={styles.investorMeta}>
              Owner: <Text style={styles.metaHighlight}>{deal.businessOwnerName || deal.ownerName || deal.userName || 'Business Owner'}</Text>
            </Text>
          </View>
        </View>

        {/* Financial Escrow Callout Box */}
        <View style={styles.escrowBox}>
          <View style={styles.capitalCol}>
            <Text style={styles.escrowLabel}>INVESTED CAPITAL</Text>
            <Text style={styles.capitalValue}>
              GH₵{deal.amount ? deal.amount.toLocaleString() : '0'}
            </Text>
          </View>

          <View style={styles.termsCol}>
            <View style={styles.termTag}>
              <Text style={[styles.termTagText, { color: returnTypeColor }]}>
                {returnTypeFormatted} ({deal.returnType === 'FIXED' ? `GH₵${deal.returnValue}` : `${deal.returnValue}%`})
              </Text>
            </View>
            <Text style={styles.timelineText}>{deal.timelineMonths} Months Duration</Text>
          </View>
        </View>

        {/* 3. Signature & Escrow Progress Bar */}
        <View style={styles.signaturesRow}>
          <View style={[styles.sigChip, deal.ownerSigned ? styles.sigDone : styles.sigPending]}>
            <Ionicons
              name={deal.ownerSigned ? 'checkmark-circle' : 'time-outline'}
              size={13}
              color={deal.ownerSigned ? '#16A34A' : '#D97706'}
            />
            <Text style={[styles.sigText, deal.ownerSigned ? styles.sigTextDone : styles.sigTextPending]}>
              {deal.ownerSigned ? 'Owner Signed' : 'Owner Signature Needed'}
            </Text>
          </View>

          <View style={[styles.sigChip, deal.investorSigned ? styles.sigDone : styles.sigPending]}>
            <Ionicons
              name={deal.investorSigned ? 'checkmark-circle' : 'time-outline'}
              size={13}
              color={deal.investorSigned ? '#16A34A' : '#D97706'}
            />
            <Text style={[styles.sigText, deal.investorSigned ? styles.sigTextDone : styles.sigTextPending]}>
              {deal.investorSigned ? 'Investor Signed' : 'Investor Signature Needed'}
            </Text>
          </View>
        </View>

        {/* 4. Action Footer Bar */}
        <View style={styles.actionFooter}>
          <TouchableOpacity
            style={styles.chatPillBtn}
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: deal.id } })}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubbles" size={14} color="#1D4ED8" />
            <Text style={styles.chatPillText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dealRoomBtn}
            onPress={() => router.push(`/deal/${deal.id}`)}
            activeOpacity={0.85}
          >
            <Text style={styles.dealRoomBtnText}>Enter Deal Room</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function InvestorDealsScreen() {
  const [filter, setFilter] = useState<DealFilter>('All');

  const { data: deals = [], isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['myDeals'],
    queryFn: () => getMyDeals(),
  });

  const activeDeals = useMemo(
    () => deals.filter(d => ACTIVE_STATUSES.includes(d.status)),
    [deals]
  );

  const filteredDeals = useMemo(() => {
    if (filter === 'All') return activeDeals;
    return activeDeals.filter(d => d.status === filter);
  }, [activeDeals, filter]);

  const totalInvested = useMemo(
    () => activeDeals.reduce((s, d) => s + d.amount, 0),
    [activeDeals]
  );

  const pendingSigsCount = useMemo(
    () => activeDeals.filter(d => d.status === 'PENDING_SIGNATURES').length,
    [activeDeals]
  );

  const fundedCount = useMemo(
    () => activeDeals.filter(d => d.status === 'FUNDED' || d.status === 'ACTIVE').length,
    [activeDeals]
  );

  const onRefresh = async () => {
    await refetch();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenState loading title="Loading deals portfolio" />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenState
          icon="alert-circle-outline"
          title="Could not load deals"
          detail={error instanceof Error ? error.message : 'Please try again.'}
          action="Retry"
          onPress={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* 1. Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Portfolio Deals</Text>
          <Text style={styles.subtitle}>Legally binding agreements & active portfolio.</Text>
        </View>
        <View style={styles.escrowBadge}>
          <Ionicons name="shield-checkmark" size={16} color="#10B981" />
          <Text style={styles.escrowBadgeText}>Protected</Text>
        </View>
      </View>

      {/* 2. Distinct Deep Navy Hero Capital Banner */}
      <View style={styles.heroBannerContainer}>
        <View style={styles.heroBanner}>
          <View style={styles.heroBannerTop}>
            <View>
              <Text style={styles.heroLabel}>TOTAL INVESTED CAPITAL</Text>
              <Text style={styles.heroValue}>GH₵{totalInvested.toLocaleString()}</Text>
            </View>
            <View style={styles.heroIconCircle}>
              <Ionicons name="briefcase" size={24} color="#10B981" />
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{activeDeals.length}</Text>
              <Text style={styles.heroStatLabel}>Active Deals</Text>
            </View>

            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatValue, { color: '#F59E0B' }]}>{pendingSigsCount}</Text>
              <Text style={styles.heroStatLabel}>Pending Sigs</Text>
            </View>

            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatValue, { color: '#10B981' }]}>{fundedCount}</Text>
              <Text style={styles.heroStatLabel}>Funded</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3. Filter Bar (Emerald & Slate Theme) */}
      <View style={styles.filterBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {DEAL_FILTERS.map((item) => {
            const isSelected = filter === item;
            const displayLabel =
              item === 'All'
                ? 'All Deals'
                : item === 'ACTIVE'
                ? 'Active'
                : item === 'PENDING_SIGNATURES'
                ? 'Pending Sigs'
                : item === 'PENDING_MFI'
                ? 'In MFI Review'
                : 'MFI Approved';

            return (
              <TouchableOpacity
                key={item}
                onPress={() => setFilter(item)}
                style={[
                  styles.filterPill,
                  isSelected ? styles.filterPillActive : styles.filterPillInactive,
                ]}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected ? styles.filterPillTextActive : styles.filterPillTextInactive,
                  ]}
                >
                  {displayLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. Contracts / Deals List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#0D1B3E" />
        }
      >
        {filteredDeals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="document-text-outline" size={32} color="#0D1B3E" />
            </View>
            <Text style={styles.emptyTitle}>No deals in this filter</Text>
            <Text style={styles.emptySubtitle}>
              Explore pitches to place bids and close deals.
            </Text>
          </View>
        ) : (
          filteredDeals.map((deal) => <InvestorDealCard key={deal.id} deal={deal} />)
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F1F5F9', // Crisp Slate Gray background
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  escrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  escrowBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },

  /* Hero Capital Banner */
  heroBannerContainer: {
    paddingHorizontal: 20,
    marginVertical: 6,
  },
  heroBanner: {
    backgroundColor: '#0D1B3E', // Navy Banner
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    shadowColor: '#0D1B3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  heroBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  heroValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  heroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 14,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },

  /* Filter Bar */
  filterBarContainer: {
    paddingVertical: 10,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
  },
  filterPillInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  filterPillTextInactive: {
    color: '#475569',
  },

  /* List & Contract Cards */
  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 16,
  },
  contractCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contractRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  ribbonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ribbonCode: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  contractBody: {
    padding: 16,
    gap: 14,
  },
  partiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  blueAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D1B3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  badgeCheck: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#16A34A',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partiesMeta: {
    flex: 1,
  },
  businessTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  investorMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  metaHighlight: {
    fontWeight: '700',
    color: '#0F172A',
  },

  /* Escrow Box */
  escrowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  capitalCol: {
    gap: 2,
  },
  escrowLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  capitalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  termsCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  termTag: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  termTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timelineText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Signatures Row */
  signaturesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sigChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  sigDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  sigPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  sigText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sigTextDone: {
    color: '#16A34A',
  },
  sigTextPending: {
    color: '#B45309',
  },

  /* Action Footer */
  actionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
  },
  chatPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  chatPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  dealRoomBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0D1B3E',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  dealRoomBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
});
