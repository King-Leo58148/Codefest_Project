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
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/store/themeStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

const TOPICS = [
  'Investment & Bids',
  'Deals & Repayments',
  'Verification Issues',
  'Payment & MoMo Problems',
  'Account Access',
  'Other Inquiry',
];

const SUPPORT_PHONE = '+233207113678';
const SUPPORT_WHATSAPP = '233207113678';
const SUPPORT_EMAIL = 'nkosobusiness@gmail.com';

export default function ContactSupportScreen() {
  const { isDark, colors } = useTheme();
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
    if (!message.trim() || message.trim().length < 10) {
      Alert.alert('Required', 'Please describe your issue in at least 10 characters.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  const callSupport = () => Linking.openURL(`tel:${SUPPORT_PHONE}`);
  const whatsappSupport = () => Linking.openURL(`https://wa.me/${SUPPORT_WHATSAPP}`);
  const emailSupport = () => Linking.openURL(`mailto:${SUPPORT_EMAIL}`);

  if (submitted) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Support Request Sent</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.successContainer}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={36} color="#FFFFFF" />
          </View>
          <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Ticket Created! 🎉</Text>
          <Text style={[styles.successSub, { color: colors.textSecondary }]}>
            Our Accra support team will contact you via email at {user?.email || 'your registered email'} within 24 hours.
          </Text>
          <Button title="Back to Support" onPress={() => setSubmitted(false)} style={{ marginTop: 12, width: '100%' }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Contact 24/7 Support</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Quick Channels Grid */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Direct Support Channels</Text>

          <View style={styles.channelsGrid}>
            <TouchableOpacity style={[styles.channelCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={callSupport}>
              <View style={[styles.channelIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="call" size={20} color="#15803D" />
              </View>
              <Text style={[styles.channelLabel, { color: colors.textPrimary }]}>Phone Support</Text>
              <Text style={[styles.channelDetail, { color: colors.textSecondary }]}>+233 20 711 3678</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.channelCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={whatsappSupport}>
              <View style={[styles.channelIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="logo-whatsapp" size={20} color="#15803D" />
              </View>
              <Text style={[styles.channelLabel, { color: colors.textPrimary }]}>WhatsApp Chat</Text>
              <Text style={[styles.channelDetail, { color: colors.textSecondary }]}>Instant Reply</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.channelCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={emailSupport}>
              <View style={[styles.channelIconCircle, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="mail" size={20} color="#1D4ED8" />
              </View>
              <Text style={[styles.channelLabel, { color: colors.textPrimary }]}>Email Support</Text>
              <Text style={[styles.channelDetail, { color: colors.textSecondary }]}>nkosobusiness@gmail.com</Text>
            </TouchableOpacity>
          </View>

          {/* Contact Ticket Form */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 8 }]}>Submit Support Ticket</Text>

          <Text style={[styles.label, { color: colors.textPrimary }]}>Select Issue Topic</Text>
          <View style={styles.topicsGrid}>
            {TOPICS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.topicChip,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                  selectedTopic === t && { backgroundColor: isDark ? colors.accent : colors.primary, borderColor: isDark ? colors.accent : colors.primary },
                ]}
                onPress={() => setSelectedTopic(t)}
              >
                <Text style={[styles.topicChipText, { color: colors.textSecondary }, selectedTopic === t && { color: '#FFFFFF', fontWeight: '800' }]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Subject"
            value={subject}
            onChangeText={setSubject}
            placeholder="Brief summary of issue"
            leftIcon="create-outline"
          />

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Message Description</Text>
            <View style={[styles.inputBoxArea, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Input
                value={message}
                onChangeText={setMessage}
                multiline
                placeholder="Describe your issue or question in detail..."
                placeholderTextColor={colors.textMuted}
                style={{ height: 90, textAlignVertical: 'top' }}
              />
            </View>
          </View>

          <Button
            title="Submit Support Ticket"
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: 8 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  channelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  channelCard: {
    width: '31%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  channelIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelLabel: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  channelDetail: {
    fontSize: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  topicChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputBoxArea: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  successSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});