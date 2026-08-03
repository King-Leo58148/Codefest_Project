import 'text-encoding';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Colors } from '@/constants/Colors';
import { cardStyles } from '@/components/ui/Card';
import { ScreenState } from '@/components/ui/ScreenState';
import { getDealMessages, sendDealMessage } from '@/services/api';
import { BASE_URL } from '@/services/backendClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/authStore';

export default function DealChat({ dealId }: { dealId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [connected, setConnected] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadError, setLoadError] = useState('');
  const stompClient = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    // 1. Fetch initial messages
    setLoadingMessages(true);
    setLoadError('');
    getDealMessages(dealId)
      .then((data) => {
        setMessages(data);
      })
      .catch((error) => {
        console.error(error);
        setLoadError('Could not load messages.');
      })
      .finally(() => setLoadingMessages(false));

    // 2. Connect WebSocket
    const connectWS = async () => {
      const token = await AsyncStorage.getItem('token');
      
      stompClient.current = new Client({
        webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
        connectHeaders: { Authorization: `Bearer ${token}` },
        debug: () => {},
        onConnect: () => {
          setConnected(true);
          stompClient.current.subscribe(`/topic/deal/${dealId}`, (msg: any) => {
            const newMsg = JSON.parse(msg.body);
            setMessages((prev) => [...prev, newMsg]);
            scrollToBottom();
          });
        },
        onStompError: (frame) => {
          console.error('STOMP Error:', frame);
        }
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
    }, 100);
  };

  const handleSend = async () => {
    if (!inputMsg.trim()) return;
    try {
      await sendDealMessage(dealId, inputMsg);
      setInputMsg('');
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender?.email === user?.email;
    return (
      <View style={[styles.msgContainer, isMe ? styles.msgMe : styles.msgOther]}>
        <Text style={styles.msgSender}>
          {isMe ? 'You' : item.sender?.fullName || 'User'} • {new Date(item.sentAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <View style={[styles.msgBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.msgText, isMe ? styles.textMe : styles.textOther]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Deal Room Chat</Text>
        <View style={[styles.statusBadge, connected ? styles.statusConnected : styles.statusConnecting]}>
          <Text style={[styles.statusText, connected ? styles.statusTextConnected : styles.statusTextConnecting]}>
            {connected ? 'Live' : 'Connecting...'}
          </Text>
        </View>
      </View>
      
      <View style={styles.chatArea}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, i) => item.id?.toString() || i.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loadingMessages ? (
              <ScreenState loading title="Loading messages" />
            ) : loadError ? (
              <ScreenState icon="alert-circle-outline" title={loadError} />
            ) : (
              <ScreenState
                icon="chatbubble-outline"
                title="No messages yet"
                detail="Send a message to start negotiating."
              />
            )
          }
        />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={inputMsg}
            onChangeText={setInputMsg}
            placeholderTextColor={Colors.textMuted}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, (!connected || !inputMsg.trim()) && styles.sendBtnDisabled]} 
            onPress={handleSend}
            disabled={!connected || !inputMsg.trim()}
            activeOpacity={0.72}
          >
            <Ionicons name="send" size={16} color={Colors.surface} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...cardStyles.surface,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    height: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusConnected: {
    backgroundColor: '#F0FDF4',
  },
  statusConnecting: {
    backgroundColor: '#FFFBEB',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusTextConnected: {
    color: '#15803D',
  },
  statusTextConnecting: {
    color: '#B45309',
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
    flexGrow: 1,
  },
  msgContainer: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  msgMe: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  msgOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  msgSender: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  msgBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  textMe: {
    color: '#FFFFFF',
  },
  textOther: {
    color: Colors.textPrimary,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 40,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border,
  },
});
