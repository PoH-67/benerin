import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, Bot, Sparkles, MessageSquare, Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  sendMessage, subscribeToMessages, getAIDiagnosis, getAIQuickResponse, deleteChatHistory
} from '../services/chatService';

export const OrderChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData } = useAuth();
  const { order } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const chatId = order?.id || 'default';

  useEffect(() => {
    if (!order) { navigate('/aktivitas'); return; }
    const unsub = subscribeToMessages(chatId, setMessages);
    return unsub;
  }, [chatId, order, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const QUICK_QUESTIONS = [
    'Bapak ada dimana?',
    'Berapa lama lagi sampai?',
    'Apakah alatnya sudah lengkap?',
    'Berapa total biayanya?',
  ];

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setLoading(true);

    try {
      await sendMessage(chatId, user?.uid || 'user', userData?.name || 'Pengguna', msg);
      const aiReply = await getAIQuickResponse(msg, order.workerName, order.location);
      setTimeout(async () => {
        await sendMessage(chatId, order.workerId || 'worker', order.workerName || 'Tukang', aiReply, true);
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] px-4 max-w-3xl mx-auto py-2">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-2xl mb-2">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-amber-400 text-neutral-950 font-black flex items-center justify-center">
          {order?.workerName?.charAt(0) || 'T'}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm text-white">{order?.workerName || 'Tukang Benerin'}</h3>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">● Online • Siap Menjawab</span>
        </div>
      </div>

      {/* Quick Chat Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-400/50 text-neutral-300 hover:text-amber-400 text-xs font-semibold whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
        {messages.length === 0 && (
          <div className="text-center py-12 text-xs text-neutral-500">
            Ketik pesan atau pilih pertanyaan cepat di atas untuk chat dengan tukang.
          </div>
        )}
        {messages.map((m) => {
          const isMe = m.senderId === user?.uid || m.senderName !== order?.workerName;
          return (
            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                isMe
                  ? 'bg-amber-400 text-neutral-950 font-medium rounded-tr-xs'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-xs'
              }`}>
                {m.isAI && !isMe && (
                  <span className="block text-[9px] font-bold text-amber-400 mb-1">🤖 Quick AI Auto-reply</span>
                )}
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <div className="pt-2">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Tulis pesan ke tukang..."
            className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 focus:border-amber-400 rounded-xl text-xs text-neutral-100 outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="px-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-neutral-950 font-bold rounded-xl"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AIChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      isUser: false,
      text: 'Halo! 👋 Saya Asisten AI Benerin. Ceritakan kendala atau kerusakan di rumah/alat elektronik Anda, saya akan bantu diagnosis dan perkirakan biayanya!',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const text = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), isUser: true, text }]);
    setLoading(true);

    try {
      const response = await getAIDiagnosis(text);
      setMessages(prev => [...prev, { id: Date.now() + 1, isUser: false, text: response }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, isUser: false, text: 'Maaf, ada kendala koneksi AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-90px)] px-4 max-w-3xl mx-auto py-2">
      <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.isUser ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs md:text-sm leading-relaxed ${
              m.isUser
                ? 'bg-amber-400 text-neutral-950 font-medium rounded-tr-xs'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-xs whitespace-pre-wrap'
            }`}>
              {!m.isUser && (
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] mb-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Diagnosis Benerin</span>
                </div>
              )}
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-xs text-amber-400 flex items-center gap-2 py-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            AI sedang menganalisis kerusakan...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="pt-2">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ketik keluhan (contoh: AC netes air & gak dingin)..."
            className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 focus:border-amber-400 rounded-xl text-xs text-neutral-100 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-neutral-950 font-bold rounded-xl cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatPage = () => {
  const [tab, setTab] = useState('ai');
  return (
    <div className="max-w-3xl mx-auto space-y-2">
      <div className="flex p-1 bg-neutral-900 border border-neutral-800 rounded-2xl mx-4 mt-2">
        <button
          onClick={() => setTab('ai')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            tab === 'ai' ? 'bg-amber-400 text-neutral-950 shadow-md' : 'text-neutral-400'
          }`}
        >
          Diagnosis Kerusakan (AI)
        </button>
        <button
          onClick={() => setTab('tukang')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            tab === 'tukang' ? 'bg-amber-400 text-neutral-950 shadow-md' : 'text-neutral-400'
          }`}
        >
          Chat Tukang
        </button>
      </div>

      {tab === 'ai' ? <AIChatPage /> : (
        <div className="p-8 text-center text-neutral-500 text-xs">
          Buka menu <span className="text-amber-400 font-bold">Aktivitas &gt; Chat</span> pada pesanan yang sedang berjalan untuk berkomunikasi langsung dengan tukang.
        </div>
      )}
    </div>
  );
};

export default ChatPage;
