import React from 'react';
import { Modal, View, Text, Button, StyleSheet, Image, ActivityIndicator } from 'react-native';

interface AcceptBidModalProps {
  visible: boolean;
  onAccept: () => void;
  onCancel: () => void;
  bid: {
    id: string;
    amount: number;
    businessName: string;
    businessLogo?: string;
    message?: string;
    createdAt: string;
  };
  loading?: boolean;
}

const AcceptBidModal = ({ 
  visible, 
  onAccept, 
  onCancel, 
  bid,
  loading = false
}: AcceptBidModalProps) => {
  if (!visible) {
    return null;
  }

  return (
    <Modal 
      transparent={true}
      visible={visible}
      animationType="fade"
    >
      <View style={styles.backdrop}>
        <View style={styles.modalContent}>
          {/* Bid Header */}
          <View style={styles.header}>
            {bid.businessLogo ? (
              <Image 
                source={{ uri: bid.businessLogo }} 
                style={styles.businessLogo} 
              />
            ) : (
              <View style={[styles.businessLogo, styles.defaultLogo]}>
                <Text style={styles.defaultLogoText}>B</Text>
              </View>
            )}
            <View style={styles.bidInfo}>
              <Text style={styles.businessName}>{bid.businessName}</Text>
              <Text style={styles.bidAmount}>${bid.amount.toLocaleString()}</Text>
            </View>
          </View>

          {/* Bid Message */}
          {bid.message && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>Message:</Text>
              <Text style={styles.messageText}>{bid.message}</Text>
            </View>
          )}

          {/* Bid Timestamp */}
          <View style={styles.timestampContainer}>
            <Text style={styles.timestampText}>
              Bid placed on: {new Date(bid.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {loading ? (
              <ActivityIndicator 
                size="small" 
                color="#fff" 
                style={styles.loadingIndicator} 
              />
            ) : (
              <>
                <Button 
                  title="Cancel" 
                  color="#ff6b6b" 
                  onPress={onCancel} 
                />
                <Button 
                  title="Accept Bid" 
                  color="#4ecdc4" 
                  onPress={onAccept} 
                />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  businessLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  defaultLogo: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultLogoText: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#666',
  },
  bidInfo: {
    flexDirection: 'column',
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  bidAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 4,
  },
  messageContainer: {
    marginVertical: 16,
  },
  messageLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  timestampContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  timestampText: {
    fontSize: 12,
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loadingIndicator: {
    marginHorizontal: 12,
  },
});

export default AcceptBidModal;