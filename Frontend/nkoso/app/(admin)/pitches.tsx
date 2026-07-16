import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function AdminPitchesScreen() {
  const pendingPitches = [
    { id: 1, businessName: "Kwame's Farm", industry: "Agriculture", amount: "5,000", status: "PENDING" },
    { id: 2, businessName: "Accra Tech Hub", industry: "Technology", amount: "15,000", status: "PENDING" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pitch Review</Text>
        <Text style={styles.subtitle}>Review and approve funding requests</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {pendingPitches.map((pitch) => (
          <View key={pitch.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.businessName}>{pitch.businessName}</Text>
                <Text style={styles.industry}>{pitch.industry}</Text>
              </View>
              <View style={styles.badgeWarning}>
                <Text style={styles.badgeTextWarning}>{pitch.status}</Text>
              </View>
            </View>
            
            <View style={styles.cardBody}>
              <View style={styles.amountRow}>
                <Text style={styles.label}>Amount Requested:</Text>
                <Text style={styles.amount}>GH₵ {pitch.amount}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <TouchableOpacity style={[styles.button, styles.buttonReject]}>
                <Ionicons name="close" size={16} color="#d32f2f" />
                <Text style={styles.buttonTextReject}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonApprove]}>
                <Ionicons name="checkmark" size={16} color="#fff" />
                <Text style={styles.buttonTextApprove}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  industry: {
    fontSize: 14,
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
  cardBody: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: Colors.textLight,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
  },
  buttonReject: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  buttonTextReject: {
    color: '#d32f2f',
    fontWeight: '600',
    marginLeft: 4,
  },
  buttonApprove: {
    backgroundColor: Colors.primary,
  },
  buttonTextApprove: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
});
