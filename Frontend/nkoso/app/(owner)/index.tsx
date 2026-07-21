import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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
import { useQuery } from '@tanstack/react-query';
import { getMyPitches, getBidsForPitch, getMyDeals } from '@/services/api';
import { ProgressBar } from '@/components/ui/ProgressBar';

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

  // Refresh dashboard data every time this screen regains focus
  // (e.g. after coming back from paying/signing a deal in the Deal Room)
  useFocusEffect(
    React.useCallback(() => {
      refetchPitches();
      if (myPitches.length > 0) refetchBids();
      // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // If a bid has been accepted, route to its Deal Room instead of
  // the read-only Bid Details screen.
  const handleBidPress = async (bid: (typeof allBids)[number]) => {
    if (bid.status === 'ACCEPTED') {
      try {
        const deals = await getMyDeals();
        const deal = deals.find((d) => d.bidId === bid.id);
        if (deal) {
          router.push(`/deal/${deal.id}`);
          return;
        }
        Alert.alert('Processing', 'Your deal is being created.');
        return;
      } catch {
        // fall through to bid details if the deals lookup fails
      }
    }
    router.push(`/bid/${bid.id}`);
  };

  if (loadingPitches || loadingBids) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName}</Text>
            <Text style={styles.title}>Your Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>GH₵{formatCurrency(totalRaised)}</Text>
            <Text style={styles.statLabel}>Total raised</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{allBids.length}</Text>
            <Text style={styles.statLabel}>Total bids</Text>
          </View>
          <View style={[styles.statCard, pendingBids > 0 && styles.statCardHighlight]}>
            <Text
              style={[styles.statValue, pendingBids > 0 && styles.statValueHighlight]}
            >
              {pendingBids}
            </Text>
            <Text style={styles.statLabel}>Pending bids</Text>
          </View>
        </View>

        {/* Active Pitch Card(s) */}
        <Text style={styles.sectionTitle}>
          Active pitch{livePitches.length !== 1 ? 'es' : ''}
        </Text>
        {livePitches.length > 0 ? (
          livePitches.map((pitch) => {
            const raisedAmount = Number(pitch.amountRaised ?? 0);
            const neededAmount = Number(pitch.amountNeeded ?? 0);
            const fundedPercent =
              neededAmount > 0 ? (raisedAmount / neededAmount) * 100 : 0;
            return (
              <View key={pitch.id} style={styles.pitchCard}>
                <LinearGradient
                  colors={[Colors.primary, '#162040']}
                  style={styles.pitchGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.pitchCardHeader}>
                    <View>
                      <Text style={styles.pitchName}>{pitch.businessName}</Text>
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
                  <Text style={styles.pitchPercent}>{fundedPercent.toFixed(0)}% funded</Text>

                  <View style={styles.pitchMeta}>
                    <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.pitchMetaText}>{pitch.location}</Text>
                    <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.pitchMetaText}>
                      Ends {formatDate(pitch.campaignEndDate)}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            );
          })
        ) : (
          <View style={styles.pitchCard}>
            <View
              style={[
                styles.pitchGradient,
                { backgroundColor: Colors.surface, padding: 30, alignItems: 'center' },
              ]}
            >
              <Text style={{ color: Colors.textMuted }}>No active pitches found.</Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(owner)/bids')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="people-outline" size={22} color="#3B82F6" />
            </View>
            <Text style={styles.actionLabel}>Review Bids</Text>
            {pendingBids > 0 && (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{pendingBids}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(owner)/pitches')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="megaphone-outline" size={22} color="#EA580C" />
            </View>
            <Text style={styles.actionLabel}>My Pitches</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(owner)/profile')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="person-outline" size={22} color={Colors.accent} />
            </View>
            <Text style={styles.actionLabel}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Recent bids */}
        <Text style={styles.sectionTitle}>Recent bids</Text>
        {recentBids.length > 0 ? (
          recentBids.map((bid) => (
            <TouchableOpacity
              key={bid.id}
              style={styles.bidRow}
              onPress={() => handleBidPress(bid)}
              activeOpacity={0.8}
            >
              <View style={styles.bidAvatar}>
                <Text style={styles.bidAvatarText}>
                  {bid.investorName ? bid.investorName[0] : 'I'}
                </Text>
              </View>
              <View style={styles.bidInfo}>
                <Text style={styles.bidInvestor}>{bid.investorName || 'Investor'}</Text>
                <Text style={styles.bidDetails}>
                  GH₵{formatCurrency(bid.amount)} · {bid.returnType} · {bid.timelineMonths}mo
                </Text>
              </View>
              <View style={[styles.bidStatus, { backgroundColor: getBidStatusBg(bid.status) }]}>
                <Text style={[styles.bidStatusText, { color: getBidStatusColor(bid.status) }]}>
                  {bid.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ textAlign: 'center', color: Colors.textMuted, marginTop: 10, marginBottom: 20 }}>
            No bids yet
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
    case 'REJECTED': return '#FFF1F2';
    default: return Colors.borderLight;
  }
}

function getBidStatusColor(status: string) {
  switch (status) {
    case 'PENDING': return '#EA580C';
    case 'COUNTERED': return '#3B82F6';
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
    paddingTop: 12,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statCardHighlight: {
    backgroundColor: '#FFF7ED',
  },
  statValue: {
    fontSize: 18,
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
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  pitchCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
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
  },
  pitchIndustry: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(34,197,94,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
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
    fontWeight: '600',
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
  },
  pitchGoal: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  pitchPercent: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
  },
  pitchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pitchMetaText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginRight: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bidAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  bidInfo: {
    flex: 1,
  },
  bidInvestor: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  bidDetails: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bidStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bidStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  createPitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    gap: 8,
  },
  createPitchText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});