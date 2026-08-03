import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pitch } from '@/types';
import { Colors } from '@/constants/Colors';
import { Badge } from '@/components/ui/Badge';
import { cardStyles } from '@/components/ui/Card';
import { FadeInView } from '@/components/ui/FadeInView';

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
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <View style={pbStyles.track}>
      <View style={[pbStyles.fill, { width: `${pct}%` as any }]} />
    </View>
  );
}

const pbStyles = StyleSheet.create({
  track: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    backgroundColor: Colors.accent,
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
    <View style={styles.playOverlay}>
      <Animated.View
        style={[
          styles.playPulseRing,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      <View style={styles.playCircle}>
        <Ionicons name="play" size={20} color="#fff" />
      </View>
    </View>
  );
}

export function PitchCard({ pitch, compact = false, delay = 0 }: PitchCardProps) {
  const handlePress = () => {
    router.push(`/pitch/${pitch.id}`);
  };

  const fundedPct = pitch.amountNeeded > 0
    ? Math.round((pitch.amountRaised / pitch.amountNeeded) * 100)
    : 0;

  if (compact) {
    return (
      <FadeInView delay={delay}>
        <TouchableOpacity style={styles.compactCard} onPress={handlePress} activeOpacity={0.75}>
          <Image
            source={{ uri: pitch.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=70' }}
            style={styles.compactImage}
          />
          {/* Left accent bar */}
          <View style={styles.compactAccent} />
          <View style={styles.compactContent}>
            <Badge label={pitch.industry} industry={pitch.industry} size="sm" />
            <Text style={styles.compactName} numberOfLines={1}>
              {pitch.businessName}
            </Text>
            <Text style={styles.compactDesc} numberOfLines={2}>
              {pitch.shortDescription}
            </Text>
            <View style={styles.compactFooter}>
              <Text style={styles.raisedText}>
                GH₵{(pitch.amountNeeded / 1000).toFixed(0)}k · {pitch.offerValue}% {formatOfferType(pitch.offerType)}
              </Text>
              <View style={styles.compactArrow}>
                <Ionicons name="arrow-forward" size={12} color={Colors.primary} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </FadeInView>
    );
  }

  return (
    <FadeInView delay={delay}>
      <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.75}>
        {/* Media */}
        <View style={styles.mediaWrap}>
          <Image
            source={{ uri: pitch.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80' }}
            style={styles.media}
          />
          {pitch.videoUrl ? <PulsePlayButton /> : null}
          {/* Heart / save button */}
          <TouchableOpacity style={styles.heartBtn} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="heart-outline" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
          {/* Industry badge overlay */}
          <View style={styles.badgeOverlay}>
            <Badge label={pitch.industry} industry={pitch.industry} size="sm" />
          </View>
        </View>

        {/* Body */}
        <View style={styles.cardBody}>
          <View style={styles.titleRow}>
            <Text style={styles.businessName} numberOfLines={1}>{pitch.businessName}</Text>
            {pitch.location ? (
              <View style={styles.locationChip}>
                <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
                <Text style={styles.locationText} numberOfLines={1}>{pitch.location}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.shortDesc} numberOfLines={2}>
            {pitch.shortDescription}
          </Text>

          {/* Progress */}
          {pitch.amountRaised != null && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.fundedLabel}>{fundedPct}% funded</Text>
                <Text style={styles.fundedAmount}>
                  GH₵{pitch.amountRaised?.toLocaleString()} raised
                </Text>
              </View>
              <ProgressBar value={pitch.amountRaised} max={pitch.amountNeeded} />
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statValue}>GH₵{pitch.amountNeeded.toLocaleString()}</Text>
              <Text style={styles.statLabel}>asking</Text>
            </View>
            <TouchableOpacity style={styles.viewBtn} onPress={handlePress} activeOpacity={0.82}>
              <Text style={styles.viewBtnText}>
                {pitch.offerValue}% {formatOfferType(pitch.offerType)}
              </Text>
              <Ionicons name="arrow-forward" size={13} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyles.surfaceMed,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18,
  },
  mediaWrap: {
    position: 'relative',
  },
  media: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    backgroundColor: Colors.borderLight,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  playPulseRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  playCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(13, 27, 62, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  heartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ffffffd9',
    borderRadius: 22,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  badgeOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  cardBody: {
    padding: 16,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  businessName: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    flexShrink: 0,
  },
  locationText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    maxWidth: 80,
  },
  shortDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  progressSection: {
    gap: 5,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fundedLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accent,
  },
  fundedAmount: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  viewBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.1,
  },

  // Compact card
  compactCard: {
    ...cardStyles.surface,
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  compactAccent: {
    position: 'absolute',
    left: 78,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.accent,
    opacity: 0.6,
  },
  compactImage: {
    width: 80,
    height: 90,
    resizeMode: 'cover',
    backgroundColor: Colors.borderLight,
  },
  compactContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  compactName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  compactDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    flex: 1,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  raisedText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    flex: 1,
  },
  compactArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
