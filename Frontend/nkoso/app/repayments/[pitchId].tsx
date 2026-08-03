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
import { useTheme } from '@/store/themeStore';
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
  const { isDark, colors } = useTheme();
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

  const initiatePaymentMutation = useMutation({
    mutationFn: (repaymentId: string) => initiateRepaymentPayment(repaymentId),
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: (reference: string) => verifyRepaymentPayment(reference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealRepayments', deal?.id] });
      queryClient.invalidateQueries({ queryKey: ['myDeals'] });
    },
  });

  const handlePayInstallment = async (repayment: any) => {
    try {
      const response = await initiatePaymentMutation.mutateAsync(repayment.id);
      const authorizationUrl = response.authorization_url || response.authorizationUrl;
      const reference = response.reference;

      if (!authorizationUrl) {
        Alert.alert('Payment Error', 'Failed to retrieve Paystack checkout URL.');
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(authorizationUrl, 'nkoso://');

      if (result.type === 'success' || result.type === 'dismiss') {
        if (reference) {
          Alert.alert('Verifying Payment', 'Please wait while we confirm your transaction...');
          await verifyPaymentMutation.mutateAsync(reference);
          Alert.alert('Success 🎉', 'Payment verified successfully!');
        } else {
          refetchRepayments();
        }
      }
    } catch (err: any) {
      Alert.alert('Payment Error', err?.message || 'Could not complete MoMo payment.');
    }
  };

  const handleDirectMoMoPay = async (amount: number, note: string) => {
    try {
      const targetRepayment = rawRepaymentSchedule.find((r: any) => r.status === 'PENDING') || rawRepaymentSchedule[0];
      if (!targetRepayment) {
        Alert.alert('Repayment', 'No pending repayment schedule found.');
        return;
      }

      const response = await initiatePaymentMutation.mutateAsync(targetRepayment.id);
      const authorizationUrl = response.authorization_url || response.authorizationUrl;
      const reference = response.reference;

      if (!authorizationUrl) {
        Alert.alert('Payment Error', 'Failed to generate direct Paystack checkout.');
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(authorizationUrl, 'nkoso://');

      if (result.type === 'success' || result.type === 'dismiss') {
        if (reference) {
          await verifyPaymentMutation.mutateAsync(reference);
          Alert.alert('Success 🎉', `Direct payback of GH₵${amount.toLocaleString()} processed!`);
        } else {
          refetchRepayments();
        }
      }
    } catch (err: any) {
      Alert.alert('Payment Error', err?.message || 'Could not process Paystack payment.');
    }
  };

  if (isLoading || loadingRepayments) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <ScreenState loading title="Loading Repayment Schedule..." />
      </SafeAreaView>
    );
  }

  if (!deal) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Repayments</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScreenState
          icon="alert-circle-outline"
          title="Deal Not Found"
          detail="Could not retrieve the agreement for this pitch."
          action="Go Back"
          onPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const returnType = deal.returnType || 'FIXED';
  const returnValue = deal.returnValue || 0;
  const dealAmount = deal.amount || 0;

  let computedTargetReturn = dealAmount;
  if (returnType === 'FIXED') {
    computedTargetReturn = dealAmount + (dealAmount * (returnValue / 100));
  } else if (returnType === 'EQUITY') {
    computedTargetReturn = dealAmount;
  } else {
    computedTargetReturn = dealAmount * (1 + (returnValue / 100));
  }

  const totalPaid = rawRepaymentSchedule
    .filter((r: any) => r.status === 'PAID')
    .reduce((sum: number, r: any) => sum + (r.amount || 0), 0);

  const remainingBalance = Math.max(0, computedTargetReturn - totalPaid);
  const progressPct = computedTargetReturn > 0 ? Math.min(100, (totalPaid / computedTargetReturn) * 100) : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {deal.pitchTitle || deal.businessName || 'Repayment Schedule'}
          </Text>
          <Text style={[styles.headerSubTitle, { color: colors.textSecondary }]}>
            {returnType.replace(/_/g, ' ')} ({returnValue}%)
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => refetchRepayments()}>
          <Ionicons name="refresh" size={20} color="#16A34A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Overview Progress Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: isDark ? '#0F1A34' : '#0D1B3E' }]}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.returnBadge}>
              <Ionicons
                name={returnType === 'EQUITY' ? 'pie-chart' : returnType === 'REVENUE_SHARE' ? 'trending-up' : 'calendar'}
                size={14}
                color="#10B981"
              />
              <Text style={styles.returnBadgeText}>{returnType.replace(/_/g, ' ')}</Text>
            </View>

            <View style={styles.statusPill}>
              <Text style={styles.statusPillLabel}>
                {remainingBalance === 0 ? 'FULLY REPAID' : 'ACTIVE PAYBACK'}
              </Text>
            </View>
          </View>

          <View style={styles.heroAmountGroup}>
            <Text style={styles.heroAmountLabel}>Total Paid so far</Text>
            <Text style={styles.heroAmountValue}>GH₵{totalPaid.toLocaleString()}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBox}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>{progressPct.toFixed(0)}% Repaid</Text>
              <Text style={styles.progressTargetText}>
                Target: GH₵{computedTargetReturn.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroFooterRow}>
            <View>
              <Text style={styles.footerLabel}>Remaining Balance</Text>
              <Text style={styles.footerValue}>GH₵{remainingBalance.toLocaleString()}</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.footerLabel}>Original Principal</Text>
              <Text style={styles.footerValueSub}>GH₵{dealAmount.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Any-Time Custom Payback Banner for Owners */}
        {isOwner && remainingBalance > 0 && (
          <View style={[styles.customPayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.customPayHeader}>
              <View style={styles.customPayIconBox}>
                <Ionicons name="flash" size={20} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.customPayTitle, { color: colors.textPrimary }]}>Pay Back Anytime</Text>
                <Text style={[styles.customPaySub, { color: colors.textSecondary }]}>
                  Make early or partial MoMo repayments whenever you have funds.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.toggleCustomBtn}
                onPress={() => setShowCustomPayback(!showCustomPayback)}
              >
                <Ionicons name={showCustomPayback ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {showCustomPayback && (
              <View style={styles.customPayInputBox}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Enter Custom Amount (GH₵):</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
                  <Text style={[styles.currencyPrefix, { color: colors.textPrimary }]}>GH₵</Text>
                  <TextInput
                    style={[styles.textInput, { color: colors.textPrimary }]}
                    keyboardType="numeric"
                    placeholder="e.g. 500"
                    placeholderTextColor={colors.textMuted}
                    value={customAmount}
                    onChangeText={setCustomAmount}
                  />
                </View>

                {/* Quick Selection Chips */}
                <View style={styles.quickChipsRow}>
                  {[100, 250, 500, 1000].map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={[styles.quickChip, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
                      onPress={() => setCustomAmount(amt.toString())}
                    >
                      <Text style={[styles.quickChipText, { color: colors.textPrimary }]}>+GH₵{amt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.directPayBtn}
                  onPress={() => {
                    const val = parseFloat(customAmount);
                    if (isNaN(val) || val <= 0) {
                      Alert.alert('Invalid Amount', 'Please enter a valid amount to pay back.');
                      return;
                    }
                    handleDirectMoMoPay(val, 'Custom Any-Time Payback');
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="card-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.directPayBtnText}>
                    Pay GH₵{customAmount || '0'} via Paystack / MoMo
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Repayment Schedule Section Header */}
        <View style={styles.scheduleHeaderRow}>
          <Text style={[styles.scheduleTitle, { color: colors.textPrimary }]}>Repayment Installments</Text>
          <Text style={[styles.installmentCount, { color: colors.textSecondary }]}>
            {rawRepaymentSchedule.length} Payments
          </Text>
        </View>

        {rawRepaymentSchedule.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Schedule Created</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              {isOwner
                ? 'Use the "Pay Back Anytime" option above to send repayments via MoMo anytime.'
                : 'The business owner can make flexible repayments anytime.'}
            </Text>
          </View>
        ) : (
          <View style={styles.installmentsStack}>
            {rawRepaymentSchedule.map((item: any, idx: number) => {
              const isPaid = item.status === 'PAID';
              const isPending = item.status === 'PENDING';

              return (
                <View
                  key={item.id || idx}
                  style={[
                    styles.installmentCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    isPaid && { backgroundColor: isDark ? '#052E16' : '#F0FDF4', borderColor: isDark ? '#065F46' : '#BBF7D0' },
                  ]}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.installmentBadgeGroup}>
                      <View style={[styles.stepCircle, isPaid && { backgroundColor: '#16A34A' }]}>
                        <Text style={styles.stepCircleText}>{idx + 1}</Text>
                      </View>
                      <View>
                        <Text style={[styles.installmentName, { color: colors.textPrimary }]}>
                          Installment #{idx + 1}
                        </Text>
                        <Text style={[styles.dueDateText, { color: colors.textSecondary }]}>
                          Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Flexible / Any time'}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.statusPillSmall, isPaid ? styles.paidPill : styles.pendingPill]}>
                      <Text style={[styles.statusPillText, isPaid ? styles.paidText : styles.pendingText]}>
                        {isPaid ? 'PAID' : 'PENDING'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.amountRow}>
                    <Text style={[styles.installmentAmount, { color: colors.textPrimary }]}>
                      GH₵{(item.amount || 0).toLocaleString()}
                    </Text>
                    <Text style={[styles.returnTypeNote, { color: colors.textSecondary }]}>
                      {returnType === 'FIXED' ? 'Scheduled Fixed Return' : 'Return commitment'}
                    </Text>
                  </View>

                  {isPaid ? (
                    <View style={styles.paidInfo}>
                      <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                      <Text style={styles.paidInfoText}>
                        Paid on {item.paidAt ? new Date(item.paidAt).toLocaleDateString() : 'Confirmed'}
                      </Text>
                    </View>
                  ) : isOwner ? (
                    <TouchableOpacity
                      style={styles.payBtn}
                      onPress={() => handlePayInstallment(item)}
                      disabled={initiatePaymentMutation.isPending}
                      activeOpacity={0.85}
                    >
                      {initiatePaymentMutation.isPending ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Ionicons name="logo-paystack" size={16} color="#FFFFFF" />
                          <Text style={styles.payBtnText}>Pay GH₵{(item.amount || 0).toLocaleString()} via MoMo</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.paidInfo}>
                      <Ionicons name="time-outline" size={16} color="#D97706" />
                      <Text style={[styles.paidInfoText, { color: '#D97706' }]}>Awaiting Owner Payment</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
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
  headerTitleGroup: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  refreshBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },

  /* Hero Overview Card */
  heroCard: {
    borderRadius: 24,
    padding: 20,
    gap: 14,
    shadowColor: '#0D1B3E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  returnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  returnBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  statusPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusPillLabel: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  heroAmountGroup: {
    marginTop: 4,
  },
  heroAmountLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  heroAmountValue: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 2,
  },
  progressBox: {
    gap: 6,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  progressTargetText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },
  footerValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  footerValueSub: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },

  /* Custom Payback Card */
  customPayCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  customPayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customPayIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customPayTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  customPaySub: {
    fontSize: 11,
    marginTop: 1,
  },
  toggleCustomBtn: {
    padding: 4,
  },
  customPayInputBox: {
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  currencyPrefix: {
    fontSize: 14,
    fontWeight: '800',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  directPayBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  directPayBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  /* Installment Cards Stack */
  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  installmentCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyBox: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  installmentsStack: {
    gap: 12,
  },
  installmentCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  installmentBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0D1B3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  installmentName: {
    fontSize: 14,
    fontWeight: '800',
  },
  dueDateText: {
    fontSize: 11,
    marginTop: 1,
  },
  statusPillSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  paidPill: {
    backgroundColor: '#DCFCE7',
  },
  pendingPill: {
    backgroundColor: '#FEF3C7',
  },
  paidText: {
    color: '#15803D',
  },
  pendingText: {
    color: '#B45309',
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
    letterSpacing: -0.5,
  },
  returnTypeNote: {
    fontSize: 12,
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
  },
  payBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
