import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { verifyGhanaCard, getCurrentUser } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import type { VerificationAsset } from '@/types';

export default function VerifyGhanaCardScreen() {
  const [number, setNumber] = useState('');
  const [asset, setAsset] = useState<VerificationAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const { user, setUser, token } = useAuthStore();

  useEffect(() => {
    const refreshUser = async () => {
      if (!token) return;
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        // keep existing user state
      }
    };

    refreshUser();
  }, [token, setUser]);

  const pick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted)
      return Alert.alert('Photo permission needed', 'Allow photo access to upload your Ghana Card.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) {
      const picked = result.assets[0];
      setAsset({ uri: picked.uri, fileName: picked.fileName ?? undefined, mimeType: picked.mimeType ?? undefined });
    }
  };

  const alreadyVerified = user?.ghanaCardVerified;

  const submit = async () => {
    if (!token) {
      setError('User session not initialized. Please sign in to complete verification.');
      setStatusMessage('');
      return;
    }

    if (alreadyVerified) {
      setError('Your Ghana Card is already verified. No further submission is needed.');
      setStatusMessage('');
      return;
    }

    const card = number.replace(/\s/g, '').toUpperCase();
    if (!card || card.length < 10) {
      setError('Enter a valid Ghana Card number.');
      setStatusMessage('');
      return;
    }
    if (!asset) {
      setError('Choose a Ghana Card image before continuing.');
      setStatusMessage('');
      return;
    }

    setError('');
    setStatusMessage('Submitting Ghana Card verification...');
    setLoading(true);
    try {
      const verified = await verifyGhanaCard(card, asset);
      if (!verified) {
        setError('We could not verify these details.');
        setStatusMessage('');
        return;
      }
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      Alert.alert('Verification submitted', 'Ghana Card submitted successfully.');
      router.push('/(auth)/verify-momo');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Please try again.');
      setStatusMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify your Ghana Card</Text>
      <Text style={styles.copy}>Add your card number and a clear image to verify your identity.</Text>

      {alreadyVerified ? (
        <View style={styles.verifiedCard}>
          <Text style={styles.verifiedLabel}>Ghana Card already verified</Text>
          <Text style={styles.verifiedMessage}>
            Your identity is already verified. You may skip this step and continue to MoMo verification.
          </Text>
        </View>
      ) : (
        <>
          <Input
            placeholder="GHA-XXXXXXXXX-X"
            value={number}
            onChangeText={setNumber}
            autoCapitalize="characters"
            leftIcon="card-outline"
          />
          <TouchableOpacity onPress={pick} style={styles.upload}>
            <Text style={styles.uploadText}>{asset ? asset.fileName || 'Image selected' : 'Choose Ghana Card image'}</Text>
          </TouchableOpacity>
        </>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!error && statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}

      <Button
        title={alreadyVerified ? 'Already verified' : 'Continue'}
        onPress={submit}
        loading={loading}
        disabled={loading || alreadyVerified}
      />
      <TouchableOpacity onPress={() => router.push('/(auth)/verify-momo')} style={styles.skip}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles=StyleSheet.create({container:{flex:1,backgroundColor:'#fff',padding:24,justifyContent:'center',gap:16},title:{fontSize:27,fontWeight:'800',color:Colors.textPrimary},copy:{fontSize:15,lineHeight:22,color:Colors.textSecondary,marginBottom:8},upload:{height:50,borderRadius:8,borderWidth:1,borderColor:Colors.primary,borderStyle:'dashed',alignItems:'center',justifyContent:'center'},uploadText:{fontSize:14,fontWeight:'700',color:Colors.primary},verifiedCard:{padding:16,backgroundColor:'#ECFDF5',borderRadius:16,borderWidth:1,borderColor:'#D1FAE5'},verifiedLabel:{fontSize:16,fontWeight:'700',color:'#166534',marginBottom:6},verifiedMessage:{fontSize:14,color:'#134E4A',lineHeight:20},skip:{alignItems:'center',padding:12},skipText:{color:Colors.textSecondary,fontSize:14,fontWeight:'600'},errorText:{color:Colors.accentRed,fontSize:13,marginBottom:8},statusText:{color:Colors.primary,fontSize:13,marginBottom:8}});
