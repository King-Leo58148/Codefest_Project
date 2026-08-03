import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pitch, Industry } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { FadeInView } from '@/components/ui/FadeInView';
import { useTheme } from '@/store/themeStore';

interface PitchCardProps {
  pitch: Pitch;
  compact?: boolean;
  delay?: number;
}

function formatOfferType(offerType: string | undefined) {
  if (offerType === 'REVENUE_SHARE') return 'Rev. Share';
  if (offerType === 'FIXED') return 'Fixed Return';
  return 'Equity';
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const { colors } = useTheme();
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <View style={[pbStyles.track, { backgroundColor: colors.surfaceSubtle }]}>
      <View style={[pbStyles.fill, { width: `${pct}%` as any }]} />
    </View>
  );
}

const pbStyles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    backgroundColor: '#16A34A',
    borderRadius: 2,
  },
});

function PulsePlayButton() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.4,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [scaleAnim, opacityAnim]);

  return (
    <View style={pulseStyles.playContainer}>
      <Animated.View
        style={[
          pulseStyles.pulseCircle,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      <View style={pulseStyles.playButton}>
        <Ionicons name="play" size={16} color="#FFFFFF" style={{ marginLeft: 2 }} />
      </View>
    </View>
  );
}

const pulseStyles = StyleSheet.create({
  playContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function PitchCard({ pitch, compact = false, delay = 0 }: PitchCardProps) {
  const { colors, isDark } = useTheme();
  const fundedPercent = pitch.amountNeeded > 0
    ? Math.min((pitch.amountRaised / pitch.amountNeeded) * 100, 100)
    : 0;

  const handlePress = () => {
    router.push(`/pitch/${pitch.id}`);
  };

  const handleBidPress = () => {
    router.push({ pathname: '/invest/[id]', params: { id: pitch.id } });
  };

  if (compact) {
    return (
      <FadeInView delay={delay}>
        <TouchableOpacity
          style={[styles.compactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handlePress}
          activeOpacity={0.88}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: pitch.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800' }}
              style={styles.compactImage}
              resizeMode="cover"
            />
            {pitch.videoUrl ? (
              <View style={styles.videoBadge}>
                <Ionicons name="play-circle" size={16} color="#FFFFFF" />
              </View>
            ) : null}
            <View style={styles.badgeTopLeft}>
              <Badge label={pitch.industry} industry={pitch.industry as Industry} size="sm" />
            </View>
          </View>

          <View style={styles.compactContent}>
            <Text style={[styles.compactTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {pitch.businessName}
            </Text>
            <Text style={[styles.location, { color: colors.textSecondary }]} numberOfLines={1}>
              📍 {pitch.location}
            </Text>

            <View style={styles.compactProgressSection}>
              <ProgressBar value={pitch.amountRaised} max={pitch.amountNeeded} />
              <View style={styles.compactMetricsRow}>
                <Text style={styles.amountRaised}>
                  GH₵{pitch.amountRaised.toLocaleString()}
                </Text>
                <Text style={styles.percentText}>{fundedPercent.toFixed(0)}%</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </FadeInView>
    );
  }

  return (
    <FadeInView delay={delay}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={handlePress}
        activeOpacity={0.92}
      >
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: pitch.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800' }}
            style={styles.bannerImage}
            resizeMode="cover"
          />

          {pitch.videoUrl ? (
            <View style={styles.videoOverlay}>
              <PulsePlayButton />
              <Text style={styles.videoLabel}>Watch Pitch Video</Text>
            </View>
          ) : null}

          <View style={styles.bannerBadgeOverlay}>
            <Badge label={pitch.industry} industry={pitch.industry as Industry} size="sm" />
            {pitch.status === 'LIVE' ? (
              <View style={styles.liveChip}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.businessName, { color: colors.textPrimary }]} numberOfLines={1}>
                {pitch.businessName}
              </Text>
              <Text style={[styles.location, { color: colors.textSecondary }]}>📍 {pitch.location}</Text>
            </View>

            <View style={styles.offerBadge}>
              <Text style={styles.offerValue}>
                {pitch.offerType === 'FIXED' ? `GH₵${pitch.offerValue}` : `${pitch.offerValue}%`}
              </Text>
              <Text style={styles.offerType}>{formatOfferType(pitch.offerType)}</Text>
            </View>
          </View>

          <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={2}>
            {pitch.summary}
          </Text>

          <View style={styles.progressContainer}>
            <ProgressBar value={pitch.amountRaised} max={pitch.amountNeeded} />
            <View style={styles.metricsRow}>
              <View>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Raised</Text>
                <Text style={styles.raisedValue}>
                  GH₵{pitch.amountRaised.toLocaleString()}
                </Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Goal</Text>
                <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                  GH₵{pitch.amountNeeded.toLocaleString()}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Progress</Text>
                <Text style={styles.percentValue}>{fundedPercent.toFixed(0)}%</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.cardFooter, { backgroundColor: colors.surfaceSubtle, borderTopColor: colors.border }]}>
          <View style={styles.ownerInfo}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(pitch.ownerName || pitch.businessName)[0].toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.ownerName, { color: colors.textPrimary }]} numberOfLines={1}>
              {pitch.ownerName || 'Business Owner'}
            </Text>
          </View>

          <TouchableOpacity style={styles.bidButton} onPress={handleBidPress} activeOpacity={0.8}>
            <Text style={styles.bidButtonText}>Place Bid</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  bannerContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  videoLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bannerBadgeOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(22, 163, 74, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  location: {
    fontSize: 12,
    marginTop: 2,
  },
  offerBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  offerValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#16A34A',
  },
  offerType: {
    fontSize: 10,
    color: '#15803D',
    fontWeight: '600',
  },
  summary: {
    fontSize: 13,
    lineHeight: 18,
  },
  progressContainer: {
    gap: 8,
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  raisedValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  percentValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0D1B3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  ownerName: {
    fontSize: 13,
    fontWeight: '600',
  },
  bidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0D1B3E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  bidButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Compact Mode */
  compactCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
    height: 100,
  },
  imageContainer: {
    width: 100,
    height: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  badgeTopLeft: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  compactContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  compactProgressSection: {
    gap: 4,
  },
  compactMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountRaised: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
});
