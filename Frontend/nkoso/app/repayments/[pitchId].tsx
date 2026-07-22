import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import {
  getDealRepayments,
  getMyDeals,
  initiateRepaymentPayment,
  verifyRepaymentPayment,
} from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export default function RepaymentScheduleScreen() {
  const { pitchId } = useLocalSearchParams<{ pitchId: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: myDeals = [], isLoading } = useQuery({
    queryKey: ['myDeals'],
    queryFn: () => getMyDeals(),
  });
  
  const deal = myDeals.find((d) => d.pitchId === pitchId);
  const isOwner = user?.role === 'OWNER';

  const {
    data: repaymentSchedule = [],
    isLoading: loadingRepayments,
  } = useQuery({
    queryKey: ['dealRepayments', deal?.id],
    queryFn: () => getDealRepayments(deal!.id),
    enabled: !!deal?.id,
  });

  const payMutation = useMutation({
    mutationFn: async (repaymentId: string) => {
      if (!deal) throw new Error('No deal found.');

      const response = await initiateRepaymentPayment(deal.id, repaymentId);
      if (!response?.authorization_url) {
        throw new Error('Could not start Paystack checkout.');
      }

      await WebBrowser.openBrowserAsync(response.authorization_url);

      let lastError: unknown = null;
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          return await verifyRepaymentPayment(deal.id, repaymentId, response.reference);
        } catch (error) {
          lastError = error;
          await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
        }
      }

      throw lastError instanceof Error ? lastError : new Error('Repayment could not be confirmed.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealRepayments', deal?.id] });
      queryClient.invalidateQueries({ queryKey: ['myDeals'] });
      Alert.alert('Repayment confirmed', 'Your repayment was confirmed through Paystack.');
    },
    onError: (error) => {
      Alert.alert(
        'Repayment not confirmed',
        error instanceof Error ? error.message : 'If checkout completed, pull to refresh in a moment.'
      );
    },
  });

  if (isLoading || loadingRepayments) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

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
                      {isOwner && repayment.status === 'PENDING' && (
                        <TouchableOpacity
                          style={styles.payButton}
                          onPress={() => payMutation.mutate(repayment.id)}
                          disabled={payMutation.isPending}
                        >
                          {payMutation.isPending && payMutation.variables === repayment.id ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Ionicons name="card-outline" size={16} color="#fff" />
                          )}
                          <Text style={styles.payButtonText}>Pay with Paystack</Text>
                        </TouchableOpacity>
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
  payButton: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
