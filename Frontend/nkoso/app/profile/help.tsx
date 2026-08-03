import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/store/themeStore';

interface FAQ {
  q: string;
  a: string;
}

interface FAQCategory {
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: FAQ[];
}

const FAQS: FAQCategory[] = [
  {
    category: 'Getting Started',
    icon: 'rocket-outline',
    items: [
      {
        q: 'What is Nkɔso?',
        a: 'Nkɔso is a digital marketplace that connects Ghanaian investors with informal business owners seeking capital. The name means "growth" or "development" in Akan.',
      },
      {
        q: 'Who can invest on Nkɔso?',
        a: 'Any individual who has completed Ghana Card verification and linked a verified MTN MoMo account can invest. You must be at least 18 years old.',
      },
      {
        q: 'How do I verify my identity?',
        a: 'Go to Profile → Verification. You will need your Ghana Card number (e.g. GHA-123456789-1) and an active MTN MoMo number.',
      },
    ],
  },
  {
    category: 'Investing & Terms',
    icon: 'trending-up-outline',
    items: [
      {
        q: 'What is the minimum investment amount?',
        a: 'The minimum bid is GH₵ 100. Some pitches may set a higher minimum at the business owner\'s discretion.',
      },
      {
        q: 'How are returns calculated?',
        a: 'Returns are agreed at the time of the bid — either a fixed return percentage, equity stake, or revenue-share.',
      },
      {
        q: 'What fees does Nkɔso charge?',
        a: 'Nkɔso charges a 1% platform fee capped at GH₵ 100 per investment deal.',
      },
    ],
  },
  {
    category: 'Repayments & Security',
    icon: 'shield-checkmark-outline',
    items: [
      {
        q: 'How do Mobile Money repayments work?',
        a: 'Business owners initiate repayments directly in the app using Paystack MoMo integration, depositing funds into escrow or directly to investors.',
      },
      {
        q: 'Is my money safe in escrow?',
        a: 'Yes, funds stay in secure Paystack escrow until legal contracts are signed and MFI due diligence audit is approved.',
      },
    ],
  },
];

export default function HelpScreen() {
  const { isDark, colors } = useTheme();
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggle = (q: string) => {
    setOpenItem((prev) => (prev === q ? null : q));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Help & FAQ Center</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Support Banner */}
        <TouchableOpacity
          style={[styles.supportBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push('/profile/contact-support' as any)}
          activeOpacity={0.85}
        >
          <View style={styles.supportIconCircle}>
            <Ionicons name="headset-outline" size={22} color="#16A34A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.supportTitle, { color: colors.textPrimary }]}>Need Direct Assistance?</Text>
            <Text style={[styles.supportSub, { color: colors.textSecondary }]}>Contact our 24/7 Accra customer support team</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#16A34A" />
        </TouchableOpacity>

        {FAQS.map((cat) => (
          <View key={cat.category} style={styles.categoryBlock}>
            <View style={styles.catHeader}>
              <Ionicons name={cat.icon} size={18} color={isDark ? colors.accent : colors.primary} />
              <Text style={[styles.catTitle, { color: colors.textPrimary }]}>{cat.category}</Text>
            </View>

            <View style={[styles.catCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {cat.items.map((item, idx) => {
                const isOpen = openItem === item.q;
                return (
                  <View
                    key={item.q}
                    style={[
                      styles.faqItem,
                      idx < cat.items.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.questionRow}
                      onPress={() => toggle(item.q)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.questionText, { color: colors.textPrimary }]}>{item.q}</Text>
                      <Ionicons
                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>

                    {isOpen && (
                      <Text style={[styles.answerText, { color: colors.textSecondary }]}>{item.a}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
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
    gap: 20,
  },
  supportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  supportIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  supportSub: {
    fontSize: 12,
    marginTop: 1,
  },
  categoryBlock: {
    gap: 8,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  catCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqItem: {
    padding: 16,
    gap: 8,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  answerText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
});
