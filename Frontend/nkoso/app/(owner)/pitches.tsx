import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Video, ResizeMode } from 'expo-av';
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
  Image,
  ScrollView as ScrollV,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyPitches, createPitch, deletePitch } from '@/services/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const INDUSTRIES = [
  'FOOD_AND_BEVERAGE', 'RETAIL', 'AGRICULTURE', 'TRANSPORT', 'FASHION',
  'BEAUTY_AND_COSMETICS', 'CONSTRUCTION', 'EDUCATION', 'HEALTH',
  'TECHNOLOGY', 'ENTERTAINMENT', 'HOSPITALITY', 'MANUFACTURING', 'OTHER',
];

const OFFER_TYPES = ['EQUITY', 'REVENUE_SHARE', 'FIXED'];

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatOfferType(offerType: string | undefined) {
  if (offerType === 'REVENUE_SHARE') return 'revenue share';
  if (offerType === 'FIXED') return 'fixed repayment';
  return 'equity';
}

export default function PitchesScreen() {
  const [showCreate, setShowCreate] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
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
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [industry, setIndustry] = useState<string>('');
  const [offerType, setOfferType] = useState<string>('');

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
      setThumbnailUri(null);
      setIndustry('');
      setOfferType('');
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePitch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPitches'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to delete pitch');
    }
  });

  const confirmDelete = (pitchId: string) => {
    Alert.alert(
      'Delete Pitch',
      'Are you sure you want to delete this pitch? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteMutation.mutate(pitchId) 
        }
      ]
    );
  };

  const handlePickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setVideoUri(uri);

      try {
        const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(uri, {
          time: 1000,
        });
        setThumbnailUri(thumbUri);
      } catch (err) {
        console.warn('Failed to generate thumbnail', err);
        setThumbnailUri(null);
      }
    }
  };

  const handleCreate = async () => {
    if (!businessName || !description || !monthlyIncome || !amountNeeded || !videoUri || !industry || !offerType) {
      Alert.alert('Missing fields', 'Please fill in all required fields, choose an industry, offer type, and a pitch video.');
      return;
    }
    createMutation.mutate({
      data: {
        businessName,
        description,
        monthlyIncome: Number(monthlyIncome),
        amountNeeded: Number(amountNeeded),
        offerType,
        offerValue: Number(offerValue) || 0,
        location,
        industry,
      },
      video: { uri: videoUri, fileName: 'pitch-video.mp4', mimeType: 'video/mp4' },
      image: thumbnailUri
        ? { uri: thumbnailUri, fileName: 'pitch-cover.jpg', mimeType: 'image/jpeg' }
        : undefined,
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
            return (
              <View key={pitch.id} style={styles.pitchCard}>
                <TouchableOpacity
                  style={styles.mediaWrap}
                  activeOpacity={0.9}
                  disabled={!pitch.videoUrl}
                  onPress={() => pitch.videoUrl && setPlayingVideo(pitch.videoUrl)}
                >
                  {pitch.imageUrl ? (
                    <Image 
                      source={{ uri: pitch.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80' }} 
                      style={styles.media} 
                    />
                  ) : (
                    <View style={[styles.media, styles.mediaPlaceholder]}>
                      <Ionicons name="videocam" size={32} color={Colors.primary} />
                      <Text style={styles.mediaPlaceholderText}>
                        {pitch.videoUrl ? 'Tap to watch pitch video' : 'No preview available'}
                      </Text>
                    </View>
                  )}
                  {pitch.videoUrl ? (
                    <View style={styles.playOverlay}>
                      <Ionicons name="play-circle" size={48} color="#fff" />
                    </View>
                  ) : null}
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>{pitch.status === 'LIVE' ? 'LIVE' : pitch.status}</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.pitchCardBody}>
                  <View style={styles.pitchInfo}>
                    <Badge label={pitch.industry} industry={pitch.industry} />
                    <Text style={styles.pitchName}>{pitch.businessName}</Text>
                  </View>

                  <Text style={styles.pitchDesc} numberOfLines={3}>
                    {pitch.description}
                  </Text>

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

                  <View style={styles.divider} />

                  <View style={styles.statsRow}>
                    <View>
                      <Text style={styles.statValue}>GH₵{formatCurrency(pitch.amountNeeded)}</Text>
                      <Text style={styles.statLabel}>asking</Text>
                    </View>
                    <View style={styles.offerPill}>
                      <Text style={styles.offerPillText}>
                        {pitch.offerValue}% {formatOfferType(pitch.offerType)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.pitchActions}>
                    <TouchableOpacity style={styles.pitchActionBtn} activeOpacity={0.7}>
                      <Ionicons name="create-outline" size={16} color={Colors.primary} />
                      <Text style={styles.pitchActionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.pitchActionBtn} activeOpacity={0.7}>
                      <Ionicons name="share-social-outline" size={16} color={Colors.primary} />
                      <Text style={styles.pitchActionText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.pitchActionBtn} 
                      activeOpacity={0.7}
                      onPress={() => confirmDelete(pitch.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color={Colors.accentRed} />
                      <Text style={[styles.pitchActionText, { color: Colors.accentRed }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
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

            <View style={styles.textAreaWrapper}>
              <Text style={styles.textAreaLabel}>Offer type *</Text>
              <View style={styles.chipWrap}>
                {OFFER_TYPES.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, offerType === item && styles.chipSelected]}
                    onPress={() => setOfferType(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, offerType === item && styles.chipTextSelected]}>
                      {formatLabel(item)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label={
                offerType === 'FIXED'
                  ? 'Fixed repayment amount (GH₵)'
                  : offerType === 'REVENUE_SHARE'
                  ? 'Revenue share offered (%)'
                  : 'Equity offered (%)'
              }
              placeholder={offerType === 'FIXED' ? 'e.g. 25000' : 'e.g. 7.5'}
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

            <View style={styles.textAreaWrapper}>
              <Text style={styles.textAreaLabel}>Industry *</Text>
              <View style={styles.chipWrap}>
                {INDUSTRIES.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, industry === item && styles.chipSelected]}
                    onPress={() => setIndustry(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, industry === item && styles.chipTextSelected]}>
                      {formatLabel(item)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.uploadSection}>
              <Text style={styles.textAreaLabel}>Pitch Video</Text>
              {videoUri ? (
                <View style={styles.videoAttached}>
                  {thumbnailUri ? (
                    <Image source={{ uri: thumbnailUri }} style={styles.thumbnailPreview} />
                  ) : (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
                  )}
                  <Text style={styles.videoAttachedText}>Video attached successfully.</Text>
                  <TouchableOpacity onPress={() => { setVideoUri(null); setThumbnailUri(null); }}>
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

      {/* Video Player Modal */}
      <Modal
        visible={!!playingVideo}
        animationType="fade"
        transparent
        onRequestClose={() => setPlayingVideo(null)}
      >
        <View style={styles.videoModalBackdrop}>
          <TouchableOpacity
            style={styles.videoCloseBtn}
            onPress={() => setPlayingVideo(null)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {playingVideo ? (
            <Video
              source={{ uri: playingVideo }}
              style={styles.videoPlayer}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
            />
          ) : null}
        </View>
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
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  mediaWrap: {
    position: 'relative',
  },
  media: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    backgroundColor: Colors.borderLight,
  },
  mediaPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    gap: 8,
  },
  mediaPlaceholderText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  pitchCardBody: {
    padding: 18,
    gap: 10,
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
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffffffee',
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
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  offerPill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  offerPillText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  pitchActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
    marginTop: 4,
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
  thumbnailPreview: {
    width: 40,
    height: 40,
    borderRadius: 6,
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
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.inputBg,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#fff',
  },
  videoModalBackdrop: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});