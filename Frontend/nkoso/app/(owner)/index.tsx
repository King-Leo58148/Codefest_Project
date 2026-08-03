import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/store/themeStore';
import { ScreenState } from '@/components/ui/ScreenState';
import { useQuery } from '@tanstack/react-query';
import { getMyPitches, getBidsForPitch, getMyDeals, getNotifications } from '@/services/api';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MiniChart } from '@/components/portfolio/MiniChart';
import { Badge } from '@/components/ui/Badge';
import { Colors } from '@/constants/Colors';
import type { Pitch, Bid, Industry } from '@/types';

export function getIndustryImageUrl(industry?: string, pitchImage?: string): string {
  if (pitchImage && pitchImage.startsWith('http')) {
    return pitchImage;
  }
  if (!industry) {
    return 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&q=80';
  }
  const ind = industry.toLowerCase();
  if (ind.includes('tech')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=80';
  }
  if (ind.includes('food') || ind.includes('bev')) {
    return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80';
  }
  if (ind.includes('health') || ind.includes('med')) {
    return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&q=80';
  }
  if (ind.includes('agri') || ind.includes('farm')) {
    return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=300&q=80';
  }
  if (ind.includes('sustain') || ind.includes('eco') || ind.includes('green')) {
    return 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&q=80';
  }
  if (ind.includes('retail') || ind.includes('shop') || ind.includes('store')) {
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&q=80';
  }
  if (ind.includes('trans') || ind.includes('auto') || ind.includes('car') || ind.includes('logistics')) {
    return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&q=80';
  }
  if (ind.includes('fit') || ind.includes('sport')) {
    return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80';
  }
  if (ind.includes('fashion') || ind.includes('cloth') || ind.includes('apparel')) {
    return 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&q=80';
  }
  if (ind.includes('beauty') || ind.includes('cosmetic')) {
    return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=80';
  }
  if (ind.includes('construct') || ind.includes('build')) {
    return 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=300&q=80';
  }
  if (ind.includes('edu') || ind.includes('school')) {
    return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&q=80';
  }
  if (ind.includes('entertain') || ind.includes('media')) {
    return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80';
  }
  if (ind.includes('hospit') || ind.includes('hotel')) {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&q=80';
  }
  if (ind.includes('manufactur') || ind.includes('factory')) {
    return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&q=80';
  }
  return 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&q=80';
}

export default function OwnerHomeScreen() {
  const { user } = useAuthStore();
  const { isDark, colors, toggleTheme } = useTheme();
  const firstName = user?.name?.split(' ')[0] ?? 'Owner';
  const userInitials = (user?.name || 'Owner')[0].toUpperCase();

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

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchPitches(), refetchBids()]);
    setRefreshing(false);
  };

  const pendingBidsCount = allBids.filter((b) => b.status === 'PENDING').length;
  const acceptedBidsCount = allBids.filter((b) => b.status === 'ACCEPTED').length;
  const totalRaised = myPitches.reduce((sum, p) => sum + Number(p.amountRaised ?? 0), 0);
  const totalGoal = myPitches.reduce((sum, p) => sum + Number(p.amountNeeded ?? 0), 0);
  const overallProgress = totalGoal > 0 ? Math.min(100, (totalRaised / totalGoal) * 100) : 0;

  const sparklineData = useMemo(() => {
    const r = totalRaised || 1000;
    return [r * 0.1, r * 0.3, r * 0.5, r * 0.75, r * 0.9, r];
  }, [totalRaised]);

  const recentBids = useMemo(() => {
    return [...allBids]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 3);
  }, [allBids]);

  if (loadingPitches || loadingBids) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <ScreenState loading title="Loading home" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* ── 1. Top Custom Navigation Header with Theme Toggle Switch ── */}
      <View style={styles.topHeader}>
        <View style={styles.userProfileGroup}>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarLetter}>{userInitials}</Text>
          </View>
          <View>
            <Text style={[styles.userWelcomeLabel, { color: colors.textSecondary }]}>Welcome Back 👋</Text>
            <Text style={[styles.userNameText, { color: colors.textPrimary }]}>{user?.name || 'Business Owner'}</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          {/* Theme Switcher Button */}
          <TouchableOpacity
            style={[styles.headerIconButton, { backgroundColor: colors.headerBtnBg, borderColor: colors.border }]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={19}
              color={isDark ? '#F59E0B' : '#0F172A'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerIconButton, { backgroundColor: colors.headerBtnBg, borderColor: colors.border }]}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={19} color={colors.textPrimary} />
            {unreadNotifCount > 0 && <View style={styles.redBadgeDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? '#38BDF8' : '#0D1B3E'} />
        }
      >
        {/* ── 2. Distinct Gradient Wallet / Capital Hero Card ── */}
        <LinearGradient
          colors={colors.heroBg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.capitalHeroCard}
        >
          <View style={styles.heroHeaderRow}>
            <View style={styles.capitalLabelChip}>
              <View style={styles.greenPulseDot} />
              <Text style={styles.capitalChipText}>BUSINESS WALLET & CAPITAL</Text>
            </View>
            <TouchableOpacity
              style={styles.newPitchPillBtn}
              onPress={() => router.push('/(owner)/pitches')}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.newPitchPillText}>Create Pitch</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.heroAmountText}>GH₵{totalRaised.toLocaleString()}</Text>
          <Text style={styles.heroAmountSub}>Total capital raised from investor bids</Text>

          {/* Sparkline Chart */}
          <View style={styles.heroChartBox}>
            <MiniChart data={sparklineData} width={260} height={38} color="#10B981" showFill />
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressLabel}>Target Goal: GH₵{totalGoal.toLocaleString()}</Text>
              <Text style={styles.progressPct}>{overallProgress.toFixed(0)}% Funded</Text>
            </View>
            <ProgressBar percent={overallProgress} height={6} color="#10B981" />
          </View>

          {/* 3 Metrics Pills Inside Card */}
          <View style={styles.heroMetricsBar}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{myPitches.length}</Text>
              <Text style={styles.metricLabel}>Pitches</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{allBids.length}</Text>
              <Text style={styles.metricLabel}>Bids</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: '#F59E0B' }]}>{pendingBidsCount}</Text>
              <Text style={styles.metricLabel}>Pending</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: '#10B981' }]}>{acceptedBidsCount}</Text>
              <Text style={styles.metricLabel}>Accepted</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── 3. Management Hub (2x2 Grid) ── */}
        <Text style={[styles.sectionHeaderTitle, { color: colors.textPrimary }]}>Management Hub</Text>

        <View style={styles.hubGrid}>
          <TouchableOpacity
            style={[styles.hubCard, {
              backgroundColor: isDark ? '#172554' : '#EFF6FF',
              borderColor: isDark ? '#1E40AF' : '#BFDBFE',
            }]}
            onPress={() => router.push('/(owner)/bids')}
            activeOpacity={0.82}
          >
            <View style={styles.hubHeaderRow}>
              <View style={[styles.hubIconCircle, { backgroundColor: isDark ? '#1E3A8A' : '#DBEAFE' }]}>
                <Ionicons name="people" size={20} color={isDark ? '#60A5FA' : '#2563EB'} />
              </View>
              {pendingBidsCount > 0 && (
                <View style={styles.hubBadgeAlert}>
                  <Text style={styles.hubBadgeAlertText}>{pendingBidsCount} NEW</Text>
                </View>
              )}
            </View>
            <Text style={[styles.hubCardTitle, { color: colors.textPrimary }]}>Review Bids</Text>
            <Text style={[styles.hubCardSub, { color: colors.textSecondary }]}>
              {pendingBidsCount > 0 ? `${pendingBidsCount} offers awaiting response` : 'All offers reviewed'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.hubCard, {
              backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
              borderColor: isDark ? '#065F46' : '#A7F3D0',
            }]}
            onPress={() => router.push('/(owner)/deals')}
            activeOpacity={0.82}
          >
            <View style={styles.hubHeaderRow}>
              <View style={[styles.hubIconCircle, { backgroundColor: isDark ? '#065F46' : '#D1FAE5' }]}>
                <Ionicons name="document-text" size={20} color={isDark ? '#34D399' : '#16A34A'} />
              </View>
            </View>
            <Text style={[styles.hubCardTitle, { color: colors.textPrimary }]}>Deals & Legal</Text>
            <Text style={[styles.hubCardSub, { color: colors.textSecondary }]}>Signed agreements and escrow terms</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.hubCard, {
              backgroundColor: isDark ? '#451A03' : '#FFF7ED',
              borderColor: isDark ? '#78350F' : '#FDE68A',
            }]}
            onPress={() => router.push('/(owner)/pitches')}
            activeOpacity={0.82}
          >
            <View style={styles.hubHeaderRow}>
              <View style={[styles.hubIconCircle, { backgroundColor: isDark ? '#78350F' : '#FEF3C7' }]}>
                <Ionicons name="megaphone" size={20} color={isDark ? '#FBBF24' : '#D97706'} />
              </View>
            </View>
            <Text style={[styles.hubCardTitle, { color: colors.textPrimary }]}>My Pitches</Text>
            <Text style={[styles.hubCardSub, { color: colors.textSecondary }]}>{myPitches.length} published campaigns</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.hubCard, {
              backgroundColor: isDark ? '#3B0764' : '#F3E8FF',
              borderColor: isDark ? '#581C87' : '#DDD6FE',
            }]}
            onPress={() => router.push('/profile')}
            activeOpacity={0.82}
          >
            <View style={styles.hubHeaderRow}>
              <View style={[styles.hubIconCircle, { backgroundColor: isDark ? '#581C87' : '#EDE9FE' }]}>
                <Ionicons name="wallet-outline" size={20} color={isDark ? '#C084FC' : '#9333EA'} />
              </View>
            </View>
            <Text style={[styles.hubCardTitle, { color: colors.textPrimary }]}>MoMo Repayments</Text>
            <Text style={[styles.hubCardSub, { color: colors.textSecondary }]}>Disbursements & Account setup</Text>
          </TouchableOpacity>
        </View>

        {/* ── 4. Vertical Live Pitch Portfolio Cards with Official Industry Badges ── */}
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionHeaderTitle, { color: colors.textPrimary }]}>Live Pitch Portfolio</Text>
          <TouchableOpacity onPress={() => router.push('/(owner)/pitches')}>
            <Text style={styles.seeAllLink}>Manage All ({livePitches.length})</Text>
          </TouchableOpacity>
        </View>

        {livePitches.length === 0 ? (
          <View style={[styles.emptyCardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="megaphone-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyCardTitle, { color: colors.textPrimary }]}>No Live Pitches</Text>
            <Text style={[styles.emptyCardSub, { color: colors.textSecondary }]}>
              Publish your first business pitch to attract investor bids.
            </Text>
            <TouchableOpacity
              style={styles.createPitchEmptyBtn}
              onPress={() => router.push('/(owner)/pitches')}
            >
              <Text style={styles.createPitchEmptyText}>+ Create Pitch</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.verticalCardsStack}>
            {livePitches.map((pitch) => {
              const raised = Number(pitch.amountRaised ?? 0);
              const needed = Number(pitch.amountNeeded ?? 0);
              const pct = needed > 0 ? (raised / needed) * 100 : 0;
              const industryImageUrl = getIndustryImageUrl(pitch.industry, pitch.imageUrl);

              return (
                <TouchableOpacity
                  key={pitch.id}
                  style={[styles.verticalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => router.push(`/pitch/${pitch.id}`)}
                  activeOpacity={0.85}
                >
                  <View style={styles.verticalCardHeader}>
                    {/* Industry Image Thumbnail Avatar */}
                    <View style={[styles.industryImageAvatarCircle, { borderColor: colors.border }]}>
                      <Image
                        source={{ uri: industryImageUrl }}
                        style={styles.industryImageAvatar}
                        resizeMode="cover"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.verticalBusinessName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {pitch.businessName}
                      </Text>

                      {/* Official Industry Badge Pill */}
                      <View style={styles.industryBadgePillRow}>
                        <Badge label={pitch.industry} industry={pitch.industry as Industry} size="sm" />
                        <Text style={[styles.locationText, { color: colors.textSecondary }]}>· {pitch.location}</Text>
                      </View>
                    </View>

                    <View style={[styles.liveChip, { backgroundColor: isDark ? '#052E16' : '#DCFCE7' }]}>
                      <Text style={[styles.liveChipText, { color: isDark ? '#4ADE80' : '#15803D' }]}>LIVE</Text>
                    </View>
                  </View>

                  <View style={[styles.verticalAmountBox, { backgroundColor: colors.boxBg }]}>
                    <View style={styles.amountCol}>
                      <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>RAISED</Text>
                      <Text style={[styles.amountVal, { color: colors.textPrimary }]}>GH₵{raised.toLocaleString()}</Text>
                    </View>
                    <View style={[styles.amountDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.amountCol}>
                      <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>TARGET GOAL</Text>
                      <Text style={[styles.amountVal, { color: colors.textPrimary }]}>GH₵{needed.toLocaleString()}</Text>
                    </View>
                  </View>

                  <ProgressBar percent={pct} height={5} color="#16A34A" />

                  <View style={styles.verticalFooter}>
                    <Text style={styles.verticalPctText}>{pct.toFixed(0)}% Funded</Text>
                    <View style={styles.manageLinkRow}>
                      <Text style={styles.manageLinkText}>Manage Pitch</Text>
                      <Ionicons name="chevron-forward" size={14} color="#16A34A" />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── 5. Recent Investor Offers Feed ── */}
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionHeaderTitle, { color: colors.textPrimary }]}>Recent Investor Offers</Text>
          <TouchableOpacity onPress={() => router.push('/(owner)/bids')}>
            <Text style={styles.seeAllLink}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentBids.length === 0 ? (
          <View style={[styles.emptyCardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={28} color={colors.textMuted} />
            <Text style={[styles.emptyCardTitle, { color: colors.textPrimary }]}>No Bids Received Yet</Text>
            <Text style={[styles.emptyCardSub, { color: colors.textSecondary }]}>
              Bids placed by investors will show up here instantly.
            </Text>
          </View>
        ) : (
          <View style={[styles.activityFeedBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {recentBids.map((bid, index) => {
              const isLast = index === recentBids.length - 1;
              const statusBg =
                bid.status === 'ACCEPTED'
                  ? isDark ? '#052E16' : '#DCFCE7'
                  : bid.status === 'PENDING'
                  ? isDark ? '#451A03' : '#FEF3C7'
                  : colors.surfaceSubtle;
              const statusColor =
                bid.status === 'ACCEPTED'
                  ? isDark ? '#4ADE80' : '#15803D'
                  : bid.status === 'PENDING'
                  ? isDark ? '#FBBF24' : '#B45309'
                  : colors.textSecondary;

              return (
                <TouchableOpacity
                  key={bid.id}
                  style={[styles.activityRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                  onPress={() => router.push(`/bid/${bid.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.activityAvatar}>
                    <Text style={styles.activityAvatarText}>
                      {(bid.investorName || 'I')[0].toUpperCase()}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.activityInvestorName, { color: colors.textPrimary }]}>
                      {bid.investorName || 'Investor'}
                    </Text>
                    <Text style={[styles.activitySubText, { color: colors.textSecondary }]}>
                      GH₵{bid.amount.toLocaleString()} · {bid.returnType.replace(/_/g, ' ')} ({bid.returnValue}%)
                    </Text>
                  </View>

                  <View style={[styles.activityBadge, { backgroundColor: statusBg }]}>
                    <Text style={[styles.activityBadgeText, { color: statusColor }]}>
                      {bid.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  /* Top Custom Header */
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userProfileGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0D1B3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  userWelcomeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  redBadgeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 20,
  },

  /* Distinct Gradient Wallet Hero Card */
  capitalHeroCard: {
    borderRadius: 24,
    padding: 20,
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
  capitalLabelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  capitalChipText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  newPitchPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  newPitchPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroAmountText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 14,
    letterSpacing: -0.8,
  },
  heroAmountSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  heroChartBox: {
    marginVertical: 12,
    alignItems: 'center',
  },
  progressContainer: {
    gap: 6,
    marginTop: 4,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  progressPct: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
  },
  heroMetricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  /* Management Hub 2x2 Colorful Grid */
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  hubCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  hubHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hubIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubBadgeAlert: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  hubBadgeAlertText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  hubCardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  hubCardSub: {
    fontSize: 11,
    lineHeight: 15,
  },

  /* Vertical Stacked Live Cards */
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  seeAllLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  verticalCardsStack: {
    gap: 14,
  },
  verticalCard: {
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
  verticalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  industryImageAvatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  industryImageAvatar: {
    width: '100%',
    height: '100%',
  },
  verticalBusinessName: {
    fontSize: 15,
    fontWeight: '800',
  },
  industryBadgePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  locationText: {
    fontSize: 11,
  },
  liveChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  liveChipText: {
    fontSize: 10,
    fontWeight: '800',
  },
  verticalAmountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 14,
    padding: 12,
  },
  amountCol: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 9,
    fontWeight: '800',
  },
  amountVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  amountDivider: {
    width: 1,
    height: 24,
  },
  verticalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verticalPctText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  manageLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  manageLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },

  /* Activity Feed Box */
  activityFeedBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 6,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  activityAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0D1B3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  activityInvestorName: {
    fontSize: 14,
    fontWeight: '800',
  },
  activitySubText: {
    fontSize: 11,
    marginTop: 2,
  },
  activityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activityBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },

  /* Empty Cards */
  emptyCardContainer: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 6,
  },
  emptyCardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptyCardSub: {
    fontSize: 12,
    textAlign: 'center',
  },
  createPitchEmptyBtn: {
    marginTop: 8,
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  createPitchEmptyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
