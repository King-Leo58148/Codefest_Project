import React from 'react';
import { Video, ResizeMode } from 'expo-av';
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
import { Colors } from '@/constants/Colors';
import { useQuery } from '@tanstack/react-query';
import { getPitch } from '@/services/api';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

export default function PitchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data: pitch, isLoading } = useQuery({
    queryKey: ['pitch', id],
    queryFn: () => getPitch(id as string),
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!pitch) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Pitch not found.</Text>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const fundedPercent = (pitch.amountRaised / pitch.amountNeeded) * 100;
  const isInvestor = user?.role === 'INVESTOR';

  const summaryItems = [
    { label: 'Equity offered', value: `${pitch.offerValue}%` },
    { label: 'Pre-money valuation', value: `GH₵${pitch.preMoneyValuation.toLocaleString()}` },
    { label: 'Minimum investment', value: `GH₵${pitch.minimumInvestment.toLocaleString()}` },
    { label: 'Campaign ends', value: new Date(pitch.campaignEndDate).toLocaleDateString() },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image / Video */}
        <View style={styles.heroContainer}>
          {pitch.videoUrl ? (
            <Video
              source={{ uri: pitch.videoUrl }}
              style={styles.heroImage}
              useNativeControls
              resizeMode={ResizeMode.COVER}
            />
          ) : (
            <Image 
              source={{ uri: pitch.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80' }} 
              style={styles.heroImage} 
            />
          )}
          <View style={styles.heroOverlay}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.heroActionBtn} activeOpacity={0.8}>
                <Ionicons name="share-social-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroActionBtn} activeOpacity={0.8}>
                <Ionicons name="heart-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Badge + title */}
          <Badge label={pitch.industry} industry={pitch.industry} />
          <Text style={styles.title}>{pitch.businessName}</Text>
          <Text style={styles.shortDesc}>{pitch.shortDescription}</Text>

          {/* Meta */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.metaText}>{pitch.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.metaText}>Founded {pitch.foundedYear}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.metaText}>GH₵{(pitch.revenue / 1000).toFixed(0)}k rev.</Text>
            </View>
          </View>

          {/* Funding progress */}
          <Text style={styles.sectionTitle}>Funding progress</Text>
          <View style={styles.fundingCard}>
            <ProgressBar percent={fundedPercent} height={8} showLabel />
            <View style={styles.fundingDetails}>
              <Text style={styles.fundingRaised}>
                GH₵{pitch.amountRaised.toLocaleString()} raised
              </Text>
              <Text style={styles.fundingGoal}>
                Goal: GH₵{pitch.amountNeeded.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Investment summary */}
          <Text style={styles.sectionTitle}>Investment summary</Text>
          <View style={styles.summaryCard}>
            {summaryItems.map((item, i) => (
              <View key={item.label}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{item.label}</Text>
                  <Text style={styles.summaryValue}>{item.value}</Text>
                </View>
                {i < summaryItems.length - 1 && <View style={styles.summaryDivider} />}
              </View>
            ))}
          </View>

          {/* Legal note */}
          <View style={styles.legalNote}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.legalText}>
              You'll be investing under a SAFE (Simple Agreement for Future Equity). All deals
              are legally backed by our MFI partner.{' '}
              <Text style={styles.legalLink}>Learn more</Text>
            </Text>
          </View>

          {/* About */}
          <Text style={styles.sectionTitle}>About the business</Text>
          <Text style={styles.description}>{pitch.description}</Text>

          {/* Owner */}
          <View style={styles.ownerRow}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.ownerAvatarText}>{pitch.ownerName[0]}</Text>
            </View>
            <View>
              <Text style={styles.ownerName}>{pitch.ownerName}</Text>
              <Text style={styles.ownerLabel}>Business owner</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      {isInvestor && (
        <View style={styles.cta}>
          <Button
            title="Invest now"
            onPress={() => router.push(`/invest/${pitch.id}`)}
          />
          <Text style={styles.ctaDisclaimer}>
            By continuing, you agree to the terms and conditions.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
  backLink: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  heroContainer: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: 'linear-gradient(rgba(0,0,0,0.3), transparent)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 8,
  },
  heroActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  shortDesc: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  fundingCard: {
    backgroundColor: Colors.borderLight,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  fundingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fundingRaised: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  fundingGoal: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  summaryCard: {
    backgroundColor: Colors.borderLight,
    borderRadius: 12,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 14,
  },
  legalNote: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    alignItems: 'flex-start',
  },
  legalText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primary,
    lineHeight: 18,
  },
  legalLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  ownerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  ownerLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  cta: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  ctaDisclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
