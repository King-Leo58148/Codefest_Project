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
import { Colors } from '@/constants/Colors';
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

/**
 * Animated industry chip — springs to scale on selection.
 * Principle: micro-interaction + evaluative ease (one clear active state).
 */
function IndustryChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
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
        style={[styles.industryChip, active && styles.industryChipActive]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        {active && <View style={styles.chipActiveDot} />}
        <Text style={[styles.industryChipText, active && styles.industryChipTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ExploreScreen() {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('All');
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Animated border colour on search focus
  const borderAnim = useRef(new Animated.Value(0)).current;
  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.primary],
  });

  const onFocus = () => {
    setIsFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setIsFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const { data: pitches = [], isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['pitches', selectedIndustry],
    queryFn: () => getPitches(selectedIndustry),
  });

  const filtered = pitches.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.businessName.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    );
  });

  const renderHeader = useCallback(
    () => (
      <>
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
          <TouchableOpacity
            style={styles.filterBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="options-outline" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Animated focus search bar */}
        <Animated.View style={[styles.searchBar, { borderColor }]}>
          <Ionicons
            name="search-outline"
            size={18}
            color={isFocused ? Colors.primary : Colors.textMuted}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search businesses or industries"
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Animated chips */}
        <FlatList
          data={INDUSTRIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.industryList}
          renderItem={({ item }) => (
            <IndustryChip
              label={item}
              active={selectedIndustry === item}
              onPress={() => setSelectedIndustry(item)}
            />
          )}
        />

        {/* Result count — upgraded to a styled label */}
        <View style={styles.resultCountRow}>
          <Ionicons
            name={isLoading ? 'hourglass-outline' : 'grid-outline'}
            size={12}
            color={Colors.textMuted}
          />
          <Text style={styles.resultCount}>
            {isLoading
              ? 'Searching opportunities…'
              : `${filtered.length} ${filtered.length === 1 ? 'opportunity' : 'opportunities'} available`}
          </Text>
        </View>
      </>
    ),
    [selectedIndustry, search, filtered.length, isLoading, isFocused, borderColor]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshing={isRefetching}
        onRefresh={refetch}
        renderItem={({ item, index }) => (
          <View style={styles.cardWrapper}>
            <PitchCard pitch={item} delay={index * 30} />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.cardWrapper}>
              <PitchCardSkeleton />
              <PitchCardSkeleton />
              <PitchCardSkeleton />
            </View>
          ) : isError ? (
            <ScreenState
              icon="alert-circle-outline"
              title="Could not load opportunities"
              detail={error instanceof Error ? error.message : 'Please try again.'}
              action="Retry"
              onPress={() => refetch()}
            />
          ) : (
            <ScreenState
              icon="search-outline"
              title="No results found"
              detail="Try a different search term or industry filter."
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: 28 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12,
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  filterBtn: {
    width: 40, height: 40, backgroundColor: Colors.surface, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  searchBar: {
    marginHorizontal: 20, backgroundColor: Colors.surface, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, minHeight: 48, gap: 10, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1, borderWidth: 1.5,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  industryList: { paddingHorizontal: 20, paddingBottom: 8, gap: 8 },
  industryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  industryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipActiveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.accent },
  industryChipText:       { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  industryChipTextActive: { color: '#fff' },
  resultCountRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, marginTop: 4, marginBottom: 10,
  },
  resultCount: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  cardWrapper: { paddingHorizontal: 20 },
});
