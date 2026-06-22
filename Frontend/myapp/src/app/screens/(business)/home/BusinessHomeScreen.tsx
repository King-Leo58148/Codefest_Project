import { useMemo, useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Bell,
  ChevronRight,
  DollarSign,
  Handshake,
  Megaphone,
  Plus,
  TrendingUp,
  Users,
  Building2,
  Clock,
  AlertCircle,
  Sparkles,
  Award,
  BarChart3,
  Eye,
  Target,
  Calendar,
  ArrowUpRight,
} from "lucide-react-native";
import {
  MOCK_BIDS,
  MOCK_BUSINESS_NAME,
  MOCK_PITCHES,
  MOCK_STATS,
} from "./mockData";
import type { BusinessPitch, InvestorBid } from "./types";
import {
  BUSINESS_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatCurrency,
  formatRelativeDate,
} from "./utils";
import MetricsCard, { METRIC_CONFIGS } from "./components/MetricsCard";
import RecentActivity from "./components/RecentActivity";

// Types
interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  actionable: boolean;
  metadata?: any;
}

const MOCK_RECENT_BIDS = MOCK_BIDS.slice(0, 3);

export default function BusinessHomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [showAllPitches, setShowAllPitches] = useState(false);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const displayedPitches = useMemo(() => {
    return showAllPitches ? MOCK_PITCHES : MOCK_PITCHES.slice(0, 3);
  }, [showAllPitches]);

  // Mock activities for RecentActivity component
  const mockActivities: Activity[] = useMemo(() => {
    return MOCK_BIDS.slice(0, 5).map((bid, index) => ({
      id: bid.id,
      type: 'bid_received',
      title: `New bid from ${bid.investorName}`,
      description: `${formatCurrency(bid.amount)} for ${bid.pitchTitle}`,
      timestamp: formatRelativeDate(bid.createdAt),
      priority: index < 2 ? 'high' : 'medium',
      read: index > 2,
      actionable: true,
      metadata: {
        amount: bid.amount,
        investorName: bid.investorName,
        pitchTitle: bid.pitchTitle,
      },
    }));
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handlePostPitch = () => {
    router.push("/(business)/post-pitch");
  };

  const handleViewBids = () => {
    router.push("/(business)/bids");
  };

  const handleViewDeals = () => {
    router.push("/(business)/deals");
  };

  const handleViewAllPitches = () => {
    setShowAllPitches(!showAllPitches);
  };

  const handleViewNotifications = () => {
    router.push("/(shared)/notifications");
  };

  const handleViewAllActivities = () => {
    router.push("/(shared)/notifications");
  };

  const handleActivityPress = (activity: Activity) => {
    if (activity.type === 'bid_received') {
      router.push("/(business)/bids");
    }
  };

  const handleMarkRead = (id: string) => {
    console.log('Marking activity as read:', id);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        bounces={true}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={BUSINESS_COLORS.primary}
            colors={[BUSINESS_COLORS.primary]}
          />
        }
      >
        {/* Hero Section */}
        <LinearGradient
          colors={["#10B981", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={[styles.bubble, styles.bubbleLarge]} />
          <View style={[styles.bubble, styles.bubbleSmall]} />
          <View style={[styles.bubble, styles.bubbleMedium]} />

          <View style={styles.heroHeader}>
            <View style={styles.heroTextBlock}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.businessName}>{MOCK_BUSINESS_NAME}</Text>
              <View style={styles.verificationBadge}>
                <Sparkles size={12} color="#FFFFFF" />
                <Text style={styles.verificationText}>Verified Business</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleViewNotifications}
              style={styles.notificationButton}
              accessibilityLabel="Notifications"
            >
              <Bell color="#FFFFFF" size={20} strokeWidth={2.2} />
              {MOCK_STATS.newBids > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {MOCK_STATS.newBids > 9 ? "9+" : MOCK_STATS.newBids}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.heroSubtitle}>
            Track your pitches, review investor bids, and close funding deals.
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Stats Grid - Using MetricsCard */}
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <MetricsCard
                metric={{
                  ...METRIC_CONFIGS.activePitches,
                  value: MOCK_STATS.activePitches,
                  onPress: () => router.push("/(business)/pitches"),
                }}
                size="small"
                showTrend={false}
              />
              <MetricsCard
                metric={{
                  ...METRIC_CONFIGS.totalBids,
                  value: MOCK_STATS.newBids,
                  badge: `${MOCK_STATS.newBids} new`,
                  onPress: handleViewBids,
                }}
                size="small"
                showTrend={false}
              />
            </View>
            <View style={styles.statsRow}>
              <MetricsCard
                metric={{
                  ...METRIC_CONFIGS.totalFunding,
                  value: formatCurrency(MOCK_STATS.totalRaised),
                  onPress: handleViewDeals,
                }}
                size="small"
                showTrend={false}
              />
              <MetricsCard
                metric={{
                  ...METRIC_CONFIGS.activeDeals,
                  value: MOCK_STATS.activeDeals,
                  onPress: handleViewDeals,
                }}
                size="small"
                showTrend={false}
              />
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsRow}>
              <QuickAction
                icon={Plus}
                label="Post Pitch"
                colors={["#10B981", "#059669"]}
                onPress={handlePostPitch}
              />
              <QuickAction
                icon={TrendingUp}
                label="View Bids"
                colors={["#4F46E5", "#7C3AED"]}
                onPress={handleViewBids}
              />
              <QuickAction
                icon={Handshake}
                label="My Deals"
                colors={["#0EA5E9", "#0284C7"]}
                onPress={handleViewDeals}
              />
              <QuickAction
                icon={BarChart3}
                label="Analytics"
                colors={["#F59E0B", "#D97706"]}
                onPress={() => router.push("/(business)/analytics")}
              />
            </View>
          </View>

          {/* Recent Activity - Using RecentActivity Component */}
          <View style={styles.section}>
            <RecentActivity
              activities={mockActivities}
              maxItems={3}
              showSeeAll={true}
              onSeeAll={handleViewAllActivities}
              onActivityPress={handleActivityPress}
              onMarkRead={handleMarkRead}
              variant="default"
            />
          </View>

          {/* Active Pitches Section */}
          <View style={styles.section}>
            <SectionHeader
              title="Active Pitches"
              actionLabel={showAllPitches ? "Show less" : "See all"}
              onPress={handleViewAllPitches}
              count={MOCK_PITCHES.length}
            />

            {MOCK_PITCHES.length === 0 ? (
              <EmptyPanel
                icon={Megaphone}
                title="No active pitches yet"
                message="Post your first pitch to attract investors and start receiving bids."
                actionLabel="Post a Pitch"
                onPress={handlePostPitch}
              />
            ) : (
              <View style={styles.cardList}>
                {displayedPitches.map((pitch) => (
                  <PitchCard
                    key={pitch.id}
                    pitch={pitch}
                    onPress={() => router.push(`/(business)/pitches/${pitch.id}`)}
                  />
                ))}
                {MOCK_PITCHES.length > 3 && !showAllPitches && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleViewAllPitches}
                    style={styles.showMoreButton}
                  >
                    <Text style={styles.showMoreText}>
                      View all {MOCK_PITCHES.length} pitches
                    </Text>
                    <ChevronRight size={16} color={BUSINESS_COLORS.primary} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Recent Bids Section */}
          <View style={styles.section}>
            <SectionHeader
              title="Recent Bids"
              actionLabel="View all"
              onPress={handleViewBids}
              count={MOCK_RECENT_BIDS.length}
            />

            {MOCK_RECENT_BIDS.length === 0 ? (
              <EmptyPanel
                icon={Users}
                title="No bids received yet"
                message="Share your pitch to start getting offers from investors."
                actionLabel="View Bids"
                onPress={handleViewBids}
              />
            ) : (
              <View style={styles.cardList}>
                {MOCK_RECENT_BIDS.map((bid) => (
                  <BidCard
                    key={bid.id}
                    bid={bid}
                    onPress={() => router.push(`/(business)/bids/${bid.id}`)}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Performance Summary */}
          <View style={styles.section}>
            <View style={styles.performanceCard}>
              <View style={styles.performanceHeader}>
                <View style={styles.performanceTitleBlock}>
                  <Text style={styles.performanceTitle}>Performance Overview</Text>
                  <Text style={styles.performanceSubtitle}>
                    Last 30 days activity
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push("/(business)/analytics")}
                >
                  <Text style={styles.performanceAction}>View full report</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.performanceMetrics}>
                <View style={styles.performanceMetric}>
                  <Eye size={16} color={BUSINESS_COLORS.primary} />
                  <Text style={styles.performanceValue}>1,247</Text>
                  <Text style={styles.performanceLabel}>Views</Text>
                </View>
                <View style={styles.performanceDivider} />
                <View style={styles.performanceMetric}>
                  <Users size={16} color={BUSINESS_COLORS.primary} />
                  <Text style={styles.performanceValue}>89</Text>
                  <Text style={styles.performanceLabel}>Investors</Text>
                </View>
                <View style={styles.performanceDivider} />
                <View style={styles.performanceMetric}>
                  <TrendingUp size={16} color={BUSINESS_COLORS.primary} />
                  <Text style={styles.performanceValue}>18%</Text>
                  <Text style={styles.performanceLabel}>Conversion</Text>
                </View>
                <View style={styles.performanceDivider} />
                <View style={styles.performanceMetric}>
                  <Clock size={16} color={BUSINESS_COLORS.primary} />
                  <Text style={styles.performanceValue}>12</Text>
                  <Text style={styles.performanceLabel}>Days active</Text>
                </View>
              </View>

              <View style={styles.performanceFooter}>
                <View style={styles.performanceGrowth}>
                  <ArrowUpRight size={14} color="#10B981" />
                  <Text style={styles.performanceGrowthText}>
                    12% increase in views this week
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tips Section */}
          <View style={[styles.section, styles.lastSection]}>
            <View style={styles.tipsCard}>
              <LinearGradient
                colors={["#4F46E5", "#7C3AED"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tipsGradient}
              >
                <View style={styles.tipsContent}>
                  <View style={styles.tipsIconContainer}>
                    <Award size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.tipsTextContainer}>
                    <Text style={styles.tipsTitle}>Investor Tip</Text>
                    <Text style={styles.tipsDescription}>
                      Respond to bids within 24 hours to increase your chances of closing deals.
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.tipsButton}
                  >
                    <Text style={styles.tipsButtonText}>Learn More</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-components

function StatCard({
  icon: Icon,
  label,
  value,
  accentColor,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  label: string;
  value: string;
  accentColor: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: `${accentColor}15` }]}>
        <Icon color={accentColor} size={18} strokeWidth={2.2} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({
  icon: Icon,
  label,
  colors,
  onPress,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  label: string;
  colors: readonly [string, string];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.quickAction}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.quickActionGradient}
      >
        <Icon color="#FFFFFF" size={22} strokeWidth={2.2} />
      </LinearGradient>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onPress,
  count,
}: {
  title: string;
  actionLabel: string;
  onPress: () => void;
  count?: number;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleBlock}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {count !== undefined && (
          <View style={styles.sectionCount}>
            <Text style={styles.sectionCountText}>{count}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={styles.sectionAction}>
        <Text style={styles.sectionActionText}>{actionLabel}</Text>
        <ChevronRight color={BUSINESS_COLORS.primary} size={16} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

function PitchCard({ pitch, onPress }: { pitch: BusinessPitch; onPress: () => void }) {
  const progress = Math.min((pitch.raised / pitch.fundingGoal) * 100, 100);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.pitchCard}>
      <View style={styles.pitchHeader}>
        <View style={styles.pitchTitleBlock}>
          <Text style={styles.pitchTitle}>{pitch.title}</Text>
          <Text style={styles.pitchMeta}>
            {pitch.bidCount} bid{pitch.bidCount === 1 ? "" : "s"} received
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${STATUS_COLORS[pitch.status]}15` },
          ]}
        >
          <Text style={[styles.statusText, { color: STATUS_COLORS[pitch.status] }]}>
            {STATUS_LABELS[pitch.status]}
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%`, backgroundColor: STATUS_COLORS[pitch.status] },
          ]}
        />
      </View>

      <View style={styles.pitchFooter}>
        <Text style={styles.pitchAmount}>
          {formatCurrency(pitch.raised)} raised
        </Text>
        <Text style={styles.pitchGoal}>
          of {formatCurrency(pitch.fundingGoal)} goal
        </Text>
        <View style={styles.pitchProgressText}>
          <Text style={styles.pitchProgressPercent}>{Math.round(progress)}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function BidCard({ bid, onPress }: { bid: InvestorBid; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.bidCard}>
      <View style={styles.bidAvatar}>
        <Text style={styles.bidAvatarText}>
          {bid.investorName.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.bidContent}>
        <Text style={styles.bidInvestor}>{bid.investorName}</Text>
        <Text style={styles.bidPitch}>{bid.pitchTitle}</Text>
        <Text style={styles.bidDate}>{formatRelativeDate(bid.createdAt)}</Text>
      </View>

      <View style={styles.bidAmountBlock}>
        <Text style={styles.bidAmount}>{formatCurrency(bid.amount)}</Text>
        <ChevronRight color="#9CA3AF" size={16} strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  message,
  actionLabel,
  onPress,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  title: string;
  message: string;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.emptyPanel}>
      <Icon size={32} color={BUSINESS_COLORS.muted} strokeWidth={2} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.emptyButton}>
        <Text style={styles.emptyButtonText}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BUSINESS_COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  hero: {
    overflow: "hidden",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    minHeight: 180,
  },
  bubble: {
    position: "absolute",
    borderRadius: 999,
  },
  bubbleLarge: {
    width: 160,
    height: 160,
    right: -30,
    top: -40,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  bubbleMedium: {
    width: 120,
    height: 120,
    right: 60,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  bubbleSmall: {
    width: 96,
    height: 96,
    bottom: 12,
    left: -24,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  heroTextBlock: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 14,
    fontWeight: "600",
  },
  businessName: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  verificationText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#059669",
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: "rgba(255, 255, 255, 0.88)",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 16,
    maxWidth: 320,
  },
  content: {
    marginTop: -20,
    paddingHorizontal: 20,
    gap: 24,
  },
  statsGrid: {
    gap: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
  section: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    color: "#1E1B4B",
    fontSize: 18,
    fontWeight: "800",
  },
  sectionCount: {
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sectionCountText: {
    color: "#6B7280",
    fontSize: 10,
    fontWeight: "600",
  },
  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  sectionActionText: {
    color: BUSINESS_COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  quickActionLabel: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  cardList: {
    gap: 12,
  },
  pitchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  pitchHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  pitchTitleBlock: {
    flex: 1,
    gap: 4,
  },
  pitchTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  pitchMeta: {
    color: "#6B7280",
    fontSize: 12,
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
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  pitchFooter: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 10,
  },
  pitchAmount: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  pitchGoal: {
    color: "#6B7280",
    fontSize: 12,
  },
  pitchProgressText: {
    marginLeft: "auto",
  },
  pitchProgressPercent: {
    color: BUSINESS_COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  bidCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  bidAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  bidAvatarText: {
    color: "#059669",
    fontSize: 18,
    fontWeight: "800",
  },
  bidContent: {
    flex: 1,
    gap: 2,
  },
  bidInvestor: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
  bidPitch: {
    color: "#6B7280",
    fontSize: 12,
  },
  bidDate: {
    color: "#9CA3AF",
    fontSize: 11,
    marginTop: 2,
  },
  bidAmountBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  bidAmount: {
    color: "#059669",
    fontSize: 15,
    fontWeight: "800",
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  showMoreText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "500",
  },
  emptyPanel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyMessage: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: "#ECFDF5",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyButtonText: {
    color: "#059669",
    fontSize: 13,
    fontWeight: "700",
  },
  performanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  performanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  performanceTitleBlock: {
    gap: 2,
  },
  performanceTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  performanceSubtitle: {
    color: "#6B7280",
    fontSize: 12,
  },
  performanceAction: {
    color: BUSINESS_COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  performanceMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  performanceMetric: {
    alignItems: "center",
    gap: 4,
  },
  performanceValue: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
  },
  performanceLabel: {
    color: "#6B7280",
    fontSize: 10,
    fontWeight: "500",
  },
  performanceDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E5E7EB",
  },
  performanceFooter: {
    marginTop: 12,
  },
  performanceGrowth: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  performanceGrowthText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "500",
  },
  tipsCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  tipsGradient: {
    padding: 16,
  },
  tipsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tipsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  tipsTextContainer: {
    flex: 1,
    gap: 2,
  },
  tipsTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  tipsDescription: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    lineHeight: 16,
  },
  tipsButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tipsButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  lastSection: {
    marginBottom: 20,
  },
});