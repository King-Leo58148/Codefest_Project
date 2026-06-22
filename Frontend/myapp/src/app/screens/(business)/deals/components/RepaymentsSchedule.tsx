import { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  Filter,
  Info,
  Share2,
  TrendingUp,
  X,
  AlertCircle,
  ArrowLeft,
  Printer,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

// Types
export type PaymentStatus = "paid" | "pending" | "overdue" | "upcoming";

export interface Payment {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  principal: number;
  interest: number;
  status: PaymentStatus;
  paidDate?: string;
  transactionId?: string;
  lateFee?: number;
  notes?: string;
}

export interface RepaymentScheduleData {
  dealId: string;
  dealTitle: string;
  investorName: string;
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  nextPaymentDate: string;
  payments: Payment[];
}

interface RepaymentScheduleProps {
  schedule: RepaymentScheduleData;
  onMakePayment?: (paymentId: string) => void;
  onViewReceipt?: (paymentId: string) => void;
  onShare?: () => void;
  onDownload?: () => void;
}

// Mock Data
const MOCK_SCHEDULE: RepaymentScheduleData = {
  dealId: "deal_123",
  dealTitle: "Green Valley Farms Expansion",
  investorName: "John Doe",
  totalAmount: 100000,
  totalPaid: 25000,
  totalRemaining: 75000,
  interestRate: 12,
  startDate: "2024-01-15",
  endDate: "2027-01-15",
  nextPaymentDate: "2024-02-15",
  payments: [
    {
      id: "pay_001",
      number: 1,
      dueDate: "2024-02-15",
      amount: 8333.33,
      principal: 6666.67,
      interest: 1666.66,
      status: "paid",
      paidDate: "2024-02-14",
      transactionId: "txn_001",
    },
    {
      id: "pay_002",
      number: 2,
      dueDate: "2024-03-15",
      amount: 8333.33,
      principal: 6666.67,
      interest: 1666.66,
      status: "pending",
    },
    {
      id: "pay_003",
      number: 3,
      dueDate: "2024-04-15",
      amount: 8333.33,
      principal: 6666.67,
      interest: 1666.66,
      status: "upcoming",
    },
    {
      id: "pay_004",
      number: 4,
      dueDate: "2024-05-15",
      amount: 8333.33,
      principal: 6666.67,
      interest: 1666.66,
      status: "upcoming",
    },
    {
      id: "pay_005",
      number: 5,
      dueDate: "2024-06-15",
      amount: 8333.33,
      principal: 6666.67,
      interest: 1666.66,
      status: "overdue",
      lateFee: 250.00,
    },
  ],
};

const COLORS = {
  primary: "#10B981",
  primaryDark: "#059669",
  primaryLight: "#D1FAE5",
  text: "#111827",
  muted: "#6B7280",
  background: "#F9FAFB",
  border: "#E5E7EB",
  white: "#FFFFFF",
  danger: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
  info: "#3B82F6",
  purple: "#4F46E5",
};

const STATUS_CONFIG: Record<PaymentStatus, { color: string; bgColor: string; label: string; icon: any }> = {
  paid: {
    color: COLORS.success,
    bgColor: `${COLORS.success}15`,
    label: "Paid",
    icon: CheckCircle,
  },
  pending: {
    color: COLORS.warning,
    bgColor: `${COLORS.warning}15`,
    label: "Pending",
    icon: Clock,
  },
  overdue: {
    color: COLORS.danger,
    bgColor: `${COLORS.danger}15`,
    label: "Overdue",
    icon: AlertCircle,
  },
  upcoming: {
    color: COLORS.info,
    bgColor: `${COLORS.info}15`,
    label: "Upcoming",
    icon: Calendar,
  },
};

type FilterType = "all" | PaymentStatus;

export default function RepaymentSchedule({
  schedule = MOCK_SCHEDULE,
  onMakePayment,
  onViewReceipt,
  onShare,
  onDownload,
}: RepaymentScheduleProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredPayments = useMemo(() => {
    if (filter === "all") return schedule.payments;
    return schedule.payments.filter((p) => p.status === filter);
  }, [filter, schedule.payments]);

  const summary = useMemo(() => {
    const total = schedule.payments.length;
    const paid = schedule.payments.filter((p) => p.status === "paid").length;
    const pending = schedule.payments.filter((p) => p.status === "pending").length;
    const overdue = schedule.payments.filter((p) => p.status === "overdue").length;
    const upcoming = schedule.payments.filter((p) => p.status === "upcoming").length;

    return { total, paid, pending, overdue, upcoming };
  }, [schedule.payments]);

  const totalPaid = useMemo(() => {
    return schedule.payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [schedule.payments]);

  const totalPending = useMemo(() => {
    return schedule.payments
      .filter((p) => p.status === "pending" || p.status === "overdue")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [schedule.payments]);

  const handlePaymentPress = (payment: Payment) => {
    setSelectedPayment(payment);
    setModalVisible(true);
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => {
    const status = STATUS_CONFIG[item.status];
    const StatusIcon = status.icon;
    const isOverdue = item.status === "overdue";
    const isPaid = item.status === "paid";

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handlePaymentPress(item)}
        style={[
          styles.paymentItem,
          isOverdue && styles.paymentItemOverdue,
          isPaid && styles.paymentItemPaid,
        ]}
      >
        <View style={styles.paymentHeader}>
          <View style={styles.paymentLeft}>
            <View style={[styles.paymentNumber, { backgroundColor: status.bgColor }]}>
              <Text style={[styles.paymentNumberText, { color: status.color }]}>
                #{item.number}
              </Text>
            </View>
            <View>
              <Text style={styles.paymentDueDate}>
                Due: {formatDate(item.dueDate)}
              </Text>
              {item.paidDate && (
                <Text style={styles.paymentPaidDate}>
                  Paid: {formatDate(item.paidDate)}
                </Text>
              )}
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <StatusIcon size={12} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.paymentDetails}>
          <View style={styles.paymentAmount}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amountValue}>{formatCurrency(item.amount)}</Text>
          </View>
          <View style={styles.paymentBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Principal</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(item.principal)}</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Interest</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(item.interest)}</Text>
            </View>
            {item.lateFee && (
              <>
                <View style={styles.breakdownDivider} />
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownLabel, { color: COLORS.danger }]}>
                    Late Fee
                  </Text>
                  <Text style={[styles.breakdownValue, { color: COLORS.danger }]}>
                    {formatCurrency(item.lateFee)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.paymentActions}>
          {item.status === "pending" || item.status === "overdue" ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onMakePayment?.(item.id)}
              style={styles.payButton}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.payGradient}
              >
                <DollarSign size={16} color="#FFFFFF" />
                <Text style={styles.payButtonText}>Pay Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : item.status === "paid" ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onViewReceipt?.(item.id)}
              style={styles.receiptButton}
            >
              <Printer size={16} color={COLORS.primary} />
              <Text style={styles.receiptButtonText}>View Receipt</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handlePaymentPress(item)}
            style={styles.infoButton}
          >
            <Info size={16} color={COLORS.muted} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.backButton}
              onPress={() => {}} // navigation.goBack()
            >
              <ArrowLeft size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Repayment Schedule</Text>
            <View style={styles.headerRight} />
          </View>
          <Text style={styles.headerSubtitle}>
            {schedule.dealTitle} · {schedule.investorName}
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: `${COLORS.success}10` }]}>
            <DollarSign size={20} color={COLORS.success} />
            <Text style={styles.summaryValue}>{formatCurrency(totalPaid)}</Text>
            <Text style={styles.summaryLabel}>Total Paid</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: `${COLORS.warning}10` }]}>
            <Clock size={20} color={COLORS.warning} />
            <Text style={styles.summaryValue}>{formatCurrency(totalPending)}</Text>
            <Text style={styles.summaryLabel}>Total Pending</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: `${COLORS.purple}10` }]}>
            <TrendingUp size={20} color={COLORS.purple} />
            <Text style={styles.summaryValue}>{schedule.interestRate}%</Text>
            <Text style={styles.summaryLabel}>Interest Rate</Text>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Repayment Progress</Text>
            <Text style={styles.progressPercentage}>
              {Math.round((totalPaid / schedule.totalAmount) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(totalPaid / schedule.totalAmount) * 100}%`,
                  backgroundColor:
                    totalPaid / schedule.totalAmount > 0.5
                      ? COLORS.success
                      : COLORS.warning,
                },
              ]}
            />
          </View>
          <View style={styles.progressStats}>
            <Text style={styles.progressStat}>
              {formatCurrency(totalPaid)} of {formatCurrency(schedule.totalAmount)}
            </Text>
            <Text style={styles.progressStat}>
              {summary.paid} of {summary.total} payments
            </Text>
          </View>
        </View>

        {/* Payment Summary Stats */}
        <View style={styles.statsRow}>
          <StatBadge
            label="Paid"
            count={summary.paid}
            total={summary.total}
            color={COLORS.success}
          />
          <StatBadge
            label="Pending"
            count={summary.pending}
            total={summary.total}
            color={COLORS.warning}
          />
          <StatBadge
            label="Overdue"
            count={summary.overdue}
            total={summary.total}
            color={COLORS.danger}
          />
          <StatBadge
            label="Upcoming"
            count={summary.upcoming}
            total={summary.total}
            color={COLORS.info}
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterContainer}>
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
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.85}
                  onPress={() => setFilter(key as PaymentStatus)}
                  style={[
                    styles.filterChip,
                    filter === key && styles.filterChipActive,
                  ]}
                >
                  <View style={styles.filterChipContent}>
                    <config.icon
                      size={12}
                      color={filter === key ? config.color : COLORS.muted}
                    />
                    <Text
                      style={[
                        styles.filterText,
                        filter === key && styles.filterTextActive,
                        { color: filter === key ? config.color : COLORS.muted },
                      ]}
                    >
                      {config.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Payment List */}
        <View style={styles.listContainer}>
          {filteredPayments.length === 0 ? (
            <View style={styles.emptyState}>
              <CheckCircle size={48} color={COLORS.success} />
              <Text style={styles.emptyTitle}>All Caught Up!</Text>
              <Text style={styles.emptyMessage}>
                You have no {filter !== "all" ? STATUS_CONFIG[filter as PaymentStatus]?.label.toLowerCase() : ""}{" "}
                payments at the moment.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredPayments}
              renderItem={renderPaymentItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onShare}
            style={styles.shareButton}
          >
            <Share2 size={20} color={COLORS.primary} />
            <Text style={styles.shareText}>Share Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onDownload}
            style={styles.downloadButton}
          >
            <Download size={20} color="#FFFFFF" />
            <Text style={styles.downloadText}>Download PDF</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Payment Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Payment Details</Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setModalVisible(false)}
                  style={styles.modalClose}
                >
                  <X size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              {selectedPayment && (
                <>
                  <View style={styles.modalPaymentHeader}>
                    <View
                      style={[
                        styles.modalStatusBadge,
                        {
                          backgroundColor:
                            STATUS_CONFIG[selectedPayment.status].bgColor,
                        },
                      ]}
                    >
                      {(() => {
                        const Icon = STATUS_CONFIG[selectedPayment.status].icon;
                        return (
                          <Icon
                            size={16}
                            color={STATUS_CONFIG[selectedPayment.status].color}
                          />
                        );
                      })()}
                      <Text
                        style={[
                          styles.modalStatusText,
                          {
                            color: STATUS_CONFIG[selectedPayment.status].color,
                          },
                        ]}
                      >
                        {STATUS_CONFIG[selectedPayment.status].label}
                      </Text>
                    </View>
                    <Text style={styles.modalPaymentNumber}>
                      Payment #{selectedPayment.number}
                    </Text>
                  </View>

                  <View style={styles.modalDetails}>
                    <DetailRow
                      label="Due Date"
                      value={formatDate(selectedPayment.dueDate)}
                    />
                    <DetailRow
                      label="Amount"
                      value={formatCurrency(selectedPayment.amount)}
                    />
                    <DetailRow
                      label="Principal"
                      value={formatCurrency(selectedPayment.principal)}
                    />
                    <DetailRow
                      label="Interest"
                      value={formatCurrency(selectedPayment.interest)}
                    />
                    {selectedPayment.lateFee && (
                      <DetailRow
                        label="Late Fee"
                        value={formatCurrency(selectedPayment.lateFee)}
                        valueColor={COLORS.danger}
                      />
                    )}
                    {selectedPayment.paidDate && (
                      <DetailRow
                        label="Paid Date"
                        value={formatDate(selectedPayment.paidDate)}
                      />
                    )}
                    {selectedPayment.transactionId && (
                      <DetailRow
                        label="Transaction ID"
                        value={selectedPayment.transactionId}
                        monospace
                      />
                    )}
                    {selectedPayment.notes && (
                      <DetailRow
                        label="Notes"
                        value={selectedPayment.notes}
                        multiline
                      />
                    )}
                  </View>

                  {selectedPayment.status === "pending" ||
                  selectedPayment.status === "overdue" ? (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        setModalVisible(false);
                        onMakePayment?.(selectedPayment.id);
                      }}
                      style={styles.modalPayButton}
                    >
                      <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.modalPayGradient}
                      >
                        <DollarSign size={20} color="#FFFFFF" />
                        <Text style={styles.modalPayText}>Pay Now</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : selectedPayment.status === "paid" ? (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        setModalVisible(false);
                        onViewReceipt?.(selectedPayment.id);
                      }}
                      style={styles.modalReceiptButton}
                    >
                      <Printer size={20} color={COLORS.primary} />
                      <Text style={styles.modalReceiptText}>View Receipt</Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              )}
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// Sub-components

function StatBadge({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  return (
    <View style={styles.statBadge}>
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statCount}>
        {count}/{total}
      </Text>
    </View>
  );
}

function DetailRow({
  label,
  value,
  valueColor,
  monospace,
  multiline,
}: {
  label: string;
  value: string;
  valueColor?: string;
  monospace?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[
          styles.detailValue,
          valueColor && { color: valueColor },
          monospace && styles.detailValueMonospace,
          multiline && styles.detailValueMultiline,
        ]}
        numberOfLines={multiline ? undefined : 1}
      >
        {value}
      </Text>
    </View>
  );
}

// Utility Functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-GH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 4,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
  },
  headerRight: {
    width: 32,
  },
  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    paddingLeft: 36,
  },
  summaryGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  summaryLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "500",
  },
  progressSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 14,
    gap: 8,
    marginBottom: 16,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  progressPercentage: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressStat: {
    color: COLORS.muted,
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  statBadge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "500",
  },
  statCount: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "600",
    marginLeft: "auto",
  },
  filterRow: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: `${COLORS.primary}10`,
    borderColor: COLORS.primary,
  },
  filterChipContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  filterText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "500",
  },
  filterTextActive: {
    color: COLORS.primary,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  listContent: {
    gap: 12,
  },
  paymentItem: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentItemOverdue: {
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  paymentItemPaid: {
    opacity: 0.7,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  paymentNumber: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paymentNumberText: {
    fontSize: 12,
    fontWeight: "700",
  },
  paymentDueDate: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "500",
  },
  paymentPaidDate: {
    color: COLORS.success,
    fontSize: 11,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  paymentDetails: {
    gap: 8,
  },
  paymentAmount: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: {
    color: COLORS.muted,
    fontSize: 12,
  },
  amountValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  paymentBreakdown: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  breakdownItem: {
    flex: 1,
    gap: 2,
  },
  breakdownLabel: {
    color: COLORS.muted,
    fontSize: 10,
  },
  breakdownValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },
  breakdownDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  paymentActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  payButton: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  payGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  payButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },
  receiptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}05`,
  },
  receiptButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  infoButton: {
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    gap: 12,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  emptyMessage: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: "center",
  },
  bottomActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  shareText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  downloadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.purple,
  },
  downloadText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    maxHeight: "80%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  modalClose: {
    padding: 4,
  },
  modalPaymentHeader: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  modalStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  modalStatusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  modalPaymentNumber: {
    color: COLORS.muted,
    fontSize: 14,
  },
  modalDetails: {
    gap: 12,
    paddingVertical: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    color: COLORS.muted,
    fontSize: 13,
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  detailValueMonospace: {
    fontFamily: "monospace",
  },
  detailValueMultiline: {
    flexWrap: "wrap",
    textAlign: "left",
    marginTop: 4,
  },
  modalPayButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  modalPayGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  modalPayText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  modalReceiptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    marginTop: 8,
  },
  modalReceiptText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});