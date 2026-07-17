import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AdminDealsScreen() {
  const activeDeals: any[] = [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Deal Monitoring</Text>
        <Text style={styles.subtitle}>Track investments and MFI approvals</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeDeals.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 40, color: Colors.textLight }}>
            No active deals found.
          </Text>
        ) : (
          activeDeals.map((deal) => (
            <View key={deal.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.businessName}>{deal.businessName}</Text>
                  <Text style={styles.dealId}>Deal #{deal.id}</Text>
                </View>
                <View style={deal.status === 'ACTIVE' ? styles.badgeSuccess : styles.badgeWarning}>
                  <Text style={deal.status === 'ACTIVE' ? styles.badgeTextSuccess : styles.badgeTextWarning}>
                    {deal.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.cardBody}>
                <View style={styles.row}>
                  <Text style={styles.label}>Investor:</Text>
                  <Text style={styles.value}>{deal.investor}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Amount:</Text>
                  <Text style={styles.value}>GH₵ {deal.amount}</Text>
                </View>
              </View>
  
              <View style={styles.cardFooter}>
                <TouchableOpacity 
                  style={styles.buttonOutline}
                  onPress={() => router.push(`/deal/${deal.id}`)}
                >
                  <Text style={styles.buttonTextOutline}>View Details</Text>
                </TouchableOpacity>
                {deal.status === 'PENDING_MFI' && (
                  <TouchableOpacity style={styles.buttonApprove}>
                    <Text style={styles.buttonTextApprove}>Approve MFI</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  dealId: {
    fontSize: 12,
    color: Colors.textLight,
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
  cardBody: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: Colors.textLight,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  buttonOutline: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonTextOutline: {
    color: Colors.text,
    fontWeight: '500',
  },
  buttonApprove: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  buttonTextApprove: {
    color: '#fff',
    fontWeight: '600',
  },
});
