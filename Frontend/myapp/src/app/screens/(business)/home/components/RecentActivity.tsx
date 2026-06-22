import { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Handshake,
  MessageCircle,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
  Eye,
  Star,
  AlertCircle,
  User,
  Briefcase,
  Building2,
  Gift,
  Sparkles,
  ChevronRight,
} from "lucide-react-native";

// Types
export type ActivityType =
  | "bid_received"
  | "bid_accepted"
  | "bid_countered"
  | "deal_closed"
  | "payment_received"
  | "payment_due"
  | "document_signed"
  | "message_received"
  | "pitch_viewed"
  | "pitch_approved"
  | "investor_followed"
  | "milestone_reached"
  | "verification_completed"
  | "system_notification";

export type ActivityPriority = "high" | "medium" | "low";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  priority: ActivityPriority;
  read: boolean;
  actionable: boolean;
  icon?: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  color?: string;
  backgroundColor?: string;
  metadata?: {
    amount?: number;
    investorName?: string;
    pitchTitle?: string;
    dealId?: string;
    userId?: string;
    [key: string]: any;
  };
  onPress?: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

interface RecentActivityProps {
  activities: Activity[];
  maxItems?: number;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
  onActivityPress?: (activity: Activity) => void;
  onMarkRead?: (id: string) => void;
  variant?: "default" | "compact" | "minimal";
  showFilters?: boolean;
  autoHideRead?: boolean;
  loading?: boolean;
}

// Activity type configurations
const ACTIVITY_CONFIGS: Record<ActivityType, { 
  icon: any; 
  color: string; 
  backgroundColor: string;
  priority: ActivityPriority;
  label: string;
}> = {
  bid_received: {
    icon: DollarSign,
    color: "#10B981",
    backgroundColor: "#D1FAE5",
    priority: "high",
    label: "New Bid",
  },
  bid_accepted: {
    icon: Handshake,
    color: "#4F46E5",
    backgroundColor: "#EEF2FF",
    priority: "high",
    label: "Bid Accepted",
  },
  bid_countered: {
    icon: TrendingUp,
    color: "#F59E0B",
    backgroundColor: "#FEF3C7",
    priority: "high",
    label: "Counter Offer",
  },
  deal_closed: {
    icon: CheckCircle,
    color: "#10B981",
    backgroundColor: "#D1FAE5",
    priority: "high",
    label: "Deal Closed",
  },
  payment_received: {
    icon: DollarSign,
    color: "#3B82F6",
    backgroundColor: "#DBEAFE",
    priority: "high",
    label: "Payment Received",
  },
  payment_due: {
    icon: Clock,
    color: "#EF4444",
    backgroundColor: "#FEE2E2",
    priority: "high",
    label: "Payment Due",
  },
  document_signed: {
    icon: FileText,
    color: "#8B5CF6",
    backgroundColor: "#EDE9FE",
    priority: "medium",
    label: "Document Signed",
  },
  message_received: {
    icon: MessageCircle,
    color: "#06B6D4",
    backgroundColor: "#CFFAFE",
    priority: "medium",
    label: "New Message",
  },
  pitch_viewed: {
    icon: Eye,
    color: "#EC4899",
    backgroundColor: "#FCE7F3",
    priority: "low",
    label: "Pitch Viewed",
  },
  pitch_approved: {
    icon: Star,
    color: "#F59E0B",
    backgroundColor: "#FEF3C7",
    priority: "medium",
    label: "Pitch Approved",
  },
  investor_followed: {
    icon: Users,
    color: "#10B981",
    backgroundColor: "#D1FAE5",
    priority: "low",
    label: "New Follower",
  },
  milestone_reached: {
    icon: Gift,
    color: "#F59E0B",
    backgroundColor: "#FEF3C7",
    priority: "medium",
    label: "Milestone Reached",
  },
  verification_completed: {
    icon: CheckCircle,
    color: "#10B981",
    backgroundColor: "#D1FAE5",
    priority: "high",
    label: "Verification Complete",
  },
  system_notification: {
    icon: Bell,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    priority: "low",
    label: "System Update",
  },
};

// Mock Data
const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "bid_received",
    title: "New bid from John Doe",
    description: "GHS 100,000 for Green Valley Farms expansion",
    timestamp: "2 minutes ago",
    priority: "high",
    read: false,
    actionable: true,
    metadata: {
      amount: 100000,
      investorName: "John Doe",
      pitchTitle: "Green Valley Farms Expansion",
    },
    onAction: () => {},
    actionLabel: "Review Bid",
  },
  {
    id: "2",
    type: "payment_received",
    title: "Payment received",
    description: "GHS 8,333.33 from ABC Company",
    timestamp: "1 hour ago",
    priority: "high",
    read: false,
    actionable: true,
    metadata: {
      amount: 8333.33,
    },
    onAction: () => {},
    actionLabel: "View Receipt",
  },
  {
    id: "3",
    type: "message_received",
    title: "New message from Sarah K.",
    description: "Interested in your pitch for TechHub",
    timestamp: "3 hours ago",
    priority: "medium",
    read: true,
    actionable: true,
    metadata: {
      userId: "user_123",
    },
    onAction: () => {},
    actionLabel: "Reply",
  },
  {
    id: "4",
    type: "pitch_viewed",
    title: "Pitch viewed by 12 investors",
    description: "Green Valley Farms had 12 new views this week",
    timestamp: "5 hours ago",
    priority: "low",
    read: true,
    actionable: false,
  },
  {
    id: "5",
    type: "deal_closed",
    title: "Deal closed with Michael T.",
    description: "GHS 250,000 investment for SmartAgri",
    timestamp: "1 day ago",
    priority: "high",
    read: true,
    actionable: true,
    metadata: {
      amount: 250000,
      investorName: "Michael T.",
      pitchTitle: "SmartAgri Solutions",
    },
    onAction: () => {},
    actionLabel: "View Deal",
  },
  {
    id: "6",
    type: "milestone_reached",
    title: "Funding milestone reached!",
    description: "Your pitch has reached 50% of funding goal",
    timestamp: "2 days ago",
    priority: "medium",
    read: true,
    actionable: false,
  },
];

export default function RecentActivity({
  activities = MOCK_ACTIVITIES,
  maxItems = 5,
  showSeeAll = true,
  onSeeAll,
  onActivityPress,
  onMarkRead,
  variant = "default",
  showFilters = false,
  autoHideRead = false,
  loading = false,
}: RecentActivityProps) {
  const [filter, setFilter] = useState<"all" | "unread" | "high" | "medium" | "low">("all");
  const [expanded, setExpanded] = useState(false);

  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    // Apply filter
    if (filter === "unread") {
      filtered = filtered.filter((a) => !a.read);
    } else if (filter !== "all") {
      filtered = filtered.filter((a) => a.priority === filter);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => {
      // Simple sort - in real app, use actual timestamps
      return a.timestamp.localeCompare(b.timestamp);
    });

    // Auto-hide read items
    if (autoHideRead) {
      filtered = filtered.filter((a) => !a.read);
    }

    // Limit items
    if (!expanded && maxItems) {
      filtered = filtered.slice(0, maxItems);
    }

    return filtered;
  }, [activities, filter, maxItems, autoHideRead, expanded]);

  const unreadCount = useMemo(() => {
    return activities.filter((a) => !a.read).length;
  }, [activities]);

  const highPriorityCount = useMemo(() => {
    return activities.filter((a) => a.priority === "high" && !a.read).length;
  }, [activities]);

  const getPriorityBadgeColor = (priority: ActivityPriority) => {
    switch (priority) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const getTimeAgo = (timestamp: string) => {
    // In a real app, use a proper time utility
    return timestamp;
  };

  const renderActivityItem = ({ item }: { item: Activity }) => {
    const config = ACTIVITY_CONFIGS[item.type];
    const Icon = item.icon || config.icon;
    const color = item.color || config.color;
    const bgColor = item.backgroundColor || config.backgroundColor;
    const isUnread = !item.read;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          if (onActivityPress) {
            onActivityPress(item);
          }
          if (onMarkRead && isUnread) {
            onMarkRead(item.id);
          }
        }}
        style={[
          styles.activityItem,
          isUnread && styles.activityItemUnread,
          variant === "compact" && styles.activityItemCompact,
          variant === "minimal" && styles.activityItemMinimal,
        ]}
      >
        {/* Priority Indicator */}
        <View
          style={[
            styles.priorityIndicator,
            { backgroundColor: getPriorityBadgeColor(item.priority) },
            isUnread && styles.priorityIndicatorActive,
          ]}
        />

        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Icon size={variant === "minimal" ? 16 : 20} color={color} strokeWidth={2} />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, isUnread && styles.titleUnread]}>
              {item.title}
            </Text>
            <Text style={styles.timestamp}>{getTimeAgo(item.timestamp)}</Text>
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Metadata Tags */}
          {item.metadata?.amount && (
            <View style={styles.metadataRow}>
              <DollarSign size={12} color="#6B7280" />
              <Text style={styles.metadataText}>
                {formatCurrency(item.metadata.amount)}
              </Text>
            </View>
          )}
          {item.metadata?.investorName && (
            <View style={styles.metadataRow}>
              <User size={12} color="#6B7280" />
              <Text style={styles.metadataText}>{item.metadata.investorName}</Text>
            </View>
          )}

          {/* Action Button */}
          {item.actionable && item.onAction && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={item.onAction}
              style={[styles.actionButton, { backgroundColor: `${color}15` }]}
            >
              <Text style={[styles.actionText, { color }]}>
                {item.actionLabel || "Take Action"}
              </Text>
              <ChevronRight size={14} color={color} />
            </TouchableOpacity>
          )}
        </View>

        {/* Unread Indicator */}
        {isUnread && <View style={[styles.unreadDot, { backgroundColor: color }]} />}
      </TouchableOpacity>
    );
  };

  // Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.skeletonHeader}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonCount} />
        </View>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.skeletonItem}>
            <View style={styles.skeletonIcon} />
            <View style={styles.skeletonContent}>
              <View style={styles.skeletonLine} />
              <View style={[styles.skeletonLine, { width: "60%" }]} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Recent Activity</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
          {highPriorityCount > 0 && (
            <View style={styles.highPriorityBadge}>
              <AlertCircle size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
        {showSeeAll && activities.length > maxItems && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              if (expanded) {
                setExpanded(false);
              } else if (onSeeAll) {
                onSeeAll();
              } else {
                setExpanded(true);
              }
            }}
            style={styles.seeAllButton}
          >
            <Text style={styles.seeAllText}>
              {expanded ? "Show Less" : "See All"}
            </Text>
            <ArrowRight size={14} color="#10B981" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      {showFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setFilter("all")}
            style={[styles.filterChip, filter === "all" && styles.filterChipActive]}
          >
            <Text
              style={[
                styles.filterText,
                filter === "all" && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setFilter("unread")}
            style={[styles.filterChip, filter === "unread" && styles.filterChipActive]}
          >
            <Text
              style={[
                styles.filterText,
                filter === "unread" && styles.filterTextActive,
              ]}
            >
              Unread
            </Text>
            {unreadCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setFilter("high")}
            style={[styles.filterChip, filter === "high" && styles.filterChipActive]}
          >
            <Text
              style={[
                styles.filterText,
                filter === "high" && styles.filterTextActive,
              ]}
            >
              High Priority
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setFilter("medium")}
            style={[styles.filterChip, filter === "medium" && styles.filterChipActive]}
          >
            <Text
              style={[
                styles.filterText,
                filter === "medium" && styles.filterTextActive,
              ]}
            >
              Medium
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setFilter("low")}
            style={[styles.filterChip, filter === "low" && styles.filterChipActive]}
          >
            <Text
              style={[
                styles.filterText,
                filter === "low" && styles.filterTextActive,
              ]}
            >
              Low
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Activity List */}
      {filteredActivities.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Bell size={32} color="#D1D5DB" />
          </View>
          <Text style={styles.emptyTitle}>No Activity</Text>
          <Text style={styles.emptyDescription}>
            {filter !== "all"
              ? "No activities match your current filter"
              : "You're all caught up! No new activities to show"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredActivities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Footer - Mark All Read */}
      {unreadCount > 0 && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            filteredActivities
              .filter((a) => !a.read)
              .forEach((a) => {
                if (onMarkRead) onMarkRead(a.id);
              });
          }}
          style={styles.markAllReadButton}
        >
          <CheckCircle size={14} color="#10B981" />
          <Text style={styles.markAllReadText}>Mark all as read</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Utility Functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
  },
  unreadBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  highPriorityBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 999,
    padding: 4,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "600",
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterContent: {
    gap: 8,
    paddingHorizontal: 2,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: "#D1FAE5",
  },
  filterText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#059669",
  },
  filterBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  filterBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  listContent: {
    gap: 8,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "transparent",
    position: "relative",
  },
  activityItemUnread: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E5E7EB",
  },
  activityItemCompact: {
    padding: 8,
  },
  activityItemMinimal: {
    padding: 6,
    gap: 8,
  },
  priorityIndicator: {
    width: 3,
    height: "100%",
    borderRadius: 2,
    opacity: 0.3,
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
  },
  priorityIndicatorActive: {
    opacity: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  titleUnread: {
    color: "#111827",
    fontWeight: "600",
  },
  timestamp: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "400",
    flexShrink: 0,
  },
  description: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  metadataText: {
    color: "#9CA3AF",
    fontSize: 11,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    flexShrink: 0,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyDescription: {
    color: "#6B7280",
    fontSize: 13,
    textAlign: "center",
  },
  markAllReadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  markAllReadText: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "500",
  },
  // Skeleton
  skeletonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  skeletonTitle: {
    width: 120,
    height: 20,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
  },
  skeletonCount: {
    width: 40,
    height: 20,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
  },
  skeletonItem: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 8,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    width: "100%",
  },
});