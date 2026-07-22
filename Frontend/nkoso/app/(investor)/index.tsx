import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { PitchCard } from '@/components/pitch/PitchCard';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { getPitches, getMyDeals } from '@/services/api';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const firstName = user?.name.split(' ')[0] ?? 'Investor';

  const { data: pitches = [], isLoading: isLoadingPitches } = useQuery({
    queryKey: ['pitches'],
    queryFn: () => getPitches(),
  });

  const { data: deals = [], isLoading: isLoadingDeals } = useQuery({
    queryKey: ['myDeals'],
    queryFn: () => getMyDeals(),
  });

  const activeDealsCount = deals.filter(d => 
    ['PENDING_SIGNATURES', 'PENDING_MFI', 'MFI_APPROVED', 'PAYMENT_PENDING', 'FUNDED', 'ACTIVE'].includes(d.status)
  ).length;

  const featuredPitch = pitches.length > 0 ? pitches[0] : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName}</Text>
            <Text style={styles.tagline}>
              Invest in businesses.{'\n'}Build the future.
            </Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/notifications')} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(investor)/explore')}
          activeOpacity={0.8}
        >
          <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Search businesses or industries</Text>
        </TouchableOpacity>

        <View style={styles.portfolioCard}>
          <Text style={styles.portfolioLabel}>Active Deals</Text>
          <Text style={styles.portfolioValue}>
            {isLoadingDeals ? 'Loading...' : activeDealsCount}
          </Text>
          <View style={styles.changeRow}>
            <Text style={styles.changeText}>
              In negotiation or funded
            </Text>
          </View>
          
          <View style={styles.shortcutsRow}>
            {[
              { icon: 'compass-outline', label: 'Explore', route: '/(investor)/explore' },
              { icon: 'heart-outline', label: 'Watchlist', route: '/(investor)/explore' },
              { icon: 'briefcase-outline', label: 'My Deals', route: '/(investor)/active-deals' },
              { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.shortcut}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon as any} size={20} color="rgba(255,255,255,0.7)" />
                <Text style={styles.shortcutLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured opportunities</Text>
          <TouchableOpacity onPress={() => router.push('/(investor)/explore')} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {/* Featured hero card */}
        {featuredPitch ? (
          <TouchableOpacity
            style={styles.featuredHero}
            onPress={() => router.push(`/pitch/${featuredPitch.id}`)}
            activeOpacity={0.9}
          >
            <Image 
              source={{ uri: featuredPitch.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80' }} 
              style={styles.featuredImg} 
            />
            <View style={styles.featuredOverlay}>
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>{featuredPitch.industry}</Text>
              </View>
              <Text style={styles.featuredName}>{featuredPitch.businessName}</Text>
              <Text style={styles.featuredDesc} numberOfLines={2}>
                {featuredPitch.shortDescription}
              </Text>
              <Text style={styles.featuredFunded}>
                {Math.round((featuredPitch.amountRaised / featuredPitch.amountNeeded) * 100)}% funded
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.featuredHero, { justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface }]}>
            {isLoadingPitches ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Text style={{ color: Colors.textMuted }}>No featured opportunities</Text>
            )}
          </View>
        )}

        {/* Pitch list */}
        <View style={styles.pitchList}>
          {isLoadingPitches ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
          ) : (
            pitches.slice(0, 4).map((pitch) => (
              <PitchCard key={pitch.id} pitch={pitch} compact />
            ))
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
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
  tagline: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 28,
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
  searchBar: {
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  portfolioCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  portfolioLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  changeText: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '500',
  },

  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 14,
  },
  shortcut: {
    alignItems: 'center',
    gap: 4,
  },
  shortcutLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  viewAll: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  featuredHero: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    height: 200,
  },
  featuredImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    gap: 4,
  },
  featuredBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  featuredBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  featuredName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  featuredDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  featuredFunded: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
  },
  pitchList: {
    paddingHorizontal: 20,
  },
});
