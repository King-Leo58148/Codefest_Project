import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/store/themeStore';
import { Button } from '@/components/ui/Button';
import { ScreenState } from '@/components/ui/ScreenState';
import { FadeInView } from '@/components/ui/FadeInView';
import { getBid, counterBid } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function BidDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark, colors } = useTheme();
  const queryClient = useQueryClient();

  const { data: bid, isLoading: loadingBid } = useQuery({
    queryKey: ['bid', id],
    queryFn: () => getBid(id as string),
  });

  const [counterAmount, setCounterAmount] = useState('');
  const [counterReturn, setCounterReturn] = useState('');
  const [counterTimeline, setCounterTimeline] = useState('');
  const [note, setNote] = useState('');

  React.useEffect(() => {
    if (bid) {
      setCounterAmount(bid.amount.toString());
      setCounterReturn(bid.returnValue.toString());
      setCounterTimeline(bid.timelineMonths.toString());
    }
  }, [bid]);

  const counterMutation = useMutation({
    mutationFn: () => counterBid(id as string, {
      amount: parseFloat(counterAmount),
      returnType: bid?.returnType,
      returnValue: parseFloat(counterReturn),
      timelineMonths: parseInt(counterTimeline, 10),
      note
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bid', id] });
      queryClient.invalidateQueries({ queryKey: ['ownerBids'] });
      queryClient.invalidateQueries({ queryKey: ['myPitches'] });
      queryClient.invalidateQueries({ queryKey: ['ownerDeals'] });
      Alert.alert(
        'Counter-offer sent!',
        'Your counter-offer has been sent to the investor. They will review and respond.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
    onError: (err: any) => {
      Alert.alert('Counter error', err?.message || 'Could not submit counter offer.');
    }
  });

  if (loadingBid) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <ScreenState loading title="Loading Bid Details..." />
      </SafeAreaView>
    );
  }

  if (!bid) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Bid Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScreenState
          icon="alert-circle-outline"
          title="Bid Not Found"
          detail="Could not find the requested investor bid."
          action="Go Back"
          onPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const returnTypeFormatted =
    bid.returnType === 'REVENUE_SHARE'
      ? `${bid.returnValue}% Revenue Share`
      : bid.returnType === 'EQUITY'
      ? `${bid.returnValue}% Equity Stake`
      : `GH₵${bid.returnValue} Fixed Return`;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Custom Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Investor Bid Offer</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Investor Profile Header Card */}
        <FadeInView style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.investorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(bid.investorName || 'I')[0].toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.investorName, { color: colors.textPrimary }]}>
                {bid.investorName || 'Accredited Investor'}
              </Text>
              <Text style={[styles.investorSub, { color: colors.textSecondary }]}>Ghana Accredited Angel Investor</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: bid.status === 'ACCEPTED' ? (isDark ? '#052E16' : '#DCFCE7') : (isDark ? '#451A03' : '#FEF3C7') }]}>
              <Text style={[styles.statusText, { color: bid.status === 'ACCEPTED' ? (isDark ? '#4ADE80' : '#15803D') : (isDark ? '#FBBF24' : '#B45309') }]}>
                {bid.status}
              </Text>
            </View>
          </View>
        </FadeInView>

        {/* Offer Details Grid */}
        <FadeInView delay={100} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Offer Summary</Text>

          <View style={styles.grid}>
            <View style={[styles.gridCell, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.cellLabel, { color: colors.textSecondary }]}>Capital Amount</Text>
              <Text style={[styles.cellValue, { color: colors.textPrimary }]}>GH₵{bid.amount.toLocaleString()}</Text>
            </View>

            <View style={[styles.gridCell, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.cellLabel, { color: colors.textSecondary }]}>Return Structure</Text>
              <Text style={[styles.cellValue, { color: colors.textPrimary }]}>{returnTypeFormatted}</Text>
            </View>

            <View style={[styles.gridCell, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.cellLabel, { color: colors.textSecondary }]}>Duration / Term</Text>
              <Text style={[styles.cellValue, { color: colors.textPrimary }]}>{bid.timelineMonths} Months</Text>
            </View>

            <View style={[styles.gridCell, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.cellLabel, { color: colors.textSecondary }]}>Submitted Date</Text>
              <Text style={[styles.cellValue, { color: colors.textPrimary }]}>
                {bid.createdAt ? new Date(bid.createdAt).toLocaleDateString() : 'Recent'}
              </Text>
            </View>
          </View>
        </FadeInView>

        {/* Counter-Offer Form */}
        {bid.status === 'PENDING' && (
          <FadeInView delay={200} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Propose Counter-Offer</Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
              Adjust terms and submit counter proposals directly to the investor.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Counter Amount (GH₵)</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  keyboardType="numeric"
                  value={counterAmount}
                  onChangeText={setCounterAmount}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Counter Return Value (%)</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  keyboardType="numeric"
                  value={counterReturn}
                  onChangeText={setCounterReturn}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Note to Investor (Optional)</Text>
              <View style={[styles.inputBox, styles.inputBoxArea, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  multiline
                  placeholder="Explain reason for counter proposal..."
                  placeholderTextColor={colors.textMuted}
                  value={note}
                  onChangeText={setNote}
                />
              </View>
            </View>

            <Button
              title="Submit Counter-Offer"
              onPress={() => counterMutation.mutate()}
              loading={counterMutation.isPending}
              style={styles.submitBtn}
            />
          </FadeInView>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  investorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#0D1B3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  investorName: {
    fontSize: 16,
    fontWeight: '800',
  },
  investorSub: {
    fontSize: 12,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 12,
    marginTop: -4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCell: {
    width: '48%',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  cellLabel: {
    fontSize: 11,
  },
  cellValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputBox: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
    justifyContent: 'center',
  },
  inputBoxArea: {
    height: 80,
    paddingVertical: 8,
  },
  textInput: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 6,
  },
});
