import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { MOCK_DEALS } from '@/services/mockData';

export default function RepaymentScheduleScreen() {
  const { pitchId } = useLocalSearchParams<{ pitchId: string }>();
  
  // Find the deal associated with this pitch
  const deal = MOCK_DEALS.find((d) => d.pitchId === pitchId);

  if (!deal) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Repayments</Text>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>No active deal found for this pitch.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { repaymentSchedule } = deal;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COLLECTED':
        return Colors.accent;
      case 'PENDING':
        return Colors.primary;
      case 'MISSED':
        return Colors.accentRed;
      default:
        return Colors.textMuted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COLLECTED':
        return 'checkmark-circle';
      case 'PENDING':
        return 'time-outline';
      case 'MISSED':
        return 'close-circle';
      default:
        return 'ellipse-outline';
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Repayment Schedule</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{deal.businessName}</Text>
          <Text style={styles.summarySubtitle}>
            Total Investment: GH₵{deal.amount.toLocaleString()}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Timeline</Text>
        
        {repaymentSchedule.length === 0 ? (
          <Text style={styles.emptyText}>No repayment schedule has been generated yet.</Text>
        ) : (
          <View style={styles.timeline}>
            {repaymentSchedule.map((repayment, index) => {
              const isLast = index === repaymentSchedule.length - 1;
              const statusColor = getStatusColor(repayment.status);
              
              return (
                <View key={repayment.id} style={styles.timelineItem}>
                  {/* Left Column: Icon and Line */}
                  <View style={styles.timelineLeft}>
                    <Ionicons 
                      name={getStatusIcon(repayment.status)} 
                      size={24} 
                      color={statusColor} 
                    />
                    {!isLast && <View style={[styles.timelineLine, { backgroundColor: statusColor }]} />}
                  </View>
                  
                  {/* Right Column: Details */}
                  <View style={styles.timelineRight}>
                    <View style={styles.repaymentCard}>
                      <View style={styles.repaymentHeader}>
                        <Text style={styles.dueDate}>{repayment.dueDate}</Text>
                        <Text style={[styles.statusBadge, { color: statusColor, backgroundColor: `${statusColor}20` }]}>
                          {repayment.status}
                        </Text>
                      </View>
                      
                      <Text style={styles.amount}>GH₵{repayment.amount.toLocaleString()}</Text>
                      
                      {repayment.collectedAt && (
                        <Text style={styles.collectedText}>
                          Collected on {repayment.collectedAt}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: Colors.borderLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 40,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 24,
    paddingLeft: 12,
  },
  repaymentCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  repaymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dueDate: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  amount: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  collectedText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
  },
});
