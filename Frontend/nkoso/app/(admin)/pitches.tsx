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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors } from '@/constants/Colors';
import {
  approveAdminPitch,
  getAdminPendingPitches,
  rejectAdminPitch,
} from '@/services/api';
import type { Pitch } from '@/types';

export default function AdminPitchesScreen() {
  const queryClient = useQueryClient();
  const {
    data: pendingPitches = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['adminPendingPitches'],
    queryFn: getAdminPendingPitches,
  });

  const approveMutation = useMutation({
    mutationFn: approveAdminPitch,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminPendingPitches'] }),
    onError: (error) => showError(error, 'Could not approve this pitch.'),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectAdminPitch,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminPendingPitches'] }),
    onError: (error) => showError(error, 'Could not reject this pitch.'),
  });

  const busyPitchId = approveMutation.variables ?? rejectMutation.variables;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pitch Review</Text>
        <Text style={styles.subtitle}>Review and approve funding requests</Text>
      </View>

      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.stateText}>Loading pitches</Text>
        </View>
      ) : isError ? (
        <View style={styles.state}>
          <Ionicons name="alert-circle-outline" size={42} color={Colors.accentRed} />
          <Text style={styles.stateTitle}>Could not load pitches</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
          }
        >
          {pendingPitches.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={44} color={Colors.accent} />
              <Text style={styles.emptyTitle}>No pending pitches</Text>
              <Text style={styles.emptyText}>New business pitches will appear here for review.</Text>
            </View>
          ) : (
            pendingPitches.map((pitch) => (
              <PitchReviewCard
                key={pitch.id}
                pitch={pitch}
                busy={busyPitchId === pitch.id}
                onApprove={() => approveMutation.mutate(pitch.id)}
                onReject={() => rejectMutation.mutate(pitch.id)}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function PitchReviewCard({
  pitch,
  busy,
  onApprove,
  onReject,
}: {
  pitch: Pitch;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.businessName}>{pitch.businessName || 'Untitled business'}</Text>
          <Text style={styles.industry}>{pitch.industry} · {pitch.location || 'Location pending'}</Text>
        </View>
        <View style={styles.badgeWarning}>
          <Text style={styles.badgeTextWarning}>{pitch.status}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {pitch.shortDescription || pitch.description || 'No description provided.'}
      </Text>

      <View style={styles.metrics}>
        <Metric label="Requested" value={`GH₵ ${formatCurrency(pitch.amountNeeded)}`} />
        <Metric label="Minimum" value={`GH₵ ${formatCurrency(pitch.minimumInvestment)}`} />
        <Metric label="Return" value={`${pitch.offerValue}% ${pitch.offerType.replace('_', ' ')}`} />
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={[styles.button, styles.buttonReject]}
          onPress={onReject}
          disabled={busy}
        >
          <Ionicons name="close" size={16} color="#d32f2f" />
          <Text style={styles.buttonTextReject}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonApprove]}
          onPress={onApprove}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="checkmark" size={16} color="#fff" />
          )}
          <Text style={styles.buttonTextApprove}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function formatCurrency(value: number | string | null | undefined) {
  const next = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(next) ? next.toLocaleString() : '0';
}

function showError(error: unknown, fallback: string) {
  Alert.alert('Pitch review failed', error instanceof Error ? error.message : fallback);
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
    padding: 24,
    gap: 10,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stateText: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
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
    marginBottom: 12,
  },
  cardTitleBlock: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  industry: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  metrics: {
    gap: 8,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  metric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  metricValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
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
  cardFooter: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    gap: 4,
  },
  buttonReject: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  buttonTextReject: {
    color: '#d32f2f',
    fontWeight: '700',
  },
  buttonApprove: {
    backgroundColor: Colors.primary,
  },
  buttonTextApprove: {
    color: '#fff',
    fontWeight: '700',
  },
});
