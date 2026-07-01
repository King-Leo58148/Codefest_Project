import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { verifyGhanaCard, verifyMomo } from '@/services/api';

export default function VerificationScreen() {
  const { user, setUser } = useAuthStore();
  const [ghanaCardInput, setGhanaCardInput] = useState('');
  const [momoInput, setMomoInput] = useState('');
  const [cardLoading, setCardLoading] = useState(false);
  const [momoLoading, setMomoLoading] = useState(false);

  const handleVerifyCard = async () => {
    const cleaned = ghanaCardInput.replace(/\s/g, '').toUpperCase();
    if (!cleaned || cleaned.length < 10) {
      Alert.alert('Invalid', 'Enter a valid Ghana Card number (e.g. GHA-123456789-1).');
      return;
    }
    setCardLoading(true);
    try {
      await verifyGhanaCard(cleaned);
      setUser({ ...user!, ghanaCardVerified: true, ghanaCardNumber: cleaned });
      Alert.alert('Verified!', 'Your Ghana Card has been verified successfully.');
      setGhanaCardInput('');
    } catch {
      Alert.alert('Failed', 'Could not verify Ghana Card. Please try again.');
    } finally {
      setCardLoading(false);
    }
  };

  const handleVerifyMomo = async () => {
    const cleaned = momoInput.replace(/\D/g, '');
    if (!cleaned || cleaned.length < 10) {
      Alert.alert('Invalid', 'Enter a valid 10-digit MTN MoMo number.');
      return;
    }
    setMomoLoading(true);
    try {
      await verifyMomo(cleaned);
      setUser({ ...user!, momoVerified: true, momoNumber: cleaned });
      Alert.alert('Verified!', 'Your MoMo account has been verified successfully.');
      setMomoInput('');
    } catch {
      Alert.alert('Failed', 'Could not verify MoMo account. Please try again.');
    } finally {
      setMomoLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Investor verification</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall status */}
        <View
          style={[
            styles.statusBanner,
            user?.ghanaCardVerified && user?.momoVerified
              ? styles.statusBannerVerified
              : styles.statusBannerPending,
          ]}
        >
          <Ionicons
            name={user?.ghanaCardVerified && user?.momoVerified ? 'shield-checkmark' : 'shield-outline'}
            size={28}
            color={user?.ghanaCardVerified && user?.momoVerified ? Colors.accent : '#EA580C'}
          />
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>
              {user?.ghanaCardVerified && user?.momoVerified ? 'Fully verified' : 'Verification pending'}
            </Text>
            <Text style={styles.statusDesc}>
              {user?.ghanaCardVerified && user?.momoVerified
                ? 'You are verified to invest on Nkɔso.'
                : 'Complete verification to unlock all investment features.'}
            </Text>
          </View>
        </View>

        {/* Ghana Card */}
        <View style={styles.verifyCard}>
          <View style={styles.verifyCardHeader}>
            <View style={styles.verifyCardLeft}>
              <View
                style={[
                  styles.verifyIconBox,
                  { backgroundColor: user?.ghanaCardVerified ? '#F0FDF4' : '#EFF6FF' },
                ]}
              >
                <Ionicons
                  name="card-outline"
                  size={22}
                  color={user?.ghanaCardVerified ? Colors.accent : Colors.primary}
                />
              </View>
              <View>
                <Text style={styles.verifyCardTitle}>Ghana Card</Text>
                <Text style={styles.verifyCardSubtitle}>National identity verification</Text>
              </View>
            </View>
            <View
              style={[
                styles.verifyBadge,
                user?.ghanaCardVerified ? styles.verifyBadgeDone : styles.verifyBadgePending,
              ]}
            >
              <Ionicons
                name={user?.ghanaCardVerified ? 'checkmark-circle' : 'time-outline'}
                size={13}
                color={user?.ghanaCardVerified ? Colors.accent : '#EA580C'}
              />
              <Text
                style={[
                  styles.verifyBadgeText,
                  { color: user?.ghanaCardVerified ? Colors.accent : '#EA580C' },
                ]}
              >
                {user?.ghanaCardVerified ? 'Verified' : 'Pending'}
              </Text>
            </View>
          </View>

          {user?.ghanaCardVerified ? (
            <View style={styles.verifiedDetails}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
              <Text style={styles.verifiedDetailsText}>
                {user.ghanaCardNumber ?? 'GHA-XXXXXXXXX-X'} · Verified via Appruve
              </Text>
            </View>
          ) : (
            <View style={styles.verifyForm}>
              <Input
                placeholder="GHA-XXXXXXXXX-X"
                value={ghanaCardInput}
                onChangeText={setGhanaCardInput}
                autoCapitalize="characters"
                leftIcon="card-outline"
              />
              <Button
                title="Verify Ghana Card"
                onPress={handleVerifyCard}
                loading={cardLoading}
              />
            </View>
          )}
        </View>

        {/* MoMo */}
        <View style={styles.verifyCard}>
          <View style={styles.verifyCardHeader}>
            <View style={styles.verifyCardLeft}>
              <View
                style={[
                  styles.verifyIconBox,
                  { backgroundColor: user?.momoVerified ? '#F0FDF4' : '#EFF6FF' },
                ]}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={22}
                  color={user?.momoVerified ? Colors.accent : Colors.primary}
                />
              </View>
              <View>
                <Text style={styles.verifyCardTitle}>MTN MoMo</Text>
                <Text style={styles.verifyCardSubtitle}>Mobile money verification</Text>
              </View>
            </View>
            <View
              style={[
                styles.verifyBadge,
                user?.momoVerified ? styles.verifyBadgeDone : styles.verifyBadgePending,
              ]}
            >
              <Ionicons
                name={user?.momoVerified ? 'checkmark-circle' : 'time-outline'}
                size={13}
                color={user?.momoVerified ? Colors.accent : '#EA580C'}
              />
              <Text
                style={[
                  styles.verifyBadgeText,
                  { color: user?.momoVerified ? Colors.accent : '#EA580C' },
                ]}
              >
                {user?.momoVerified ? 'Verified' : 'Pending'}
              </Text>
            </View>
          </View>

          {user?.momoVerified ? (
            <View style={styles.verifiedDetails}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
              <Text style={styles.verifiedDetailsText}>
                {user.momoNumber ?? '0XX XXXX XXXX'} · Verified via MTN MoMo API
              </Text>
            </View>
          ) : (
            <View style={styles.verifyForm}>
              <Input
                placeholder="024 XXX XXXX"
                value={momoInput}
                onChangeText={setMomoInput}
                keyboardType="phone-pad"
                leftIcon="phone-portrait-outline"
              />
              <Button
                title="Verify MoMo account"
                onPress={handleVerifyMomo}
                loading={momoLoading}
              />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.legalNote}>
          <Ionicons name="information-circle-outline" size={15} color={Colors.textMuted} />
          <Text style={styles.legalText}>
            Verification is required by our licensed MFI partner for legal compliance. Your data
            is securely handled via Appruve and MTN MoMo APIs.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  statusBanner: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 16,
    gap: 14,
    alignItems: 'center',
  },
  statusBannerVerified: { backgroundColor: '#F0FDF4' },
  statusBannerPending: { backgroundColor: '#FFF7ED' },
  statusInfo: { flex: 1 },
  statusTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  statusDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  verifyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  verifyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifyCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  verifyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyCardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  verifyCardSubtitle: { fontSize: 12, color: Colors.textSecondary },
  verifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  verifyBadgeDone: { backgroundColor: '#F0FDF4' },
  verifyBadgePending: { backgroundColor: '#FFF7ED' },
  verifyBadgeText: { fontSize: 12, fontWeight: '600' },
  verifiedDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
  },
  verifiedDetailsText: { fontSize: 13, color: '#16A34A', flex: 1 },
  verifyForm: { gap: 12 },
  legalNote: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  legalText: { flex: 1, fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
});
