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
import { MOCK_PITCHES } from '@/services/mockData';
import { Button } from '@/components/ui/Button';
import { placeBid } from '@/services/api';

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2000, 5000];
const RETURN_TYPES = ['EQUITY', 'REVENUE_SHARE', 'FIXED'] as const;

export default function InvestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pitch = MOCK_PITCHES.find((p) => p.id === id);

  const [amount, setAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState('');
  const [returnType, setReturnType] = useState<'EQUITY' | 'REVENUE_SHARE' | 'FIXED'>('EQUITY');
  const [returnValue, setReturnValue] = useState('');
  const [timelineMonths, setTimelineMonths] = useState('12');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'amount' | 'terms' | 'review'>('amount');

  if (!pitch) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Pitch not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const finalAmount = customAmount ? parseInt(customAmount, 10) || amount : amount;
  const platformFee = Math.min(finalAmount * 0.01, 100);

  const handleSubmit = async () => {
    if (!returnValue) {
      Alert.alert('Missing details', 'Please enter your expected return value.');
      return;
    }
    setLoading(true);
    try {
      await placeBid({
        pitchId: pitch.id,
        amount: finalAmount,
        returnType,
        returnValue: parseFloat(returnValue),
        timelineMonths: parseInt(timelineMonths, 10),
        note,
      });
      Alert.alert(
        'Bid placed!',
        `Your bid of GH₵${finalAmount.toLocaleString()} has been sent to ${pitch.businessName}. You'll be notified when they respond.`,
        [{ text: 'OK', onPress: () => router.replace('/(investor)/portfolio') }]
      );
    } catch {
      Alert.alert('Error', 'Failed to place bid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (step === 'amount' ? router.back() : setStep(step === 'review' ? 'terms' : 'amount'))}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invest in {pitch.businessName}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Step indicator */}
        <View style={styles.stepRow}>
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
        </View>

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
                  onChangeText={(v) => {
                    setCustomAmount(v);
                  }}
                />
              </View>
            </View>

            <View style={styles.minNote}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.minNoteText}>
                Minimum investment: GH₵{pitch.minimumInvestment.toLocaleString()}
              </Text>
            </View>

            <Button
              title="Continue"
              onPress={() => {
                if (finalAmount < pitch.minimumInvestment) {
                  Alert.alert(
                    'Minimum not met',
                    `Minimum investment is GH₵${pitch.minimumInvestment.toLocaleString()}`
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
                  onPress={() => setReturnType(rt)}
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
                  : 'Fixed return (%)'}
              </Text>
              <View style={styles.fieldInput}>
                <TextInput
                  style={styles.fieldInputText}
                  placeholder="e.g. 5"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="decimal-pad"
                  value={returnValue}
                  onChangeText={setReturnValue}
                />
                <Text style={styles.fieldSuffix}>%</Text>
              </View>
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

            <Button title="Review bid" onPress={() => setStep('review')} />
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
                { label: 'Expected return', value: `${returnValue}%` },
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

            <Button title="Place bid" onPress={handleSubmit} loading={loading} />
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
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
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
    paddingVertical: 10,
    borderRadius: 10,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 50,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 50,
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
    paddingVertical: 10,
    borderRadius: 10,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 90,
  },
  reviewCard: {
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
