import React from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors } from '@/constants/Colors';
import { approveMfiDeal, getAdminDeals, rejectMfiDeal } from '@/services/api';
import type { Deal } from '@/types';

const REVIEW_STATUSES = ['PENDING_MFI', 'PAYMENT_PENDING', 'ACTIVE'] as const;

export default function AdminDealsScreen() {
  const queryClient = useQueryClient();
  const {
    data: deals = [],
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['adminDeals'],
    queryFn: getAdminDeals,
  });

  const approveMutation = useMutation({
    mutationFn: approveMfiDeal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminDeals'] }),
    onError: (error) => showError(error, 'Could not approve MFI review.'),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectMfiDeal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminDeals'] }),
    onError: (error) => showError(error, 'Could not reject this deal.'),
  });

  const visibleDeals = deals.filter((deal) => REVIEW_STATUSES.includes(deal.status as any));
  const busyDealId = approveMutation.variables ?? rejectMutation.variables;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MFI Workflow</Text>
        <Text style={styles.subtitle}>Review signed deals before investor payment</Text>
      </View>

      {isLoading ? (
        <State icon="hourglass-outline" title="Loading deals" />
      ) : isError ? (
        <State icon="alert-circle-outline" title="Could not load deals" action="Retry" onPress={() => refetch()} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
        >
          {visibleDeals.length === 0 ? (
            <State
              icon="shield-checkmark-outline"
              title="No MFI work pending"
              detail="Deals appear here after both parties sign."
            />
          ) : (
            visibleDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                busy={busyDealId === deal.id}
                onApprove={() => approveMutation.mutate(deal.id)}
                onReject={() => rejectMutation.mutate(deal.id)}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function DealCard({
  deal,
  busy,
  onApprove,
  onReject,
}: {
  deal: Deal;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const canReview = deal.status === 'PENDING_MFI';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleBlock}>
          <Text style={styles.businessName}>{deal.businessName || 'Business deal'}</Text>
          <Text style={styles.dealId}>Deal #{deal.id}</Text>
        </View>
        <StatusBadge status={deal.status} />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Required checks</Text>
        <CheckRow done={deal.ownerSigned} label="Business owner signed" />
        <CheckRow done={deal.investorSigned} label="Investor signed" />
        <CheckRow done={deal.amount > 0} label={`Investment amount: GH₵ ${formatCurrency(deal.amount)}`} />
        <CheckRow done={deal.timelineMonths > 0} label={`Timeline: ${deal.timelineMonths} months`} />
      </View>

      <View style={styles.cardBody}>
        <Row label="Return" value={`${deal.returnValue}% ${deal.returnType.replace('_', ' ')}`} />
        <Row label="Platform fee" value={`GH₵ ${formatCurrency(deal.platformFee ?? deal.amount * 0.01)}`} />
        <Row label="Owner receives" value={`GH₵ ${formatCurrency(deal.netDisbursementAmount ?? deal.amount)}`} />
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.buttonOutline}
          onPress={() => router.push(`/deal/${deal.id}`)}
        >
          <Text style={styles.buttonTextOutline}>View Details</Text>
        </TouchableOpacity>
        {canReview && (
          <>
            <TouchableOpacity style={styles.buttonReject} onPress={onReject} disabled={busy}>
              <Text style={styles.buttonTextReject}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonApprove} onPress={onApprove} disabled={busy}>
              {busy ? <ActivityIndicator size="small" color="#fff" /> : null}
              <Text style={styles.buttonTextApprove}>Approve MFI</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

function StatusBadge({ status }: { status: Deal['status'] }) {
  const active = status === 'ACTIVE';
  return (
    <View style={active ? styles.badgeSuccess : styles.badgeWarning}>
      <Text style={active ? styles.badgeTextSuccess : styles.badgeTextWarning}>
        {status.replace('_', ' ')}
      </Text>
    </View>
  );
}

function CheckRow({ done, label }: { done: boolean; label: string }) {
  return (
    <View style={styles.checkRow}>
      <Ionicons
        name={done ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={done ? Colors.accent : Colors.textMuted}
      />
      <Text style={styles.checkText}>{label}</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function State({
  icon,
  title,
  detail,
  action,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail?: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.state}>
      <Ionicons name={icon} size={42} color={Colors.textMuted} />
      <Text style={styles.stateTitle}>{title}</Text>
      {detail ? <Text style={styles.stateDetail}>{detail}</Text> : null}
      {action ? (
        <TouchableOpacity style={styles.retryButton} onPress={onPress}>
          <Text style={styles.retryText}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function showError(error: unknown, fallback: string) {
  Alert.alert('MFI action failed', error instanceof Error ? error.message : fallback);
}

function formatCurrency(value: number | string | null | undefined) {
  const next = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(next) ? next.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 10,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  stateDetail: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 6,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  titleBlock: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dealId: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badgeWarning: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeTextWarning: {
    color: '#e65100',
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeSuccess: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeTextSuccess: {
    color: '#2e7d32',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: Colors.borderLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  cardBody: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  value: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    flexWrap: 'wrap',
  },
  buttonOutline: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonTextOutline: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  buttonReject: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#ffebee',
  },
  buttonTextReject: {
    color: '#d32f2f',
    fontWeight: '700',
  },
  buttonApprove: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  buttonTextApprove: {
    color: '#fff',
    fontWeight: '700',
  },
});
