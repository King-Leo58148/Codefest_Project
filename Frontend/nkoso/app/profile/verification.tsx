import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/store/themeStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getCurrentUser, verifyGhanaCard, verifyMomo } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { VerificationAsset } from "@/types";

type Tab = "ghana-card" | "momo";

export default function VerificationScreen() {
  const { tab } = useLocalSearchParams<{ tab?: Tab }>();
  const [activeTab, setActiveTab] = useState<Tab>(tab === "momo" ? "momo" : "ghana-card");
  const { isDark, colors } = useTheme();

  const { user, setUser } = useAuthStore();
  const [cardNumber, setCardNumber] = useState("");
  const [momoNumber, setMomoNumber] = useState(user?.momoNumber || "");
  const [asset, setAsset] = useState<VerificationAsset | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [momoLoading, setMomoLoading] = useState(false);

  const refreshUser = async () => {
    const current = await getCurrentUser();
    setUser(current);
    return current;
  };

  const chooseImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted)
      return Alert.alert(
        "Photo permission needed",
        "Allow photo access to upload your Ghana Card.",
      );
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled) {
      const picked = result.assets[0];
      setAsset({
        uri: picked.uri,
        fileName: picked.fileName ?? undefined,
        mimeType: picked.mimeType ?? undefined,
      });
    }
  };

  const submitCard = async () => {
    if (!cardNumber.trim()) return Alert.alert("Card number required", "Enter your Ghana Card number.");
    setCardLoading(true);
    try {
      await verifyGhanaCard(cardNumber.trim(), asset);
      await refreshUser();
      Alert.alert("Verification submitted", "Ghana Card submitted successfully.");
    } catch (err: any) {
      Alert.alert("Submission failed", err?.message || "Check your input.");
    } finally {
      setCardLoading(false);
    }
  };

  const submitMomo = async () => {
    if (!momoNumber.trim()) return Alert.alert("MoMo number required", "Enter a 10-digit number.");
    setMomoLoading(true);
    try {
      await verifyMomo(momoNumber.trim());
      await refreshUser();
      Alert.alert("MoMo verified", "Your Mobile Money account is verified.");
    } catch (err: any) {
      Alert.alert("Verification failed", err?.message || "Check your MoMo number.");
    } finally {
      setMomoLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.icon}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Identity & MoMo Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.surfaceSubtle }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "ghana-card" && { backgroundColor: isDark ? colors.accent : colors.primary }]}
          onPress={() => setActiveTab("ghana-card")}
        >
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === "ghana-card" && { color: "#FFFFFF", fontWeight: "800" }]}>
            Ghana Card
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "momo" && { backgroundColor: isDark ? colors.accent : colors.primary }]}
          onPress={() => setActiveTab("momo")}
        >
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === "momo" && { color: "#FFFFFF", fontWeight: "800" }]}>
            MoMo Account
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === "ghana-card" ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Ghana Card Verification</Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
              Verify your national identity card to unlock full deal-making access.
            </Text>

            <Input
              label="Ghana Card Number (GHA-XXXXXXXXX-X)"
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="e.g. GHA-123456789-0"
              leftIcon="card-outline"
            />

            <Text style={[styles.uploadLabel, { color: colors.textPrimary }]}>Upload Card Document / Photo</Text>
            <TouchableOpacity
              style={[styles.uploadBox, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
              onPress={chooseImage}
            >
              <Ionicons name={asset ? "checkmark-circle" : "cloud-upload-outline"} size={28} color={asset ? "#16A34A" : colors.textMuted} />
              <Text style={[styles.uploadText, { color: colors.textPrimary }]}>
                {asset ? "Photo Selected" : "Tap to upload image file"}
              </Text>
            </TouchableOpacity>

            <Button
              title="Submit Ghana Card for Verification"
              onPress={submitCard}
              loading={cardLoading}
              style={{ marginTop: 10 }}
            />
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Mobile Money Account</Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
              Verify your Mobile Money phone number for automated repayments and disbursements.
            </Text>

            <Input
              label="MoMo Phone Number"
              value={momoNumber}
              onChangeText={setMomoNumber}
              placeholder="024XXXXXXX"
              keyboardType="phone-pad"
              leftIcon="phone-portrait-outline"
            />

            <Button
              title="Verify MoMo Account"
              onPress={submitMomo}
              loading={momoLoading}
              style={{ marginTop: 10 }}
            />
          </View>
        )}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  icon: {
    width: 40,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  tabBar: {
    flexDirection: "row",
    padding: 4,
    margin: 16,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  sectionSub: {
    fontSize: 13,
    marginTop: -4,
    lineHeight: 18,
  },
  uploadLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  uploadBox: {
    height: 100,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
