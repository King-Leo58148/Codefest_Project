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
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { ScreenState } from '@/components/ui/ScreenState';
import { StatusBadge } from '@/components/ui/Badge';
import { cardStyles } from '@/components/ui/Card';
import { FadeInView, SlideInView } from '@/components/ui/FadeInView';
import { PaymentSuccessModal } from '@/components/ui/PaymentSuccessModal';
import * as WebBrowser from 'expo-web-browser';
import { signDeal, initiatePayment, verifyPayment, getDeal, getPitch, getBid } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
// Full page chat is now navigated to at /chat/[id]

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
  const queryClient = useQueryClient();

  const { data: deal, isLoading: loadingDeal } = useQuery({
    queryKey: ['deal', id],
    queryFn: () => getDeal(id as string),
  });

  const [ownerSigned, setOwnerSigned] = useState(false);
  const [investorSigned, setInvestorSigned] = useState(false);
  const [mfiApproved, setMfiApproved] = useState(false);

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

  React.useEffect(() => {
    if (deal) {
      setOwnerSigned(deal.ownerSigned);
      setInvestorSigned(deal.investorSigned);
      setMfiApproved(deal.mfiApproved);
    }
  }, [deal]);

  const isOwner = user?.role === 'OWNER';
  const isInvestor = user?.role === 'INVESTOR';
  const bothSigned = ownerSigned && investorSigned;

  const signMutation = useMutation({
    mutationFn: () => {
      if (!deal) throw new Error("No deal");
      return signDeal(deal.id, isOwner ? 'owner' : 'investor');
    },
    onSuccess: () => {
      if (isOwner) {
        setOwnerSigned(true);
      } else {
        setInvestorSigned(true);
      }
      queryClient.invalidateQueries({ queryKey: ['deal', id] });
      setModalConfig({
        visible: true,
        title: 'Agreement Signed!',
        subtitle: isOwner
          ? 'You have signed the investment deal. Waiting for investor signature.'
          : 'You have signed the investment deal. Submitted to MFI partner for legal verification.',
      });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to sign. Please try again.');
    }
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!deal) throw new Error("No deal");

      const res = await initiatePayment(deal.id);

      if (!res || !res.authorization_url) {
        throw new Error('Could not get a payment link. Please try again.');
      }

      await WebBrowser.openBrowserAsync(res.authorization_url);

      let lastError: any = null;
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const updatedDeal = await verifyPayment(deal.id, res.reference);
          if (updatedDeal?.status === 'ACTIVE') {
            return updatedDeal;
          }
          lastError = new Error('Payment not yet confirmed');
        } catch (err) {
          lastError = err;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
      }
      throw lastError || new Error('Payment could not be confirmed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal', deal?.id] });
      queryClient.invalidateQueries({ queryKey: ['myPitches'] });
      queryClient.invalidateQueries({ queryKey: ['ownerAllBids'] });

      setModalConfig({
        visible: true,
        title: 'Payment Successful!',
        subtitle: `Your investment of GH₵${deal?.amount?.toLocaleString()} has been confirmed. Funds will be disbursed to ${deal?.businessName} shortly.`,
        amount: deal?.amount,
      });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['deal', deal?.id] });
      Alert.alert(
        'Payment Not Confirmed Yet',
        "We couldn't confirm your payment went through yet. If you completed checkout, please pull to refresh in a moment."
      );
    }
  });

  if (loadingDeal) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenState loading title="Loading deal room" />
      </SafeAreaView>
    );
  }

  if (!deal) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenState
          icon="briefcase-outline"
          title="Deal not found"
          detail="This room may no longer be available."
          action="Go back"
          onPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const canSign = isOwner ? !ownerSigned : !investorSigned;
  const stConfig = getStatusBadgeConfig(deal.status);

  const handleSign = () => {
    signMutation.mutate();
  };

  const handlePayment = () => {
    payMutation.mutate();
  };

  const steps = [
    {
      label: 'Both parties sign',
      done: bothSigned,
      icon: 'document-text-outline' as const,
    },
    {
      label: 'MFI partner reviews',
      done: mfiApproved,
      icon: 'shield-checkmark-outline' as const,
    },
    {
      label: 'Payment processed',
      done: deal.paystackRef !== undefined,
      icon: 'cash-outline' as const,
    },
    {
      label: 'Funds disbursed',
      done: deal.disbursedAt !== undefined,
      icon: 'phone-portrait-outline' as const,
    },
  ];

  const platformFee = deal.platformFee ?? deal.amount * 0.01;
  const terms = [
    { label: 'Investment amount', value: `GH₵${deal.amount.toLocaleString()}` },
    ...(isInvestor ? [
      { label: 'Platform fee', value: `GH₵${platformFee.toLocaleString()}` },
      { label: 'Total checkout', value: `GH₵${(deal.amount + platformFee).toLocaleString()}` },
    ] : []),
    { label: 'Owner receives', value: `GH₵${(deal.netDisbursementAmount ?? deal.amount).toLocaleString()}` },
    { label: 'Return type', value: deal.returnType.replace(/_/g, ' ') },
    { label: 'Return value', value: `${deal.returnValue}%` },
    { label: 'Timeline', value: `${deal.timelineMonths} months` },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.72}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deal Room</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Deal Summary Hero Card */}
        <SlideInView from="left">
          <View style={styles.heroCard}>
            <LinearGradient
              colors={[Colors.primary, '#162040']}
              style={styles.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroTopRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.heroLabel}>INVESTMENT DEAL</Text>
                  <Text style={styles.heroBusiness} numberOfLines={1}>{deal.businessName}</Text>
                </View>
                <StatusBadge label={stConfig.label} status={stConfig.status} />
              </View>

              <View style={styles.heroAmountRow}>
                <Text style={styles.heroAmount}>GH₵{deal.amount.toLocaleString()}</Text>
                <Text style={styles.heroAmountSub}>
                  {deal.returnValue}% {deal.returnType.replace(/_/g, ' ')}
                </Text>
              </View>
            </LinearGradient>
          </View>
        </SlideInView>

        {/* Progress Pipeline */}
        <Text style={styles.sectionTitle}>Deal Progress Pipeline</Text>
        <FadeInView delay={60}>
          <View style={styles.stepsCard}>
            {steps.map((step, i) => (
              <View key={step.label} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepCircle,
                    step.done ? styles.stepCircleDone : styles.stepCirclePending,
                  ]}
                >
                  <Ionicons
                    name={step.done ? 'checkmark' : step.icon}
                    size={16}
                    color={step.done ? '#fff' : Colors.textMuted}
                  />
                </View>
                {i < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      step.done ? styles.stepLineDone : {},
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.stepLabel,
                    step.done && styles.stepLabelDone,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </FadeInView>

        {/* Deal Terms Table */}
        <Text style={styles.sectionTitle}>Agreement Terms</Text>
        <FadeInView delay={100}>
          <View style={styles.termsCard}>
            {terms.map((item, i, arr) => (
              <View key={item.label}>
                <View style={styles.termsRow}>
                  <Text style={styles.termsLabel}>{item.label}</Text>
                  <Text style={styles.termsValue}>{item.value}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.termsDivider} />}
              </View>
            ))}
          </View>
        </FadeInView>

        {/* Signatures */}
        <Text style={styles.sectionTitle}>Signatures & Approval</Text>
        <FadeInView delay={140}>
          <View style={styles.signaturesCard}>
            <View style={styles.signatureRow}>
              <View style={styles.signerInfo}>
                <View style={styles.signerAvatar}>
                  <Ionicons name="person" size={16} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.signerName}>Business Owner</Text>
                  <Text style={styles.signerRole}>{pitch?.ownerName || (isOwner ? user?.name : 'Owner')}</Text>
                </View>
              </View>
              <View style={[styles.sigBadge, ownerSigned ? styles.sigBadgeSigned : {}]}>
                <Ionicons
                  name={ownerSigned ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={ownerSigned ? Colors.accent : Colors.textMuted}
                />
                <Text
                  style={[styles.sigBadgeText, ownerSigned ? styles.sigBadgeTextSigned : {}]}
                >
                  {ownerSigned ? 'Signed' : 'Pending'}
                </Text>
              </View>
            </View>
            <View style={styles.sigDivider} />
            <View style={styles.signatureRow}>
              <View style={styles.signerInfo}>
                <View style={styles.signerAvatar}>
                  <Ionicons name="person" size={16} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.signerName}>Investor</Text>
                  <Text style={styles.signerRole}>{bid?.investorName || (isInvestor ? user?.name : 'Investor')}</Text>
                </View>
              </View>
              <View style={[styles.sigBadge, investorSigned ? styles.sigBadgeSigned : {}]}>
                <Ionicons
                  name={investorSigned ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={investorSigned ? Colors.accent : Colors.textMuted}
                />
                <Text
                  style={[styles.sigBadgeText, investorSigned ? styles.sigBadgeTextSigned : {}]}
                >
                  {investorSigned ? 'Signed' : 'Pending'}
                </Text>
              </View>
            </View>
          </View>
        </FadeInView>

        {/* MFI status */}
        <FadeInView delay={180}>
          <View style={styles.mfiCard}>
            <View style={[styles.mfiIconBox, mfiApproved && styles.mfiIconBoxApproved]}>
              <Ionicons
                name={mfiApproved ? 'shield-checkmark' : 'shield-outline'}
                size={22}
                color={mfiApproved ? Colors.accent : Colors.textMuted}
              />
            </View>
            <View style={styles.mfiInfo}>
              <Text style={styles.mfiTitle}>MFI Partner Review</Text>
              <Text style={styles.mfiDesc}>
                {mfiApproved
                  ? 'Legally approved by licensed MFI. Payment can now proceed.'
                  : bothSigned
                  ? 'Under legal review by our MFI partner. Usually completed within 24-48 hours.'
                  : 'Waiting for both signatures before MFI review.'}
              </Text>
            </View>
          </View>
        </FadeInView>

        {/* Actions */}
        {canSign && (
          <FadeInView delay={200}>
            <Button
              title={`Sign Agreement as ${isOwner ? 'Business Owner' : 'Investor'}`}
              onPress={handleSign}
              loading={signMutation.isPending}
              leftIcon="create-outline"
            />
          </FadeInView>
        )}

        {mfiApproved && isInvestor && deal.status !== 'ACTIVE' && (
          <FadeInView delay={200}>
            <Button
              title={deal.paystackRef ? 'Retry Payment' : 'Proceed to Payment (MoMo/Card)'}
              onPress={handlePayment}
              loading={payMutation.isPending}
              leftIcon="cash-outline"
            />
          </FadeInView>
        )}

        {bothSigned && mfiApproved && (
          <View style={styles.successNote}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.accent} />
            <Text style={styles.successText}>
              Deal approved! Payment will be disbursed to the business owner's MoMo account
              after payment confirmation.
            </Text>
          </View>
        )}

        {deal.status === 'ACTIVE' && (
          <Button
            title="View Repayments Schedule"
            onPress={() => router.push(`/repayments/${deal.id}`)}
            variant="secondary"
            leftIcon="calendar-outline"
          />
        )}

        <View style={{ height: 16 }} />

        {/* Real-time Private Chat Launcher */}
        <Text style={styles.sectionTitle}>Room Discussion</Text>
        <TouchableOpacity
          style={styles.chatLaunchCard}
          onPress={() => router.push({ pathname: '/chat/[id]', params: { id } })}
          activeOpacity={0.82}
        >
          <View style={styles.chatLaunchIconBg}>
            <Ionicons name="chatbubbles" size={26} color={Colors.surface} />
          </View>
          <View style={styles.chatLaunchContent}>
            <View style={styles.chatLaunchHeader}>
              <Text style={styles.chatLaunchTitle}>Private Deal Chat</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveBadgeDot} />
                <Text style={styles.liveBadgeText}>Live</Text>
              </View>
            </View>
            <Text style={styles.chatLaunchSub}>
              Tap to open full page chat with {isOwner ? 'investor' : 'business owner'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Payment Success Animation Modal */}
      <PaymentSuccessModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        subtitle={modalConfig.subtitle}
        amount={modalConfig.amount}
        onClose={() => setModalConfig({ ...modalConfig, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  content: {
    padding: 20,
    paddingBottom: 44,
    gap: 16,
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 4,
  },
  heroGradient: {
    padding: 20,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  heroBusiness: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.4,
  },
  heroAmountRow: {
    gap: 2,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  heroAmountSub: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  termsCard: {
    ...cardStyles.surface,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  termsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  termsLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  termsValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  termsDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 16,
  },
  stepsCard: {
    ...cardStyles.surface,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
    position: 'relative',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleDone: {
    backgroundColor: Colors.accent,
  },
  stepCirclePending: {
    backgroundColor: Colors.borderLight,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  stepLine: {
    position: 'absolute',
    left: 17,
    top: 36,
    width: 2,
    height: 16,
    backgroundColor: Colors.borderLight,
  },
  stepLineDone: {
    backgroundColor: Colors.accent,
  },
  stepLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  stepLabelDone: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  signaturesCard: {
    ...cardStyles.surface,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 64,
    padding: 16,
  },
  signerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  signerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signerName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  signerRole: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  sigBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: Colors.borderLight,
  },
  sigBadgeSigned: {
    backgroundColor: '#F0FDF4',
  },
  sigBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  sigBadgeTextSigned: {
    color: Colors.accent,
  },
  sigDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 16,
  },
  mfiCard: {
    ...cardStyles.surface,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    alignItems: 'flex-start',
  },
  mfiIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mfiIconBoxApproved: {
    backgroundColor: '#F0FDF4',
  },
  mfiInfo: { flex: 1 },
  mfiTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  mfiDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  successNote: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  successText: {
    flex: 1,
    fontSize: 13,
    color: '#16A34A',
    lineHeight: 18,
    fontWeight: '500',
  },
  chatLaunchCard: {
    ...cardStyles.surface,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chatLaunchIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatLaunchContent: {
    flex: 1,
  },
  chatLaunchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatLaunchTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  liveBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accent,
  },
  chatLaunchSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
  },
});
