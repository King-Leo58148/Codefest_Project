import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/store/themeStore';
import { PitchCard } from '@/components/pitch/PitchCard';
import { ScreenState } from '@/components/ui/ScreenState';
import { PitchCardSkeleton } from '@/components/ui/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { getPitches } from '@/services/api';
import { Industry } from '@/types';

const INDUSTRIES: Industry[] = [
  'All', 'Technology', 'Food & Bev', 'Health', 'Sustainability',
  'Fitness', 'Agriculture', 'Retail',
];

function IndustryChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { isDark, colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 280, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          styles.industryChip,
          { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
          active && { backgroundColor: isDark ? colors.accent : colors.primary, borderColor: isDark ? colors.accent : colors.primary },
        ]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        {active && <View style={styles.chipActiveDot} />}
        <Text style={[
          styles.industryChipText,
          { color: colors.textSecondary },
          active && { color: '#FFFFFF', fontWeight: '800' },
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ExploreScreen() {
  const { colors, isDark } = useTheme();
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: pitches = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['pitches'],
    queryFn: () => getPitches(),
  });

  const filteredPitches = pitches.filter((p) => {
    const matchesIndustry =
      selectedIndustry === 'All' ||
      p.industry.toLowerCase() === selectedIndustry.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      p.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesIndustry && matchesSearch;
  });

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.heading, { color: colors.textPrimary }]}>Explore Pitches</Text>
            <Text style={[styles.subheading, { color: colors.textSecondary }]}>Discover Ghana's next big businesses</Text>
          </View>
          {pitches.length > 0 && (
            <View style={[styles.countBadge, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.countBadgeText, { color: colors.textPrimary }]}>{pitches.length} Live</Text>
            </View>
          )}
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search business, industry, location..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Industry Chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={INDUSTRIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <IndustryChip
              label={item}
              active={selectedIndustry === item}
              onPress={() => setSelectedIndustry(item)}
            />
          )}
          contentContainerStyle={styles.chipsContainer}
        />
      </View>
    ),
    [selectedIndustry, searchQuery, pitches.length, colors, isDark]
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {isLoading ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(item) => item.toString()}
          ListHeaderComponent={renderHeader}
          renderItem={() => <PitchCardSkeleton />}
          contentContainerStyle={styles.listContent}
        />
      ) : isError ? (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <>
              {renderHeader()}
              <ScreenState
                icon="wifi-outline"
                title="Could not load pitches"
                detail={(error as Error)?.message || 'Check connection'}
                action="Try Again"
                onPress={() => refetch()}
              />
            </>
          }
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={filteredPitches}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => <PitchCard pitch={item} />}
          ListEmptyComponent={
            <ScreenState
              icon="search-outline"
              title="No pitches found"
              detail={
                searchQuery || selectedIndustry !== 'All'
                  ? 'Try clearing filters or search keywords.'
                  : 'Check back soon for new opportunities.'
              }
            />
          }
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerContainer: {
    paddingTop: 12,
    paddingBottom: 16,
    gap: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 13,
    marginTop: 2,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  chipsContainer: {
    gap: 8,
    paddingRight: 16,
  },
  industryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  industryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
