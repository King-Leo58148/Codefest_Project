import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Deal } from '@/types';
import { FadeInView } from '@/components/ui/FadeInView';

interface BusinessFilterPanelProps {
  deals: Deal[];
  /** null = show all */
  selectedDealId: string | null;
  onSelect: (dealId: string | null) => void;
}

/**
 * Horizontal scrollable list of invested businesses.
 * Tapping one filters the charts to that business only.
 * Tapping "All" resets the filter.
 * — Goal-gradient + contrast effect: showing named businesses
 *   with GH₵ amounts makes the portfolio feel tangible.
 */
export function BusinessFilterPanel({
  deals,
  selectedDealId,
  onSelect,
}: BusinessFilterPanelProps) {
  if (deals.length === 0) return null;

  const ACTIVE_STATUSES = ['PENDING_SIGNATURES', 'PENDING_MFI', 'MFI_APPROVED', 'PAYMENT_PENDING', 'FUNDED', 'ACTIVE'];
  const activeDeals = deals.filter(d => ACTIVE_STATUSES.includes(d.status));

  const industryColors: Record<string, string> = {
    'Technology': '#3B82F6',
    'Food & Bev': '#EA580C',
    'Health': '#16A34A',
    'Agriculture': '#D97706',
    'Retail': '#E11D48',
    'Fitness': '#9333EA',
    'Transport': '#0891B2',
    'Fashion': '#DB2777',
    'default': Colors.primary,
  };

  return (
    <FadeInView style={styles.wrapper}>
      <Text style={styles.label}>YOUR BUSINESSES</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {/* All chip */}
        <TouchableOpacity
          style={[styles.chip, selectedDealId === null && styles.chipActive]}
          onPress={() => onSelect(null)}
          activeOpacity={0.75}
        >
          <Text style={[styles.chipText, selectedDealId === null && styles.chipTextActive]}>
            All
          </Text>
        </TouchableOpacity>

        {activeDeals.map((deal, i) => {
          const isSelected = selectedDealId === deal.id;
          // Pick a colour accent per business (cycle through industry colours)
          const colorKeys = Object.keys(industryColors).filter(k => k !== 'default');
          const accent = industryColors[colorKeys[i % colorKeys.length]];

          return (
            <TouchableOpacity
              key={deal.id}
              style={[
                styles.businessCard,
                isSelected && { borderColor: accent, backgroundColor: accent + '12' },
              ]}
              onPress={() => onSelect(isSelected ? null : deal.id)}
              activeOpacity={0.78}
            >
              {/* Colour strip */}
              <View style={[styles.strip, { backgroundColor: accent }]} />
              <View style={styles.cardBody}>
                <Text style={styles.businessName} numberOfLines={1}>
                  {deal.businessName}
                </Text>
                <Text style={[styles.businessAmount, { color: accent }]}>
                  GH₵{deal.amount.toLocaleString()}
                </Text>
                <View style={styles.returnRow}>
                  <Text style={styles.returnType}>{deal.returnType.replace(/_/g, ' ')}</Text>
                  <Text style={styles.returnValue}>{deal.returnValue}%</Text>
                </View>
              </View>
              {isSelected && (
                <View style={[styles.selectedDot, { backgroundColor: accent }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  row: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.borderLight,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignSelf: 'center',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#fff',
  },
  businessCard: {
    width: 130,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  strip: {
    height: 4,
    width: '100%',
  },
  cardBody: {
    padding: 10,
    gap: 3,
  },
  businessName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  businessAmount: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  returnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  returnType: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  returnValue: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  selectedDot: {
    position: 'absolute',
    top: 10,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
