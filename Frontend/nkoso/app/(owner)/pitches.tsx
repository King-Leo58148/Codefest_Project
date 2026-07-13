import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
  ScrollView as ScrollV,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyPitches, createPitch } from '@/services/api';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function PitchesScreen() {
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();

  const { data: pitches = [], isLoading: loadingPitches, isError, error, refetch } = useQuery({
    queryKey: ['myPitches'],
    queryFn: () => getMyPitches(),
  });

  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [amountNeeded, setAmountNeeded] = useState('');
  const [offerValue, setOfferValue] = useState('');
  const [location, setLocation] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: any) => createPitch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPitches'] });
      setShowCreate(false);
      setBusinessName('');
      setDescription('');
      setMonthlyIncome('');
      setAmountNeeded('');
      setOfferValue('');
      setLocation('');
      setVideoUri(null);
      Alert.alert(
        'Pitch submitted!',
        'Your pitch has been submitted for admin review. You will be notified once it goes live.',
        [{ text: 'OK' }]
      );
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to submit pitch');
    }
  });

  const handlePickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!businessName || !description || !monthlyIncome || !amountNeeded || !videoUri) {
      Alert.alert('Missing fields', 'Please fill in all required fields and choose a pitch video.');
      return;
    }
    createMutation.mutate({
      data: {
        businessName,
        description,
        monthlyIncome: Number(monthlyIncome),
        amountNeeded: Number(amountNeeded),
        offerType: 'EQUITY',
        offerValue: Number(offerValue) || 0,
        location,
        industry: 'TECHNOLOGY',
      },
      video: { uri: videoUri, fileName: 'pitch-video.mp4', mimeType: 'video/mp4' },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Pitches</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowCreate(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Pitches */}
        {loadingPitches ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
        ) : isError ? (
          <View style={styles.emptyCard}>
            <Ionicons name="alert-circle-outline" size={32} color={Colors.accentRed} />
            <Text style={styles.emptyText}>Could not load your pitches</Text>
            <Text style={styles.emptyDesc}>{error instanceof Error ? error.message : 'Please try again.'}</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => refetch()} activeOpacity={0.8}>
              <Text style={styles.createBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : pitches.length > 0 ? (
          pitches.map((pitch) => {
            const raisedAmount = Number(pitch.amountRaised ?? 0);
            const neededAmount = Number(pitch.amountNeeded ?? 0);
            const percent = neededAmount > 0 ? (raisedAmount / neededAmount) * 100 : 0;
            return (
              <View key={pitch.id} style={styles.pitchCard}>
                <View style={styles.pitchCardHeader}>
                  <View style={styles.pitchInfo}>
                    <Text style={styles.pitchName}>{pitch.businessName}</Text>
                    <Badge label={pitch.industry} industry={pitch.industry} />
                  </View>
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>{pitch.status === 'LIVE' ? 'LIVE' : pitch.status}</Text>
                  </View>
                </View>

                <Text style={styles.pitchDesc} numberOfLines={3}>
                  {pitch.description}
                </Text>

                <View style={styles.fundingSection}>
                  <View style={styles.fundingRow}>
                    <Text style={styles.fundingLabel}>Raised</Text>
                    <Text style={styles.fundingLabel}>Goal</Text>
                  </View>
                  <View style={styles.fundingRow}>
                    <Text style={styles.fundingValue}>
                      GH₵{formatCurrency(pitch.amountRaised)}
                    </Text>
                    <Text style={styles.fundingValue}>
                      GH₵{formatCurrency(pitch.amountNeeded)}
                    </Text>
                  </View>
                  <ProgressBar percent={percent} height={8} />
                  <Text style={styles.fundedPercent}>{percent.toFixed(0)}% funded</Text>
                </View>

                <View style={styles.pitchMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.metaText}>{pitch.location}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.metaText}>Ends {formatDate(pitch.campaignEndDate)}</Text>
                  </View>
                </View>

                <View style={styles.pitchActions}>
                  <TouchableOpacity style={styles.pitchActionBtn} activeOpacity={0.7}>
                    <Ionicons name="create-outline" size={16} color={Colors.primary} />
                    <Text style={styles.pitchActionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pitchActionBtn} activeOpacity={0.7}>
                    <Ionicons name="analytics-outline" size={16} color={Colors.primary} />
                    <Text style={styles.pitchActionText}>Stats</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pitchActionBtn} activeOpacity={0.7}>
                    <Ionicons name="share-social-outline" size={16} color={Colors.primary} />
                    <Text style={styles.pitchActionText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="megaphone-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No pitches yet</Text>
            <Text style={styles.emptyDesc}>Create your first pitch to start raising capital.</Text>
          </View>
        )}

        {/* No more pitches message */}
        {pitches.length > 0 && !isError ? <View style={styles.emptyCard}>
          <Ionicons name="add-circle-outline" size={32} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Create another pitch</Text>
          <Text style={styles.emptyDesc}>
            You can have multiple active pitches at the same time.
          </Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setShowCreate(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.createBtnText}>+ New Pitch</Text>
          </TouchableOpacity>
        </View> : null}
      </ScrollView>

      {/* Create Pitch Modal */}
      <Modal
        visible={showCreate}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreate(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalFlex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Pitch</Text>
            <TouchableOpacity onPress={() => setShowCreate(false)} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollV
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.modalSubtitle}>
              Tell investors about your business. Be honest and specific.
            </Text>
            <Input
              label="Business name *"
              placeholder="e.g. Accra Fresh Foods"
              value={businessName}
              onChangeText={setBusinessName}
            />
            <View style={styles.textAreaWrapper}>
              <Text style={styles.textAreaLabel}>Business description *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe what your business does, how you make money, and what the funds will be used for..."
                placeholderTextColor={Colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
            <Input
              label="Monthly income (GH₵) *"
              placeholder="e.g. 5000"
              value={monthlyIncome}
              onChangeText={setMonthlyIncome}
              keyboardType="numeric"
            />
            <Input
              label="Amount needed (GH₵) *"
              placeholder="e.g. 20000"
              value={amountNeeded}
              onChangeText={setAmountNeeded}
              keyboardType="numeric"
            />
            <Input
              label="Investor offer (% equity / revenue share)"
              placeholder="e.g. 7.5"
              value={offerValue}
              onChangeText={setOfferValue}
              keyboardType="numeric"
            />
            <Input
              label="Location"
              placeholder="e.g. Accra, Greater Accra"
              value={location}
              onChangeText={setLocation}
            />

            <View style={styles.uploadSection}>
              <Text style={styles.textAreaLabel}>Pitch Video</Text>
              {videoUri ? (
                <View style={styles.videoAttached}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
                  <Text style={styles.videoAttachedText}>Video attached successfully.</Text>
                  <TouchableOpacity onPress={() => setVideoUri(null)}>
                    <Text style={styles.removeVideoText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadBtn} onPress={handlePickVideo} activeOpacity={0.7}>
                  <Ionicons name="cloud-upload-outline" size={24} color={Colors.primary} />
                  <Text style={styles.uploadBtnText}>Select a video</Text>
                </TouchableOpacity>
              )}
            </View>

            <Button
              title="Submit Pitch for Review"
              onPress={handleCreate}
              loading={createMutation.isPending}
            />
            <View style={{ height: 20 }} />
          </ScrollV>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function formatCurrency(value: number | string | null | undefined) {
  const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
  if (!Number.isFinite(numericValue)) {
    return '0';
  }
  return numericValue.toLocaleString();
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'TBD';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'TBD' : date.toLocaleDateString();
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  pitchCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  pitchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pitchInfo: {
    gap: 6,
  },
  pitchName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  liveText: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: '700',
  },
  pitchDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  fundingSection: {
    gap: 6,
  },
  fundingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fundingLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  fundingValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  fundedPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent,
  },
  pitchMeta: {
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  pitchActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  pitchActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.borderLight,
  },
  pitchActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  createBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  createBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  // Modal
  modalFlex: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalContent: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  textAreaWrapper: {
    marginBottom: 16,
  },
  textAreaLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  textArea: {
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 120,
  },
  videoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  videoNoteText: {
    flex: 1,
    fontSize: 13,
    color: Colors.primary,
    lineHeight: 18,
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadBtn: {
    backgroundColor: Colors.borderLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadBtnText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  videoAttached: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },
  videoAttachedText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  removeVideoText: {
    fontSize: 13,
    color: Colors.accentRed,
    fontWeight: '600',
  },
});
