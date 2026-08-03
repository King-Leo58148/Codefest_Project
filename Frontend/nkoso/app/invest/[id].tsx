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
import { Button } from '@/components/ui/Button';
import { ScreenState } from '@/components/ui/ScreenState';
import { FadeInView } from '@/components/ui/FadeInView';
import { cardStyles } from '@/components/ui/Card';
import { placeBid, getPitch } from '@/services/api';
import { useQuery, useMutation } from '@tanstack/react-query';

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2000, 5000];
const RETURN_TYPES = ['EQUITY', 'REVENUE_SHARE', 'FIXED'] as const;

export default function InvestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { data: pitch, isLoading: loadingPitch } = useQuery({
    queryKey: ['pitch', id],
    queryFn: () => getPitch(id as string),
  });

  const [amount, setAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState('');
  const [returnType, setReturnType] = useState<'EQUITY' | 'REVENUE_SHARE' | 'FIXED'>('EQUITY');
  const [returnValue, setReturnValue] = useState('');
  const [timelineMonths, setTimelineMonths] = useState('12');
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'amount' | 'terms' | 'review'>('amount');
  const [equityError, setEquityError] = useState('');
  const [amountError, setAmountError] = useState('');

  const finalAmount = customAmount ? parseInt(customAmount, 10) || amount : amount;
  const platformFee = Math.min(finalAmount * 0.01, 100);

  const handleCustomAmountChange = (v: string) => {
    setCustomAmount(v);
    const num = parseInt(v, 10);
    if (v !== '' && (isNaN(num) || num < 100)) {
      setAmountError('Minimum investment amount is GH₵ 100');
    } else {
      setAmountError('');
    }
  };

  const handleCustomAmountBlur = () => {
    if (finalAmount < 100) {
      setAmountError('Minimum investment amount is GH₵ 100');
    } else {
      setAmountError('');
    }
  };

  const handleReturnValueChange = (v: string) => {
    if (returnType === 'EQUITY') {
      const num = parseFloat(v);
      if (!isNaN(num) && num > 100) {
        setReturnValue('100');
        setEquityError('Equity cannot exceed 100%');
        return;
      } else if (v !== '' && !isNaN(num) && num < 1) {
        setEquityError('Minimum equity is 1%');
      } else {
        setEquityError('');
      }
    } else if (returnType === 'REVENUE_SHARE') {
      const num = parseFloat(v);
      if (!isNaN(num) && num > 100) {
        setReturnValue('100');
        setEquityError('Revenue share cannot exceed 100%');
        return;
      } else if (v !== '' && !isNaN(num) && num < 1) {
        setEquityError('Minimum revenue share is 1%');
      } else {
        setEquityError('');
      }
    } else if (returnType === 'FIXED') {
      const num = parseFloat(v);
      if (v !== '' && (isNaN(num) || num < 100)) {
        setEquityError('Minimum fixed return is GH₵ 100');
      } else {
        setEquityError('');
      }
    } else {
      setEquityError('');
    }
    setReturnValue(v);
  };

  const handleReturnValueBlur = () => {
    const num = parseFloat(returnValue);
    if (returnType === 'EQUITY') {
      if (isNaN(num) || num < 1 || returnValue === '') {
        setReturnValue('1');
        setEquityError('Minimum equity is 1%');
      } else if (num > 100) {
        setReturnValue('100');
        setEquityError('Equity cannot exceed 100%');
      } else {
        setEquityError('');
      }
    } else if (returnType === 'REVENUE_SHARE') {
      if (isNaN(num) || num < 1 || returnValue === '') {
        setReturnValue('1');
        setEquityError('Minimum revenue share is 1%');
      } else if (num > 100) {
        setReturnValue('100');
        setEquityError('Revenue share cannot exceed 100%');
      } else {
        setEquityError('');
      }
    } else if (returnType === 'FIXED') {
      if (isNaN(num) || num < 100 || returnValue === '') {
        setReturnValue('100');
        setEquityError('Minimum fixed return is GH₵ 100');
      } else {
        setEquityError('');
      }
    }
  };

  if (loadingPitch) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenState loading title="Loading investment details" />
      </SafeAreaView>
    );
  }

  if (!pitch) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenState
          icon="megaphone-outline"
          title="Pitch not found"
          detail="This opportunity may no longer be available."
          action="Go back"
          onPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const mutation = useMutation({
    mutationFn: (data: any) => placeBid(data),
    onSuccess: () => {
      Alert.alert(
        'Bid placed!',
        `Your bid of GH₵${finalAmount.toLocaleString()} has been sent to ${pitch.businessName}. You'll be notified when they respond.`,
        [{ text: 'OK', onPress: () => router.replace('/(investor)/active-deals') }]
      );
    },
    onError: (error: any) => {
      const msg = error?.message || '';
      if (msg.includes('verification') || msg.includes('Please complete verification process')) {
        Alert.alert('Verification required', 'Please complete verification process.');
      } else {
        Alert.alert('Error', 'Failed to place bid. Please try again.');
      }
    }
  });

  const handleSubmit = () => {
    if (!returnValue) {
      Alert.alert('Missing details', 'Please enter your expected return value.');
      return;
    }
    const num = parseFloat(returnValue);
    if (returnType === 'EQUITY' && (num < 1 || num > 100)) {
      Alert.alert('Invalid equity', 'Equity must be between 1% and 100%');
      return;
    }
    if (returnType === 'REVENUE_SHARE' && (num < 1 || num > 100)) {
      Alert.alert('Invalid revenue share', 'Revenue share must be between 1% and 100%');
      return;
    }
    if (returnType === 'FIXED' && num < 100) {
      Alert.alert('Invalid fixed return', 'Minimum fixed return is GH₵ 100');
      return;
    }
    mutation.mutate({
      pitchId: pitch.id,
      amount: finalAmount,
      returnType,
      returnValue: num,
      timelineMonths: parseInt(timelineMonths, 10),
      note,
    });
  };

  const isReturnInvalid = () => {
    if (!returnValue) return true;
    const num = parseFloat(returnValue);
    if (isNaN(num)) return true;
    if (returnType === 'EQUITY') return num < 1 || num > 100;
    if (returnType === 'REVENUE_SHARE') return num < 1 || num > 100;
    if (returnType === 'FIXED') return num < 100;
    return false;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (step === 'amount' ? router.back() : setStep(step === 'review' ? 'terms' : 'amount'))}
          style={styles.backBtn}
          activeOpacity={0.72}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invest in {pitch.businessName}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Step indicator */}
        <FadeInView style={styles.stepRow}>
          {(['amount', 'terms', 'review'] as const).map((s, i) => (
            <View key={s} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  (step === s || ['amount', 'terms', 'review'].indexOf(step) > i) &&
                    styles.stepCircleActive,
                ]}
              >
                {(['amount', 'terms', 'review'].indexOf(step) > i) ? (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                ) : (
                  <Text style={styles.stepNum}>{i + 1}</Text>
                )}
              </View>
              <Text style={styles.stepLabel}>
                {s === 'amount' ? 'Amount' : s === 'terms' ? 'Terms' : 'Review'}
              </Text>
            </View>
          ))}
        </FadeInView>

        {/* Step 1: Amount */}
        {step === 'amount' && (
          <>
            <Text style={styles.sectionTitle}>Your investment</Text>
            <View style={styles.amountDisplay}>
              <Text style={styles.currency}>GH₵</Text>
              <Text style={styles.amountValue}>{finalAmount.toLocaleString()}</Text>
            </View>

            <View style={styles.presetGrid}>
              {PRESET_AMOUNTS.map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[
                    styles.presetBtn,
                    amount === a && !customAmount && styles.presetBtnActive,
                  ]}
                  onPress={() => {
                    setAmount(a);
                    setCustomAmount('');
                    setAmountError('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.presetBtnText,
                      amount === a && !customAmount && styles.presetBtnTextActive,
                    ]}
                  >
                    {a.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customInput}>
              <Text style={styles.customLabel}>Custom amount</Text>
              <View style={styles.customInputRow}>
                <Text style={styles.customCurrency}>GH₵</Text>
                <TextInput
                  style={styles.customInputField}
                  placeholder="Enter amount"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={customAmount}
                  onChangeText={handleCustomAmountChange}
                  onBlur={handleCustomAmountBlur}
                />
              </View>
              {amountError ? (
                <Text style={{ color: Colors.accentRed, fontSize: 12, marginTop: 4 }}>
                  {amountError}
                </Text>
              ) : null}
            </View>

            <View style={styles.minNote}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.minNoteText}>
                Minimum investment: GH₵100
              </Text>
            </View>

            <Button
              title="Continue"
              disabled={finalAmount < 100}
              onPress={() => {
                if (finalAmount < 100) {
                  setAmountError('Minimum investment amount is GH₵ 100');
                  Alert.alert(
                    'Minimum not met',
                    'Minimum investment amount is GH₵ 100'
                  );
                  return;
                }
                setStep('terms');
              }}
            />
          </>
        )}

        {/* Step 2: Terms */}
        {step === 'terms' && (
          <>
            <Text style={styles.sectionTitle}>Investment terms</Text>

            <Text style={styles.fieldLabel}>Return type</Text>
            <View style={styles.returnTypeRow}>
              {RETURN_TYPES.map((rt) => (
                <TouchableOpacity
                  key={rt}
                  style={[styles.rtChip, returnType === rt && styles.rtChipActive]}
                  onPress={() => {
                    setReturnType(rt);
                    setEquityError('');
                    if (rt === 'EQUITY' || rt === 'REVENUE_SHARE') {
                      const num = parseFloat(returnValue);
                      if (isNaN(num) || num < 1) setReturnValue('1');
                      else if (num > 100) setReturnValue('100');
                    } else if (rt === 'FIXED') {
                      const num = parseFloat(returnValue);
                      if (isNaN(num) || num < 100) setReturnValue('100');
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.rtChipText, returnType === rt && styles.rtChipTextActive]}
                  >
                    {rt.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>
                {returnType === 'EQUITY'
                  ? 'Equity stake (%)'
                  : returnType === 'REVENUE_SHARE'
                  ? 'Revenue share (%)'
                  : 'Fixed return (GH₵)'}
              </Text>
              <View style={styles.fieldInput}>
                {returnType === 'FIXED' && <Text style={[styles.fieldSuffix, {marginRight: 4}]}>GH₵</Text>}
                <TextInput
                  style={styles.fieldInputText}
                  placeholder={returnType === 'FIXED' ? 'e.g. 100' : '1-100'}
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="decimal-pad"
                  value={returnValue}
                  onChangeText={handleReturnValueChange}
                  onBlur={handleReturnValueBlur}
                />
                {returnType !== 'FIXED' && <Text style={styles.fieldSuffix}>%</Text>}
              </View>
              {equityError ? (
                <Text style={{ color: Colors.accentRed, fontSize: 12, marginTop: 4 }}>
                  {equityError}
                </Text>
              ) : null}
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Investment timeline (months)</Text>
              <View style={styles.fieldInput}>
                <TextInput
                  style={styles.fieldInputText}
                  placeholder="12"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={timelineMonths}
                  onChangeText={setTimelineMonths}
                />
                <Text style={styles.fieldSuffix}>mo</Text>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Note to business owner (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Tell them why you're interested..."
              placeholderTextColor={Colors.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Button
              title="Review bid"
              disabled={isReturnInvalid()}
              onPress={() => {
                if (isReturnInvalid()) {
                  const num = parseFloat(returnValue);
                  if (returnType === 'FIXED' && (isNaN(num) || num < 100)) {
                    setEquityError('Minimum fixed return is GH₵ 100');
                    Alert.alert('Invalid fixed return', 'Minimum fixed return is GH₵ 100');
                  } else if (returnType === 'REVENUE_SHARE') {
                    setEquityError('Minimum revenue share is 1%');
                    Alert.alert('Invalid revenue share', 'Revenue share must be between 1% and 100%');
                  } else {
                    setEquityError('Minimum equity is 1%');
                    Alert.alert('Invalid equity', 'Equity must be between 1% and 100%');
                  }
                  return;
                }
                setStep('review');
              }}
            />
          </>
        )}

        {/* Step 3: Review */}
        {step === 'review' && (
          <>
            <Text style={styles.sectionTitle}>Review your bid</Text>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewBusiness}>{pitch.businessName}</Text>

              {[
                { label: 'Investment amount', value: `GH₵${finalAmount.toLocaleString()}` },
                { label: 'Return type', value: returnType.replace('_', ' ') },
                { label: 'Expected return', value: returnType === 'FIXED' ? `GH₵${returnValue}` : `${returnValue}%` },
                { label: 'Timeline', value: `${timelineMonths} months` },
                { label: 'Platform fee (1%)', value: `GH₵${platformFee.toFixed(2)}` },
                { label: 'Total you pay', value: `GH₵${(finalAmount + platformFee).toFixed(2)}` },
              ].map((item, i, arr) => (
                <View key={item.label}>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>{item.label}</Text>
                    <Text
                      style={[
                        styles.reviewValue,
                        item.label.includes('Total') && styles.reviewValueBold,
                      ]}
                    >
                      {item.value}
                    </Text>
                  </View>
                  {i < arr.length - 1 && <View style={styles.reviewDivider} />}
                </View>
              ))}
            </View>

            {note && (
              <View style={styles.notePreview}>
                <Text style={styles.notePreviewLabel}>Your note:</Text>
                <Text style={styles.notePreviewText}>{note}</Text>
              </View>
            )}

            <View style={styles.reviewTerms}>
              <Ionicons name="shield-checkmark-outline" size={14} color={Colors.accent} />
              <Text style={styles.reviewTermsText}>
                Your bid will be reviewed by the business owner. A deal only closes when
                both parties agree and the MFI partner approves.
              </Text>
            </View>

            <Button title="Place bid" onPress={handleSubmit} loading={mutation.isPending} />
            <Text style={styles.ctaDisclaimer}>
              By placing a bid, you agree to the Nkɔso investment terms.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 8,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  stepLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  currency: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingBottom: 6,
  },
  amountValue: {
    fontSize: 52,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 60,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: Colors.borderLight,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  presetBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  presetBtnTextActive: {
    color: '#fff',
  },
  customLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  customInput: {},
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    minHeight: 52,
    gap: 6,
  },
  customCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  customInputField: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    height: '100%',
  },
  minNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  minNoteText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  fieldRow: { gap: 8 },
  fieldInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  fieldInputText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  fieldSuffix: {
    fontSize: 15,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  returnTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  rtChip: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.borderLight,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  rtChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rtChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  rtChipTextActive: { color: '#fff' },
  noteInput: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 90,
  },
  reviewCard: {
    ...cardStyles.surface,
    backgroundColor: Colors.borderLight,
    borderRadius: 14,
    overflow: 'hidden',
  },
  reviewBusiness: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  reviewLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  reviewValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  reviewValueBold: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 14,
  },
  notePreview: {
    backgroundColor: Colors.borderLight,
    borderRadius: 10,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notePreviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  notePreviewText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  reviewTerms: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewTermsText: {
    flex: 1,
    fontSize: 12,
    color: '#16A34A',
    lineHeight: 18,
  },
  ctaDisclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
