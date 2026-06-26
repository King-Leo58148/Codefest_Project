import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { MiniChart } from '@/components/portfolio/MiniChart';
import { MOCK_INVESTMENTS, CHART_DATA } from '@/services/mockData';

const TIME_FILTERS = ['1D', '1W', '1M', '1Y', 'All'];

export default function PortfolioScreen() {
  const [activeFilter, setActiveFilter] = useState('All');

  const totalValue = MOCK_INVESTMENTS.reduce((s, i) => s + i.currentValue, 0);
  const totalChange = MOCK_INVESTMENTS.reduce((s, i) => s + i.change, 0);
  const totalPercent = ((totalChange / (totalValue - totalChange)) * 100).toFixed(1);
  const isPositive = totalChange >= 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Portfolio</Text>
        </View>

        {/* Portfolio Card */}
        <View style={styles.portfolioCard}>
          <Text style={styles.totalLabel}>Total value</Text>
          <Text style={styles.totalValue}>GH₵{totalValue.toLocaleString()}</Text>
          <View style={styles.changeRow}>
            <Ionicons
              name={isPositive ? 'arrow-up' : 'arrow-down'}
              size={12}
              color={isPositive ? Colors.accent : Colors.accentRed}
            />
            <Text
              style={[
                styles.changeText,
                { color: isPositive ? Colors.accent : Colors.accentRed },
              ]}
            >
              GH₵{Math.abs(totalChange).toLocaleString()} ({Math.abs(Number(totalPercent))}%) All
              time
            </Text>
          </View>

          {/* Time filter */}
          <View style={styles.timeFilters}>
            {TIME_FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                onPress={() => setActiveFilter(f)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === f && styles.filterChipTextActive,
                  ]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <MiniChart data={CHART_DATA} width={320} height={100} showFill />
        </View>

        {/* Investments */}
        <Text style={styles.sectionTitle}>Your investments</Text>
        {MOCK_INVESTMENTS.map((inv) => (
          <TouchableOpacity
            key={inv.pitchId}
            style={styles.investmentRow}
            onPress={() => router.push(`/pitch/${inv.pitchId}`)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: inv.imageUrl }} style={styles.investImg} />
            <View style={styles.investInfo}>
              <Text style={styles.investName}>{inv.businessName}</Text>
              <Text style={styles.investIndustry}>{inv.industry}</Text>
            </View>
            <View style={styles.investValues}>
              <Text style={styles.investValue}>GH₵{inv.currentValue.toLocaleString()}</Text>
              <View style={styles.changeChip}>
                <Ionicons
                  name={inv.change >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={10}
                  color={inv.change >= 0 ? Colors.accent : Colors.accentRed}
                />
                <Text
                  style={[
                    styles.changeChipText,
                    {
                      color:
                        inv.change >= 0 ? Colors.accent : Colors.accentRed,
                    },
                  ]}
                >
                  {Math.abs(inv.changePercent).toFixed(1)}%
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

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
  portfolioCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  totalLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  timeFilters: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.borderLight,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  investmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 12,
  },
  investImg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  investInfo: {
    flex: 1,
  },
  investName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  investIndustry: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  investValues: {
    alignItems: 'flex-end',
    gap: 4,
  },
  investValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  changeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
