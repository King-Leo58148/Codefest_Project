import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { PitchCard } from '@/components/pitch/PitchCard';
import { MOCK_PITCHES } from '@/services/mockData';
import { Industry, Pitch } from '@/types';

const INDUSTRIES: Industry[] = [
  'All',
  'Technology',
  'Food & Bev',
  'Health',
  'Sustainability',
  'Fitness',
  'Agriculture',
  'Retail',
];

export default function ExploreScreen() {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('All');
  const [search, setSearch] = useState('');

  const filtered = MOCK_PITCHES.filter((p) => {
    const matchIndustry =
      selectedIndustry === 'All' || p.industry === selectedIndustry;
    const matchSearch =
      !search ||
      p.businessName.toLowerCase().includes(search.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    return matchIndustry && matchSearch;
  });

  const renderHeader = useCallback(
    () => (
      <>
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search businesses or industries"
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={INDUSTRIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.industryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.industryChip,
                selectedIndustry === item && styles.industryChipActive,
              ]}
              onPress={() => setSelectedIndustry(item)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.industryChipText,
                  selectedIndustry === item && styles.industryChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Featured */}
        {selectedIndustry === 'All' && !search && (
          <>
            <Text style={styles.sectionLabel}>Featured</Text>
          </>
        )}

        <Text style={styles.resultCount}>
          {filtered.length} {filtered.length === 1 ? 'opportunity' : 'opportunities'}
        </Text>
      </>
    ),
    [selectedIndustry, search, filtered.length]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <PitchCard pitch={item} />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyDesc}>
              Try a different search term or industry filter.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  list: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  filterBtn: {
    width: 38,
    height: 38,
    backgroundColor: Colors.surface,
    borderRadius: 10,
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
    backgroundColor: Colors.surface,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  industryList: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 8,
  },
  industryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 0,
  },
  industryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  industryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  industryChipTextActive: {
    color: '#fff',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
  },
  resultCount: {
    fontSize: 13,
    color: Colors.textMuted,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  cardWrapper: {
    paddingHorizontal: 20,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
