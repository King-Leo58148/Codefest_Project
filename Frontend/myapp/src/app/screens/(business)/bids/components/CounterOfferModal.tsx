import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import type { InvestorBid } from "../../types";
import { BUSINESS_COLORS } from "../../utils";

interface CounterOfferModalProps {
  visible: boolean;
  bid: InvestorBid;
  loading?: boolean;
  onSubmit: (amount: number, message?: string) => void;
  onCancel: () => void;
}

const CounterOfferModal = ({
  visible,
  bid,
  loading = false,
  onSubmit,
  onCancel,
}: CounterOfferModalProps) => {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    const parsed = Number(amount.replace(/[^0-9]/g, ""));
    if (!parsed || parsed <= 0) {
      return;
    }
    onSubmit(parsed, message || undefined);
    setAmount("");
    setMessage("");
  };

  const handleCancel = () => {
    setAmount("");
    setMessage("");
    onCancel();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.backdrop}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Make Counter Offer</Text>
          <Text style={styles.subtitle}>
            Propose a different amount to {bid.investorName} for &quot;{bid.pitchTitle}&quot;
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Original Bid</Text>
            <Text style={styles.value}>${bid.amount.toLocaleString()}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Pitch</Text>
            <Text style={styles.value}>{bid.pitchTitle}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Counter Amount ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Message (optional)</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Add context for your counter offer..."
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
              multiline
              returnKeyType="done"
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={loading}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Counter</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: BUSINESS_COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: BUSINESS_COLORS.muted,
    marginBottom: 18,
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  value: {
    fontSize: 14,
    color: BUSINESS_COLORS.text,
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
  inputGroup: {
    marginTop: 16,
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: BUSINESS_COLORS.text,
  },
  messageInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: BUSINESS_COLORS.primary,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default CounterOfferModal;
