import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Check, X } from "lucide-react-native";
import type { InvestorBid } from "../../types";
import { BUSINESS_COLORS } from "../../utils";
import { BID_STATUS_COLORS, BID_STATUS_LABELS, formatCurrency, formatRelativeDate } from "../../utils";

interface BidItemProps {
  bid: InvestorBid;
  onAcceptPress: (bid: InvestorBid) => void;
  onDeclinePress: (bid: InvestorBid) => void;
}

const BidItem = ({ bid, onAcceptPress, onDeclinePress }: BidItemProps) => {
  return (
    <View style={styles.bidCard}>
      <View style={styles.bidHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{bid.investorName.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.bidInfo}>
          <Text style={styles.investorName}>{bid.investorName}</Text>
          <Text style={styles.pitchTitle}>{bid.pitchTitle}</Text>
          <Text style={styles.date}>{formatRelativeDate(bid.createdAt)}</Text>
        </View>

        <View style={styles.amountBlock}>
          <Text style={styles.amount}>{formatCurrency(bid.amount)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${BID_STATUS_COLORS[bid.status]}15` }]}>
            <Text style={[styles.statusText, { color: BID_STATUS_COLORS[bid.status] }]}>
              {BID_STATUS_LABELS[bid.status]}
            </Text>
          </View>
        </View>
      </View>

      {bid.message ? <Text style={styles.message}>{bid.message}</Text> : null}

      {bid.status === "pending" ? (
        <View style={styles.actions}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => onDeclinePress(bid)} style={styles.declineButton}>
            <X color="#EF4444" size={16} strokeWidth={2.5} />
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} onPress={() => onAcceptPress(bid)} style={styles.acceptButton}>
            <Check color="#FFFFFF" size={16} strokeWidth={2.5} />
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  bidCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    gap: 12,
  },
  bidHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: BUSINESS_COLORS.primaryDark,
    fontSize: 18,
    fontWeight: "800",
  },
  bidInfo: {
    flex: 1,
    gap: 2,
  },
  investorName: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  pitchTitle: {
    color: BUSINESS_COLORS.muted,
    fontSize: 13,
  },
  date: {
    color: "#9CA3AF",
    fontSize: 11,
    marginTop: 2,
  },
  amountBlock: {
    alignItems: "flex-end",
    gap: 6,
  },
  amount: {
    color: BUSINESS_COLORS.primaryDark,
    fontSize: 16,
    fontWeight: "800",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  message: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  declineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
    paddingVertical: 12,
  },
  declineText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "700",
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    backgroundColor: BUSINESS_COLORS.primary,
    paddingVertical: 12,
  },
  acceptText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default BidItem;
