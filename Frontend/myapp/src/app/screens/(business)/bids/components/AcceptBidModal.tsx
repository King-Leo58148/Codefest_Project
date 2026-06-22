import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import type { InvestorBid } from "../../types";
import { BUSINESS_COLORS } from "../../utils";

interface AcceptBidModalProps {
  visible: boolean;
  bid: InvestorBid;
  loading?: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

const AcceptBidModal = ({
  visible,
  bid,
  loading = false,
  onAccept,
  onCancel,
}: AcceptBidModalProps) => {
  if (!visible) {
    return null;
  }

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>Accept Bid</Text>
<Text style={styles.subtitle}>
            Accept {bid.investorName}'s bid of ${" "}
            <Text style={{ color: BUSINESS_COLORS.primaryDark }}>
              {bid.amount.toLocaleString()}
            </Text>
            {" "}for "{bid.pitchTitle}"?
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Investor</Text>
            <Text style={styles.value}>{bid.investorName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>${bid.amount.toLocaleString()}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Pitch</Text>
            <Text style={styles.value}>{bid.pitchTitle}</Text>
          </View>

          {bid.message ? (
            <View style={styles.messageBlock}>
              <Text style={styles.messageLabel}>Message</Text>
              <Text style={styles.messageText}>{bid.message}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.acceptButton, loading && styles.acceptButtonDisabled]}
              onPress={onAccept}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.acceptButtonText}>Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  messageBlock: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  messageLabel: {
    fontSize: 12,
    color: BUSINESS_COLORS.muted,
    fontWeight: "600",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
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
  acceptButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: BUSINESS_COLORS.primary,
  },
  acceptButtonDisabled: {
    opacity: 0.7,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default AcceptBidModal;
