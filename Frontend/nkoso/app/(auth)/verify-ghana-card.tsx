import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { verifyGhanaCard } from '@/services/api';
import type { VerificationAsset } from '@/types';

export default function VerifyGhanaCardScreen() {
  const [number, setNumber] = useState(''); const [asset, setAsset] = useState<VerificationAsset | null>(null); const [loading, setLoading] = useState(false);
  const pick = async () => { const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(); if (!permission.granted) return Alert.alert('Photo permission needed', 'Allow photo access to upload your Ghana Card.'); const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 }); if (!result.canceled) { const picked = result.assets[0]; setAsset({ uri: picked.uri, fileName: picked.fileName ?? undefined, mimeType: picked.mimeType ?? undefined }); } };
  const submit = async () => { const card = number.replace(/\s/g, '').toUpperCase(); if (!card || card.length < 10) return Alert.alert('Invalid card', 'Enter a valid Ghana Card number.'); if (!asset) return Alert.alert('Image required', 'Choose a Ghana Card image before continuing.'); setLoading(true); try { const verified = await verifyGhanaCard(card, asset); if (!verified) return Alert.alert('Not verified', 'We could not verify these details.'); router.push('/(auth)/verify-momo'); } catch (error) { Alert.alert('Verification failed', error instanceof Error ? error.message : 'Please try again.'); } finally { setLoading(false); } };
  return <View style={styles.container}><Text style={styles.title}>Verify your Ghana Card</Text><Text style={styles.copy}>Add your card number and a clear image to verify your identity.</Text><Input placeholder="GHA-XXXXXXXXX-X" value={number} onChangeText={setNumber} autoCapitalize="characters" leftIcon="card-outline"/><TouchableOpacity onPress={pick} style={styles.upload}><Text style={styles.uploadText}>{asset ? asset.fileName || 'Image selected' : 'Choose Ghana Card image'}</Text></TouchableOpacity><Button title="Continue" onPress={submit} loading={loading}/><TouchableOpacity onPress={() => router.push('/(auth)/verify-momo')} style={styles.skip}><Text style={styles.skipText}>Skip for now</Text></TouchableOpacity></View>;
}
const styles=StyleSheet.create({container:{flex:1,backgroundColor:'#fff',padding:24,justifyContent:'center',gap:16},title:{fontSize:27,fontWeight:'800',color:Colors.textPrimary},copy:{fontSize:15,lineHeight:22,color:Colors.textSecondary,marginBottom:8},upload:{height:50,borderRadius:8,borderWidth:1,borderColor:Colors.primary,borderStyle:'dashed',alignItems:'center',justifyContent:'center'},uploadText:{fontSize:14,fontWeight:'700',color:Colors.primary},skip:{alignItems:'center',padding:12},skipText:{color:Colors.textSecondary,fontSize:14,fontWeight:'600'}});
