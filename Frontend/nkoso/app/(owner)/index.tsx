import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { ScreenState } from '@/components/ui/ScreenState';
import { cardStyles } from '@/components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import { getMyPitches, getBidsForPitch, getMyDeals, getNotifications } from '@/services/api';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FadeInView, SlideInView } from '@/components/ui/FadeInView';
import { PressableScale } from '@/components/ui/PressableScale';
import { MiniChart } from '@/components/portfolio/MiniChart';

export default function OwnerDashboardScreen() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] ?? 'Owner';

  const {
    data: myPitches = [],
    isLoading: loadingPitches,
    refetch: refetchPitches,
  } = useQuery({
    queryKey: ['myPitches'],
    queryFn: () => getMyPitches(),
  });

  const livePitches = myPitches.filter((p) => p.status === 'LIVE' || p.status === 'FUNDED');
  const pitchIds = myPitches.map((p) => p.id).join(',');

  const {
    data: allBids = [],
    isLoading: loadingBids,
    refetch: refetchBids,
  } = useQuery({
    queryKey: ['ownerAllBids', pitchIds],
    queryFn: async () => {
      const results = await Promise.all(
        myPitches.map((p) => getBidsForPitch(p.id))
      );
      return results.flat();
    },
    enabled: myPitches.length > 0,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
  });

  const unreadNotifCount = notifications.filter((n: any) => !n.read).length;

  useFocusEffect(
    React.useCallback(() => {
      refetchPitches();
      if (myPitches.length > 0) refetchBids();
    }, [pitchIds])
  );

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchPitches(), refetchBids()]);
    setRefreshing(false);
  };

  const pendingBids = allBids.filter((b) => b.status === 'PENDING').length;
  const totalRaised = myPitches.reduce(
    (sum, p) => sum + Number(p.amountRaised ?? 0),
    0
  );

  const recentBids = [...allBids]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 3);

  const handleBidPress = async (bid: (typeof allBids)[number]) => {
    if (bid.status === 'ACCEPTED') {
      try {
        const deals = await getMyDeals();
        const deal = deals.find((d) => d.bidId === bid.id);
        if (deal) {
          router.push({ pathname: '/deal/[id]', params: { id: deal.id } });
          return;
        }
        Alert.alert('Processing', 'Your deal is being created.');
        return;
      } catch {
        // fall through to bid details
      }
    }
    router.push(`/bid/${bid.id}`);
  };

  if (loadingPitches || loadingBids) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenState loading title="Loading dashboard" />
      </SafeAreaView>
    );
  }

  const sparklineData = [totalRaised * 0.2, totalRaised * 0.35, totalRaised * 0.5, totalRaised * 0.65, totalRaised * 0.8, totalRaised || 1000];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <SlideInView from="left" style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back, {firstName}</Text>
            <Text style={styles.title}>Business Dashboard</Text>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.75}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
            {unreadNotifCount > 0 && <View style={styles.bellDot} />}
          </TouchableOpacity>
        </SlideInView>

        {/* Stats Row */}
        <FadeInView delay={60} style={styles.statsRow}>
          <View style={[styles.statCardSmall, styles.primaryStatCard]}>
            <View style={styles.statCardTop}>
              <Text style={styles.statLabelLight}>TOTAL CAPITAL RAISED</Text>
              <Ionicons name="trending-up" size={16} color={Colors.accent} />
            </View>
            <Text style={styles.statValueLight}>GH₵{formatCurrency(totalRaised)}</Text>
            <View style={styles.chartWrap}>
              <MiniChart data={sparklineData} width={130} height={32} color={Colors.accent} showFill />
            </View>
          </View>

          <View style={styles.statSubRow}>
            <View style={styles.statCardSmall}>
              <Text style={styles.statValue}>{allBids.length}</Text>
              <Text style={styles.statLabel}>Total bids</Text>
            </View>
            <View style={[styles.statCardSmall, pendingBids > 0 && styles.statCardHighlight]}>
              <Text style={[styles.statValue, pendingBids > 0 && styles.statValueHighlight]}>
                {pendingBids}
              </Text>
              <Text style={styles.statLabel}>Pending bids</Text>
            </View>
          </View>
        </FadeInView>

        {/* Active Pitch Card(s) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            Active pitch{livePitches.length !== 1 ? 'es' : ''}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(owner)/pitches')} activeOpacity={0.7}>
            <Text style={styles.viewAll}>Manage</Text>
          </TouchableOpacity>
        </View>

        {livePitches.length > 0 ? (
          livePitches.map((pitch, index) => {
            const raisedAmount = Number(pitch.amountRaised ?? 0);
            const neededAmount = Number(pitch.amountNeeded ?? 0);
            const fundedPercent =
              neededAmount > 0 ? (raisedAmount / neededAmount) * 100 : 0;
            return (
              <FadeInView key={pitch.id} delay={100 + index * 40}>
                <PressableScale onPress={() => router.push(`/pitch/${pitch.id}`)}>
                  <View style={styles.pitchCard}>
                    <LinearGradient
                      colors={[Colors.primary, '#162040']}
                      style={styles.pitchGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.pitchCardHeader}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={styles.pitchName} numberOfLines={1}>{pitch.businessName}</Text>
                          <Text style={styles.pitchIndustry}>{pitch.industry}</Text>
                        </View>
                        <View style={styles.statusBadge}>
                          <View style={styles.statusDot} />
                          <Text style={styles.statusText}>Live</Text>
                        </View>
                      </View>

                      <View style={styles.pitchAmounts}>
                        <Text style={styles.pitchRaised}>
                          GH₵{formatCurrency(pitch.amountRaised)}
                        </Text>
                        <Text style={styles.pitchGoal}>
                          of GH₵{formatCurrency(pitch.amountNeeded)}
                        </Text>
                      </View>

                      <ProgressBar percent={fundedPercent} height={6} color={Colors.accent} />
                      <View style={styles.percentRow}>
                        <Text style={styles.pitchPercent}>{fundedPercent.toFixed(0)}% funded</Text>
                        <Text style={styles.pitchPercentSub}>
                          GH₵{(neededAmount - raisedAmount > 0 ? neededAmount - raisedAmount : 0).toLocaleString()} remaining
                        </Text>
                      </View>

                      <View style={styles.pitchMeta}>
                        <View style={styles.pitchMetaChip}>
                          <Ionicons name="location-outline" size={11} color="rgba(255,255,255,0.7)" />
                          <Text style={styles.pitchMetaText}>{pitch.location}</Text>
                        </View>
                        <View style={styles.pitchMetaChip}>
                          <Ionicons name="calendar-outline" size={11} color="rgba(255,255,255,0.7)" />
                          <Text style={styles.pitchMetaText}>
                            Ends {formatDate(pitch.campaignEndDate)}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                </PressableScale>
              </FadeInView>
            );
          })
        ) : (
          <FadeInView delay={100}>
            <View style={styles.emptyPitchCard}>
              <Ionicons name="megaphone-outline" size={32} color={Colors.textMuted} />
              <Text style={styles.emptyPitchTitle}>No active pitches</Text>
              <Text style={styles.emptyPitchSubtitle}>Create a pitch to start receiving investment bids</Text>
              <TouchableOpacity
                style={styles.createPitchAction}
                onPress={() => router.push('/(owner)/pitches')}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={16} color={Colors.primary} />
                <Text style={styles.createPitchActionText}>Create Pitch</Text>
              </TouchableOpacity>
            </View>
          </FadeInView>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actionsRow}>
          <PressableScale style={{ flex: 1 }} onPress={() => router.push('/(owner)/bids')}>
            <View style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="people" size={20} color="#2563EB" />
              </View>
              <Text style={styles.actionLabel}>Review Bids</Text>
              {pendingBids > 0 && (
                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>{pendingBids}</Text>
                </View>
              )}
            </View>
          </PressableScale>

          <PressableScale style={{ flex: 1 }} onPress={() => router.push('/(owner)/pitches')}>
            <View style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="megaphone" size={20} color="#EA580C" />
              </View>
              <Text style={styles.actionLabel}>My Pitches</Text>
            </View>
          </PressableScale>

          <PressableScale style={{ flex: 1 }} onPress={() => router.push('/(owner)/profile')}>
            <View style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="person" size={20} color={Colors.accent} />
              </View>
              <Text style={styles.actionLabel}>Profile</Text>
            </View>
          </PressableScale>
        </View>

        {/* Recent bids */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent bids</Text>
          <TouchableOpacity onPress={() => router.push('/(owner)/bids')} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {recentBids.length > 0 ? (
          recentBids.map((bid, idx) => (
            <FadeInView key={bid.id} delay={idx * 30}>
              <PressableScale onPress={() => handleBidPress(bid)}>
                <View style={styles.bidRow}>
                  <View style={styles.bidAvatar}>
                    <Text style={styles.bidAvatarText}>
                      {bid.investorName ? bid.investorName[0] : 'I'}
                    </Text>
                  </View>
                  <View style={styles.bidInfo}>
                    <Text style={styles.bidInvestor}>{bid.investorName || 'Investor'}</Text>
                    <Text style={styles.bidDetails}>
                      GH₵{formatCurrency(bid.amount)} · {bid.returnType.replace(/_/g, ' ')} · {bid.timelineMonths}mo
                    </Text>
                  </View>
                  <View style={[styles.bidStatus, { backgroundColor: getBidStatusBg(bid.status) }]}>
                    <Text style={[styles.bidStatusText, { color: getBidStatusColor(bid.status) }]}>
                      {bid.status}
                    </Text>
                  </View>
                </View>
              </PressableScale>
            </FadeInView>
          ))
        ) : (
          <Text style={{ textAlign: 'center', color: Colors.textMuted, marginTop: 6, marginBottom: 20, fontSize: 13 }}>
            No bids received yet
          </Text>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatCurrency(value: number | string | null | undefined) {
  const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
  if (!Number.isFinite(numericValue)) {
    return '0';
  }
  return numericValue.toLocaleString();
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'TBD';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'TBD' : date.toLocaleDateString();
}

function getBidStatusBg(status: string) {
  switch (status) {
    case 'PENDING': return '#FFF7ED';
    case 'COUNTERED': return '#EFF6FF';
    case 'ACCEPTED': return '#F0FDF4';
    case 'REJECTED': return '#FEF2F2';
    default: return Colors.borderLight;
  }
}

function getBidStatusColor(status: string) {
  switch (status) {
    case 'PENDING': return '#EA580C';
    case 'COUNTERED': return '#2563EB';
    case 'ACCEPTED': return Colors.accent;
    case 'REJECTED': return Colors.accentRed;
    default: return Colors.textMuted;
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accentRed,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  statsRow: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
    marginTop: 8,
  },
  primaryStatCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  statCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabelLight: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  statValueLight: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  chartWrap: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  statSubRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCardSmall: {
    ...cardStyles.surface,
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  statCardHighlight: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statValueHighlight: {
    color: '#EA580C',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  viewAll: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  pitchCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  pitchGradient: {
    padding: 20,
    gap: 12,
  },
  pitchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pitchName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  pitchIndustry: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(34,197,94,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.4)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  statusText: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: '700',
  },
  pitchAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  pitchRaised: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  pitchGoal: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  percentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pitchPercent: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '700',
  },
  pitchPercentSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  pitchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  pitchMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pitchMetaText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  emptyPitchCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
  },
  emptyPitchTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyPitchSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  createPitchAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.borderLight,
  },
  createPitchActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  actionCard: {
    ...cardStyles.surface,
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  actionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.accentRed,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  bidRow: {
    ...cardStyles.surface,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  bidAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  bidInfo: {
    flex: 1,
  },
  bidInvestor: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  bidDetails: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bidStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  bidStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
