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
import { useTheme } from '@/store/themeStore';
import { Button } from '@/components/ui/Button';
import { ScreenState } from '@/components/ui/ScreenState';
import { FadeInView } from '@/components/ui/FadeInView';
import { placeBid, getPitch } from '@/services/api';
import { useQuery, useMutation } from '@tanstack/react-query';

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2000, 5000];
const RETURN_TYPES = ['EQUITY', 'REVENUE_SHARE', 'FIXED'] as const;

export default function InvestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark, colors } = useTheme();

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
    setReturnValue(v);
    const num = parseFloat(v);
    if (returnType === 'EQUITY') {
      if (v !== '' && (isNaN(num) || num <= 0 || num > 100)) {
        setEquityError('Equity stake must be between 0.1% and 100%');
      } else {
        setEquityError('');
      }
    } else {
      setEquityError('');
    }
  };

  const placeBidMutation = useMutation({
    mutationFn: placeBid,
    onSuccess: () => {
      Alert.alert(
        'Bid Offer Placed! 🎉',
        `Your offer of GH₵ ${finalAmount.toLocaleString()} has been submitted to ${pitch?.businessName || 'the business'}.`,
        [{ text: 'View Portfolio', onPress: () => router.replace('/(investor)/active-deals') }]
      );
    },
    onError: (err: any) => {
      Alert.alert('Bid Failed', err?.message || 'Could not submit bid offer.');
    },
  });

  const handleSubmit = () => {
    if (!pitch) return;
    placeBidMutation.mutate({
      pitchId: pitch.id,
      amount: finalAmount,
      returnType,
      returnValue: parseFloat(returnValue) || 0,
      timelineMonths: parseInt(timelineMonths, 10) || 12,
      note,
    });
  };

  if (loadingPitch) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <ScreenState loading title="Loading Pitch Details..." />
      </SafeAreaView>
    );
  }

  if (!pitch) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Place Bid Offer</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScreenState
          icon="alert-circle-outline"
          title="Pitch Not Found"
          detail="Could not find the requested pitch opportunity."
          action="Go Back"
          onPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Navigation */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => {
            if (step === 'review') setStep('terms');
            else if (step === 'terms') setStep('amount');
            else router.back();
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Place Bid Offer</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>{pitch.businessName}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Wizard Step Progress Pills */}
      <View style={styles.wizardRow}>
        <View style={[styles.wizardStep, step === 'amount' && styles.wizardStepActive]}>
          <Text style={[styles.wizardStepText, step === 'amount' && styles.wizardStepTextActive]}>1. Amount</Text>
        </View>
        <View style={[styles.wizardStep, step === 'terms' && styles.wizardStepActive]}>
          <Text style={[styles.wizardStepText, step === 'terms' && styles.wizardStepTextActive]}>2. Return Terms</Text>
        </View>
        <View style={[styles.wizardStep, step === 'review' && styles.wizardStepActive]}>
          <Text style={[styles.wizardStepText, step === 'review' && styles.wizardStepTextActive]}>3. Review</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 'amount' && (
          <FadeInView style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Choose Capital Amount</Text>
            <Text style={[styles.stepSub, { color: colors.textSecondary }]}>
              Select or type the capital amount you wish to invest in {pitch.businessName}.
            </Text>

            {/* Quick Presets Grid */}
            <View style={styles.presetsGrid}>
              {PRESET_AMOUNTS.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.presetChip,
                    { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                    amount === amt && !customAmount && { backgroundColor: isDark ? colors.accent : colors.primary, borderColor: isDark ? colors.accent : colors.primary },
                  ]}
                  onPress={() => {
                    setAmount(amt);
                    setCustomAmount('');
                    setAmountError('');
                  }}
                >
                  <Text
                    style={[
                      styles.presetText,
                      { color: colors.textPrimary },
                      amount === amt && !customAmount && { color: '#FFFFFF', fontWeight: '800' },
                    ]}
                  >
                    GH₵ {amt.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Or Enter Custom Amount (GH₵)</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Text style={[styles.prefix, { color: colors.textPrimary }]}>GH₵</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  keyboardType="numeric"
                  placeholder="e.g. 1500"
                  placeholderTextColor={colors.textMuted}
                  value={customAmount}
                  onChangeText={handleCustomAmountChange}
                  onBlur={handleCustomAmountBlur}
                />
              </View>
              {amountError ? <Text style={styles.errorText}>{amountError}</Text> : null}
            </View>

            <Button
              title="Next: Return Terms →"
              onPress={() => setStep('terms')}
              disabled={!!amountError || finalAmount < 100}
              style={styles.nextBtn}
            />
          </FadeInView>
        )}

        {step === 'terms' && (
          <FadeInView style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Define Return Terms</Text>
            <Text style={[styles.stepSub, { color: colors.textSecondary }]}>
              Propose your desired return structure and repayment timeline for this investment.
            </Text>

            {/* Return Type Segmented Selector */}
            <View style={styles.segmentContainer}>
              {RETURN_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.segmentTab,
                    { backgroundColor: colors.surfaceSubtle },
                    returnType === t && { backgroundColor: isDark ? colors.accent : colors.primary },
                  ]}
                  onPress={() => {
                    setReturnType(t);
                    setEquityError('');
                  }}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      { color: colors.textSecondary },
                      returnType === t && { color: '#FFFFFF', fontWeight: '800' },
                    ]}
                  >
                    {t === 'REVENUE_SHARE' ? 'Rev Share' : t.charAt(0) + t.slice(1).toLowerCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Return Value Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                {returnType === 'EQUITY'
                  ? 'Proposed Equity Stake (%)'
                  : returnType === 'REVENUE_SHARE'
                  ? 'Proposed Revenue Share (%)'
                  : 'Proposed Fixed Return Value (GH₵)'}
              </Text>
              <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  keyboardType="numeric"
                  placeholder={returnType === 'FIXED' ? 'e.g. 600' : 'e.g. 10'}
                  placeholderTextColor={colors.textMuted}
                  value={returnValue}
                  onChangeText={handleReturnValueChange}
                />
              </View>
              {equityError ? <Text style={styles.errorText}>{equityError}</Text> : null}
            </View>

            {/* Timeline Months Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Target Timeline (Months)</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  keyboardType="numeric"
                  placeholder="e.g. 12"
                  placeholderTextColor={colors.textMuted}
                  value={timelineMonths}
                  onChangeText={setTimelineMonths}
                />
              </View>
            </View>

            {/* Optional Note to Business Owner */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Message to Business Owner (Optional)</Text>
              <View style={[styles.inputBox, styles.inputBoxArea, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  multiline
                  placeholder="Introduce yourself or highlight why you want to invest..."
                  placeholderTextColor={colors.textMuted}
                  value={note}
                  onChangeText={setNote}
                />
              </View>
            </View>

            <Button
              title="Next: Review Offer →"
              onPress={() => setStep('review')}
              disabled={!returnValue || !!equityError}
              style={styles.nextBtn}
            />
          </FadeInView>
        )}

        {step === 'review' && (
          <FadeInView style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Review Bid Proposal</Text>
            <Text style={[styles.stepSub, { color: colors.textSecondary }]}>
              Double-check your bid parameters before submitting your offer.
            </Text>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Target Business</Text>
                <Text style={[styles.reviewValue, { color: colors.textPrimary }]}>{pitch.businessName}</Text>
              </View>

              <View style={styles.reviewDivider} />

              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Investment Amount</Text>
                <Text style={[styles.reviewValueBold, { color: isDark ? colors.accent : colors.primary }]}>GH₵ {finalAmount.toLocaleString()}</Text>
              </View>

              <View style={styles.reviewDivider} />

              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Return Structure</Text>
                <Text style={[styles.reviewValue, { color: colors.textPrimary }]}>
                  {returnType === 'FIXED' ? `GH₵${returnValue} Fixed Return` : `${returnValue}% ${returnType}`}
                </Text>
              </View>

              <View style={styles.reviewDivider} />

              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Timeline</Text>
                <Text style={[styles.reviewValue, { color: colors.textPrimary }]}>{timelineMonths} Months</Text>
              </View>

              <View style={styles.reviewDivider} />

              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Estimated Platform Fee (1%)</Text>
                <Text style={[styles.reviewValue, { color: colors.textPrimary }]}>GH₵ {platformFee.toFixed(2)}</Text>
              </View>
            </View>

            <Button
              title="Submit Bid Offer"
              onPress={handleSubmit}
              loading={placeBidMutation.isPending}
              style={styles.submitBtn}
            />
          </FadeInView>
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
  headerTitleBox: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 11,
    marginTop: 1,
  },
  wizardRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  wizardStep: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
  },
  wizardStepActive: {
    backgroundColor: '#16A34A',
  },
  wizardStepText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  wizardStepTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
  },
  stepContainer: {
    gap: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  stepSub: {
    fontSize: 13,
    marginTop: -8,
    lineHeight: 18,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetChip: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    gap: 6,
  },
  inputBoxArea: {
    height: 80,
    paddingVertical: 8,
  },
  prefix: {
    fontSize: 15,
    fontWeight: '800',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewLabel: {
    fontSize: 13,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviewValueBold: {
    fontSize: 16,
    fontWeight: '800',
  },
  reviewDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  nextBtn: {
    marginTop: 8,
  },
  submitBtn: {
    marginTop: 8,
  },
});
