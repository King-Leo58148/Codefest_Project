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
import { Colors } from '@/constants/Colors';

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
    category: 'Getting started',
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
        a: 'Go to Profile → Investor verification. You will need your Ghana Card number (e.g. GHA-123456789-1) and an active MTN MoMo number. Verification is instant via our partner API.',
      },
    ],
  },
  {
    category: 'Investing',
    icon: 'trending-up-outline',
    items: [
      {
        q: 'What is the minimum investment amount?',
        a: 'The minimum bid is GH₵ 200. Some pitches may set a higher minimum at the business owner\'s discretion.',
      },
      {
        q: 'How are returns calculated?',
        a: 'Returns are agreed at the time of the bid — either a fixed return percentage or revenue-share. The exact amount appears in your deal room before you sign.',
      },
      {
        q: 'What fees does Nkɔso charge?',
        a: 'Nkɔso charges a 2% platform fee on the investment amount at the time a bid is placed. There are no hidden fees or withdrawal charges.',
      },
      {
        q: 'Can I cancel a bid after placing it?',
        a: 'You can cancel a pending bid before the business owner accepts it. Once accepted and the deal is signed, bids are irrevocable.',
      },
    ],
  },
  {
    category: 'Deals & repayments',
    icon: 'document-text-outline',
    items: [
      {
        q: 'What happens in the deal room?',
        a: 'Once a bid is accepted, both parties enter a deal room to sign the digital agreement, complete MFI compliance checks, and release funds via MoMo.',
      },
      {
        q: 'How do I receive my returns?',
        a: 'All repayments are sent directly to your verified MTN MoMo number on the agreed schedule. You will receive a notification for each payment.',
      },
      {
        q: 'What if a business owner misses a repayment?',
        a: 'Nkɔso\'s licensed MFI partner monitors repayments. Missed payments trigger a grace period and escalation process in line with Ghana\'s Borrowers and Lenders Act.',
      },
    ],
  },
  {
    category: 'Security & privacy',
    icon: 'shield-outline',
    items: [
      {
        q: 'Is my money safe?',
        a: 'Investments carry inherent risk. Nkɔso is not a bank and does not guarantee returns. Always invest only what you can afford to lose. We work with licensed MFIs to structure legally binding agreements.',
      },
      {
        q: 'How is my data protected?',
        a: 'All personal and financial data is encrypted in transit and at rest. We comply with Ghana\'s Data Protection Act, 2012. We never sell your data to third parties.',
      },
    ],
  },
];

function FAQItem({ item }: { item: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQ}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={styles.faqQText}>{item.q}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={Colors.textMuted}
        />
      </TouchableOpacity>
      {open && <Text style={styles.faqA}>{item.a}</Text>}
    </View>
  );
}

export default function HelpScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help center</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact CTA */}
        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => router.push('/profile/contact-support' as any)}
          activeOpacity={0.8}
        >
          <View style={styles.contactLeft}>
            <View style={styles.contactIcon}>
              <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.contactTitle}>Can't find an answer?</Text>
              <Text style={styles.contactSub}>Chat with our support team</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        {FAQS.map((cat) => (
          <View key={cat.category}>
            <View style={styles.catHeader}>
              <Ionicons name={cat.icon} size={16} color={Colors.primary} />
              <Text style={styles.catTitle}>{cat.category}</Text>
            </View>
            <View style={styles.card}>
              {cat.items.map((item, idx) => (
                <View key={item.q}>
                  <FAQItem item={item} />
                  {idx < cat.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.footer}>
          Nkɔso v1.0.0 · help@nkoso.com.gh
        </Text>
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
  contactCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  contactSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  catTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.4 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  faqItem: { paddingHorizontal: 16, paddingVertical: 14 },
  faqQ: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  faqQText: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary, lineHeight: 20 },
  faqA: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 10,
  },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: 16 },
  footer: { fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
});
