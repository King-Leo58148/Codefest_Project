import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, DollarSign, Handshake, User } from "lucide-react-native";
import { MOCK_DEALS } from "./mockData";
import type { BusinessDeal, DealStatus } from "./types";
import {
  BUSINESS_COLORS,
  DEAL_STATUS_COLORS,
  DEAL_STATUS_LABELS,
  formatCurrency,
  formatDate,
} from "./utils";

type DealFilter = "all" | DealStatus;

const FILTERS: { id: DealFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "pending_signature", label: "Pending" },
  { id: "completed", label: "Completed" },
];

export default function BusinessDealsScreen() {
  const [filter, setFilter] = useState<DealFilter>("all");

  const filteredDeals = useMemo(() => {
    if (filter === "all") {
      return MOCK_DEALS;
    }

    return MOCK_DEALS.filter((deal) => deal.status === filter);
  }, [filter]);

  const summary = useMemo(() => {
    const activeDeals = MOCK_DEALS.filter((deal) => deal.status === "active");
    const completedDeals = MOCK_DEALS.filter((deal) => deal.status === "completed");
    const totalValue = MOCK_DEALS.reduce((sum, deal) => sum + deal.amount, 0);

    return {
      activeCount: activeDeals.length,
      completedCount: completedDeals.length,
      totalValue,
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Deals</Text>
        <Text style={styles.subtitle}>
          Manage funding agreements with your investors
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <SummaryCard
          icon={Handshake}
          label="Active"
          value={String(summary.activeCount)}
          color="#0EA5E9"
        />
        <SummaryCard
          icon={DollarSign}
          label="Total Value"
          value={formatCurrency(summary.totalValue)}
          color={BUSINESS_COLORS.primary}
        />
        <SummaryCard
          icon={Calendar}
          label="Completed"
          value={String(summary.completedCount)}
          color="#4F46E5"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((item) => {
          const isActive = filter === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => setFilter(item.id)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <Text
                style={[styles.filterText, isActive && styles.filterTextActive]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredDeals.length === 0 ? (
          <View style={styles.emptyPanel}>
            <Text style={styles.emptyTitle}>No deals yet</Text>
            <Text style={styles.emptyMessage}>
              Accept investor bids to create funding deals.
            </Text>
          </View>
        ) : (
          filteredDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: `${color}15` }]}>
        <Icon color={color} size={16} strokeWidth={2.2} />
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function DealCard({ deal }: { deal: BusinessDeal }) {
  return (
    <View style={styles.dealCard}>
      <View style={styles.dealHeader}>
        <View style={styles.dealTitleBlock}>
          <Text style={styles.dealPitch}>{deal.pitchTitle}</Text>
          <View style={styles.investorRow}>
            <User color={BUSINESS_COLORS.muted} size={14} strokeWidth={2.2} />
            <Text style={styles.investorName}>{deal.investorName}</Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${DEAL_STATUS_COLORS[deal.status]}15` },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: DEAL_STATUS_COLORS[deal.status] },
            ]}
          >
            {DEAL_STATUS_LABELS[deal.status]}
          </Text>
        </View>
      </View>

      <View style={styles.dealMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Amount</Text>
          <Text style={styles.metaValue}>{formatCurrency(deal.amount)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Started</Text>
          <Text style={styles.metaValue}>{formatDate(deal.startDate)}</Text>
        </View>
        {deal.expectedCloseDate ? (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Expected Close</Text>
            <Text style={styles.metaValue}>
              {formatDate(deal.expectedCloseDate)}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BUSINESS_COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 4,
  },
  title: {
    color: BUSINESS_COLORS.text,
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: BUSINESS_COLORS.muted,
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  summaryValue: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },
  summaryLabel: {
    color: BUSINESS_COLORS.muted,
    fontSize: 11,
    marginTop: 2,
    fontWeight: "600",
  },
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 16,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: "#ECFDF5",
    borderColor: BUSINESS_COLORS.primary,
  },
  filterText: {
    color: BUSINESS_COLORS.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  filterTextActive: {
    color: BUSINESS_COLORS.primaryDark,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 12,
  },
  dealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    gap: 14,
  },
  dealHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  dealTitleBlock: {
    flex: 1,
    gap: 6,
  },
  dealPitch: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  investorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  investorName: {
    color: BUSINESS_COLORS.muted,
    fontSize: 13,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  dealMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    minWidth: "30%",
    gap: 2,
  },
  metaLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "600",
  },
  metaValue: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyPanel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  emptyTitle: {
    color: BUSINESS_COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },
  emptyMessage: {
    color: BUSINESS_COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
