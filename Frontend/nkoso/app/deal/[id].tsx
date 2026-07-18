import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import * as WebBrowser from 'expo-web-browser';
import { signDeal, initiatePayment, verifyPayment, getDeal, getPitch, getBid } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import DealChat from '@/components/DealChat';

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
  const [loading, setLoading] = useState(false);

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

  const isOwner = user?.role === 'OWNER' || user?.role === 'BOTH';
  const isInvestor = user?.role === 'INVESTOR' || user?.role === 'BOTH';
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
      Alert.alert(
        'Signed!',
        'You have signed the deal agreement. ' +
          (isOwner
            ? 'Waiting for investor signature.'
            : 'The deal has been submitted to our MFI partner for legal review.'),
        [{ text: 'OK' }]
      );
    },
    onError: () => {
      Alert.alert('Error', 'Failed to sign. Please try again.');
    }
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!deal) throw new Error("No deal");
      // 1. Initiate payment (get Paystack authorization URL)
      const res = await initiatePayment(deal.id);

      // 2. Open Paystack checkout in in-app browser
      if (res && res.authorization_url) {
        await WebBrowser.openBrowserAsync(res.authorization_url);
        // After browser closes, refetch the latest deal state
        queryClient.invalidateQueries({ queryKey: ['deal', deal.id] });
      } else {
        Alert.alert('Payment failed', 'Could not get a payment link. Please try again.');
      }
    },
    onError: (error: any) => {
      Alert.alert('Payment failed', error.message || 'Something went wrong');
    }
  });

  if (loadingDeal) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!deal) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Deal not found.</Text>
      </SafeAreaView>
    );
  }

  const canSign = isOwner ? !ownerSigned : !investorSigned;

  const handleSign = () => {
    signMutation.mutate();
  };

  const handleMfiApprove = () => {
    Alert.alert('MFI Approved', 'The MFI partner has approved this deal. The investor can now proceed with payment.', [
      { text: 'OK', onPress: () => setMfiApproved(true) },
    ]);
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deal Room</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Deal header */}
        <View style={styles.dealHeader}>
          <Text style={styles.dealBusiness}>{deal.businessName}</Text>
          <View style={styles.dealStatusBadge}>
            <Text style={styles.dealStatusText}>
              {deal.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Deal terms */}
        <Text style={styles.sectionTitle}>Deal terms</Text>
        <View style={styles.termsCard}>
          {[
            { label: 'Investment amount', value: `GH₵${deal.amount.toLocaleString()}` },
            { label: 'Return type', value: deal.returnType.replace('_', ' ') },
            { label: 'Return value', value: `${deal.returnValue}%` },
            { label: 'Timeline', value: `${deal.timelineMonths} months` },
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

        {/* Progress steps */}
        <Text style={styles.sectionTitle}>Deal progress</Text>
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

        {/* Signatures */}
        <Text style={styles.sectionTitle}>Signatures</Text>
        <View style={styles.signaturesCard}>
          <View style={styles.signatureRow}>
            <View style={styles.signerInfo}>
              <Ionicons name="person-circle-outline" size={24} color={Colors.primary} />
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
              <Ionicons name="person-circle-outline" size={24} color={Colors.primary} />
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

        {/* MFI status */}
        <View style={styles.mfiCard}>
          <Ionicons
            name={mfiApproved ? 'shield-checkmark' : 'shield-outline'}
            size={22}
            color={mfiApproved ? Colors.accent : Colors.textMuted}
          />
          <View style={styles.mfiInfo}>
            <Text style={styles.mfiTitle}>MFI Partner Review</Text>
            <Text style={styles.mfiDesc}>
              {mfiApproved
                ? 'Legally approved. Payment can now proceed.'
                : bothSigned
                ? 'Under legal review by our MFI partner. Usually 24-48 hours.'
                : 'Waiting for both signatures before MFI review.'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {canSign && (
          <Button
            title={`Sign as ${isOwner ? 'Business Owner' : 'Investor'}`}
            onPress={handleSign}
            loading={signMutation.isPending}
          />
        )}

        {bothSigned && !mfiApproved && user?.role === 'ADMIN' && (
          <Button
            title="Simulate MFI Approval"
            onPress={handleMfiApprove}
            variant="secondary"
          />
        )}

        {mfiApproved && isInvestor && deal.status !== 'ACTIVE' && (
          <Button
            title={deal.paystackRef ? 'Retry payment' : 'Proceed with payment'}
            onPress={handlePayment}
            loading={payMutation.isPending}
          />
        )}

        {bothSigned && mfiApproved && (
          <View style={styles.successNote}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.accent} />
            <Text style={styles.successText}>
              Deal approved! Payment will be disbursed to the business owner's MoMo account
              within 24 hours of payment confirmation.
            </Text>
          </View>
        )}

        <View style={{ height: 24 }} />

        {/* Real-time chat */}
        <Text style={styles.sectionTitle}>Discussion</Text>
        <DealChat dealId={id} />
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
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
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dealBusiness: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  dealStatusBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  dealStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
    textTransform: 'uppercase',
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
  stepsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
    top: 34,
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
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
    color: Colors.accent,
    fontWeight: '600',
  },
  signaturesCard: {
    backgroundColor: Colors.borderLight,
    borderRadius: 14,
    overflow: 'hidden',
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  signerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  signerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  signerRole: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  sigBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.border,
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
    backgroundColor: Colors.border,
    marginHorizontal: 14,
  },
  mfiCard: {
    flexDirection: 'row',
    backgroundColor: Colors.borderLight,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  mfiInfo: { flex: 1 },
  mfiTitle: {
    fontSize: 14,
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
    borderRadius: 10,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
  },
  successText: {
    flex: 1,
    fontSize: 13,
    color: '#16A34A',
    lineHeight: 18,
  },
});
