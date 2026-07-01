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
import { Colors } from '@/constants/Colors';
import { MOCK_BIDS } from '@/services/mockData';
import { Button } from '@/components/ui/Button';

export default function BidDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bid = MOCK_BIDS.find((b) => b.id === id) ?? MOCK_BIDS[0];

  const [counterAmount, setCounterAmount] = useState(bid.amount.toString());
  const [counterReturn, setCounterReturn] = useState(bid.returnValue.toString());
  const [counterTimeline, setCounterTimeline] = useState(bid.timelineMonths.toString());
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCounter = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    Alert.alert(
      'Counter-offer sent!',
      'Your counter-offer has been sent to the investor. They will review and respond.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bid Details</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Investor info */}
        <View style={styles.investorCard}>
          <View style={styles.investorAvatar}>
            <Text style={styles.investorAvatarText}>{bid.investorName[0]}</Text>
          </View>
          <View style={styles.investorInfo}>
            <Text style={styles.investorName}>{bid.investorName}</Text>
            <Text style={styles.bidDate}>Bid placed {bid.createdAt}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBg(bid.status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(bid.status) }]}>
              {bid.status}
            </Text>
          </View>
        </View>

        {/* Original bid */}
        <Text style={styles.sectionTitle}>Original bid</Text>
        <View style={styles.termsCard}>
          {[
            { label: 'Amount', value: `GH₵${bid.amount.toLocaleString()}` },
            { label: 'Return type', value: bid.returnType },
            { label: 'Return value', value: `${bid.returnValue}%` },
            { label: 'Timeline', value: `${bid.timelineMonths} months` },
          ].map((item, i, arr) => (
            <View key={item.label}>
              <View style={styles.termsRow}>
                <Text style={styles.termsLabel}>{item.label}</Text>
                <Text style={styles.termsValue}>{item.value}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.termsDivider} />}
            </View>
          ))}
        </View>

        {bid.note && (
          <View style={styles.noteBox}>
            <Ionicons name="chatbubble-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.noteText}>"{bid.note}"</Text>
          </View>
        )}

        {/* Counter-offer */}
        {bid.status === 'PENDING' && (
          <>
            <Text style={styles.sectionTitle}>Send counter-offer</Text>
            <Text style={styles.counterSubtitle}>
              Adjust the terms below and send a counter-offer to the investor.
            </Text>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Counter amount (GH₵)</Text>
              <View style={styles.fieldInput}>
                <TextInput
                  style={styles.fieldInputText}
                  value={counterAmount}
                  onChangeText={setCounterAmount}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Return value (%)</Text>
              <View style={styles.fieldInput}>
                <TextInput
                  style={styles.fieldInputText}
                  value={counterReturn}
                  onChangeText={setCounterReturn}
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.textMuted}
                />
                <Text style={styles.fieldSuffix}>%</Text>
              </View>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Timeline (months)</Text>
              <View style={styles.fieldInput}>
                <TextInput
                  style={styles.fieldInputText}
                  value={counterTimeline}
                  onChangeText={setCounterTimeline}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textMuted}
                />
                <Text style={styles.fieldSuffix}>mo</Text>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Message (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Explain your counter-offer..."
              placeholderTextColor={Colors.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Button
              title="Send counter-offer"
              onPress={handleCounter}
              loading={loading}
            />
          </>
        )}

        {bid.status === 'ACCEPTED' && (
          <View style={styles.acceptedBanner}>
            <Ionicons name="checkmark-circle" size={22} color={Colors.accent} />
            <View style={styles.acceptedInfo}>
              <Text style={styles.acceptedTitle}>Bid accepted!</Text>
              <Text style={styles.acceptedDesc}>
                The deal has been moved to the deal room for signatures and MFI review.
              </Text>
            </View>
            <Button
              title="Open deal room"
              onPress={() => router.push('/deal/d1')}
              style={styles.dealRoomBtn}
            />
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getStatusBg(status: string) {
  switch (status) {
    case 'PENDING': return '#FFF7ED';
    case 'COUNTERED': return '#EFF6FF';
    case 'ACCEPTED': return '#F0FDF4';
    case 'REJECTED': return '#FFF1F2';
    default: return Colors.borderLight;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING': return '#EA580C';
    case 'COUNTERED': return '#3B82F6';
    case 'ACCEPTED': return Colors.accent;
    case 'REJECTED': return Colors.accentRed;
    default: return Colors.textMuted;
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  investorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.borderLight,
    borderRadius: 14,
    padding: 14,
  },
  investorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  investorAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  investorInfo: { flex: 1 },
  investorName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  bidDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  termsCard: {
    backgroundColor: Colors.borderLight,
    borderRadius: 14,
    overflow: 'hidden',
  },
  termsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  termsLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  termsValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  termsDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 14,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 10,
    padding: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  counterSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: -8,
  },
  fieldRow: { gap: 6 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  fieldInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 50,
  },
  fieldInputText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  fieldSuffix: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  noteInput: {
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 90,
  },
  acceptedBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  acceptedInfo: { gap: 4 },
  acceptedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16A34A',
  },
  acceptedDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  dealRoomBtn: {
    width: '100%',
  },
});
