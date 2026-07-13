import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getCurrentUser, updateProfile } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

const digits = (value: string) => value.replace(/\D/g, '');
export const didMomoChange = (original?: string, next?: string) => Boolean(next?.trim()) && digits(original || '') !== digits(next || '');

export default function PersonalInfoScreen() {
  const { user, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [momoNumber, setMomoNumber] = useState(user?.momoNumber || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const momoChanged = useMemo(() => didMomoChange(user?.momoNumber, momoNumber), [user?.momoNumber, momoNumber]);

  const save = async () => {
    if (!name.trim()) return Alert.alert('Name required', 'Enter your display name.');
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) return Alert.alert('Password required', 'Enter your current password and confirm the new password.');
      if (newPassword !== confirmPassword) return Alert.alert('Passwords do not match', 'Enter matching new passwords.');
    }
    if (momoNumber.trim() && digits(momoNumber).length !== 10) return Alert.alert('Invalid MoMo number', 'Enter a 10-digit MoMo number.');
    setLoading(true);
    try {
      const updated = await updateProfile({ name, momoNumber, currentPassword, newPassword, confirmPassword });
      const serverUser = await getCurrentUser().catch(() => updated);
      setUser(serverUser);
      setEditing(false);
      if (momoChanged) {
        Alert.alert('MoMo verification needed', 'Your changed MoMo number must be verified again.', [{ text: 'Verify now', onPress: () => router.replace('/profile/verification') }]);
      } else Alert.alert('Saved', 'Your personal information has been updated.');
    } catch (error) { Alert.alert('Could not save', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setLoading(false); }
  };

  return <SafeAreaView style={styles.safe} edges={['top']}><KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={styles.header}><TouchableOpacity onPress={() => router.back()} style={styles.icon}><Ionicons name="arrow-back" size={22} color={Colors.textPrimary} /></TouchableOpacity><Text style={styles.title}>Personal information</Text><TouchableOpacity onPress={() => setEditing((value) => !value)} style={styles.edit}><Text style={styles.editText}>{editing ? 'Cancel' : 'Edit'}</Text></TouchableOpacity></View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Field label="Email address" value={user?.email || ''} icon="mail-outline" /><Field label="Account role" value={user?.role || ''} icon="business-outline" />
      {editing ? <><Input label="Display name" value={name} onChangeText={setName} leftIcon="person-outline" />
        <Input label="MoMo number" value={momoNumber} onChangeText={setMomoNumber} keyboardType="phone-pad" leftIcon="phone-portrait-outline" />
        {momoChanged ? <Text style={styles.note}>Changing this number requires MoMo verification again.</Text> : null}
        <Text style={styles.subheading}>Change password</Text><Input label="Current password" value={currentPassword} onChangeText={setCurrentPassword} secure leftIcon="lock-closed-outline" />
        <Input label="New password" value={newPassword} onChangeText={setNewPassword} secure leftIcon="lock-closed-outline" />
        <Input label="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} secure leftIcon="lock-closed-outline" />
        <Button title="Save changes" onPress={save} loading={loading} />
      </> : <><Field label="Display name" value={user?.name || ''} icon="person-outline" /><Field label="MoMo number" value={user?.momoNumber || 'Not added'} icon="phone-portrait-outline" /><Text style={styles.hint}>Use Edit to update your display name, password, or MoMo number.</Text></>}
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}
function Field({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) { return <View style={styles.field}><Text style={styles.label}>{label}</Text><View style={styles.fieldValue}><Ionicons name={icon} size={17} color={Colors.textMuted} /><Text style={styles.value}>{value}</Text></View></View>; }
const styles = StyleSheet.create({safe:{flex:1,backgroundColor:Colors.background},header:{height:62,paddingHorizontal:16,backgroundColor:Colors.surface,flexDirection:'row',alignItems:'center',borderBottomWidth:1,borderBottomColor:Colors.border},icon:{width:40},title:{flex:1,textAlign:'center',fontSize:17,fontWeight:'700',color:Colors.textPrimary},edit:{width:52,alignItems:'flex-end'},editText:{fontSize:14,fontWeight:'700',color:Colors.primary},content:{padding:20,gap:14},field:{gap:6},label:{fontSize:13,color:Colors.textSecondary,fontWeight:'600'},fieldValue:{height:48,paddingHorizontal:14,backgroundColor:Colors.borderLight,borderRadius:8,flexDirection:'row',gap:10,alignItems:'center'},value:{color:Colors.textPrimary,fontSize:15,flex:1},hint:{fontSize:13,lineHeight:19,color:Colors.textSecondary},note:{fontSize:13,color:'#B45309',lineHeight:18},subheading:{marginTop:6,fontSize:15,fontWeight:'700',color:Colors.textPrimary} });
