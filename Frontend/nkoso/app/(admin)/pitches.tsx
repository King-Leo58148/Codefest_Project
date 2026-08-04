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
import { useTheme } from '@/store/themeStore';
import {
  approveAdminPitch,
  getAdminPendingPitches,
  rejectAdminPitch,
} from '@/services/api';
import type { Pitch } from '@/types';

function showError(error: unknown, fallbackMessage: string) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  Alert.alert('Action Failed', message);
}

export default function AdminPitchesScreen() {
  const { isDark, colors } = useTheme();
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
    // Review queue is a live inbox — don't serve a stale list.
    staleTime: 0,
    refetchInterval: 15000,
    refetchOnMount: 'always',
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Pitch Review</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Review and approve funding requests</Text>
      </View>

      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={isDark ? colors.accent : colors.primary} />
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>Loading pitches</Text>
        </View>
      ) : isError ? (
        <View style={styles.state}>
          <Ionicons name="alert-circle-outline" size={42} color="#DC2626" />
          <Text style={[styles.stateText, { color: colors.textPrimary }]}>Could not load pitches.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : pendingPitches.length === 0 ? (
        <View style={styles.state}>
          <Ionicons name="checkmark-circle-outline" size={44} color="#16A34A" />
          <Text style={[styles.stateText, { color: colors.textPrimary }]}>All pending pitches reviewed.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={isDark ? '#38BDF8' : '#0D1B3E'} />
          }
        >
          {pendingPitches.map((pitch: Pitch) => {
            const busy = busyPitchId === pitch.id;
            return (
              <View key={pitch.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.businessName, { color: colors.textPrimary }]}>{pitch.businessName}</Text>
                <Text style={[styles.meta, { color: colors.textSecondary }]}>
                  {pitch.industry} • {pitch.location}
                </Text>

                <View style={[styles.metrics, { backgroundColor: colors.surfaceSubtle }]}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Target Goal</Text>
                    <Text style={[styles.metricValue, { color: colors.textPrimary }]}>GH₵{pitch.amountNeeded?.toLocaleString()}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Min Invest</Text>
                    <Text style={[styles.metricValue, { color: colors.textPrimary }]}>GH₵{pitch.minInvestment?.toLocaleString()}</Text>
                  </View>
                </View>

                {pitch.summary ? (
                  <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={3}>
                    {pitch.summary}
                  </Text>
                ) : null}

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.btn, styles.rejectBtn, busy && styles.disabled]}
                    onPress={() => rejectMutation.mutate(pitch.id)}
                    disabled={busy}
                  >
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btn, styles.approveBtn, busy && styles.disabled]}
                    onPress={() => approveMutation.mutate(pitch.id)}
                    disabled={busy}
                  >
                    {busy ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.approveText}>Approve Pitch</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
    gap: 16,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  stateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '800',
  },
  meta: {
    fontSize: 12,
    marginTop: -4,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderRadius: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  summary: {
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtn: {
    backgroundColor: '#16A34A',
  },
  approveText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  rejectBtn: {
    backgroundColor: '#FEE2E2',
  },
  rejectText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 12,
  },
  disabled: {
    opacity: 0.6,
  },
});
