import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
  getDeal,
  initiateRepaymentPayment,
  verifyRepaymentPayment,
} from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { ScreenState } from '@/components/ui/ScreenState';

export default function RepaymentScheduleScreen() {
  const { pitchId } = useLocalSearchParams<{ pitchId: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [showCustomPayback, setShowCustomPayback] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const { data: myDeals = [], isLoading: loadingMyDeals } = useQuery({
    queryKey: ['myDeals'],
    queryFn: () => getMyDeals(),
  });

  const { data: singleDeal, isLoading: loadingSingleDeal } = useQuery({
    queryKey: ['deal', pitchId],
    queryFn: () => getDeal(pitchId!),
    enabled: !!pitchId && !myDeals.some((d) => d.pitchId === pitchId || d.id === pitchId),
  });

  const deal = myDeals.find((d) => d.pitchId === pitchId || d.id === pitchId) || singleDeal;
  const isLoading = loadingMyDeals || (loadingSingleDeal && !deal);
  const isOwner = user?.role === 'OWNER';

  const {
    data: rawRepaymentSchedule = [],
    isLoading: loadingRepayments,
    refetch: refetchRepayments,
  } = useQuery({
    queryKey: ['dealRepayments', deal?.id],
    queryFn: () => getDealRepayments(deal!.id),
    enabled: !!deal?.id,
  });

  // Dynamic fallback schedule for active/funded deals if backend schedule isn't pre-generated yet
  const repaymentSchedule = useMemo(() => {
    if (rawRepaymentSchedule && rawRepaymentSchedule.length > 0) {
      return rawRepaymentSchedule;
    }
    if (!deal) return [];
    
    const months = deal.timelineMonths || 12;
    const totalTarget =
      deal.returnType === 'FIXED'
        ? deal.amount + (deal.returnValue || 0)
        : Math.round(deal.amount * (1 + (deal.returnValue || 10) / 100));
    
    const perMonthAmount = Math.round(totalTarget / months);
    const startDate = new Date();

    const generated: any[] = [];
    for (let i = 1; i <= months; i++) {
      const dDate = new Date(startDate);
      dDate.setMonth(dDate.getMonth() + i);
      generated.push({
        id: `gen-${deal.id}-${i}`,
        dueDate: dDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        amount: perMonthAmount,
        status: i === 1 ? 'PENDING' : 'UPCOMING',
        collectedAt: null,
      });
    }
    return generated;
  }, [rawRepaymentSchedule, deal]);

  const payMutation = useMutation({
    mutationFn: async ({ repaymentId, amount }: { repaymentId?: string; amount?: number }) => {
      if (!deal) throw new Error('No deal found.');

      const response = await initiateRepaymentPayment(deal.id, repaymentId, amount);
      if (!response?.authorization_url) {
        throw new Error('Could not start Paystack MoMo checkout.');
      }

      await WebBrowser.openBrowserAsync(response.authorization_url);

      let lastError: unknown = null;
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          return await verifyRepaymentPayment(deal.id, repaymentId || '1', response.reference);
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
      setShowCustomPayback(false);
      setCustomAmount('');
      Alert.alert(
        'Repayment Successful!',
        'Your payment has been processed via Paystack and sent to the investor\'s MoMo account.'
      );
    },
    onError: (error) => {
      Alert.alert(
        'Repayment Pending',
        error instanceof Error ? error.message : 'If MoMo checkout completed, pull to refresh in a moment.'
      );
    },
  });

  const handleCustomPaybackSubmit = () => {
    const val = parseFloat(customAmount);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid repayment amount in GH₵.');
      return;
    }

    const pendingItem = repaymentSchedule.find((r) => r.status === 'PENDING') || repaymentSchedule[0];
    payMutation.mutate({ repaymentId: pendingItem?.id, amount: val });
  };

  if (isLoading || loadingRepayments) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenState loading title="Loading Repayment Schedule" />
      </SafeAreaView>
    );
  }

  if (!deal) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Repayments</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScreenState
          icon="document-text-outline"
          title="No Active Deal Found"
          detail="Repayment schedule will appear once deal signatures are completed."
          action="Go Back"
          onPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const getReturnTypeMeta = (returnType: string, returnValue: number) => {
    switch (returnType) {
      case 'REVENUE_SHARE':
        return {
          title: 'Revenue Share Agreement',
          description: `${returnValue}% Monthly Revenue Share`,
          badgeColor: '#D97706',
          badgeBg: '#FFFBEB',
          icon: 'pie-chart-outline' as const,
        };
      case 'EQUITY':
        return {
          title: 'Equity Dividend Stake',
          description: `${returnValue}% Equity Dividend Distribution`,
          badgeColor: '#16A34A',
          badgeBg: '#DCFCE7',
          icon: 'trending-up-outline' as const,
        };
      case 'FIXED':
      default:
        return {
          title: 'Fixed Return Repayment',
          description: `Fixed Monthly Return of GH₵${returnValue}`,
          badgeColor: '#2563EB',
          badgeBg: '#EFF6FF',
          icon: 'cash-outline' as const,
        };
    }
  };

  const returnMeta = getReturnTypeMeta(deal.returnType, deal.returnValue);

  const totalCollected = repaymentSchedule
    .filter((r) => r.status === 'COLLECTED' || r.status === 'PAID')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const pendingAmount = repaymentSchedule
    .filter((r) => r.status === 'PENDING' || r.status === 'UPCOMING')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COLLECTED':
      case 'PAID':
        return { label: 'Paid', color: '#16A34A', bg: '#DCFCE7', icon: 'checkmark-circle' as const };
      case 'PENDING':
        return { label: 'Due Now', color: '#D97706', bg: '#FEF3C7', icon: 'time-outline' as const };
      case 'UPCOMING':
        return { label: 'Upcoming', color: '#2563EB', bg: '#EFF6FF', icon: 'calendar-outline' as const };
      case 'MISSED':
      case 'OVERDUE':
        return { label: 'Overdue', color: '#DC2626', bg: '#FEE2E2', icon: 'alert-circle' as const };
      default:
        return { label: status, color: '#64748B', bg: '#F1F5F9', icon: 'ellipse-outline' as const };
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Repayment Schedule</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Deal Summary & Return Type Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTitleWrap}>
              <Text style={styles.businessName}>{deal.businessName}</Text>
              <Text style={styles.investmentMeta}>
                Principal Capital: GH₵{deal.amount.toLocaleString()} · {deal.timelineMonths} Months
              </Text>
            </View>

            <View style={[styles.typeBadge, { backgroundColor: returnMeta.badgeBg }]}>
              <Ionicons name={returnMeta.icon} size={14} color={returnMeta.badgeColor} />
              <Text style={[styles.typeBadgeText, { color: returnMeta.badgeColor }]}>
                {returnMeta.title}
              </Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          {/* Repayment Progress Counters */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>TOTAL REPAID</Text>
              <Text style={[styles.statValue, { color: '#16A34A' }]}>
                GH₵{totalCollected.toLocaleString()}
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCol}>
              <Text style={styles.statLabel}>REMAINING</Text>
              <Text style={[styles.statValue, { color: '#D97706' }]}>
                GH₵{pendingAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Flexible Payback Anytime Card for Business Owner */}
        {isOwner && (
          <View style={styles.anytimeCard}>
            <View style={styles.anytimeHeader}>
              <View style={styles.anytimeTitleRow}>
                <View style={styles.anytimeIconBg}>
                  <Ionicons name="flash-outline" size={18} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.anytimeTitle}>Flexi-Payback (Pay Anytime)</Text>
                  <Text style={styles.anytimeSub}>
                    You can make repayments at any time before due dates.
                  </Text>
                </View>
              </View>

              {!showCustomPayback ? (
                <TouchableOpacity
                  style={styles.anytimeToggleBtn}
                  onPress={() => setShowCustomPayback(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={16} color="#0D1B3E" />
                  <Text style={styles.anytimeToggleText}>Pay Custom Amount</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {showCustomPayback && (
              <View style={styles.customPaybackBox}>
                <Text style={styles.customInputLabel}>Enter amount to pay back (GH₵)</Text>
                <View style={styles.customInputRow}>
                  <Text style={styles.customCurrency}>GH₵</Text>
                  <TextInput
                    style={styles.customInput}
                    placeholder="e.g. 500"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={customAmount}
                    onChangeText={setCustomAmount}
                  />
                </View>

                <View style={styles.customActionRow}>
                  <TouchableOpacity
                    style={styles.cancelCustomBtn}
                    onPress={() => {
                      setShowCustomPayback(false);
                      setCustomAmount('');
                    }}
                  >
                    <Text style={styles.cancelCustomText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.submitCustomBtn}
                    onPress={handleCustomPaybackSubmit}
                    disabled={payMutation.isPending}
                  >
                    {payMutation.isPending ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="card-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.submitCustomText}>Pay MoMo via Paystack</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Paystack MoMo Gateway Channel Banner */}
        <View style={styles.momoBanner}>
          <View style={styles.momoIconBg}>
            <Ionicons name="shield-checkmark" size={20} color="#0D1B3E" />
          </View>
          <View style={styles.momoMeta}>
            <Text style={styles.momoTitle}>Paystack MoMo Disbursement</Text>
            <Text style={styles.momoSub}>
              {isOwner
                ? 'Repayments are debited via MTN MoMo / Paystack and transferred directly to the investor.'
                : 'Repayments from the business owner land directly into your registered MoMo account.'}
            </Text>
          </View>
        </View>

        {/* Timeline Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Repayment Schedule</Text>
          <Text style={styles.sectionSub}>{repaymentSchedule.length} Installments</Text>
        </View>

        {/* Timeline List */}
        <View style={styles.timelineList}>
          {repaymentSchedule.map((repayment, index) => {
            const isLast = index === repaymentSchedule.length - 1;
            const statusStyle = getStatusStyle(repayment.status);

            return (
              <View key={repayment.id} style={styles.timelineRow}>
                {/* Left Timeline Node */}
                <View style={styles.timelineCol}>
                  <View style={[styles.nodeCircle, { backgroundColor: statusStyle.bg }]}>
                    <Ionicons name={statusStyle.icon} size={16} color={statusStyle.color} />
                  </View>
                  {!isLast && <View style={[styles.nodeLine, { backgroundColor: statusStyle.bg }]} />}
                </View>

                {/* Right Card Content */}
                <View style={styles.timelineContent}>
                  <View style={styles.installmentCard}>
                    <View style={styles.cardTop}>
                      <View>
                        <Text style={styles.dueDateLabel}>DUE DATE</Text>
                        <Text style={styles.dueDateValue}>{repayment.dueDate}</Text>
                      </View>

                      <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusPillText, { color: statusStyle.color }]}>
                          {statusStyle.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.amountRow}>
                      <Text style={styles.installmentAmount}>
                        GH₵{repayment.amount ? repayment.amount.toLocaleString() : '0'}
                      </Text>
                      <Text style={styles.returnTypeNote}>{returnMeta.description}</Text>
                    </View>

                    {repayment.collectedAt && (
                      <View style={styles.paidInfo}>
                        <Ionicons name="checkmark-done" size={13} color="#16A34A" />
                        <Text style={styles.paidInfoText}>
                          Confirmed on {repayment.collectedAt}
                        </Text>
                      </View>
                    )}

                    {/* Pay Button for Business Owner */}
                    {isOwner && (repayment.status === 'PENDING' || repayment.status === 'UPCOMING') && (
                      <TouchableOpacity
                        style={styles.payBtn}
                        onPress={() => payMutation.mutate({ repaymentId: repayment.id, amount: repayment.amount })}
                        disabled={payMutation.isPending}
                        activeOpacity={0.85}
                      >
                        {payMutation.isPending ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <Ionicons name="card-outline" size={16} color="#FFFFFF" />
                            <Text style={styles.payBtnText}>
                              Pay GH₵{repayment.amount.toLocaleString()} with Paystack MoMo
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },

  /* Hero Summary Card */
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroTitleWrap: {
    flex: 1,
    marginRight: 10,
  },
  businessName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  investmentMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },

  /* Flexible Payback Card */
  anytimeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 12,
  },
  anytimeHeader: {
    gap: 10,
  },
  anytimeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  anytimeIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  anytimeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  anytimeSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  anytimeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    paddingVertical: 9,
    borderRadius: 10,
  },
  anytimeToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D1B3E',
  },

  /* Custom Payback Box */
  customPaybackBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 46,
    gap: 6,
  },
  customCurrency: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  customInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  customActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelCustomBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  cancelCustomText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  submitCustomBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    borderRadius: 10,
  },
  submitCustomText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Paystack MoMo Gateway Banner */
  momoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  momoIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  momoMeta: {
    flex: 1,
  },
  momoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  momoSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 17,
  },

  /* Timeline Header */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  /* Timeline List & Cards */
  timelineList: {
    marginTop: 4,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineCol: {
    alignItems: 'center',
    width: 36,
  },
  nodeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 18,
    paddingLeft: 8,
  },
  installmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dueDateLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  dueDateValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  amountRow: {
    gap: 2,
  },
  installmentAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  returnTypeNote: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  paidInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  paidInfoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },

  /* Paystack Button */
  payBtn: {
    backgroundColor: '#0D1B3E',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: '#0D1B3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
