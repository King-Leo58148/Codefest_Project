import React, { useState } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { getMyDeals } from '@/services/api';

export default function PortfolioScreen() {
  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['myDeals'],
    queryFn: () => getMyDeals(),
  });

  const activeDeals = deals.filter(deal => 
    ['PENDING_SIGNATURES', 'PENDING_MFI', 'MFI_APPROVED', 'PAYMENT_PENDING', 'FUNDED', 'ACTIVE'].includes(deal.status)
  );

  const totalInvested = activeDeals.reduce((sum, deal) => sum + deal.amount, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Deals</Text>
        </View>

        {/* Main summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Invested</Text>
            <Text style={styles.summaryValue}>
              {isLoading ? 'Loading...' : `GH₵${totalInvested.toLocaleString()}`}
            </Text>
          </View>
        </View>

        {/* Active Deals List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Deals</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
          ) : activeDeals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No active deals yet.</Text>
            </View>
          ) : (
            activeDeals.map((deal) => (
              <TouchableOpacity
                key={deal.id}
                style={styles.investCard}
                onPress={() => router.push(`/deal/${deal.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.investInfo}>
                  <Text style={styles.investName}>{deal.businessName}</Text>
                  <Text style={styles.investIndustry}>Status: {deal.status.replace(/_/g, ' ')}</Text>
                </View>
                <View style={styles.investRight}>
                  <Text style={styles.investValue}>GH₵{deal.amount.toLocaleString()}</Text>
                  <Text style={styles.investStatusLabel}>View Room</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  investCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  investInfo: {
    flex: 1,
  },
  investName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  investIndustry: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  investRight: {
    alignItems: 'flex-end',
  },
  investValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  investStatusLabel: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
});
