import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pitch } from '@/types';
import { Colors } from '@/constants/Colors';
import { Badge } from '@/components/ui/Badge';

interface PitchCardProps {
  pitch: Pitch;
  compact?: boolean;
}

function formatOfferType(offerType: string | undefined) {
  if (offerType === 'REVENUE_SHARE') return 'revenue share';
  if (offerType === 'FIXED') return 'fixed repayment';
  return 'equity';
}

export function PitchCard({ pitch, compact = false }: PitchCardProps) {
  const handlePress = () => {
    router.push(`/pitch/${pitch.id}`);
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handlePress} activeOpacity={0.8}>
        <Image 
          source={{ uri: pitch.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80' }} 
          style={styles.compactImage} 
        />
        <View style={styles.compactContent}>
          <Badge label={pitch.industry} industry={pitch.industry} />
          <Text style={styles.compactName} numberOfLines={1}>
            {pitch.businessName}
          </Text>
          <Text style={styles.compactDesc} numberOfLines={2}>
            {pitch.shortDescription}
          </Text>
          <View style={styles.compactFooter}>
            <Text style={styles.raisedText}>
              GH₵{(pitch.amountNeeded / 1000).toFixed(0)}k for {pitch.offerValue}% {formatOfferType(pitch.offerType)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.mediaWrap}>
        <Image source={{ uri: pitch.imageUrl }} style={styles.media} />
        {pitch.videoUrl ? (
          <View style={styles.playOverlay}>
            <Ionicons name="play-circle" size={54} color="#fff" />
          </View>
        ) : null}
        <TouchableOpacity style={styles.heartBtn} activeOpacity={0.7}>
          <Ionicons name="heart-outline" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <Badge label={pitch.industry} industry={pitch.industry} />
        <Text style={styles.businessName}>{pitch.businessName}</Text>
        <Text style={styles.shortDesc} numberOfLines={2}>
          {pitch.shortDescription}
        </Text>
        <View style={styles.cardMeta}>
          <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.metaText}>{pitch.location}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statValue}>GH₵{pitch.amountNeeded.toLocaleString()}</Text>
            <Text style={styles.statLabel}>asking</Text>
          </View>
          <TouchableOpacity style={styles.viewBtn} onPress={handlePress} activeOpacity={0.8}>
            <Text style={styles.viewBtnText}>
              {pitch.offerValue}% {formatOfferType(pitch.offerType)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  heartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ffffffcc',
    borderRadius: 20,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: 16,
    gap: 8,
  },
  businessName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  shortDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
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
  },
  viewBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  viewBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Compact styles
  compactCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  compactImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  compactContent: {
    flex: 1,
    padding: 10,
    gap: 4,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  compactDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  raisedText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});