import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pitch } from '@/types';
import { Colors } from '@/constants/Colors';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface PitchCardProps {
  pitch: Pitch;
  compact?: boolean;
}

export function PitchCard({ pitch, compact = false }: PitchCardProps) {
  const fundedPercent = (pitch.amountRaised / pitch.amountNeeded) * 100;

  const handlePress = () => {
    router.push(`/pitch/${pitch.id}`);
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handlePress} activeOpacity={0.8}>
        <Image source={{ uri: pitch.imageUrl }} style={styles.compactImage} />
        <View style={styles.compactContent}>
          <Badge label={pitch.industry} industry={pitch.industry} />
          <Text style={styles.compactName} numberOfLines={1}>
            {pitch.businessName}
          </Text>
          <Text style={styles.compactDesc} numberOfLines={2}>
            {pitch.shortDescription}
          </Text>
          <ProgressBar percent={fundedPercent} />
          <View style={styles.compactFooter}>
            <Text style={styles.fundedLabel}>
              {fundedPercent.toFixed(0)}% funded
            </Text>
            <Text style={styles.raisedText}>
              GH₵{(pitch.amountRaised / 1000).toFixed(0)}k raised
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: pitch.imageUrl }} style={styles.cardImage} />
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
        <ProgressBar percent={fundedPercent} />
        <View style={styles.fundingRow}>
          <Text style={styles.fundedPercent}>{fundedPercent.toFixed(0)}% funded</Text>
          <Text style={styles.raisedAmt}>
            GH₵{pitch.amountRaised.toLocaleString()} raised
          </Text>
          <Text style={styles.goalAmt}>
            of GH₵{pitch.amountNeeded.toLocaleString()}
          </Text>
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
  cardHeader: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
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
  fundingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  fundedPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
  },
  raisedAmt: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  goalAmt: {
    fontSize: 12,
    color: Colors.textMuted,
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
  fundedLabel: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: '600',
  },
  raisedText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
