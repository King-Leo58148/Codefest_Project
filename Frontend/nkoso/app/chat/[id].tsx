import 'text-encoding';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/store/themeStore';
import { getDealMessages, sendDealMessage, getDeal } from '@/services/api';
import { BASE_URL } from '@/services/backendClient';
import { useAuthStore } from '@/store/authStore';
import { Deal } from '@/types';

function formatMessageTime(dateString: string | undefined): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateHeader(dateString: string | undefined): string {
  if (!dateString) return 'Today';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Today';
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function FullPageChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dealId = Array.isArray(id) ? id[0] : id;
  const { isDark, colors } = useTheme();

  const [deal, setDeal] = useState<Deal | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const stompClientRef = useRef<Client | null>(null);

  const { user } = useAuthStore();
  const currentUserId = user?.id || '';

  const isOwner = user?.role === 'OWNER';
  const otherPartyName = isOwner 
    ? (deal?.investorName || 'Investor Partner') 
    : (deal?.businessName || 'Business Owner');

  useEffect(() => {
    if (!dealId) return;

    let isMounted = true;

    async function initChat() {
      try {
        setLoading(true);
        const dealData = await getDeal(dealId);
        if (isMounted) setDeal(dealData);

        const msgs = await getDealMessages(dealId);
        if (isMounted) setMessages(msgs);

        const token = await AsyncStorage.getItem('auth_token');
        const wsUrl = `${BASE_URL}/ws-chat`;

        const client = new Client({
          webSocketFactory: () => new SockJS(wsUrl) as any,
          connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
          debug: () => {},
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
          if (!isMounted) return;
          setConnected(true);

          client.subscribe(`/topic/deal.${dealId}`, (message) => {
            if (!isMounted) return;
            try {
              const newMsg = JSON.parse(message.body);
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
            } catch (e) {
              console.error('Error parsing WS message:', e);
            }
          });
        };

        client.onStompError = () => {
          if (isMounted) setConnected(false);
        };

        client.activate();
        stompClientRef.current = client;
      } catch (err: any) {
        console.error('Chat Init Error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initChat();

    return () => {
      isMounted = false;
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [dealId]);

  const handleSend = async () => {
    const text = inputMsg.trim();
    if (!text || !dealId) return;

    setInputMsg('');
    setSending(true);

    try {
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.publish({
          destination: `/app/chat.sendMessage/${dealId}`,
          body: JSON.stringify({ content: text }),
        });
      } else {
        const sent = await sendDealMessage(dealId, text);
        setMessages((prev) => {
          if (prev.some((m) => m.id === sent.id)) return prev;
          return [...prev, sent];
        });
      }
    } catch (err: any) {
      Alert.alert('Message Failed', err?.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  };

  const renderMessageItem = ({ item, index }: { item: any; index: number }) => {
    const isMe = item.senderId === currentUserId || item.senderName === user?.name;
    const showDateHeader = index === 0 || 
      formatDateHeader(item.createdAt) !== formatDateHeader(messages[index - 1]?.createdAt);

    return (
      <View>
        {showDateHeader && (
          <View style={styles.dateHeaderContainer}>
            <Text style={[styles.dateHeaderText, { color: colors.textMuted }]}>{formatDateHeader(item.createdAt)}</Text>
          </View>
        )}

        <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowOther]}>
          {!isMe && (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{(item.senderName || 'P')[0].toUpperCase()}</Text>
            </View>
          )}

          <View style={[
            styles.bubble,
            isMe ? styles.bubbleMe : [styles.bubbleOther, { backgroundColor: colors.surface, borderColor: colors.border }],
          ]}>
            {!isMe && <Text style={styles.senderLabel}>{item.senderName || 'Partner'}</Text>}
            <Text style={[styles.msgContent, isMe ? styles.msgContentMe : { color: colors.textPrimary }]}>{item.content}</Text>

            <View style={styles.msgFooter}>
              <Text style={[styles.timeText, isMe ? styles.timeTextMe : { color: colors.textMuted }]}>
                {formatMessageTime(item.createdAt)}
              </Text>
              {isMe && (
                <Ionicons name="checkmark-done" size={14} color="#A7F3D0" style={{ marginLeft: 3 }} />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Custom Top Navigation Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerPartnerGroup}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{(otherPartyName || 'P')[0].toUpperCase()}</Text>
          </View>
          <View>
            <Text style={[styles.headerPartnerName, { color: colors.textPrimary }]} numberOfLines={1}>
              {otherPartyName}
            </Text>
            <View style={styles.statusOnlineRow}>
              <View style={[styles.statusDot, connected ? styles.statusDotOnline : styles.statusDotOffline]} />
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                {connected ? 'Real-time Encrypted' : 'Reconnecting...'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.dealRoomNavBtn} 
          onPress={() => router.push(`/deal/${dealId}` as any)}
        >
          <Ionicons name="document-text-outline" size={20} color="#16A34A" />
        </TouchableOpacity>
      </View>

      {/* Main Chat Body */}
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {loading ? (
          <View style={styles.centeredLoading}>
            <ActivityIndicator size="large" color={isDark ? colors.accent : colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading Secure Encrypted Messages...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="chatbubbles-outline" size={32} color="#16A34A" />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Encrypted Deal Room Chat</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Send a message to discuss legal terms, milestone verification, or payment arrangements.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, idx) => item.id || idx.toString()}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        {/* Bottom Input Action Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.inputField, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            value={inputMsg}
            onChangeText={setInputMsg}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputMsg.trim() || sending) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputMsg.trim() || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerPartnerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginHorizontal: 8,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0D1B3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerPartnerName: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusOnlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotOnline: {
    backgroundColor: '#16A34A',
  },
  statusDotOffline: {
    backgroundColor: '#94A3B8',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  dealRoomNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  dateHeaderContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginVertical: 2,
  },
  msgRowMe: {
    justifyContent: 'flex-end',
  },
  msgRowOther: {
    justifyContent: 'flex-start',
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0D1B3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 3,
  },
  bubbleMe: {
    backgroundColor: '#0D1B3E',
    borderColor: '#162544',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  msgContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  msgContentMe: {
    color: '#FFFFFF',
  },
  msgFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  timeText: {
    fontSize: 10,
  },
  timeTextMe: {
    color: '#94A3B8',
  },
  inputBar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
  },
  inputField: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
