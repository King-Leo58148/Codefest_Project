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
import { Colors } from "@/constants/Colors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getCurrentUser, verifyGhanaCard, verifyMomo } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { VerificationAsset } from "@/types";

type Tab = "ghana-card" | "momo";

export default function VerificationScreen() {
  const { tab } = useLocalSearchParams<{ tab?: Tab }>();
  const [activeTab, setActiveTab] = useState<Tab>(tab === "momo" ? "momo" : "ghana-card");

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

  const verifyCard = async () => {
    const number = cardNumber.replace(/\s/g, "").toUpperCase();
    if (!number || number.length < 10)
      return Alert.alert("Invalid Ghana Card", "Enter a valid Ghana Card number.");
    if (!asset)
      return Alert.alert("Image required", "Choose a clear Ghana Card image before continuing.");
    setCardLoading(true);
    try {
      const verified = await verifyGhanaCard(number, asset);
      if (!verified)
        return Alert.alert(
          "Not verified",
          "We could not verify this Ghana Card. Check the details and image.",
        );
      await refreshUser();
      setCardNumber("");
      setAsset(null);
      Alert.alert("Verified ✓", "Your Ghana Card has been verified.");
    } catch (error) {
      Alert.alert(
        "Could not verify",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setCardLoading(false);
    }
  };

  const verifyNumber = async () => {
    const number = momoNumber.replace(/\D/g, "");
    if (number.length !== 10)
      return Alert.alert("Invalid MoMo number", "Enter a 10-digit MoMo number.");
    setMomoLoading(true);
    try {
      const verified = await verifyMomo(number);
      if (!verified)
        return Alert.alert("Not verified", "We could not verify this MoMo number.");
      await refreshUser();
      Alert.alert("Verified ✓", "Your MoMo number has been verified.");
    } catch (error) {
      Alert.alert(
        "Could not verify",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setMomoLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Identity verification</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Status banner */}
      <View style={styles.banner}>
        <Ionicons
          name={user?.ghanaCardVerified && user?.momoVerified ? "shield-checkmark" : "shield-outline"}
          size={22}
          color={Colors.primary}
        />
        <Text style={styles.bannerText}>
          {user?.ghanaCardVerified && user?.momoVerified
            ? "Your account is fully verified."
            : "Complete your Ghana Card and MoMo verification to unlock full platform access."}
        </Text>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "ghana-card" && styles.tabActive]}
          onPress={() => setActiveTab("ghana-card")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="card-outline"
            size={16}
            color={activeTab === "ghana-card" ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === "ghana-card" && styles.tabTextActive]}>
            Ghana Card
          </Text>
          {user?.ghanaCardVerified && (
            <Ionicons name="checkmark-circle" size={14} color={Colors.accent} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "momo" && styles.tabActive]}
          onPress={() => setActiveTab("momo")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="phone-portrait-outline"
            size={16}
            color={activeTab === "momo" ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === "momo" && styles.tabTextActive]}>
            MoMo
          </Text>
          {user?.momoVerified && (
            <Ionicons name="checkmark-circle" size={14} color={Colors.accent} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === "ghana-card" ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Ionicons name="card-outline" size={28} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Ghana Card Verification</Text>
                <Text style={styles.cardSubtitle}>
                  Upload a clear image of your national ID card
                </Text>
              </View>
              <Text style={[styles.badge, user?.ghanaCardVerified ? styles.done : styles.pending]}>
                {user?.ghanaCardVerified ? "Verified" : "Pending"}
              </Text>
            </View>

            {user?.ghanaCardVerified ? (
              <View style={styles.verifiedBox}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
                <Text style={styles.verifiedText}>
                  Your Ghana Card is verified. No further action is needed.
                </Text>
              </View>
            ) : (
              <>
                <Input
                  placeholder="GHA-XXXXXXXXX-X"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  autoCapitalize="characters"
                  leftIcon="card-outline"
                  label="Card Number"
                />
                <TouchableOpacity onPress={chooseImage} style={styles.upload}>
                  <Ionicons name="image-outline" size={20} color={Colors.primary} />
                  <Text style={styles.uploadText}>
                    {asset ? asset.fileName || "Ghana Card image selected ✓" : "Choose Ghana Card image"}
                  </Text>
                </TouchableOpacity>
                <Button
                  title="Verify Ghana Card"
                  onPress={verifyCard}
                  loading={cardLoading}
                />
              </>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: "#FFF7ED" }]}>
                <Ionicons name="phone-portrait-outline" size={28} color="#F97316" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>MoMo Verification</Text>
                <Text style={styles.cardSubtitle}>
                  Verify the MTN Mobile Money number you use for payments
                </Text>
              </View>
              <Text style={[styles.badge, user?.momoVerified ? styles.done : styles.pending]}>
                {user?.momoVerified ? "Verified" : "Pending"}
              </Text>
            </View>

            {user?.momoVerified ? (
              <View style={styles.verifiedBox}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
                <Text style={styles.verifiedText}>
                  Your MoMo number {user?.momoNumber ? `(${user.momoNumber})` : ""} is verified. You can update it below.
                </Text>
              </View>
            ) : null}

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
              <Text style={styles.infoText}>
                We verify your MoMo account is active. Repayments are collected automatically on agreed dates.
              </Text>
            </View>

            <Input
              label="MTN MoMo Number"
              placeholder="024 XXX XXXX"
              value={momoNumber}
              onChangeText={setMomoNumber}
              keyboardType="phone-pad"
              leftIcon="phone-portrait-outline"
            />
            <Button
              title={user?.momoVerified ? "Update MoMo Number" : "Verify MoMo Number"}
              onPress={verifyNumber}
              loading={momoLoading}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    height: 62,
    paddingHorizontal: 18,
    backgroundColor: Colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: 17, fontWeight: "700", color: Colors.textPrimary },
  banner: {
    backgroundColor: "#EFF6FF",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textPrimary,
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    gap: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  tabActive: {
    backgroundColor: "#EFF6FF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  card: {
    padding: 16,
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary },
  cardSubtitle: { marginTop: 2, fontSize: 12, color: Colors.textSecondary },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  done: { backgroundColor: "#DCFCE7", color: "#15803D" },
  pending: { backgroundColor: "#FFF7ED", color: "#C2410C" },
  verifiedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    padding: 12,
  },
  verifiedText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    padding: 12,
    gap: 8,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primary,
    lineHeight: 18,
  },
  upload: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  uploadText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
    flex: 1,
  },
});
