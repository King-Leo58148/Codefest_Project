import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
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
import { useTheme } from "@/store/themeStore";
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
  const { isDark, colors } = useTheme();

  const returnTypeFormatted =
    bid.returnType === "REVENUE_SHARE"
      ? "Revenue Share"
      : bid.returnType === "EQUITY"
      ? "Equity"
      : "Fixed";

  const returnTypeColor =
    bid.returnType === "EQUITY"
      ? (isDark ? "#34D399" : "#16A34A")
      : bid.returnType === "FIXED"
      ? (isDark ? "#60A5FA" : "#2563EB")
      : (isDark ? "#FBBF24" : "#D97706");

  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return { label: "Accepted", bg: isDark ? "#052E16" : "#DCFCE7", color: isDark ? "#4ADE80" : "#15803D", icon: "checkmark-circle" as const };
      case "COUNTERED":
        return { label: "Countered", bg: isDark ? "#172554" : "#DBEAFE", color: isDark ? "#60A5FA" : "#1D4ED8", icon: "swap-horizontal" as const };
      case "REJECTED":
        return { label: "Rejected", bg: isDark ? "#450A0A" : "#FEE2E2", color: isDark ? "#F87171" : "#DC2626", icon: "close-circle" as const };
      default:
        return { label: "Pending Response", bg: isDark ? "#451A03" : "#FEF3C7", color: isDark ? "#FBBF24" : "#B45309", icon: "time" as const };
    }
  };

  const statusCfg = getStatusBadgeConfig(bid.status);
  const initials = (bid.investorName || "I")[0].toUpperCase();

  return (
    <TouchableOpacity
      style={[styles.bidCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.cardHeader}>
        <View style={styles.investorAvatarGroup}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.investorName, { color: colors.textPrimary }]} numberOfLines={1}>
              {bid.investorName || "Angel Investor"}
            </Text>
            <Text style={[styles.pitchTitle, { color: colors.textSecondary }]} numberOfLines={1}>
              Pitch: {bid.pitchTitle || "Business Pitch"}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Ionicons name={statusCfg.icon} size={12} color={statusCfg.color} />
          <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>
      </View>

      <View style={[styles.amountBox, { backgroundColor: colors.surfaceSubtle }]}>
        <View style={styles.amountCol}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>PROPOSED AMOUNT</Text>
          <Text style={[styles.amountVal, { color: colors.textPrimary }]}>GH₵{bid.amount.toLocaleString()}</Text>
        </View>
        <View style={[styles.amountDivider, { backgroundColor: colors.border }]} />
        <View style={styles.amountCol}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>RETURN TERMS</Text>
          <Text style={[styles.amountValReturn, { color: returnTypeColor }]}>
            {bid.returnValue}% {returnTypeFormatted}
          </Text>
        </View>
      </View>

      {bid.note ? (
        <Text style={[styles.noteText, { color: colors.textSecondary }]} numberOfLines={2}>
          "{bid.note}"
        </Text>
      ) : null}

      <View style={styles.cardFooter}>
        <Text style={[styles.dateText, { color: colors.textMuted }]}>
          Submitted {bid.createdAt ? new Date(bid.createdAt).toLocaleDateString() : "Recently"}
        </Text>

        {bid.status === "PENDING" && (
          <View style={styles.actionBtnRow}>
            <TouchableOpacity
              style={[styles.btnAction, styles.btnReject]}
              onPress={onReject}
              disabled={busy}
            >
              <Text style={styles.btnRejectText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnAction, styles.btnAccept]}
              onPress={onAccept}
              disabled={busy}
            >
              <Text style={styles.btnAcceptText}>Accept Offer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function OwnerBidsScreen() {
  const { isDark, colors } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");
  const queryClient = useQueryClient();

  const {
    data: bids = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["ownerBids"],
    queryFn: getOwnerBids,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BidStatus }) =>
      updateBidStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ownerBids"] });
      queryClient.invalidateQueries({ queryKey: ["myDeals"] });
      queryClient.invalidateQueries({ queryKey: ["myPitches"] });
    },
    onError: (err: any) => {
      Alert.alert("Update Error", err?.message || "Could not update bid status.");
    },
  });

  const filteredBids = useMemo(() => {
    if (selectedFilter === "All") return bids;
    return bids.filter((b) => b.status === selectedFilter);
  }, [bids, selectedFilter]);

  const pendingCount = useMemo(() => bids.filter((b) => b.status === "PENDING").length, [bids]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
        <ScreenState loading title="Loading Bids..." />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
        <ScreenState
          icon="alert-circle-outline"
          title="Could not load bids"
          detail={(error as Error)?.message || "Check connection"}
          action="Try Again"
          onPress={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header Nav */}
      <View style={[styles.headerNav, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Investor Offers & Bids</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Review capital proposals from accredited investors</Text>
        </View>
        <TouchableOpacity style={styles.refreshIconBtn} onPress={() => refetch()}>
          <Ionicons name="refresh" size={18} color="#16A34A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={isDark ? "#38BDF8" : "#0D1B3E"} />
        }
      >
        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map((f) => {
            const active = selectedFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterPill,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                  active && { backgroundColor: isDark ? colors.accent : colors.primary, borderColor: isDark ? colors.accent : colors.primary },
                ]}
                onPress={() => setSelectedFilter(f)}
              >
                <Text style={[styles.filterPillText, { color: colors.textSecondary }, active && { color: "#FFFFFF", fontWeight: "800" }]}>
                  {f === "All" ? "All Bids" : f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {filteredBids.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="people-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Bids Found</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              {selectedFilter === "All"
                ? "When investors place bids on your live pitches, they will appear here."
                : `No investor bids currently marked as ${selectedFilter}.`}
            </Text>
          </View>
        ) : (
          <View style={styles.bidsStack}>
            {filteredBids.map((b) => (
              <BidCard
                key={b.id}
                bid={b}
                busy={statusMutation.isPending}
                onAccept={() => statusMutation.mutate({ id: b.id, status: "ACCEPTED" })}
                onReject={() => statusMutation.mutate({ id: b.id, status: "REJECTED" })}
                onPress={() => router.push(`/bid/${b.id}`)}
              />
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  headerNav: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },
  refreshIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  filterScroll: {
    gap: 8,
    paddingVertical: 6,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bidsStack: {
    gap: 14,
  },
  bidCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  investorAvatarGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0D1B3E",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  investorName: {
    fontSize: 15,
    fontWeight: "800",
  },
  pitchTitle: {
    fontSize: 11,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },
  amountBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 14,
    padding: 12,
  },
  amountCol: {
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 9,
    fontWeight: "800",
  },
  amountVal: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 2,
  },
  amountValReturn: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
  },
  amountDivider: {
    width: 1,
    height: 24,
  },
  noteText: {
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
  },
  actionBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btnAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  btnReject: {
    backgroundColor: "#FEE2E2",
  },
  btnRejectText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "800",
  },
  btnAccept: {
    backgroundColor: "#16A34A",
  },
  btnAcceptText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  emptyContainer: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    gap: 6,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  emptySub: {
    fontSize: 12,
    textAlign: "center",
  },
});
