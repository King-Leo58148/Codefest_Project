import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { MOCK_BIDS } from '@/services/mockData';
import { Bid } from '@/types';

function BidCard({ bid, onAccept, onReject }: {
  bid: Bid;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const statusColors = {
    PENDING: { bg: '#FFF7ED', text: '#EA580C' },
    COUNTERED: { bg: '#EFF6FF', text: '#3B82F6' },
    ACCEPTED: { bg: '#F0FDF4', text: Colors.accent },
    REJECTED: { bg: '#FFF1F2', text: Colors.accentRed },
  };
  const sc = statusColors[bid.status] || statusColors.PENDING;

  return (
    <View style={styles.bidCard}>
      <View style={styles.bidCardHeader}>
        <View style={styles.investorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{bid.investorName[0]}</Text>
          </View>
          <View>
            <Text style={styles.investorName}>{bid.investorName}</Text>
            <Text style={styles.bidDate}>{bid.createdAt}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.statusText, { color: sc.text }]}>{bid.status}</Text>
        </View>
      </View>

      <View style={styles.bidDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={styles.detailValue}>GH₵{bid.amount.toLocaleString()}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>{bid.returnType}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Return</Text>
          <Text style={styles.detailValue}>{bid.returnValue}%</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Timeline</Text>
          <Text style={styles.detailValue}>{bid.timelineMonths} months</Text>
        </View>
      </View>

      {bid.note && (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>{bid.note}</Text>
        </View>
      )}

      {bid.status === 'PENDING' && (
        <View style={styles.bidActions}>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => onReject(bid.id)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={16} color={Colors.accentRed} />
            <Text style={styles.rejectBtnText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => router.push(`/bid/${bid.id}`)}
            activeOpacity={0.8}
          >
            <Ionicons name="git-compare-outline" size={16} color={Colors.primary} />
            <Text style={styles.counterBtnText}>Counter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => onAccept(bid.id)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.acceptBtnText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function BidsScreen() {
  const [bids, setBids] = useState(MOCK_BIDS);
  const [filter, setFilter] = useState<'All' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('All');

  const filtered = bids.filter(
    (b) => filter === 'All' || b.status === filter
  );

  const handleAccept = (id: string) => {
    Alert.alert('Accept Bid', 'Are you sure you want to accept this bid? This will move to the deal room.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: () => {
          setBids((prev) =>
            prev.map((b) => (b.id === id ? { ...b, status: 'ACCEPTED' } : b))
          );
          router.push('/deal/d1');
        },
      },
    ]);
  };

  const handleReject = (id: string) => {
    Alert.alert('Decline Bid', 'Are you sure you want to decline this bid?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () => {
          setBids((prev) =>
            prev.map((b) => (b.id === id ? { ...b, status: 'REJECTED' } : b))
          );
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Bids</Text>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(['All', 'PENDING', 'ACCEPTED', 'REJECTED'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === f && styles.filterChipTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BidCard bid={item} onAccept={handleAccept} onReject={handleReject} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No bids yet</Text>
            <Text style={styles.emptyDesc}>
              Investors will be able to bid on your live pitches.
            </Text>
          </View>
        }
      />
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  bidCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  bidCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  investorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  investorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bidDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bidDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: Colors.borderLight,
    borderRadius: 10,
    padding: 12,
  },
  detailItem: {
    width: '44%',
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  noteBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#EA580C',
  },
  noteText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  bidActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFF1F2',
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accentRed,
  },
  counterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.borderLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  counterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
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
