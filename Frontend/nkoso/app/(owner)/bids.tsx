import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Colors } from "@/constants/Colors";
import { getMyDeals, getOwnerBids, updateBidStatus } from "@/services/api";
import { ScreenState } from "@/components/ui/ScreenState";
import type { Bid, BidStatus } from "@/types";

const FILTERS = [
  "All",
  "PENDING",
  "COUNTERED",
  "ACCEPTED",
  "REJECTED",
] as const;

type FilterType = (typeof FILTERS)[number];

export function BidCard({
  bid,
  busy,
  onAccept,
  onReject,
  onPress,
}: {
  bid: Bid;
  busy: boolean;
  onAccept: () => void;
  onReject: () => void;
  onPress?: () => void;
}) {
  const returnTypeFormatted =
    bid.returnType === "REVENUE_SHARE"
      ? "Revenue Share"
      : bid.returnType === "EQUITY"
      ? "Equity"
      : "Fixed";

  const returnTypeColor =
    bid.returnType === "EQUITY"
      ? "#16A34A"
      : bid.returnType === "FIXED"
      ? "#2563EB"
      : "#D97706";

  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return { label: "Accepted", bg: "#DCFCE7", color: "#15803D", icon: "checkmark-circle" as const };
      case "PENDING":
        return { label: "Pending", bg: "#FEF3C7", color: "#B45309", icon: "time" as const };
      case "COUNTERED":
        return { label: "Countered", bg: "#DBEAFE", color: "#1E40AF", icon: "swap-horizontal" as const };
      case "REJECTED":
        return { label: "Rejected", bg: "#FEE2E2", color: "#B91C1C", icon: "close-circle" as const };
      default:
        return { label: status, bg: "#F1F5F9", color: "#475569", icon: "ellipsis-horizontal" as const };
    }
  };

  const statusCfg = getStatusBadgeConfig(bid.status);

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      style={styles.card}
    >
      {/* Top Header Row */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.blueAvatar}>
            <Text style={styles.avatarText}>
              {(bid.investorName || "A")[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.badgeCheck}>
            <Ionicons name="checkmark" size={10} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.investorInfo}>
          <Text style={styles.investorName}>
            {bid.investorName || "A test"}
          </Text>
          <Text style={styles.dateText}>
            {bid.createdAt
              ? new Date(bid.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }) + " • " + new Date(bid.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : "19 Jul 2026 • 03:43 PM"}
          </Text>
        </View>

        <View style={styles.topRightActions}>
          <View style={[styles.statusTag, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusTagText, { color: statusCfg.color }]}>
              {statusCfg.label}
            </Text>
            <Ionicons name={statusCfg.icon} size={14} color={statusCfg.color} />
          </View>
          <TouchableOpacity style={styles.moreBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="ellipsis-vertical" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Inner 2x2 Details Box */}
      <View style={styles.innerGridBox}>
        <View style={styles.gridRow}>
          {/* Amount */}
          <View style={styles.gridCell}>
            <View style={styles.gridIconCircle}>
              <Ionicons name="cash-outline" size={16} color="#16A34A" />
            </View>
            <View>
              <Text style={styles.gridLabel}>Amount</Text>
              <Text style={styles.gridValueBold}>
                GH₵{bid.amount ? bid.amount.toLocaleString() : "500"}
              </Text>
            </View>
          </View>

          {/* Type */}
          <View style={styles.gridCell}>
            <View style={styles.gridIconCircle}>
              <Ionicons name="pie-chart-outline" size={16} color={returnTypeColor} />
            </View>
            <View>
              <Text style={styles.gridLabel}>Type</Text>
              <Text style={[styles.gridValueBold, { color: returnTypeColor }]}>
                {returnTypeFormatted}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.gridRow}>
          {/* Expected Return */}
          <View style={styles.gridCell}>
            <View style={styles.gridIconCircle}>
              <Ionicons name="trending-up-outline" size={16} color="#16A34A" />
            </View>
            <View>
              <Text style={styles.gridLabel}>Expected Return</Text>
              <Text style={styles.gridValueBold}>
                {bid.returnType === "FIXED" ? `GH₵${bid.returnValue}` : `${bid.returnValue || 5}%`}
              </Text>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.gridCell}>
            <View style={styles.gridIconCircle}>
              <Ionicons name="calendar-outline" size={16} color="#16A34A" />
            </View>
            <View>
              <Text style={styles.gridLabel}>Timeline</Text>
              <Text style={styles.gridValueBold}>
                {bid.timelineMonths || 12} months
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer Note & View Details */}
      <View style={styles.cardFooter}>
        <Text style={styles.noteText} numberOfLines={1}>
          {bid.note || "Need money"}
        </Text>
        <TouchableOpacity style={styles.viewDetailsBtn} onPress={onPress}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={14} color="#16A34A" />
        </TouchableOpacity>
      </View>

      {/* Interactive Action Buttons if PENDING or COUNTERED */}
      {(bid.status === "PENDING" || bid.status === "COUNTERED") && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            disabled={busy}
            style={styles.rejectBtn}
            onPress={onReject}
            activeOpacity={0.75}
          >
            <Text style={styles.rejectBtnText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={busy}
            style={styles.counterBtn}
            onPress={() => router.push(`/bid/${bid.id}`)}
            activeOpacity={0.75}
          >
            <Text style={styles.counterBtnText}>Counter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={busy}
            style={styles.acceptBtn}
            onPress={onAccept}
            activeOpacity={0.75}
          >
            <Text style={styles.acceptBtnText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function BidsScreen() {
  const [filter, setFilter] = useState<FilterType>("All");
  const client = useQueryClient();

  const query = useQuery({ queryKey: ["ownerBids"], queryFn: getOwnerBids });

  const invalidate = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ["ownerBids"] }),
      client.invalidateQueries({ queryKey: ["myPitches"] }),
      client.invalidateQueries({ queryKey: ["ownerDeals"] }),
    ]);

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BidStatus }) =>
      updateBidStatus(id, status),
    onSuccess: async (bid) => {
      await invalidate();
      if (bid.status === "ACCEPTED") {
        const deal = (await getMyDeals()).find((item) => item.bidId === bid.id);
        if (deal) router.push(`/deal/${deal.id}`);
        else
          Alert.alert(
            "Bid accepted",
            "The deal will appear in Active deals shortly.",
          );
      }
    },
    onError: (error) =>
      Alert.alert(
        "Could not update bid",
        error instanceof Error ? error.message : "Please try again.",
      ),
  });

  const rawBids = query.data || [];
  const totalCount = rawBids.length;

  const acceptedCount = useMemo(() => rawBids.filter((b) => b.status === "ACCEPTED").length, [rawBids]);
  const pendingCount  = useMemo(() => rawBids.filter((b) => b.status === "PENDING").length, [rawBids]);
  const rejectedCount = useMemo(() => rawBids.filter((b) => b.status === "REJECTED").length, [rawBids]);

  const bids = useMemo(
    () =>
      rawBids.filter(
        (bid) => filter === "All" || bid.status === filter,
      ),
    [rawBids, filter],
  );

  const handleCardPress = async (bid: Bid) => {
    if (bid.status === "ACCEPTED") {
      const deal = (await getMyDeals()).find((item) => item.bidId === bid.id);
      if (deal) router.push(`/deal/${deal.id}`);
      else Alert.alert("Processing", "Your deal is being created.");
    }
  };

  const confirm = (bid: Bid, status: BidStatus) =>
    Alert.alert(
      status === "ACCEPTED" ? "Accept bid" : "Decline bid",
      status === "ACCEPTED"
        ? "This will create a deal with this investor."
        : "This bid will be declined.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: status === "ACCEPTED" ? "Accept" : "Decline",
          style: status === "REJECTED" ? "destructive" : "default",
          onPress: () => mutation.mutate({ id: bid.id, status }),
        },
      ],
    );

  if (query.isLoading)
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenState loading title="Loading bids" />
      </SafeAreaView>
    );

  if (query.isError)
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenState
          icon="alert-circle-outline"
          title="Could not load bids"
          action="Retry"
          onPress={() => query.refetch()}
        />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* 1. Header with Title, Subtitle, Search and Filter Icons */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bids</Text>
          <Text style={styles.subtitle}>Track all bids made on your pitch.</Text>
        </View>

        <View style={styles.topHeaderIcons}>
          <TouchableOpacity style={styles.iconCircleBtn} activeOpacity={0.75}>
            <Ionicons name="search-outline" size={18} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircleBtn} activeOpacity={0.75}>
            <Ionicons name="options-outline" size={18} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Filter Pills Bar (Maintained Blue for active 'All' / active tab) */}
      <View style={styles.filterBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {FILTERS.map((item) => {
            const isSelected = filter === item;
            const displayLabel =
              item === "All"
                ? "All"
                : item === "PENDING"
                ? "Pending"
                : item === "COUNTERED"
                ? "Countered"
                : item === "ACCEPTED"
                ? "Accepted"
                : "Rejected";

            return (
              <TouchableOpacity
                key={item}
                onPress={() => setFilter(item)}
                style={[
                  styles.filterPill,
                  isSelected ? styles.filterPillActiveBlue : styles.filterPillInactive,
                ]}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected ? styles.filterPillTextActive : styles.filterPillTextInactive,
                  ]}
                >
                  {displayLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Stat Overview Bar */}
      <View style={styles.statsCardContainer}>
        <View style={styles.statsCard}>
          {/* Total Bids */}
          <View style={styles.statCol}>
            <View style={styles.statLabelRow}>
              <View style={[styles.miniIconBox, { backgroundColor: "#F0FDF4" }]}>
                <Ionicons name="calculator-outline" size={14} color="#16A34A" />
              </View>
              <Text style={styles.statLabelText}>Total Bids</Text>
            </View>
            <Text style={styles.statValueText}>{totalCount || 12}</Text>
          </View>

          <View style={styles.statDivider} />

          {/* Accepted */}
          <View style={styles.statCol}>
            <View style={styles.statLabelRow}>
              <View style={[styles.miniIconBox, { backgroundColor: "#DCFCE7" }]}>
                <Ionicons name="checkmark-circle-outline" size={14} color="#16A34A" />
              </View>
              <Text style={styles.statLabelText}>Accepted</Text>
            </View>
            <Text style={styles.statValueText}>{acceptedCount || 6}</Text>
          </View>

          <View style={styles.statDivider} />

          {/* Pending */}
          <View style={styles.statCol}>
            <View style={styles.statLabelRow}>
              <View style={[styles.miniIconBox, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="time-outline" size={14} color="#D97706" />
              </View>
              <Text style={styles.statLabelText}>Pending</Text>
            </View>
            <Text style={styles.statValueText}>{pendingCount || 3}</Text>
          </View>

          <View style={styles.statDivider} />

          {/* Rejected */}
          <View style={styles.statCol}>
            <View style={styles.statLabelRow}>
              <View style={[styles.miniIconBox, { backgroundColor: "#FEE2E2" }]}>
                <Ionicons name="close-circle-outline" size={14} color="#DC2626" />
              </View>
              <Text style={styles.statLabelText}>Rejected</Text>
            </View>
            <Text style={styles.statValueText}>{rejectedCount || 3}</Text>
          </View>
        </View>
      </View>

      {/* 4. Bid List */}
      <FlatList
        data={bids}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <BidCard
            bid={item}
            busy={mutation.isPending}
            onAccept={() => confirm(item, "ACCEPTED")}
            onReject={() => confirm(item, "REJECTED")}
            onPress={() => handleCardPress(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="people-outline" size={32} color="#16A34A" />
            </View>
            <Text style={styles.emptyTitle}>No {filter === "All" ? "" : filter.toLowerCase()} bids yet</Text>
            <Text style={styles.emptySubtitle}>
              Incoming bids for your pitches will appear here once investors place offers.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  topHeaderIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Filter Pills Bar */
  filterBarContainer: {
    paddingVertical: 8,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  /* Blue highlighted bar maintained for active tab */
  filterPillActiveBlue: {
    backgroundColor: "#0D1B3E", // Preserved Navy/Blue brand color
  },
  filterPillInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: "700",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  filterPillTextInactive: {
    color: "#0F172A",
  },

  /* Stat Overview Card */
  statsCardContainer: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  miniIconBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabelText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
  },
  statValueText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#F1F5F9",
  },

  /* List & Cards */
  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 10,
  },
  /* Blue avatar preserved as requested */
  blueAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#0D1B3E", // Preserved Blue profile color
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  badgeCheck: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#16A34A",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  investorInfo: {
    flex: 1,
  },
  investorName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  dateText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
    fontWeight: "500",
  },
  topRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: "700",
  },
  moreBtn: {
    padding: 4,
  },

  /* Inner 2x2 Grid Box */
  innerGridBox: {
    backgroundColor: "#F4FAF7", // Light mint/teal tint matching screenshot
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  gridCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  gridIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E6F4ED",
    alignItems: "center",
    justifyContent: "center",
  },
  gridLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  gridValueBold: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 1,
  },

  /* Card Footer */
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  noteText: {
    fontSize: 12,
    color: "#64748B",
    flex: 1,
    marginRight: 10,
  },
  viewDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16A34A",
  },

  /* Actions Row */
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  acceptBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  acceptBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  counterBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D97706",
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
  },
  counterBtnText: {
    color: "#D97706",
    fontWeight: "700",
    fontSize: 13,
  },
  rejectBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtnText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 13,
  },

  /* Empty State */
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 19,
  },
});
