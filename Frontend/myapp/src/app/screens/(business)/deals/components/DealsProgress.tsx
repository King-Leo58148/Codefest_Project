import { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  CheckCircle,
  Clock,
  FileText,
  Handshake,
  AlertCircle,
  ChevronRight,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { BusinessDeal, DealStatus } from "../types";

// Colors (matching BusinessDealsScreen)
const BUSINESS_COLORS = {
  primary: "#10B981",
  primaryDark: "#059669",
  primaryLight: "#D1FAE5",
  text: "#111827",
  muted: "#6B7280",
  background: "#F9FAFB",
  border: "#E5E7EB",
  white: "#FFFFFF",
};

const DEAL_STATUS_COLORS: Record<DealStatus, string> = {
  active: "#10B981",
  pending_signature: "#F59E0B",
  completed: "#4F46E5",
};

const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  active: "Active",
  pending_signature: "Pending Signature",
  completed: "Completed",
};

// Progress Step Configuration
interface ProgressStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  completed: boolean;
  active: boolean;
}

interface DealProgressProps {
  deal: BusinessDeal;
  onViewDetails?: () => void;
  onTakeAction?: () => void;
}

export default function DealProgress({ deal, onViewDetails, onTakeAction }: DealProgressProps) {
  // Calculate progress steps based on deal status
  const progressSteps = useMemo((): ProgressStep[] => {
    const steps = [
      {
        id: "funding",
        label: "Funding Received",
        icon: DollarSign,
        completed: deal.status === "active" || deal.status === "completed",
        active: deal.status === "active" || deal.status === "completed",
      },
      {
        id: "documents",
        label: "Documents Signed",
        icon: FileText,
        completed: deal.status === "active" || deal.status === "completed",
        active: deal.status === "active" || deal.status === "completed",
      },
      {
        id: "repayment",
        label: "Repayment Started",
        icon: Calendar,
        completed: deal.status === "completed",
        active: deal.status === "active",
      },
      {
        id: "completed",
        label: "Deal Completed",
        icon: CheckCircle,
        completed: deal.status === "completed",
        active: deal.status === "completed",
      },
    ];

    // Filter steps based on deal status
    if (deal.status === "pending_signature") {
      return steps.slice(0, 2).map((step, index) => ({
        ...step,
        completed: index === 0,
        active: index === 1,
      }));
    }

    if (deal.status === "active") {
      return steps.slice(0, 3).map((step, index) => ({
        ...step,
        completed: index < 2,
        active: index === 2,
      }));
    }

    if (deal.status === "completed") {
      return steps.map((step) => ({
        ...step,
        completed: true,
        active: false,
      }));
    }

    return steps;
  }, [deal.status]);

  const progressPercentage = useMemo(() => {
    const completedSteps = progressSteps.filter((step) => step.completed).length;
    return (completedSteps / progressSteps.length) * 100;
  }, [progressSteps]);

  const getStatusColor = () => {
    if (deal.status === "completed") return "#4F46E5";
    if (deal.status === "active") return "#10B981";
    return "#F59E0B";
  };

  const getStatusIcon = () => {
    if (deal.status === "completed") return CheckCircle;
    if (deal.status === "active") return TrendingUp;
    return Clock;
  };

  const StatusIcon = getStatusIcon();
  const statusColor = getStatusColor();

  const repaymentProgress = useMemo(() => {
    if (deal.repaymentSchedule) {
      const total = deal.repaymentSchedule.length;
      const paid = deal.repaymentSchedule.filter((p) => p.status === "paid").length;
      return {
        total,
        paid,
        percentage: (paid / total) * 100,
      };
    }
    return null;
  }, [deal.repaymentSchedule]);

  return (
    <View style={styles.container}>
      {/* Header with Deal Info */}
      <View style={styles.header}>
        <View style={styles.dealInfo}>
          <Text style={styles.dealTitle}>{deal.pitchTitle}</Text>
          <View style={styles.investorRow}>
            <Users size={14} color={BUSINESS_COLORS.muted} />
            <Text style={styles.investorName}>{deal.investorName}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
          <StatusIcon size={12} color={statusColor} strokeWidth={2.5} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {DEAL_STATUS_LABELS[deal.status]}
          </Text>
        </View>
      </View>

      {/* Amount and Timeline */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <DollarSign size={14} color={BUSINESS_COLORS.muted} strokeWidth={2} />
          <Text style={styles.metaValue}>{formatCurrency(deal.amount)}</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Calendar size={14} color={BUSINESS_COLORS.muted} strokeWidth={2} />
          <Text style={styles.metaValue}>{formatDate(deal.startDate)}</Text>
        </View>
        {deal.expectedCloseDate && (
          <>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Clock size={14} color={BUSINESS_COLORS.muted} strokeWidth={2} />
              <Text style={styles.metaValue}>{formatDate(deal.expectedCloseDate)}</Text>
            </View>
          </>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Deal Progress</Text>
          <Text style={styles.progressPercentage}>
            {Math.round(progressPercentage)}%
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: statusColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Progress Steps */}
      <View style={styles.stepsContainer}>
        {progressSteps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === progressSteps.length - 1;
          const isCompleted = step.completed;
          const isActive = step.active;

          return (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepLeft}>
                <View
                  style={[
                    styles.stepIconContainer,
                    isCompleted && styles.stepIconCompleted,
                    isActive && styles.stepIconActive,
                    !isCompleted && !isActive && styles.stepIconPending,
                  ]}
                >
                  <Icon
                    size={16}
                    color={
                      isCompleted
                        ? "#FFFFFF"
                        : isActive
                        ? BUSINESS_COLORS.primary
                        : BUSINESS_COLORS.muted
                    }
                    strokeWidth={2.5}
                  />
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.stepLine,
                      isCompleted && styles.stepLineCompleted,
                      isActive && styles.stepLineActive,
                    ]}
                  />
                )}
              </View>
              <View style={styles.stepRight}>
                <Text
                  style={[
                    styles.stepLabel,
                    isCompleted && styles.stepLabelCompleted,
                    isActive && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
                {isActive && (
                  <View style={styles.stepActionBadge}>
                    <ActivityIndicator size={12} color={BUSINESS_COLORS.primary} />
                    <Text style={styles.stepActionText}>In Progress</Text>
                  </View>
                )}
                {isCompleted && (
                  <View style={styles.stepCompletedBadge}>
                    <CheckCircle size={10} color="#10B981" />
                    <Text style={styles.stepCompletedText}>Done</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Repayment Progress (if active deal) */}
      {deal.status === "active" && repaymentProgress && (
        <View style={styles.repaymentSection}>
          <View style={styles.repaymentHeader}>
            <Text style={styles.repaymentTitle}>Repayment Progress</Text>
            <Text style={styles.repaymentCount}>
              {repaymentProgress.paid}/{repaymentProgress.total} payments
            </Text>
          </View>
          <View style={styles.repaymentBarTrack}>
            <View
              style={[
                styles.repaymentBarFill,
                {
                  width: `${repaymentProgress.percentage}%`,
                  backgroundColor: "#4F46E5",
                },
              ]}
            />
          </View>
          <Text style={styles.repaymentPercentage}>
            {Math.round(repaymentProgress.percentage)}% repaid
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onViewDetails}
          style={styles.viewDetailsButton}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
          <ChevronRight size={18} color={BUSINESS_COLORS.primary} />
        </TouchableOpacity>

        {deal.status === "pending_signature" && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onTakeAction}
            style={styles.actionButton}
          >
            <LinearGradient
              colors={["#4F46E5", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionGradient}
            >
              <FileText size={18} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.actionText}>Sign Documents</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {deal.status === "active" && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onTakeAction}
            style={styles.actionButton}
          >
            <LinearGradient
              colors={["#10B981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionGradient}
            >
              <DollarSign size={18} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.actionText}>Make Payment</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {deal.status === "completed" && (
          <View style={styles.completedBadge}>
            <CheckCircle size={16} color="#4F46E5" />
            <Text style={styles.completedText}>Deal Completed</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// Utility Functions (matching BusinessDealsScreen)
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-GH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BUSINESS_COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  dealInfo: {
    flex: 1,
    gap: 4,
  },
  dealTitle: {
    color: BUSINESS_COLORS.text,
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
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: BUSINESS_COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: BUSINESS_COLORS.border,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaValue: {
    color: BUSINESS_COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  metaDivider: {
    width: 1,
    height: 20,
    backgroundColor: BUSINESS_COLORS.border,
  },
  progressSection: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    color: BUSINESS_COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  progressPercentage: {
    color: BUSINESS_COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: BUSINESS_COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  stepsContainer: {
    gap: 4,
    paddingVertical: 4,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepLeft: {
    alignItems: "center",
    width: 28,
  },
  stepIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: BUSINESS_COLORS.border,
    backgroundColor: BUSINESS_COLORS.white,
  },
  stepIconCompleted: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  stepIconActive: {
    borderColor: BUSINESS_COLORS.primary,
    backgroundColor: BUSINESS_COLORS.primaryLight,
  },
  stepIconPending: {
    borderColor: BUSINESS_COLORS.border,
    backgroundColor: BUSINESS_COLORS.background,
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 16,
    backgroundColor: BUSINESS_COLORS.border,
    marginVertical: 2,
  },
  stepLineCompleted: {
    backgroundColor: "#10B981",
  },
  stepLineActive: {
    backgroundColor: BUSINESS_COLORS.primary,
  },
  stepRight: {
    flex: 1,
    paddingBottom: 8,
    gap: 2,
  },
  stepLabel: {
    color: BUSINESS_COLORS.muted,
    fontSize: 13,
    fontWeight: "500",
  },
  stepLabelCompleted: {
    color: "#10B981",
    fontWeight: "600",
  },
  stepLabelActive: {
    color: BUSINESS_COLORS.primary,
    fontWeight: "600",
  },
  stepActionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stepActionText: {
    color: BUSINESS_COLORS.primary,
    fontSize: 11,
    fontWeight: "500",
  },
  stepCompletedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stepCompletedText: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "500",
  },
  repaymentSection: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  repaymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  repaymentTitle: {
    color: BUSINESS_COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  repaymentCount: {
    color: BUSINESS_COLORS.muted,
    fontSize: 12,
    fontWeight: "500",
  },
  repaymentBarTrack: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  repaymentBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  repaymentPercentage: {
    color: BUSINESS_COLORS.muted,
    fontSize: 11,
    fontWeight: "500",
    textAlign: "right",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  viewDetailsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: BUSINESS_COLORS.border,
    borderRadius: 10,
    backgroundColor: BUSINESS_COLORS.white,
  },
  viewDetailsText: {
    color: BUSINESS_COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  completedBadge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    backgroundColor: "#EEF2FF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  completedText: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "600",
  },
});