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
  Pressable,
  Share,
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyPitches, createPitch, deletePitch } from '@/services/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/store/themeStore';

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

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return 'TBD';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'TBD';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatCurrency(val: number | undefined) {
  if (val === undefined || val === null) return '0';
  return val.toLocaleString();
}

export default function PitchesScreen() {
  const { isDark, colors } = useTheme();
  const [showCreate, setShowCreate] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [menuPitchId, setMenuPitchId] = useState<string | null>(null);
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
      const msg = error?.message || '';
      if (msg.includes('verification') || msg.includes('Please complete verification process')) {
        Alert.alert('Verification required', 'Please complete verification process.');
      } else {
        Alert.alert('Error', msg || 'Could not create pitch. Please check inputs.');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePitch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPitches'] });
      Alert.alert('Deleted', 'Pitch has been removed.');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Could not delete pitch.');
    },
  });

  const confirmDelete = (id: string) => {
    setMenuPitchId(null);
    Alert.alert(
      'Delete Pitch',
      'Are you sure you want to delete this pitch? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
      ]
    );
  };

  const handlePickVideo = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow access to your media library to upload pitch video.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedVideo = result.assets[0];
        setVideoUri(pickedVideo.uri);
        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(pickedVideo.uri, { time: 1000 });
          setThumbnailUri(uri);
        } catch {
          // Thumbnail generation failed, will rely on default image
        }
      }
    } catch {
      Alert.alert('Error', 'Could not select video.');
    }
  };

  const handleCreate = () => {
    if (!businessName.trim()) return Alert.alert('Missing info', 'Please enter your business name.');
    if (!description.trim()) return Alert.alert('Missing info', 'Please enter a business description.');
    if (!monthlyIncome.trim() || isNaN(Number(monthlyIncome)))
      return Alert.alert('Missing info', 'Please enter a valid monthly income amount.');
    if (!amountNeeded.trim() || isNaN(Number(amountNeeded)))
      return Alert.alert('Missing info', 'Please enter a valid target amount needed.');
    if (!offerType) return Alert.alert('Missing info', 'Please select an offer type.');
    if (!offerValue.trim() || isNaN(Number(offerValue)))
      return Alert.alert('Missing info', 'Please enter your offer value.');
    if (!industry) return Alert.alert('Missing info', 'Please select an industry.');

    createMutation.mutate({
      pitch: {
        businessName: businessName.trim(),
        description: description.trim(),
        summary: description.trim().slice(0, 120),
        monthlyIncome: parseFloat(monthlyIncome),
        amountNeeded: parseFloat(amountNeeded),
        minInvestment: Math.min(parseFloat(amountNeeded) * 0.05, 500),
        offerType,
        offerValue: parseFloat(offerValue),
        industry,
        location: location.trim() || 'Accra, Ghana',
      },
      video: videoUri ? { uri: videoUri, fileName: 'pitch-video.mp4', mimeType: 'video/mp4' } : undefined,
      image: thumbnailUri
        ? { uri: thumbnailUri, fileName: 'pitch-cover.jpg', mimeType: 'image/jpeg' }
        : undefined,
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>My Pitches</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowCreate(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loadingPitches ? (
          <ActivityIndicator size="large" color={isDark ? colors.accent : colors.primary} style={{ marginTop: 20 }} />
        ) : isError ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
            <Text style={[styles.emptyText, { color: colors.textPrimary }]}>Could not load your pitches</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>{error instanceof Error ? error.message : 'Please try again.'}</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => refetch()} activeOpacity={0.8}>
              <Text style={styles.createBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : pitches.length > 0 ? (
          pitches.map((pitch) => {
            return (
              <Pressable
                key={pitch.id}
                style={[styles.pitchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onLongPress={() => setMenuPitchId(pitch.id)}
                delayLongPress={400}
              >
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
                      <Ionicons name="videocam" size={32} color={isDark ? colors.accent : colors.primary} />
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

                {/* 3-dot menu button */}
                <TouchableOpacity
                  style={styles.menuDots}
                  activeOpacity={0.7}
                  onPress={() => setMenuPitchId(pitch.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <View style={styles.pitchCardBody}>
                  <View style={styles.pitchInfo}>
                    <Badge label={pitch.industry} industry={pitch.industry as any} />
                    <Text style={[styles.pitchName, { color: colors.textPrimary }]}>{pitch.businessName}</Text>
                  </View>

                  <Text style={[styles.pitchDesc, { color: colors.textSecondary }]} numberOfLines={3}>
                    {pitch.description}
                  </Text>

                  <View style={styles.pitchMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                      <Text style={[styles.metaText, { color: colors.textSecondary }]}>{pitch.location}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                      <Text style={[styles.metaText, { color: colors.textSecondary }]}>Ends {formatDate(pitch.campaignEndDate)}</Text>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <View style={styles.statsRow}>
                    <View>
                      <Text style={[styles.statValue, { color: colors.textPrimary }]}>GH₵{formatCurrency(pitch.amountNeeded)}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>asking</Text>
                    </View>
                    <View style={[styles.offerPill, { backgroundColor: colors.surfaceSubtle }]}>
                      <Text style={[styles.offerPillText, { color: isDark ? colors.accent : colors.primary }]}>
                        {pitch.offerType === 'FIXED' ? `GH₵${pitch.offerValue}` : `${pitch.offerValue}%`} {formatOfferType(pitch.offerType)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="megaphone-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textPrimary }]}>No pitches yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Create your first pitch to start raising capital.</Text>
          </View>
        )}

        {/* Create another pitch card */}
        {pitches.length > 0 && !isError ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="add-circle-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textPrimary }]}>Create another pitch</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              You can have multiple active pitches at the same time.
            </Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => setShowCreate(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.createBtnText}>+ New Pitch</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      {/* Create Pitch Modal */}
      <Modal
        visible={showCreate}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreate(false)}
      >
        <SafeAreaView style={[styles.modalFlex, { backgroundColor: colors.background }]}>
          <KeyboardAvoidingView
            style={styles.modalFlex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>New Pitch</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollV
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Tell investors about your business. Be honest and specific.
              </Text>
              
              <Input
                label="Business name *"
                placeholder="e.g. Accra Fresh Foods"
                value={businessName}
                onChangeText={setBusinessName}
              />

              <View style={styles.textAreaWrapper}>
                <Text style={[styles.textAreaLabel, { color: colors.textPrimary }]}>Business description *</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="Describe what your business does, how you make money, and what the funds will be used for..."
                  placeholderTextColor={colors.textMuted}
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
                <Text style={[styles.textAreaLabel, { color: colors.textPrimary }]}>Offer type *</Text>
                <View style={styles.chipWrap}>
                  {OFFER_TYPES.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.chip,
                        { backgroundColor: colors.inputBg, borderColor: colors.border },
                        offerType === item && { backgroundColor: isDark ? colors.accent : colors.primary, borderColor: isDark ? colors.accent : colors.primary },
                      ]}
                      onPress={() => setOfferType(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, { color: colors.textSecondary }, offerType === item && styles.chipTextSelected]}>
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
                <Text style={[styles.textAreaLabel, { color: colors.textPrimary }]}>Industry *</Text>
                <View style={styles.chipWrap}>
                  {INDUSTRIES.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.chip,
                        { backgroundColor: colors.inputBg, borderColor: colors.border },
                        industry === item && { backgroundColor: isDark ? colors.accent : colors.primary, borderColor: isDark ? colors.accent : colors.primary },
                      ]}
                      onPress={() => setIndustry(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, { color: colors.textSecondary }, industry === item && styles.chipTextSelected]}>
                        {formatLabel(item)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.uploadSection}>
                <Text style={[styles.textAreaLabel, { color: colors.textPrimary }]}>Pitch Video</Text>
                {videoUri ? (
                  <View style={[styles.videoAttached, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
                    {thumbnailUri ? (
                      <Image source={{ uri: thumbnailUri }} style={styles.thumbnailPreview} />
                    ) : (
                      <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                    )}
                    <Text style={[styles.videoAttachedText, { color: colors.textPrimary }]}>Video attached successfully.</Text>
                    <TouchableOpacity onPress={() => { setVideoUri(null); setThumbnailUri(null); }}>
                      <Text style={styles.removeVideoText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={handlePickVideo} activeOpacity={0.7}>
                    <Ionicons name="cloud-upload-outline" size={24} color={isDark ? colors.accent : colors.primary} />
                    <Text style={[styles.uploadBtnText, { color: colors.textPrimary }]}>Select a video</Text>
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
        </SafeAreaView>
      </Modal>

      {/* 3-dot Context Menu Modal */}
      <Modal
        visible={!!menuPitchId}
        animationType="fade"
        transparent
        onRequestClose={() => setMenuPitchId(null)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuPitchId(null)}
        >
          <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.6}
              onPress={async () => {
                setMenuPitchId(null);
                const pitch = pitches.find(p => p.id === menuPitchId);
                if (pitch) {
                  await Share.share({
                    message: `Check out "${pitch.businessName}" on Nkɔso! They're raising GH₵${formatCurrency(pitch.amountNeeded)}.`,
                  });
                }
              }}
            >
              <Ionicons name="share-social-outline" size={20} color={isDark ? colors.accent : colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Share</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.6}
              onPress={() => menuPitchId && confirmDelete(menuPitchId)}
            >
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
              <Text style={[styles.menuItemText, { color: '#DC2626' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Fullscreen Video Player Modal */}
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
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={26} color="#fff" />
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  emptyCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 6,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
  },
  createBtn: {
    marginTop: 8,
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  pitchCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaWrap: {
    height: 160,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  mediaPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  mediaPlaceholderText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  playOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(22, 163, 74, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  menuDots: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pitchCardBody: {
    padding: 16,
    gap: 10,
  },
  pitchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pitchName: {
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
  },
  pitchDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  pitchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
  },
  offerPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  offerPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  modalFlex: {
    flex: 1,
  },
  modalHeader: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalContent: {
    padding: 20,
    gap: 14,
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  textAreaWrapper: {
    gap: 6,
  },
  textAreaLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  textArea: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
  },
  uploadSection: {
    gap: 6,
  },
  uploadBtn: {
    height: 80,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  videoAttached: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  thumbnailPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  videoAttachedText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  removeVideoText: {
    fontSize: 13,
    color: '#DC2626',
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
  },
  chipSelected: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#fff',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  menuCard: {
    width: 220,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuDivider: {
    height: 1,
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