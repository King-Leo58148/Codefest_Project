import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '@/constants/Colors';
import { getMyDeals } from '@/services/api';

export default function OwnerDealsScreen() {
  const query = useQuery({ queryKey:['ownerDeals'], queryFn:getMyDeals });
  if (query.isLoading) return <State icon="hourglass-outline" title="Loading active deals" />;
  if (query.isError) return <State icon="alert-circle-outline" title="Could not load active deals" action="Retry" onPress={() => query.refetch()} />;
  return <SafeAreaView style={styles.safe} edges={['top']}><Text style={styles.title}>Active deals</Text><FlatList data={query.data || []} keyExtractor={(item)=>item.id} contentContainerStyle={styles.list} renderItem={({item})=><TouchableOpacity onPress={()=>router.push(`/deal/${item.id}`)} style={styles.card}><View style={styles.row}><Text style={styles.business}>{item.businessName || 'Business deal'}</Text><Text style={styles.status}>{item.status}</Text></View><Text style={styles.amount}>GH₵{item.amount.toLocaleString()}</Text><Text style={styles.meta}>{item.returnType} · {item.returnValue}% · {item.timelineMonths} months</Text><Text style={styles.meta}>{item.ownerSigned ? 'Owner signed' : 'Owner signature pending'} · {item.investorSigned ? 'Investor signed' : 'Investor signature pending'}</Text></TouchableOpacity>} ListEmptyComponent={<State icon="people-outline" title="No active deals" detail="Accepted bids will appear here."/>}/></SafeAreaView>;
}
function State({icon,title,detail,action,onPress}:{icon:keyof typeof Ionicons.glyphMap;title:string;detail?:string;action?:string;onPress?:()=>void}) { return <SafeAreaView style={styles.state}><Ionicons name={icon} size={44} color={Colors.textMuted}/><Text style={styles.stateTitle}>{title}</Text>{detail?<Text style={styles.meta}>{detail}</Text>:null}{action?<TouchableOpacity style={styles.retry} onPress={onPress}><Text style={{color:'#fff',fontWeight:'700'}}>{action}</Text></TouchableOpacity>:null}</SafeAreaView>; }
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:Colors.background},title:{padding:20,fontSize:26,fontWeight:'800',color:Colors.textPrimary},list:{paddingHorizontal:20,paddingBottom:30},card:{padding:16,marginBottom:12,borderRadius:8,backgroundColor:Colors.surface,gap:8},row:{flexDirection:'row',gap:12,justifyContent:'space-between'},business:{flex:1,fontSize:16,fontWeight:'700',color:Colors.textPrimary},status:{fontSize:12,fontWeight:'800',color:Colors.primary},amount:{fontSize:20,fontWeight:'800',color:Colors.textPrimary},meta:{fontSize:13,color:Colors.textSecondary,lineHeight:19},state:{flex:1,alignItems:'center',justifyContent:'center',padding:28,gap:10,backgroundColor:Colors.background},stateTitle:{fontSize:18,fontWeight:'700',color:Colors.textPrimary},retry:{backgroundColor:Colors.primary,paddingHorizontal:18,paddingVertical:10,borderRadius:8,marginTop:8}});
