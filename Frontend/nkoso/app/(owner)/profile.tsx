import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';

function Row({ icon, label, value, onPress, danger }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string; onPress: () => void; danger?: boolean }) {
  return <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.row} activeOpacity={0.7}>
    <Ionicons name={icon} size={20} color={danger ? Colors.accentRed : Colors.textSecondary} />
    <Text style={[styles.rowLabel, danger && { color: Colors.accentRed }]}>{label}</Text>
    {value ? <Text style={styles.rowValue}>{value}</Text> : null}
    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
  </TouchableOpacity>;
}

export default function OwnerProfileScreen() {
  const { user, logout } = useAuthStore();
  const initials = (user?.name || '?').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const openVerification = () => router.push('/profile/verification');
  const signOut = () => Alert.alert('Sign out', 'Are you sure you want to sign out?', [
    { text: 'Cancel', style: 'cancel' }, { text: 'Sign out', style: 'destructive', onPress: () => logout() },
  ]);

  return <SafeAreaView style={styles.safe} edges={['top']}><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.header}><View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View><View style={styles.identity}>
      <Text style={styles.name}>{user?.name || 'Your account'}</Text><Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.role}>{user?.role === 'OWNER' ? 'Business owner' : user?.role}</Text>
    </View></View>
    <TouchableOpacity accessibilityRole="button" onPress={openVerification} style={styles.verification} activeOpacity={0.75}>
      <Status verified={Boolean(user?.ghanaCardVerified)} label="Ghana Card" /><Status verified={Boolean(user?.momoVerified)} label="MoMo" />
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
    <Section title="Account"><Row icon="person-outline" label="Personal information" onPress={() => router.push('/profile/personal-info')} />
      <Row icon="phone-portrait-outline" label="MoMo account" value={user?.momoNumber || 'Not verified'} onPress={openVerification} />
      <Row icon="card-outline" label="Ghana Card" value={user?.ghanaCardVerified ? 'Verified' : 'Verify'} onPress={openVerification} />
    </Section>
    <Section title="Business"><Row icon="megaphone-outline" label="My pitches" onPress={() => router.push('/(owner)/pitches')} />
      <Row icon="people-outline" label="Active deals" onPress={() => router.push('/(owner)/deals')} />
    </Section>
    <Section title="Support"><Row icon="help-circle-outline" label="Help center" onPress={() => router.push('/profile/help')} />
      <Row icon="chatbubble-outline" label="Contact support" onPress={() => router.push('/profile/contact-support')} />
    </Section>
    <View style={styles.group}><Row icon="log-out-outline" label="Log out" danger onPress={signOut} /></View>
  </ScrollView></SafeAreaView>;
}

function Status({ verified, label }: { verified: boolean; label: string }) { return <View style={styles.status}><Ionicons name={verified ? 'checkmark-circle' : 'time-outline'} size={18} color={verified ? Colors.accent : Colors.textMuted} /><Text style={styles.statusText}>{label} {verified ? 'verified' : 'pending'}</Text></View>; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <View><Text style={styles.sectionTitle}>{title}</Text><View style={styles.group}>{children}</View></View>; }

const styles = StyleSheet.create({ safe:{flex:1,backgroundColor:Colors.background},content:{paddingBottom:30},header:{backgroundColor:Colors.surface,padding:20,flexDirection:'row',alignItems:'center',gap:14},avatar:{width:62,height:62,borderRadius:31,backgroundColor:Colors.primary,alignItems:'center',justifyContent:'center'},avatarText:{color:'#fff',fontWeight:'700',fontSize:22},identity:{flex:1},name:{fontSize:19,fontWeight:'700',color:Colors.textPrimary},email:{marginTop:3,fontSize:13,color:Colors.textSecondary},role:{marginTop:5,fontSize:12,color:Colors.primary,fontWeight:'600'},verification:{margin:20,padding:15,borderRadius:8,backgroundColor:'#F0FDF4',flexDirection:'row',alignItems:'center',gap:12},status:{flex:1,flexDirection:'row',gap:6,alignItems:'center'},statusText:{fontSize:12,color:Colors.textSecondary,fontWeight:'600'},sectionTitle:{marginLeft:20,marginTop:8,marginBottom:8,textTransform:'uppercase',fontSize:12,fontWeight:'700',color:Colors.textMuted},group:{marginHorizontal:20,marginBottom:16,backgroundColor:Colors.surface,borderRadius:8},row:{minHeight:54,paddingHorizontal:16,flexDirection:'row',alignItems:'center',gap:12,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:Colors.border},rowLabel:{flex:1,fontSize:16,color:Colors.textPrimary},rowValue:{fontSize:13,color:Colors.accent,fontWeight:'600'} });
