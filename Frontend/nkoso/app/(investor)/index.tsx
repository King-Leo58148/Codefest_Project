import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { PitchCard } from '@/components/pitch/PitchCard';
import { ScreenState } from '@/components/ui/ScreenState';
import { PitchCardSkeleton } from '@/components/ui/Skeleton';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { FadeInView, SlideInView } from '@/components/ui/FadeInView';
import { PressableScale } from '@/components/ui/PressableScale';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { getPitches, getMyDeals, getNotifications } from '@/services/api';

// Pulse animation for notification bell dot
function PulseDot() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1.6, duration: 700, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,   duration: 700, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1, duration: 0,   useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 0,   useNativeDriver: true }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <>
      {/* Outer pulse ring */}
      <Animated.View
        style={[
          styles.bellDotRing,
          { transform: [{ scale }], opacity },
        ]}
      />
      {/* Solid dot */}
      <View style={styles.bellDot} />
    </>
  );
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const firstName = user?.name.split(' ')[0] ?? 'Investor';

  const { data: pitches = [], isLoading: isLoadingPitches, isError: isPitchesError, refetch: refetchPitches, isRefetching: isRefetchingPitches } = useQuery({
    queryKey: ['pitches'],
    queryFn: () => getPitches(),
  });

  const { data: deals = [], isLoading: isLoadingDeals, isError: isDealsError, refetch: refetchDeals } = useQuery({
    queryKey: ['myDeals'],
    queryFn: () => getMyDeals(),
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
  });

  const unreadNotifCount = notifications.filter((n: any) => !n.read).length;

  const ACTIVE_STATUSES = ['PENDING_SIGNATURES', 'PENDING_MFI', 'MFI_APPROVED', 'PAYMENT_PENDING', 'FUNDED', 'ACTIVE'];
  const activeDeals = deals.filter(d => ACTIVE_STATUSES.includes(d.status));
  const totalInvested = activeDeals.reduce((sum, d) => sum + d.amount, 0);

  const featuredPitch = pitches.length > 0 ? pitches[0] : null;
  const fundedPct = featuredPitch
    ? Math.min(100, Math.round((featuredPitch.amountRaised / featuredPitch.amountNeeded) * 100))
    : 0;

  const onRefresh = async () => {
    await Promise.all([refetchPitches(), refetchDeals()]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingPitches}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* ── Header ── */}
        <SlideInView from="left" style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName}</Text>
            <Text style={styles.tagline}>
              Invest in businesses.{'\n'}Build the future.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.75}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
            {unreadNotifCount > 0 && (
              <View style={styles.bellDotWrap}>
                <PulseDot />
              </View>
            )}
          </TouchableOpacity>
        </SlideInView>

        {/* ── Search Bar ── */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(investor)/explore')}
          activeOpacity={0.8}
        >
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Search businesses or industries...</Text>
        </TouchableOpacity>

        {/* ── Portfolio Card ── */}
        <FadeInView delay={60} style={styles.portfolioCard}>
          {/* Subtle asymmetric highlight stripe */}
          <View style={styles.portfolioHighlight} />

          <View style={styles.portfolioHeader}>
            <Text style={styles.portfolioLabel}>Invested Capital</Text>
            <View style={styles.portfolioBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.portfolioBadgeText}>Live Portfolio</Text>
            </View>
          </View>

          {isLoadingDeals || isDealsError ? (
            <Text style={styles.portfolioValue}>{isDealsError ? '--' : '...'}</Text>
          ) : (
            <AnimatedNumber
              value={totalInvested}
              prefix="GH₵"
              formatter={(n) => Math.round(n).toLocaleString()}
              style={styles.portfolioValue}
            />
          )}

          <View style={styles.changeRow}>
            <Ionicons name="trending-up" size={14} color={Colors.accent} />
            <Text style={styles.changeText}>
              {activeDeals.length} deal{activeDeals.length !== 1 ? 's' : ''} in progress
            </Text>
          </View>

          <View style={styles.shortcutsRow}>
            {[
              { icon: 'compass-outline',       label: 'Explore',  route: '/(investor)/explore' },
              { icon: 'briefcase-outline',     label: 'My Deals', route: '/(investor)/active-deals' },
              { icon: 'notifications-outline', label: 'Alerts',   route: '/notifications' },
              { icon: 'person-outline',        label: 'Profile',  route: '/(investor)/profile' },
            ].map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={styles.shortcut}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.shortcutIconBox, i === 0 && styles.shortcutIconBoxAccent]}>
                  <Ionicons name={item.icon as any} size={20} color="#fff" />
                </View>
                <Text style={styles.shortcutLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </FadeInView>

        {/* ── Featured section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured opportunity</Text>
          <TouchableOpacity onPress={() => router.push('/(investor)/explore')} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {/* ── Featured hero card ── */}
        {featuredPitch ? (
          <FadeInView delay={100}>
            <PressableScale onPress={() => router.push(`/pitch/${featuredPitch.id}`)}>
              <View style={styles.featuredHero}>
                <Image
                  source={{ uri: featuredPitch.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80' }}
                  style={styles.featuredImg}
                />
                {/* Gradient overlay — not a flat block */}
                <LinearGradient
                  colors={['transparent', 'rgba(13,27,62,0.88)']}
                  style={styles.featuredGradient}
                >
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeText}>{featuredPitch.industry}</Text>
                  </View>
                  <Text style={styles.featuredName}>{featuredPitch.businessName}</Text>
                  <Text style={styles.featuredDesc} numberOfLines={2}>
                    {featuredPitch.shortDescription}
                  </Text>

                  {/* Funding progress bar */}
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarFill, { width: `${fundedPct}%` }]} />
                  </View>
                  <Text style={styles.featuredFunded}>
                    GH₵{featuredPitch.amountNeeded.toLocaleString()} goal · {fundedPct}% raised
                  </Text>
                </LinearGradient>
              </View>
            </PressableScale>
          </FadeInView>
        ) : (
          <View style={[styles.featuredHero, { justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface }]}>
            {isLoadingPitches ? (
              <Text style={{ color: Colors.textMuted }}>Loading...</Text>
            ) : isPitchesError ? (
              <Text style={{ color: Colors.textMuted }}>Could not load opportunities</Text>
            ) : (
              <Text style={{ color: Colors.textMuted }}>No featured opportunities</Text>
            )}
          </View>
        )}

        {/* ── Recent pitches ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent pitches</Text>
        </View>

        <View style={styles.pitchList}>
          {isLoadingPitches ? (
            <View style={{ gap: 12 }}>
              <PitchCardSkeleton />
              <PitchCardSkeleton />
            </View>
          ) : isPitchesError ? (
            <ScreenState
              icon="alert-circle-outline"
              title="Could not load opportunities"
              detail="Pull down or open Explore to try again."
            />
          ) : pitches.length === 0 ? (
            <ScreenState
              icon="compass-outline"
              title="No opportunities yet"
              detail="New pitches will appear here when they go live."
            />
          ) : (
            pitches.slice(0, 4).map((pitch, index) => (
              <PitchCard key={pitch.id} pitch={pitch} compact delay={index * 40} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.background },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 28 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  greeting: { fontSize: 14, color: Colors.textSecondary, marginBottom: 2, fontWeight: '500' },
  tagline:  { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, lineHeight: 28, letterSpacing: -0.4 },

  bellBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, position: 'relative',
  },
  bellDotWrap: { position: 'absolute', top: 10, right: 11 },
  bellDotRing: {
    position: 'absolute', width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.accentRed, top: 0, left: 0,
  },
  bellDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.accentRed,
    borderWidth: 1.5, borderColor: Colors.surface,
  },

  searchBar: {
    marginHorizontal: 20, marginVertical: 12,
    backgroundColor: Colors.surface, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  searchPlaceholder: { fontSize: 14, color: Colors.textMuted },

  portfolioCard: {
    marginHorizontal: 20, backgroundColor: Colors.primary,
    borderRadius: 20, padding: 20, marginBottom: 24,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28, shadowRadius: 14, elevation: 5,
    overflow: 'hidden', position: 'relative',
  },
  // Asymmetric highlight — intentional design choice, not a template default
  portfolioHighlight: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: -40, right: -20,
  },
  portfolioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  portfolioLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  portfolioBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent },
  portfolioBadgeText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  portfolioValue:     { fontSize: 34, fontWeight: '800', color: '#fff', marginBottom: 4, letterSpacing: -0.5 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 16 },
  changeText: { fontSize: 13, color: Colors.accent, fontWeight: '600' },

  shortcutsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', paddingTop: 14,
  },
  shortcut:          { alignItems: 'center', minWidth: 56, gap: 5 },
  shortcutIconBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  // Primary action (Explore) gets accent highlight — intentional asymmetry
  shortcutIconBoxAccent: { backgroundColor: Colors.accent },
  shortcutLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 },
  viewAll:      { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  featuredHero: {
    marginHorizontal: 20, borderRadius: 18, overflow: 'hidden',
    marginBottom: 20, height: 220,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  featuredImg:      { width: '100%', height: '100%', resizeMode: 'cover', position: 'absolute' },
  featuredGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: 16, gap: 5,
  },
  featuredBadge: {
    backgroundColor: Colors.accent, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 10, alignSelf: 'flex-start',
  },
  featuredBadgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  featuredName:      { fontSize: 18, fontWeight: '800', color: '#fff' },
  featuredDesc:      { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  progressBarContainer: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2, overflow: 'hidden', marginTop: 4,
  },
  progressBarFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
  featuredFunded:  { fontSize: 11, color: Colors.accent, fontWeight: '600' },

  pitchList: { paddingHorizontal: 20 },
});
