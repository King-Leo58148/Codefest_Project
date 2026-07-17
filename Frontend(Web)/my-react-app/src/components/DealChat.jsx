import { useState, useEffect, useRef } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '../api';
import BASE_URL from '../config';

export default function DealChat({ dealId }) {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [connected, setConnected] = useState(false);
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);
  const currentUserEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    // 1. Fetch history
    api.get(`/api/deals/${dealId}/messages`).then(res => {
      setMessages(res.data);
      scrollToBottom();
    }).catch(console.error);

    // 2. Connect WebSocket
    const token = localStorage.getItem("accesstoken");
    const socket = new SockJS(`${BASE_URL}/ws`);
    
    stompClient.current = Stomp.over(socket);
    stompClient.current.debug = () => {};

    stompClient.current.connect({ Authorization: `Bearer ${token}` }, () => {
      setConnected(true);
      stompClient.current.subscribe(`/topic/deal/${dealId}`, (msg) => {
        const newMsg = JSON.parse(msg.body);
        setMessages(prev => [...prev, newMsg]);
        scrollToBottom();
      });
    }, (err) => {
      console.error('STOMP connection error:', err);
    });

    return () => {
      if (stompClient.current) {
        stompClient.current.disconnect();
      }
    };
  }, [dealId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    try {
      await api.post(`/api/deals/${dealId}/messages`, { content: inputMsg });
      setInputMsg('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border border-slate-200 rounded-3xl bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-900">Deal Room Chat</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${connected ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {connected ? 'Live' : 'Connecting...'}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm mt-10">
            No messages yet. Send a message to start negotiating.
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender?.email === currentUserEmail;
          return (
            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mb-1 px-1">
                {isMe ? 'You' : msg.sender?.fullName || 'User'} • {new Date(msg.sentAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
              <div className={`px-4 py-2 text-sm rounded-2xl max-w-[85%] ${isMe ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white flex gap-2">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
        />
        <button type="submit" disabled={!connected || !inputMsg.trim()} className="bg-slate-900 text-white px-5 py-2 rounded-2xl text-sm font-medium hover:bg-slate-800 transition disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  );
}
