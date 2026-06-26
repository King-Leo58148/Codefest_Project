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

const TAX_YEARS = [
  {
    year: '2025',
    totalInvested: 'GH₵ 24,500',
    totalReturns: 'GH₵ 3,180',
    deals: 4,
    status: 'ready',
  },
  {
    year: '2024',
    totalInvested: 'GH₵ 18,000',
    totalReturns: 'GH₵ 2,340',
    deals: 3,
    status: 'ready',
  },
  {
    year: '2023',
    totalInvested: 'GH₵ 9,200',
    totalReturns: 'GH₵ 920',
    deals: 2,
    status: 'ready',
  },
];

export default function TaxDocumentsScreen() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (year: string) => {
    setDownloading(year);
    await new Promise((r) => setTimeout(r, 1200));
    setDownloading(null);
    Alert.alert(
      'Download started',
      `Your ${year} investment summary PDF is being prepared.`,
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tax documents</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.infoText}>
            Annual investment summaries help you report capital gains and income from investments to
            the Ghana Revenue Authority (GRA). Download and retain these for your records.
          </Text>
        </View>

        {TAX_YEARS.map((doc, i) => (
          <View key={doc.year} style={styles.docCard}>
            <View style={styles.docHeader}>
              <View style={styles.docIconBox}>
                <Ionicons name="document-text-outline" size={22} color={Colors.primary} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle}>Investment Summary {doc.year}</Text>
                <View style={styles.docBadge}>
                  <Ionicons name="checkmark-circle" size={12} color={Colors.accent} />
                  <Text style={styles.docBadgeText}>Ready to download</Text>
                </View>
              </View>
            </View>

            <View style={styles.docStats}>
              <View style={styles.docStat}>
                <Text style={styles.docStatLabel}>Total invested</Text>
                <Text style={styles.docStatValue}>{doc.totalInvested}</Text>
              </View>
              <View style={styles.docStatDivider} />
              <View style={styles.docStat}>
                <Text style={styles.docStatLabel}>Returns received</Text>
                <Text style={[styles.docStatValue, { color: Colors.accent }]}>
                  {doc.totalReturns}
                </Text>
              </View>
              <View style={styles.docStatDivider} />
              <View style={styles.docStat}>
                <Text style={styles.docStatLabel}>Deals</Text>
                <Text style={styles.docStatValue}>{doc.deals}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.downloadBtn, downloading === doc.year && styles.downloadBtnLoading]}
              onPress={() => handleDownload(doc.year)}
              activeOpacity={0.8}
              disabled={downloading !== null}
            >
              <Ionicons
                name={downloading === doc.year ? 'hourglass-outline' : 'download-outline'}
                size={16}
                color={Colors.primary}
              />
              <Text style={styles.downloadBtnText}>
                {downloading === doc.year ? 'Preparing...' : 'Download PDF'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.gra}>
          <Ionicons name="alert-circle-outline" size={15} color={Colors.textMuted} />
          <Text style={styles.graText}>
            Capital gains from investments may be subject to taxation. Consult a tax professional
            or visit gra.gov.gh for guidance on investor obligations.
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.primary, lineHeight: 19 },
  docCard: {
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
  docHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: { flex: 1 },
  docTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  docBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  docBadgeText: { fontSize: 12, color: Colors.accent, fontWeight: '500' },
  docStats: {
    flexDirection: 'row',
    backgroundColor: Colors.borderLight,
    borderRadius: 12,
    padding: 12,
    gap: 0,
  },
  docStat: { flex: 1, alignItems: 'center' },
  docStatLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 3 },
  docStatValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  docStatDivider: { width: 1, backgroundColor: Colors.border },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  downloadBtnLoading: { opacity: 0.6 },
  downloadBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  gra: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  graText: { flex: 1, fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
});
