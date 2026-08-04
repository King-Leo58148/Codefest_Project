import React from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/store/themeStore';
import { useQuery } from '@tanstack/react-query';
import { getPitch } from '@/services/api';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import type { Industry } from '@/types';

export default function PitchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { isDark, colors } = useTheme();

  const { data: pitch, isLoading } = useQuery({
    queryKey: ['pitch', id],
    queryFn: () => getPitch(id as string),
  });

  const player = useVideoPlayer(pitch?.videoUrl || null);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={isDark ? colors.accent : colors.primary} />
      </SafeAreaView>
    );
  }

  if (!pitch) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.textPrimary }]}>Pitch not found.</Text>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const fundedPercent = pitch.amountNeeded ? ((pitch.amountRaised ?? 0) / pitch.amountNeeded) * 100 : 0;
  const isInvestor = user?.role === 'INVESTOR';

  const summaryItems = [
    { 
      label: pitch.offerType === 'EQUITY' ? 'Equity offered' : pitch.offerType === 'REVENUE_SHARE' ? 'Revenue share' : 'Fixed return', 
      value: pitch.offerType === 'FIXED' ? `GH₵${pitch.offerValue}` : `${pitch.offerValue}%` 
    },
    { label: 'Pre-money valuation', value: `GH₵${(pitch.preMoneyValuation ?? 0).toLocaleString()}` },
    { label: 'Min investment', value: `GH₵${(pitch.minInvestment ?? 0).toLocaleString()}` },
    { label: 'Max investment', value: `GH₵${(pitch.maxInvestment ?? 0).toLocaleString()}` },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Custom Header */}
      <View style={[styles.customHeader, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {pitch.businessName}
        </Text>

        {isInvestor ? (
          <TouchableOpacity style={styles.headerShareBtn} onPress={() => {}}>
            <Ionicons name="share-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.headerEditBtn}
            onPress={() => router.push({ pathname: '/(owner)/pitches', params: { editId: pitch.id } })}
          >
            <Ionicons name="create-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Media Player / Image Banner */}
        <View style={styles.mediaContainer}>
          {pitch.videoUrl ? (
            <VideoView
              player={player}
              allowsFullscreen
              allowsPictureInPicture
              contentFit="contain"
              style={styles.videoPlayer}
            />
          ) : (
            <Image
              source={{ uri: pitch.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800' }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Business Title & Location */}
        <View style={styles.titleSection}>
          <Text style={[styles.businessName, { color: colors.textPrimary }]}>{pitch.businessName}</Text>
          <View style={styles.metaRow}>
            <Badge label={pitch.industry} industry={pitch.industry as Industry} size="sm" />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>📍 {pitch.location}</Text>
          </View>
        </View>

        {/* Progress Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.raisedRow}>
            <View>
              <Text style={[styles.raisedLabel, { color: colors.textSecondary }]}>Raised so far</Text>
              <Text style={styles.raisedAmount}>GH₵{(pitch.amountRaised ?? 0).toLocaleString()}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.targetLabel, { color: colors.textSecondary }]}>Target goal</Text>
              <Text style={[styles.targetAmount, { color: colors.textPrimary }]}>
                GH₵{(pitch.amountNeeded ?? 0).toLocaleString()}
              </Text>
            </View>
          </View>

          <ProgressBar percent={fundedPercent} height={10} color="#16A34A" />

          <View style={styles.progressFooter}>
            <Text style={styles.progressPercent}>{fundedPercent.toFixed(0)}% funded</Text>
            <Text style={[styles.investorCount, { color: colors.textSecondary }]}>
              {pitch.totalBids || 0} bids received
            </Text>
          </View>
        </View>

        {/* Financial Overview Grid */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Deal Parameters</Text>
          <View style={styles.grid}>
            {summaryItems.map((item, i) => (
              <View key={i} style={[styles.gridCell, { backgroundColor: colors.surfaceSubtle }]}>
                <Text style={[styles.cellLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                <Text style={[styles.cellValue, { color: colors.textPrimary }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Business Overview / Elevator Pitch */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>About the Business</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{pitch.summary}</Text>
        </View>

        {/* Problem & Solution */}
        {(pitch.problem || pitch.solution) && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {pitch.problem ? (
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>The Problem</Text>
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{pitch.problem}</Text>
              </View>
            ) : null}
            {pitch.solution ? (
              <View>
                <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>Our Solution</Text>
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{pitch.solution}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Market Traction */}
        {pitch.traction ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Market Traction</Text>
            <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{pitch.traction}</Text>
          </View>
        ) : null}

        {/* Founder & Business Info */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Founder & Business Info</Text>
          <View style={styles.founderRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(pitch.ownerName || pitch.businessName)[0].toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={[styles.founderName, { color: colors.textPrimary }]}>
                {pitch.ownerName || 'Business Founder'}
              </Text>
              <Text style={[styles.founderTitle, { color: colors.textSecondary }]}>Owner / Representative</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {isInvestor ? (
          <Button
            title="Place Bid / Offer"
            onPress={() => router.push({ pathname: '/invest/[id]', params: { id: pitch.id } })}
            style={styles.actionBtn}
          />
        ) : (
          <Button
            title="Manage Pitch & Bids"
            onPress={() => router.push({ pathname: '/(owner)/pitches', params: { pitchId: pitch.id } })}
            style={styles.actionBtn}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  customHeader: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerBackBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerShareBtn: {
    padding: 4,
  },
  headerEditBtn: {
    padding: 4,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '700',
  },
  backLink: {
    color: '#16A34A',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  mediaContainer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  titleSection: {
    gap: 6,
  },
  businessName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  raisedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  raisedLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  raisedAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#16A34A',
  },
  targetLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  targetAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  investorCount: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridCell: {
    width: '48%',
    padding: 10,
    borderRadius: 12,
    gap: 2,
  },
  cellLabel: {
    fontSize: 11,
  },
  cellValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
  },
  founderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0D1B3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  founderName: {
    fontSize: 15,
    fontWeight: '800',
  },
  founderTitle: {
    fontSize: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  actionBtn: {
    width: '100%',
  },
});
