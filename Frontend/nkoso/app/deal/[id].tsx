import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/store/themeStore';
import { Button } from '@/components/ui/Button';
import { ScreenState } from '@/components/ui/ScreenState';
import { StatusBadge } from '@/components/ui/Badge';
import { FadeInView, SlideInView } from '@/components/ui/FadeInView';
import { PaymentSuccessModal } from '@/components/ui/PaymentSuccessModal';
import * as WebBrowser from 'expo-web-browser';
import { signDeal, initiatePayment, verifyPayment, getDeal, getPitch, getBid } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';

function getStatusBadgeConfig(status: string): { label: string; status: 'success' | 'warning' | 'error' | 'info' | 'neutral' } {
  switch (status) {
    case 'ACTIVE': return { label: 'Active', status: 'success' };
    case 'FUNDED': return { label: 'Funded', status: 'success' };
    case 'MFI_APPROVED': return { label: 'MFI Approved', status: 'info' };
    case 'PENDING_SIGNATURES': return { label: 'Pending Signatures', status: 'warning' };
    case 'PENDING_MFI': return { label: 'In MFI Review', status: 'warning' };
    case 'PAYMENT_PENDING': return { label: 'Payment Pending', status: 'warning' };
    default: return { label: status.replace(/_/g, ' '), status: 'neutral' };
  }
}

export default function DealRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { isDark, colors } = useTheme();
  const queryClient = useQueryClient();

  const { data: deal, isLoading: loadingDeal } = useQuery({
    queryKey: ['deal', id],
    queryFn: () => getDeal(id as string),
  });

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    subtitle: string;
    amount?: number;
  }>({
    visible: false,
    title: '',
    subtitle: '',
  });

  const signMutation = useMutation({
    mutationFn: () => signDeal(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal', id] });
      queryClient.invalidateQueries({ queryKey: ['myDeals'] });
    },
  });

  const initiatePaymentMutation = useMutation({
    mutationFn: () => initiatePayment(id as string),
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: (reference: string) => verifyPayment(reference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal', id] });
      queryClient.invalidateQueries({ queryKey: ['myDeals'] });
    },
  });

  const { data: pitch } = useQuery({
    queryKey: ['pitch', deal?.pitchId],
    queryFn: () => getPitch(deal!.pitchId),
    enabled: !!deal?.pitchId,
  });

  const { data: bid } = useQuery({
    queryKey: ['bid', deal?.bidId],
    queryFn: () => getBid(deal!.bidId),
    enabled: !!deal?.bidId,
  });

  const isOwner = user?.role === 'OWNER';
  const isInvestor = user?.role === 'INVESTOR';

  const handleSign = () => {
    Alert.alert(
      'Sign Investment Agreement',
      'By tapping "Confirm & Sign", you legally execute this investment agreement under Ghanaian contract law.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Sign',
          onPress: () => {
            signMutation.mutate(undefined, {
              onSuccess: () => {
                setModalConfig({
                  visible: true,
                  title: 'Agreement Signed!',
                  subtitle: 'Your digital signature has been applied to the contract.',
                });
              },
              onError: (err: any) => {
                Alert.alert('Sign Error', err?.message || 'Failed to sign agreement.');
              },
            });
          },
        },
      ]
    );
  };

  const handlePay = async () => {
    try {
      const response = await initiatePaymentMutation.mutateAsync();
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
          setModalConfig({
            visible: true,
            title: 'Payment Successful! 🎉',
            subtitle: `GH₵${deal?.amount?.toLocaleString()} has been safely deposited into escrow.`,
            amount: deal?.amount,
          });
        }
      }
    } catch (err: any) {
      Alert.alert('Payment Error', err?.message || 'Could not complete MoMo payment.');
    }
  };

  if (loadingDeal) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <ScreenState loading title="Loading Deal Room..." />
      </SafeAreaView>
    );
  }

  if (!deal) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.customHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Deal Room</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScreenState
          icon="alert-circle-outline"
          title="Deal Not Found"
          detail="Could not find the requested deal room contract."
          action="Go Back"
          onPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const badgeCfg = getStatusBadgeConfig(deal.status);
  const formattedReturn =
    deal.returnType === 'REVENUE_SHARE'
      ? `${deal.returnValue}% Rev Share`
      : deal.returnType === 'EQUITY'
      ? `${deal.returnValue}% Equity`
      : `GH₵${deal.returnValue} Fixed Return`;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Custom Header */}
      <View style={[styles.customHeader, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {deal.businessName || pitch?.businessName || 'Deal Room'}
          </Text>
          <Text style={[styles.headerSubTitle, { color: colors.textSecondary }]}>Contract #{deal.id.slice(0, 8)}</Text>
        </View>

        <TouchableOpacity
          style={styles.chatNavBtn}
          onPress={() => router.push(`/chat/${deal.id}`)}
        >
          <Ionicons name="chatbubbles" size={20} color="#16A34A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Deal Status Hero Banner */}
        <LinearGradient
          colors={colors.heroBg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.heroTopRow}>
            <StatusBadge label={badgeCfg.label} status={badgeCfg.status} />
            <Text style={styles.heroAmountText}>GH₵{deal.amount.toLocaleString()}</Text>
          </View>

          <View style={styles.heroMetricsGrid}>
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>Return Structure</Text>
              <Text style={styles.heroMetricVal}>{formattedReturn}</Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>Investor</Text>
              <Text style={styles.heroMetricVal}>{bid?.investorName || deal.investorName || 'Investor'}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Repayments Navigation Banner */}
        <TouchableOpacity
          style={[styles.repaymentsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push(`/repayments/${deal.pitchId || deal.id}` as any)}
          activeOpacity={0.85}
        >
          <View style={styles.repaymentsIconBox}>
            <Ionicons name="calendar-outline" size={22} color="#16A34A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.repaymentsTitle, { color: colors.textPrimary }]}>Repayment & Payback Schedule</Text>
            <Text style={[styles.repaymentsSub, { color: colors.textSecondary }]}>
              {isOwner ? 'Make Mobile Money repayments anytime' : 'Track return disbursements'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#16A34A" />
        </TouchableOpacity>

        {/* Milestone Steps Timeline */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Milestone Workflow</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineStep}>
              <Ionicons
                name={deal.signedByOwner && deal.signedByInvestor ? 'checkmark-circle' : 'ellipsis-horizontal-circle'}
                size={22}
                color={deal.signedByOwner && deal.signedByInvestor ? '#16A34A' : '#D97706'}
              />
              <Text style={[styles.timelineText, { color: colors.textPrimary }]}>1. Signatures Executed</Text>
            </View>

            <View style={styles.timelineStep}>
              <Ionicons
                name={deal.status === 'MFI_APPROVED' || deal.status === 'PAYMENT_PENDING' || deal.status === 'ACTIVE' || deal.status === 'FUNDED' ? 'checkmark-circle' : 'ellipsis-horizontal-circle'}
                size={22}
                color={deal.status === 'MFI_APPROVED' || deal.status === 'PAYMENT_PENDING' || deal.status === 'ACTIVE' || deal.status === 'FUNDED' ? '#16A34A' : '#D97706'}
              />
              <Text style={[styles.timelineText, { color: colors.textPrimary }]}>2. MFI Due Diligence Audit</Text>
            </View>

            <View style={styles.timelineStep}>
              <Ionicons
                name={deal.status === 'ACTIVE' || deal.status === 'FUNDED' ? 'checkmark-circle' : 'ellipsis-horizontal-circle'}
                size={22}
                color={deal.status === 'ACTIVE' || deal.status === 'FUNDED' ? '#16A34A' : '#D97706'}
              />
              <Text style={[styles.timelineText, { color: colors.textPrimary }]}>3. Capital Funded into Escrow</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsStack}>
          {isInvestor && deal.status === 'MFI_APPROVED' && (
            <Button
              title="Deposit Funds via Paystack / MoMo"
              onPress={handlePay}
              loading={initiatePaymentMutation.isPending}
              style={styles.actionBtn}
            />
          )}

          {((isOwner && !deal.signedByOwner) || (isInvestor && !deal.signedByInvestor)) && (
            <Button
              title="Digitally Sign Agreement"
              onPress={handleSign}
              loading={signMutation.isPending}
              style={styles.actionBtn}
            />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Success Modal */}
      <PaymentSuccessModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        subtitle={modalConfig.subtitle}
        amount={modalConfig.amount}
        onClose={() => setModalConfig((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  customHeader: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitleBox: {
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
    marginTop: 1,
  },
  chatNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  heroBanner: {
    borderRadius: 24,
    padding: 20,
    gap: 16,
    shadowColor: '#0D1B3E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroAmountText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroMetricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroMetricCol: {
    alignItems: 'center',
  },
  heroMetricLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  heroMetricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  heroMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  repaymentsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  repaymentsIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repaymentsTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  repaymentsSub: {
    fontSize: 12,
    marginTop: 1,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  timeline: {
    gap: 12,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionsStack: {
    gap: 10,
    marginTop: 6,
  },
  actionBtn: {
    width: '100%',
  },
});
