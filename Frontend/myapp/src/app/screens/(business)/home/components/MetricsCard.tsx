import { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Clock,
  BarChart3,
  PieChart,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Eye,
  Handshake,
  Building2,
  Calendar,
  Award,
  Gift,
} from "lucide-react-native";

// Types
export type MetricTrend = "up" | "down" | "neutral";

export interface MetricData {
  id: string;
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  trend?: MetricTrend;
  trendValue?: string;
  percentageChange?: number;
  color: string;
  backgroundColor: string;
  gradient?: readonly [string, string];
  isLoading?: boolean;
  onPress?: () => void;
  badge?: string;
  target?: number;
  progress?: number;
}

interface MetricsCardProps {
  metric: MetricData;
  size?: "small" | "medium" | "large" | "full";
  variant?: "default" | "gradient" | "outlined";
  compact?: boolean;
  showTrend?: boolean;
  showProgress?: boolean;
  animated?: boolean;
}

const { width: screenWidth } = Dimensions.get("window");

// Predefined metric configurations for common use cases
export const METRIC_CONFIGS = {
  totalPitches: {
    id: "total_pitches",
    label: "Total Pitches",
    icon: Briefcase,
    color: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  activePitches: {
    id: "active_pitches",
    label: "Active Pitches",
    icon: Target,
    color: "#10B981",
    backgroundColor: "#D1FAE5",
  },
  totalBids: {
    id: "total_bids",
    label: "Total Bids",
    icon: Handshake,
    color: "#F59E0B",
    backgroundColor: "#FEF3C7",
  },
  totalFunding: {
    id: "total_funding",
    label: "Total Funding",
    icon: DollarSign,
    color: "#3B82F6",
    backgroundColor: "#DBEAFE",
  },
  activeDeals: {
    id: "active_deals",
    label: "Active Deals",
    icon: Building2,
    color: "#8B5CF6",
    backgroundColor: "#EDE9FE",
  },
  views: {
    id: "views",
    label: "Total Views",
    icon: Eye,
    color: "#EC4899",
    backgroundColor: "#FCE7F3",
  },
  conversionRate: {
    id: "conversion_rate",
    label: "Conversion Rate",
    icon: BarChart3,
    color: "#06B6D4",
    backgroundColor: "#CFFAFE",
  },
  avgBidAmount: {
    id: "avg_bid_amount",
    label: "Avg. Bid Amount",
    icon: PieChart,
    color: "#F472B6",
    backgroundColor: "#FCE7F3",
  },
  daysActive: {
    id: "days_active",
    label: "Days Active",
    icon: Calendar,
    color: "#F59E0B",
    backgroundColor: "#FEF3C7",
  },
  investorCount: {
    id: "investor_count",
    label: "Total Investors",
    icon: Users,
    color: "#10B981",
    backgroundColor: "#D1FAE5",
  },
} as const;

// Trend configurations
const TREND_CONFIGS: Record<MetricTrend, { icon: any; color: string; label: string }> = {
  up: {
    icon: ArrowUpRight,
    color: "#10B981",
    label: "Up",
  },
  down: {
    icon: ArrowDownRight,
    color: "#EF4444",
    label: "Down",
  },
  neutral: {
    icon: Minus,
    color: "#6B7280",
    label: "Stable",
  },
};

export default function MetricsCard({
  metric,
  size = "medium",
  variant = "default",
  compact = false,
  showTrend = true,
  showProgress = false,
  animated = true,
}: MetricsCardProps) {
  const Icon = metric.icon;
  const TrendIcon = metric.trend ? TREND_CONFIGS[metric.trend].icon : null;
  const trendColor = metric.trend ? TREND_CONFIGS[metric.trend].color : undefined;

  // Size configurations
  const sizeStyles = useMemo(() => {
    switch (size) {
      case "small":
        return {
          container: styles.smallContainer,
          iconSize: 20,
          valueSize: styles.smallValue,
          labelSize: styles.smallLabel,
          padding: 12,
        };
      case "large":
        return {
          container: styles.largeContainer,
          iconSize: 32,
          valueSize: styles.largeValue,
          labelSize: styles.largeLabel,
          padding: 20,
        };
      case "full":
        return {
          container: styles.fullContainer,
          iconSize: 36,
          valueSize: styles.fullValue,
          labelSize: styles.fullLabel,
          padding: 24,
        };
      default: // medium
        return {
          container: styles.mediumContainer,
          iconSize: 24,
          valueSize: styles.mediumValue,
          labelSize: styles.mediumLabel,
          padding: 16,
        };
    }
  }, [size]);

  // Variant styles
  const variantStyles = useMemo(() => {
    switch (variant) {
      case "gradient":
        return {
          container: styles.gradientContainer,
          background: metric.gradient || ["#4F46E5", "#7C3AED"],
        };
      case "outlined":
        return {
          container: styles.outlinedContainer,
          background: "transparent",
        };
      default:
        return {
          container: styles.defaultContainer,
          background: metric.backgroundColor || "#F9FAFB",
        };
    }
  }, [variant, metric.backgroundColor, metric.gradient]);

  // Loading state
  if (metric.isLoading) {
    return (
      <View style={[styles.container, sizeStyles.container, variantStyles.container]}>
        <View style={styles.skeletonIcon} />
        <View style={styles.skeletonText} />
        <View style={styles.skeletonValue} />
      </View>
    );
  }

  // Content render
  const renderContent = () => {
    const isGradient = variant === "gradient";
    const textColor = isGradient ? "#FFFFFF" : "#111827";
    const mutedColor = isGradient ? "rgba(255,255,255,0.7)" : "#6B7280";

    return (
      <>
        {/* Header with Icon and Badge */}
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              isGradient && styles.iconContainerGradient,
              !isGradient && { backgroundColor: metric.backgroundColor },
            ]}
          >
            <Icon
              size={sizeStyles.iconSize}
              color={isGradient ? "#FFFFFF" : metric.color}
              strokeWidth={2}
            />
          </View>
          {metric.badge && (
            <View style={[styles.badge, { backgroundColor: metric.color }]}>
              <Text style={styles.badgeText}>{metric.badge}</Text>
            </View>
          )}
        </View>

        {/* Value and Label */}
        <View style={styles.content}>
          <Text style={[styles.value, sizeStyles.valueSize, { color: textColor }]}>
            {metric.value}
          </Text>
          {metric.subtitle && (
            <Text style={[styles.subtitle, { color: mutedColor }]}>
              {metric.subtitle}
            </Text>
          )}
          <Text style={[styles.label, sizeStyles.labelSize, { color: mutedColor }]}>
            {metric.label}
          </Text>
        </View>

        {/* Progress Bar */}
        {showProgress && metric.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(metric.progress, 100)}%`,
                    backgroundColor: metric.color,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: mutedColor }]}>
              {Math.round(metric.progress)}% of target
            </Text>
          </View>
        )}

        {/* Target Display */}
        {metric.target && (
          <View style={styles.targetContainer}>
            <Target size={14} color={mutedColor} />
            <Text style={[styles.targetText, { color: mutedColor }]}>
              Target: {typeof metric.target === 'number' ? formatCurrency(metric.target) : metric.target}
            </Text>
          </View>
        )}

        {/* Trend Indicator */}
        {showTrend && metric.trend && TrendIcon && (
          <View style={styles.trendContainer}>
            <View
              style={[
                styles.trendBadge,
                {
                  backgroundColor: `${trendColor}15`,
                  borderColor: `${trendColor}30`,
                },
              ]}
            >
              <TrendIcon size={14} color={trendColor} strokeWidth={2.5} />
              {metric.trendValue && (
                <Text style={[styles.trendValue, { color: trendColor }]}>
                  {metric.trendValue}
                </Text>
              )}
            </View>
            {metric.percentageChange && (
              <Text
                style={[
                  styles.percentageChange,
                  {
                    color: metric.trend === "up" ? "#10B981" : 
                           metric.trend === "down" ? "#EF4444" : "#6B7280",
                  },
                ]}
              >
                {metric.percentageChange > 0 ? "+" : ""}{metric.percentageChange}%
              </Text>
            )}
          </View>
        )}
      </>
    );
  };

  // Render based on variant
  if (variant === "gradient" && metric.gradient) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={metric.onPress}
        disabled={!metric.onPress}
        style={[styles.container, sizeStyles.container]}
      >
        <LinearGradient
          colors={metric.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientBackground, sizeStyles.container]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={metric.onPress}
      disabled={!metric.onPress}
      style={[
        styles.container,
        sizeStyles.container,
        variantStyles.container,
        variant === "outlined" && styles.outlinedBorder,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
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
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  // Size variants
  smallContainer: {
    padding: 12,
    minHeight: 80,
  },
  mediumContainer: {
    padding: 16,
    minHeight: 120,
  },
  largeContainer: {
    padding: 20,
    minHeight: 160,
  },
  fullContainer: {
    padding: 24,
    minHeight: 200,
    width: screenWidth - 40,
  },
  // Variant styles
  defaultContainer: {
    backgroundColor: "#FFFFFF",
  },
  gradientContainer: {
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  outlinedContainer: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  outlinedBorder: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  // Typography
  value: {
    fontWeight: "700",
    color: "#111827",
  },
  smallValue: {
    fontSize: 18,
  },
  mediumValue: {
    fontSize: 24,
  },
  largeValue: {
    fontSize: 32,
  },
  fullValue: {
    fontSize: 40,
  },
  label: {
    fontWeight: "500",
    color: "#6B7280",
  },
  smallLabel: {
    fontSize: 11,
  },
  mediumLabel: {
    fontSize: 13,
  },
  largeLabel: {
    fontSize: 14,
  },
  fullLabel: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerGradient: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  // Content
  content: {
    gap: 2,
  },
  // Progress
  progressContainer: {
    marginTop: 12,
    gap: 4,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: "#6B7280",
  },
  // Target
  targetContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  targetText: {
    fontSize: 12,
    color: "#6B7280",
  },
  // Trend
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  percentageChange: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Skeleton
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  skeletonText: {
    width: "60%",
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonValue: {
    width: "40%",
    height: 24,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
  },
});