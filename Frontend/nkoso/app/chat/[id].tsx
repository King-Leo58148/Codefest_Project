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
import { Colors } from '@/constants/Colors';
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

  const [deal, setDeal] = useState<Deal | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState('');

  const stompClient = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!dealId) return;

    // Fetch deal info & initial messages
    setLoading(true);
    setLoadError('');

    Promise.all([
      getDeal(dealId).catch(() => null),
      getDealMessages(dealId).catch(() => []),
    ])
      .then(([dealData, msgData]) => {
        if (dealData) setDeal(dealData);
        setMessages(msgData || []);
      })
      .catch((err) => {
        console.error('Chat load error:', err);
        setLoadError('Could not load chat messages.');
      })
      .finally(() => setLoading(false));

    // Connect WebSocket
    const connectWS = async () => {
      const token = await AsyncStorage.getItem('token');

      stompClient.current = new Client({
        webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
        connectHeaders: { Authorization: `Bearer ${token}` },
        debug: () => {},
        onConnect: () => {
          setConnected(true);
          stompClient.current.subscribe(`/topic/deal/${dealId}`, (msg: any) => {
            try {
              const newMsg = JSON.parse(msg.body);
              setMessages((prev) => {
                // Avoid duplicate messages if already present
                if (prev.some((m) => m.id === newMsg.id && newMsg.id)) {
                  return prev;
                }
                return [...prev, newMsg];
              });
              scrollToBottom();
            } catch (e) {
              console.error('Error parsing WS message:', e);
            }
          });
        },
        onStompError: (frame) => {
          console.error('STOMP Error:', frame);
          setConnected(false);
        },
        onDisconnect: () => {
          setConnected(false);
        },
      });

      stompClient.current.activate();
    };

    connectWS();

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [dealId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  const handleSend = async () => {
    if (!inputMsg.trim() || sending || !dealId) return;
    const msgText = inputMsg.trim();
    setInputMsg('');
    setSending(true);

    try {
      const newMsg = await sendDealMessage(dealId, msgText);
      if (newMsg && newMsg.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      } else {
        // Optimistic update if backend didn't return full object immediately
        const tempMsg = {
          id: Date.now().toString(),
          content: msgText,
          sentAt: new Date().toISOString(),
          sender: {
            email: user?.email,
            fullName: user?.name,
          },
        };
        setMessages((prev) => [...prev, tempMsg]);
      }
      scrollToBottom();
    } catch (err) {
      console.error('Send error:', err);
      Alert.alert('Send Failed', 'Could not send message. Please try again.');
      setInputMsg(msgText);
    } finally {
      setSending(false);
    }
  };

  const businessInitials = deal?.businessName
    ? deal.businessName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'DL';

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isMe = item.sender?.email === user?.email;
    const showHeaderDate =
      index === 0 ||
      formatDateHeader(item.sentAt) !== formatDateHeader(messages[index - 1]?.sentAt);

    return (
      <View key={item.id || index}>
        {showHeaderDate && (
          <View style={styles.dateHeaderContainer}>
            <View style={styles.dateHeaderPill}>
              <Text style={styles.dateHeaderText}>{formatDateHeader(item.sentAt)}</Text>
            </View>
          </View>
        )}

        <View style={[styles.msgContainer, isMe ? styles.msgMe : styles.msgOther]}>
          {!isMe && (
            <Text style={styles.msgSenderName}>
              {item.sender?.fullName || 'User'}
            </Text>
          )}

          <View style={[styles.msgBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
            <Text style={[styles.msgText, isMe ? styles.textMe : styles.textOther]}>
              {item.content}
            </Text>
            <View style={styles.timeRow}>
              <Text style={[styles.timeText, isMe ? styles.timeTextMe : styles.timeTextOther]}>
                {formatMessageTime(item.sentAt || new Date().toISOString())}
              </Text>
              {isMe && (() => {
                const isRead = Boolean(item.isRead || item.read || item.status === 'READ');
                if (isRead) {
                  return (
                    <Ionicons
                      name="checkmark-done"
                      size={14}
                      color="#38BDF8"
                      style={{ marginLeft: 3 }}
                    />
                  );
                }
                if (connected) {
                  return (
                    <Ionicons
                      name="checkmark-done"
                      size={14}
                      color="rgba(255,255,255,0.65)"
                      style={{ marginLeft: 3 }}
                    />
                  );
                }
                return (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color="rgba(255,255,255,0.65)"
                    style={{ marginLeft: 3 }}
                  />
                );
              })()}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* ── WhatsApp Header Bar ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerTitleContainer}
          onPress={() => dealId && router.push({ pathname: '/deal/[id]', params: { id: dealId } })}
          activeOpacity={0.8}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{businessInitials}</Text>
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {deal?.businessName || 'Deal Discussion'}
            </Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, connected ? styles.dotConnected : styles.dotConnecting]} />
              <Text style={styles.statusSubtitle}>
                {connected ? 'Online · Tap for deal room' : 'Connecting...'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={() => dealId && router.push({ pathname: '/deal/[id]', params: { id: dealId } })}
          activeOpacity={0.75}
        >
          <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── WhatsApp Chat Wallpaper & Message List ── */}
      <View style={styles.chatWall}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : loadError ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={44} color={Colors.accentRed} />
            <Text style={styles.errorText}>{loadError}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                setLoading(true);
                getDealMessages(dealId)
                  .then(setMessages)
                  .finally(() => setLoading(false));
              }}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, i) => item.id?.toString() || i.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={scrollToBottom}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.encryptionCard}>
                <Ionicons name="lock-closed" size={13} color="#856404" />
                <Text style={styles.encryptionText}>
                  Private Deal Room Chat. Messages are encrypted and shared only between the investor and business owner.
                </Text>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBg}>
                  <Ionicons name="chatbubbles" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>Start Private Discussion</Text>
                <Text style={styles.emptyDetail}>
                  Send a message to discuss payment terms, timeline, or ask questions about {deal?.businessName || 'this deal'}.
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* ── WhatsApp Sticky Input Bar ── */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputArea}>
          <View style={styles.inputPill}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textMuted}
              value={inputMsg}
              onChangeText={setInputMsg}
              multiline
              maxLength={1000}
            />
          </View>

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
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" style={{ marginLeft: 2 }} />
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
    backgroundColor: Colors.surface,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  backBtn: {
    padding: 6,
    marginRight: 4,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dotConnected: {
    backgroundColor: Colors.accent,
  },
  dotConnecting: {
    backgroundColor: '#D97706',
  },
  statusSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  headerActionBtn: {
    padding: 6,
    marginLeft: 4,
  },

  // ── Chat Wall ──
  chatWall: {
    flex: 1,
    backgroundColor: '#EFEAE2', // WhatsApp light wallpaper tone
  },
  listContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingBottom: 24,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textMuted,
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },

  // ── Encrypted notice ──
  encryptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEBAA',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
    alignSelf: 'center',
    maxWidth: '92%',
  },
  encryptionText: {
    flex: 1,
    fontSize: 11,
    color: '#856404',
    lineHeight: 15,
    fontWeight: '500',
  },

  // ── Empty State ──
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingHorizontal: 28,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptyDetail: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },

  // ── Date Headers ──
  dateHeaderContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateHeaderPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // ── Messages ──
  msgContainer: {
    marginBottom: 8,
    maxWidth: '82%',
  },
  msgMe: {
    alignSelf: 'flex-end',
  },
  msgOther: {
    alignSelf: 'flex-start',
  },
  msgSenderName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
    marginLeft: 4,
  },
  msgBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleMe: {
    backgroundColor: '#005C4B', // WhatsApp signature dark teal/green
    borderTopRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 2,
  },
  msgText: {
    fontSize: 14.5,
    lineHeight: 20,
  },
  textMe: {
    color: '#FFFFFF',
  },
  textOther: {
    color: Colors.textPrimary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  timeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  timeTextMe: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  timeTextOther: {
    color: Colors.textMuted,
  },

  // ── Input Area ──
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 8,
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    minHeight: 44,
    maxHeight: 120,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: Colors.textPrimary,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
});
