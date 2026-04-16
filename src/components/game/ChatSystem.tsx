import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db } from '../../firebase/config';
import { ref, push, onValue, limitToLast, query, serverTimestamp } from 'firebase/database';
import { Send, Smile, MessageSquareText, X, MessageCircle, Ghost, Globe, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  photoURL?: string;
}

interface ChatProps {
  roomId?: string; 
  username: string;
  photoURL?: string;
  colors: any;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  isEmbedded?: boolean;
}

// Memoized individual message for extreme performance
const ChatMessage = React.memo(({ m, isMe, colors }: { m: Message, isMe: boolean, colors: any }) => (
  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-3 px-1`}>
    <div className={`flex gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isMe && (
         <div className="w-8 h-8 rounded-xl border-2 border-orange-500/30 overflow-hidden shrink-0 mt-auto shadow-md">
            <img src={m.photoURL || "/img/MDLogo.png"} alt="" className="w-full h-full object-cover" />
         </div>
      )}
      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && (
          <span className="text-[8px] font-black uppercase mb-1 ml-1 opacity-60 flex items-center gap-1" style={{ color: colors.textAccent }}>
            <div className="w-1 h-1 rounded-full bg-orange-500" /> {m.sender}
          </span>
        )}
        <div 
          className={`p-3 rounded-2xl text-[11px] font-bold shadow-xl relative border-b-4 ${isMe ? 'rounded-tr-none' : 'rounded-tl-none hover:-translate-x-1'} transition-all`}
          style={{ 
            backgroundColor: isMe ? colors.accent : colors.bgCard,
            color: isMe ? '#fff' : colors.textPrimary,
            borderColor: isMe ? colors.accentBorder : colors.borderSecondary,
          }}
        >
          <p className="break-words leading-tight whitespace-pre-wrap">{m.text}</p>
        </div>
      </div>
    </div>
  </div>
));

const ChatSystem = React.memo(({ roomId, username, photoURL, colors, isOpen, setIsOpen, isEmbedded = false }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeChannel, setActiveChannel] = useState<'global' | 'squad'>('global');
  const [localUnreadCounts, setLocalUnreadCounts] = useState({ global: 0, squad: 0 });
  const { isSidebarOpen, setUnreadCount } = useUIStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    setActiveChannel(roomId ? 'squad' : 'global');
  }, [roomId]);

  const globalPath = 'global_chat';
  const squadPath = roomId ? `rooms/${roomId}/chat` : null;

  useEffect(() => {
    setUnreadCount(localUnreadCounts.global + localUnreadCounts.squad);
  }, [localUnreadCounts, setUnreadCount]);

  useEffect(() => {
    if (isSidebarOpen || isOpen) {
        setLocalUnreadCounts(prev => ({ ...prev, [activeChannel]: 0 }));
    }
  }, [isSidebarOpen, isOpen, activeChannel]);

  useEffect(() => {
    const path = activeChannel === 'global' ? globalPath : squadPath;
    if (!path && activeChannel === 'squad') {
        setMessages([]);
        return;
    }

    const currentRef = query(ref(db, path || globalPath), limitToLast(50));
    const unsubscribe = onValue(currentRef, (snapshot) => {
      const data = snapshot.val();
      const messageList = data ? Object.entries(data).map(([id, m]: [string, any]) => ({ id, ...m })) : [];
      setMessages(messageList);
      
      // Auto-scroll logic
      if (scrollRef.current) {
        const isNearBottom = scrollRef.current.scrollHeight - scrollRef.current.scrollTop <= scrollRef.current.clientHeight + 150;
        if (isNearBottom || initialLoadRef.current) {
          setTimeout(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }, 50);
          initialLoadRef.current = false;
        }
      }
    });

    return () => unsubscribe();
  }, [activeChannel, squadPath, isSidebarOpen, isOpen]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const targetPath = activeChannel === 'global' ? globalPath : squadPath;
    if (!targetPath) return;

    try {
      await push(ref(db, targetPath), {
        sender: username,
        text: inputText.trim(),
        photoURL: photoURL || '',
        timestamp: serverTimestamp()
      });
      setInputText('');
      setShowEmoji(false);
    } catch (err) {
      console.error("Chat error:", err);
    }
  };

  const renderedMessages = useMemo(() => {
    return messages.map((m, idx) => (
      <ChatMessage key={m.id || idx} m={m} isMe={m.sender === username} colors={colors} />
    ));
  }, [messages, username, colors]);

  const emojis = ["🔥", "🍃", "⚡", "🍥", "⚔️", "👍", "🦊", "👁️"];

  return (
    <div className={`flex flex-col h-full bg-transparent overflow-hidden ${isEmbedded ? '' : 'w-[320px] sm:w-[400px] h-[500px] max-h-[85vh] rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] border-4'}`}
         style={isEmbedded ? {} : { backgroundColor: colors.bgTertiary, borderColor: colors.borderPrimary }}>
      
      <div className="p-3 border-b-2" style={{ backgroundColor: colors.headerBg, borderColor: colors.borderPrimary }}>
        <div className="flex items-center justify-between px-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-xl shadow-lg">
              <MessageSquareText className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tighter text-white italic">Village Comms</span>
              <span className="text-[8px] font-bold uppercase opacity-50 tracking-[0.2em] text-white">Encrypted Channel</span>
            </div>
          </div>
          {setIsOpen && (
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
              <X className="w-5 h-5 text-white/50" />
            </button>
          )}
        </div>

        <div className="flex gap-2 p-1 bg-black/20 rounded-2xl border border-white/5">
          {(['global', 'squad'] as const).map(ch => (
             <button 
               key={ch}
               onClick={() => setActiveChannel(ch)}
               disabled={ch === 'squad' && !roomId}
               className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden ${activeChannel === ch ? 'text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:text-slate-200'} ${ch === 'squad' && !roomId ? 'opacity-20 grayscale' : ''}`}
               style={{ backgroundColor: activeChannel === ch ? colors.accent : 'transparent' }}
             >
               {activeChannel === ch && <motion.div layoutId="active-ch" className="absolute inset-0 bg-white/5" />}
               <span className="relative z-10 flex items-center justify-center gap-2">
                 {ch === 'global' ? <Globe className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                 {ch}
               </span>
               {localUnreadCounts[ch] > 0 && activeChannel !== ch && (
                 <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full animate-ping" />
               )}
             </button>
          ))}
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 custom-scrollbar overscroll-contain flex flex-col relative"
        style={{ backgroundColor: `${colors.bgPrimary}10` }}
      >
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
        <div className="mt-auto" />
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-10 text-center scale-110">
            <Ghost className="w-12 h-12 mb-4" />
            <p className="text-[12px] font-black uppercase tracking-[0.4em]">Silence in the Village</p>
          </div>
        ) : renderedMessages}
      </div>

      <div className="p-3 border-t-2 bg-black/10 backdrop-blur-md" style={{ borderColor: colors.borderSecondary }}>
        <AnimatePresence>
          {showEmoji && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="flex flex-wrap gap-3 mb-3 p-4 bg-slate-900/90 rounded-[2rem] border border-white/10 shadow-2xl">
              {emojis.map(e => (
                <button key={e} onClick={() => { setInputText(p => p + e); setShowEmoji(false); }} className="text-xl hover:scale-150 transition-transform active:scale-90">{e}</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={sendMessage} className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5 focus-within:border-orange-500/50 transition-all">
          <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
            <Smile className="w-6 h-6 text-orange-500" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Relay message to the shinobi..."
            className="flex-1 bg-transparent border-0 focus:ring-0 text-[13px] font-bold px-1 outline-none text-white placeholder:text-slate-500"
          />
          <button type="submit" disabled={!inputText.trim()} 
                  className="p-3 bg-orange-600 text-white rounded-xl transition-all active:scale-95 disabled:opacity-20 shadow-lg shadow-orange-600/20" 
                  style={{ backgroundColor: colors.accent }}>
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
});

export default ChatSystem;
