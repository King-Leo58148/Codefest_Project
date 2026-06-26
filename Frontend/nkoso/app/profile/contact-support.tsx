import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

const TOPICS = [
  'Investment & bids',
  'Deals & repayments',
  'Verification issues',
  'Payment problems',
  'Account access',
  'Other',
];

export default function ContactSupportScreen() {
  const { user } = useAuthStore();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedTopic) {
      Alert.alert('Required', 'Please select a topic.');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Required', 'Please enter a subject.');
      return;
    }
    if (!message.trim() || message.trim().length < 20) {
      Alert.alert('Required', 'Please describe your issue in at least 20 characters.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact support</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={56} color={Colors.accent} />
          </View>
          <Text style={styles.successTitle}>Message sent!</Text>
          <Text style={styles.successBody}>
            Our team will get back to you at {user?.email} within 24 hours on business days.
          </Text>
          <Button title="Back to profile" onPress={() => router.back()} style={styles.successBtn} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact support</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Quick contact channels */}
          <View style={styles.channelsRow}>
            <TouchableOpacity style={styles.channelBtn} activeOpacity={0.8}>
              <View style={[styles.channelIcon, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="logo-whatsapp" size={20} color="#16A34A" />
              </View>
              <Text style={styles.channelLabel}>WhatsApp</Text>
              <Text style={styles.channelSub}>Fastest</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.channelBtn} activeOpacity={0.8}>
              <View style={[styles.channelIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="call-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.channelLabel}>Call us</Text>
              <Text style={styles.channelSub}>Mon–Fri 8am–6pm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.channelBtn} activeOpacity={0.8}>
              <View style={[styles.channelIcon, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="mail-outline" size={20} color="#EA580C" />
              </View>
              <Text style={styles.channelLabel}>Email</Text>
              <Text style={styles.channelSub}>24h response</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <Text style={styles.formTitle}>Send us a message</Text>

          {/* Topic chips */}
          <Text style={styles.fieldLabel}>Topic</Text>
          <View style={styles.topicsGrid}>
            {TOPICS.map((topic) => (
              <TouchableOpacity
                key={topic}
                style={[styles.topicChip, selectedTopic === topic && styles.topicChipActive]}
                onPress={() => setSelectedTopic(topic)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.topicChipText,
                    selectedTopic === topic && styles.topicChipTextActive,
                  ]}
                >
                  {topic}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Subject"
            value={subject}
            onChangeText={setSubject}
            placeholder="Brief description of your issue"
            leftIcon="document-outline"
          />

          <View style={styles.textareaContainer}>
            <Text style={styles.fieldLabel}>Message</Text>
            <Input
              value={message}
              onChangeText={setMessage}
              placeholder="Describe your issue in detail. The more context you provide, the faster we can help."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              style={styles.textarea}
            />
          </View>

          <View style={styles.replyInfo}>
            <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.replyInfoText}>
              We reply to {user?.email} within 24 hours on business days (Mon–Fri).
            </Text>
          </View>

          <Button
            title="Send message"
            onPress={handleSubmit}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
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
  channelsRow: { flexDirection: 'row', gap: 10 },
  channelBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  channelIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  channelSub: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  divider: { height: 1, backgroundColor: Colors.border },
  formTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  fieldLabel: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary, marginBottom: 8 },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topicChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  topicChipText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  topicChipTextActive: { color: '#fff' },
  textareaContainer: { gap: 0 },
  textarea: { minHeight: 120, paddingTop: 14 },
  replyInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  replyInfoText: { flex: 1, fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  successBody: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  successBtn: { marginTop: 16, width: '100%' },
});
