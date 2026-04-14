import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { getRankFromXP, getXPForNextRank, ACHIEVEMENTS, RANKS } from '../../store/useProgressionStore';
import { auth, db } from '../../firebase/config';
import { ref, push, set, onValue, update, get, remove } from 'firebase/database';
import { LogOut, Trash2, Plus, User, Sword, Award, Settings, Camera, QrCode, Edit2, Gift, History, Sparkles, Users, Play, Loader2, ScrollText, Trophy, Coins, Image as ImageIcon, Medal, Zap, Star, MessageSquareText, Menu, X } from 'lucide-react';
import Footer from '../layout/Footer';
import CurrencyBill from '../common/CurrencyBill';
import Leaderboard from './Leaderboard';
import Shop from './Shop';
import MiniGame from './MiniGame';
import MissionHistory from './MissionHistory';
import ThemeSelector from '../common/ThemeSelector';
import AchievementToast from '../common/AchievementToast';
import QRScanner from './QRScanner';
import { useUIStore } from '../../store/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingShuriken, RealisticBackground, ThreeDCard } from '../common/UIComponents';
import ChatSystem from '../game/ChatSystem';
import { QRCodeSVG } from 'qrcode.react';

const ScrollPaper = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const { colors } = useThemeStore();
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 border-4 rounded-sm rotate-[0.5deg] shadow-lg" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.borderPrimary }} />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')] opacity-30 pointer-events-none rounded-sm" />
      <div className="relative z-10 p-4">
        {children}
      </div>
    </div>
  );
};

const QRModal = ({ roomId, onClose, colors }: { roomId: string, onClose: () => void, colors: any }) => (
  <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="p-8 rounded-[2rem] border-8 flex flex-col items-center gap-6 relative shadow-[0_0_50px_rgba(0,0,0,1)]"
      style={{ backgroundColor: colors.bgTertiary, borderColor: colors.borderPrimary }}
      onClick={e => e.stopPropagation()}
    >
      <div className="absolute -top-12 -left-12 opacity-20 rotate-12 pointer-events-none">
        <ScrollText size={100} style={{ color: colors.borderPrimary }} />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-1" style={{ color: colors.textPrimary }}>Mission Seal ID: {roomId}</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: colors.textSecondary }}>Scan to join this combat dispatch</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-2xl border-4" style={{ borderColor: `${colors.borderPrimary}33` }}>
        <QRCodeSVG value={`${window.location.origin}/game/${roomId}`} size={200} level="H" />
      </div>

      <button 
        onClick={onClose} 
        className="px-8 py-3 text-white font-black rounded-xl border-b-4 shadow-xl uppercase tracking-widest active:translate-y-1 transition-all"
        style={{ backgroundColor: colors.accent, borderColor: colors.accentBorder }}
      >
        Close Scroll
      </button>
    </motion.div>
  </div>
);

const FriendsList = ({ user, colors }: any) => {
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const friendsRef = ref(db, `users/${user.uid}/friends`);
    const unsub = onValue(friendsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list = Object.entries(data).map(([id, details]: [string, any]) => ({
          id,
          ...details
        }));
        setFriends(list);
      } else {
        setFriends([]);
      }
    });
    return () => unsub();
  }, [user]);

  return (
    <div className="space-y-3">
      <div className="p-3 bg-orange-600/10 rounded-xl border border-orange-500/20 mb-4">
        <p className="text-[10px] font-bold text-orange-800 uppercase tracking-widest text-center italic">Your Shinobi Alliance</p>
      </div>
      {friends.length === 0 ? (
        <div className="py-10 text-center opacity-40">
          <Users className="w-8 h-8 mx-auto mb-2" />
          <p className="text-xs font-black uppercase tracking-tighter">No allies recruited yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {friends.map(f => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={f.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/40 backdrop-blur-md border border-black/5 shadow-sm group hover:bg-white/60 transition-all"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-black/10">
                  <img src={f.photoURL || "/img/MDLogo.png"} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-xs uppercase truncate text-orange-950 italic">{f.username}</h4>
                <p className="text-[9px] font-black text-emerald-700 uppercase tracking-tighter">Ready for Mission</p>
              </div>
              <button
                onClick={async () => {
                  if (window.confirm(`Dissolve alliance with ${f.username}?`)) {
                    await remove(ref(db, `users/${user.uid}/friends/${f.id}`));
                  }
                }}
                className="p-2 opacity-0 group-hover:opacity-100 transition-all text-red-600 hover:scale-110"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const RoomItem = React.memo(({ room, user, colors, joinRoom, deleteRoom, setQrRoomId, setShowQRScanner }: any) => {
  const playerCount = Object.keys(room.players || {}).length;
  const isFull = playerCount >= 6;
  const isPlaying = room.status === 'playing';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, x: 5 }}
      className="room-item flex items-center justify-between p-4 sm:p-5 rounded-sm border-b-[6px] border-2 group relative overflow-hidden transition-all shadow-[0_10px_25px_rgba(0,0,0,0.3)]"
      style={{
        backgroundColor: colors.bgSecondary,
        borderColor: colors.borderPrimary,
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
        backgroundSize: '200px'
      }}
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-600 shadow-[0_0_15px_#ea580c] z-10" />
      <motion.div
        className="absolute -right-8 -bottom-8 w-24 h-24 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all"
      />

      <div className="min-w-0 flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 rounded-xl overflow-hidden border-2 shadow-inner border-black/10 rotate-3 group-hover:rotate-0 transition-transform">
          <img src={room.players?.[room.host]?.photoURL || "/img/MDLogo.png"} className="w-full h-full object-cover" alt="" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            {room.isPrivate && (
              <div className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-[8px] font-black text-red-500 flex items-center gap-1 animate-pulse">
                <Zap className="w-2 h-2" /> PRIVATE
              </div>
            )}
            <h3 className="font-black text-sm sm:text-lg uppercase italic tracking-tighter text-orange-950 truncate max-w-[120px] sm:max-w-none">{room.name}</h3>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[9px] font-bold uppercase text-[#5c3c24] opacity-70 tracking-widest flex items-center gap-1">
              <User className="w-2.5 h-2.5 opacity-40 fill-current" /> SQUAD: {room.players?.[room.host]?.username || 'Unknown Shinobi'}
            </p>
            <p className="text-[9px] font-black text-orange-700/60 uppercase tracking-tighter">ID: {room.id}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/10 border border-black/5 shadow-inner">
            <Users className="w-3.5 h-3.5 text-orange-500" />
            <span className="font-black text-sm">{playerCount}/6</span>
          </div>
          {isPlaying && <span className="text-[7px] font-black text-red-700 animate-pulse mt-1 tracking-widest italic uppercase">- IN BATTLE -</span>}
        </div>
        <div className="flex gap-2 items-center">
          {room.host === user?.uid && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => deleteRoom(room.id)} className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all shadow-sm"><Trash2 className="w-5 h-5" /></motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setQrRoomId(room.id)}
            className="p-2.5 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all shadow-sm border border-emerald-500/20 bg-emerald-500/5"
            title="Show Room QR Code"
          >
            <QrCode className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (room.isPrivate && room.host !== user?.uid) ? setShowQRScanner(true) : joinRoom(room.id)}
            disabled={isFull || isPlaying}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-black uppercase text-[10px] sm:text-[11px] tracking-tight sm:tracking-[0.2em] transition-all border-b-4 shadow-xl active:translate-y-1 ${isFull || isPlaying ? 'grayscale opacity-50 cursor-not-allowed' : 'text-white'}`}
            style={{
              backgroundColor: isFull || isPlaying ? '#64748b' : (room.isPrivate && room.host !== user?.uid) ? '#10b981' : colors.accent,
              borderColor: isFull || isPlaying ? '#334155' : (room.isPrivate && room.host !== user?.uid) ? '#065f46' : colors.accentBorder
            }}
          >
            {isPlaying ? 'OCCUPIED' : isFull ? 'MAXED' : (room.isPrivate && room.host !== user?.uid) ? 'QR SCAN' : 'ENGAGE'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});



const TabContent = React.memo(({
  activeTab,
  newRoomName,
  setNewRoomName,
  setIsPrivateRoom,
  isPrivateRoom,
  createRoom,
  loading,
  colors,
  joinRoomId,
  setJoinRoomId,
  joinRoom,
  setShowQRScanner,
  userProfile,
  claimDailyReward,
  rank
}: any) => {
  if (activeTab === 'shop') return <div className="h-full"><Shop /></div>;
  if (activeTab === 'ranking') return <div className="h-[400px] sm:h-full"><Leaderboard /></div>;
  if (activeTab === 'train') return <div className="h-full"><MiniGame /></div>;
  if (activeTab === 'history') return <div className="h-full"><MissionHistory /></div>;
  if (activeTab === 'friends') return <div className="h-full"><FriendsList user={userProfile} colors={colors} /></div>;

  return (
    <div className="space-y-4">
      {/* Mobile Info Overlay */}
      <div className="xs:hidden flex items-center justify-between px-2 text-[8px] font-black uppercase opacity-60" style={{ color: colors.textPrimary }}>
        <span>{rank.badge} {rank.name}</span>
        <span>LVL {Math.floor((userProfile?.xp || 0) / 1000) + 1}</span>
      </div>

      {/* Daily Reward Banner */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={claimDailyReward}
        className="sm:hidden w-full p-2.5 bg-gradient-to-r from-emerald-600/20 to-emerald-500/5 border-2 border-emerald-500/30 rounded-2xl flex items-center justify-between group transition-all shadow-lg overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <Gift className="w-4 h-4 text-emerald-500" />
          <span className="text-[9px] font-black uppercase text-emerald-400 tracking-tighter italic">Daily Jutsu Training</span>
        </div>
        <span className="text-[8px] font-black uppercase text-emerald-600 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">+100 ₱</span>
      </motion.button>

      <div className="p-3 sm:p-5 rounded-[1.5rem] bg-black/10 backdrop-blur-md border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 paper-texture opacity-5 pointer-events-none" />
        <div className="flex flex-col gap-6">
          <div className="flex-1 space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-lg font-black flex items-center gap-3 uppercase tracking-tighter italic text-glow" style={{ color: colors.textPrimary }}>
                <Plus className="w-5 h-5 text-orange-500" /> Dispatch Scroll
              </h2>
              <div className="w-8 h-1 bg-orange-500/30 rounded-full" />
            </div>

            <div className="space-y-3">
              <div className="relative group/input">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Secret Mission Title..."
                  className="w-full px-4 py-4 rounded-2xl border-2 transition-all outline-none font-black text-sm focus:border-orange-500 shadow-inner group-hover/input:border-white/10"
                  style={{ backgroundColor: colors.bgInput, borderColor: colors.borderPrimary, color: colors.textPrimary }}
                />
                <Edit2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrivateRoom(false)}
                  className={`py-3 text-[10px] font-black uppercase rounded-xl border-b-4 transition-all btn-shinobi shadow-lg ${!isPrivateRoom ? 'bg-orange-600 border-orange-900 text-white' : 'bg-black/20 border-black/10 text-slate-500 opacity-60'}`}>
                  Public Seal
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrivateRoom(true)}
                  className={`py-3 text-[10px] font-black uppercase rounded-xl border-b-4 transition-all btn-shinobi shadow-lg ${isPrivateRoom ? 'bg-red-600 border-red-900 text-white' : 'bg-black/20 border-black/10 text-slate-500 opacity-60'}`}>
                  Private Seal
                </button>
              </div>

              <button
                type="button"
                onClick={() => createRoom(isPrivateRoom)}
                disabled={loading}
                className={`w-full text-white font-black rounded-2xl py-5 transition-all text-xs border-b-4 flex items-center justify-center gap-3 shadow-2xl btn-shinobi chakra-pulse ${isPrivateRoom ? 'bg-red-700 border-red-950 shadow-red-900/40' : 'bg-orange-600 border-orange-950 shadow-orange-900/40'}`}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <div className="p-1 bg-white/20 rounded-lg"><Sword className="w-4 h-4" /></div>
                    <span className="uppercase tracking-[0.2em]">{isPrivateRoom ? 'DEPLOY ANBU MISSION' : 'DEPLOY SHINOBI MISSION'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="hidden sm:block w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          <div className="flex-1 space-y-4 relative z-10">
            <h2 className="text-sm sm:text-lg font-black flex items-center gap-3 uppercase tracking-tighter italic" style={{ color: colors.textPrimary }}>
              <QrCode className="w-5 h-5 text-emerald-500" /> Intel Intercept
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Target Scroll ID..."
                className="w-full px-4 py-4 rounded-2xl border-2 transition-all outline-none font-black text-sm focus:border-emerald-500 shadow-inner"
                style={{ backgroundColor: colors.bgInput, borderColor: colors.borderPrimary, color: colors.textPrimary }}
              />
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => joinRoom(joinRoomId)} disabled={!joinRoomId.trim()} className="col-span-2 text-white font-black rounded-xl py-4 text-[11px] border-b-4 flex items-center justify-center gap-2 hover:brightness-110 active:translate-y-1 shadow-xl btn-shinobi disabled:grayscale" style={{ backgroundColor: '#0ea5e9', borderColor: '#0c4a6e' }}>
                  <Play className="w-4 h-4" /> INTERCEPT
                </button>
                <button type="button" onClick={() => setShowQRScanner(true)} className="col-span-1 text-white font-black rounded-xl py-4 text-[11px] border-b-4 flex items-center justify-center gap-2 hover:brightness-110 active:translate-y-1 shadow-xl btn-shinobi" style={{ backgroundColor: '#10b981', borderColor: '#047857' }}>
                  <Camera className="w-4 h-4" /> SCAN
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const CornerKunai = ({ className = "" }: { className?: string }) => (
  <div className={`absolute w-8 h-8 opacity-20 pointer-events-none ${className}`}>
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5L12 2Z" />
    </svg>
  </div>
);

interface Room {
  id: string;
  name: string;
  host: string;
  players: Record<string, { username: string; isReady: boolean; photoURL?: string }>;
  status: 'waiting' | 'playing';
  isPrivate?: boolean;
}

export default function Lobby() {
  const { user, profile, setProfile } = useAuthStore();
  const { colors, currentTheme } = useThemeStore();
  const { unreadCount, toggleSidebar } = useUIStore();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'mission' | 'shop' | 'ranking' | 'train' | 'history' | 'friends'>('mission');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [qrRoomId, setQrRoomId] = useState<string | null>(null);
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);
  const [showFriendsSidebar, setShowFriendsSidebar] = useState(false);
  const initialPlayerCount = useRef<number>(0);
  const navigate = useNavigate();

  // Auto-close QR Modal when someone joins
  useEffect(() => {
    if (qrRoomId) {
      const room = rooms.find(r => r.id === qrRoomId);
      if (room) {
        const currentCount = Object.keys(room.players || {}).length;
        if (initialPlayerCount.current === 0) {
          initialPlayerCount.current = currentCount;
        } else if (currentCount > initialPlayerCount.current) {
          // Someone joined!
          setTimeout(() => {
            setQrRoomId(null);
            initialPlayerCount.current = 0;
          }, 1000); // Small delay for visual confirmation
        }
      }
    } else {
      initialPlayerCount.current = 0;
    }
  }, [qrRoomId, rooms]);

  // Optimized Chakra Particle with CSS Animations for zero lag
  const ChakraParticle = React.memo(({ color }: { color: string }) => {
    const [style, setStyle] = useState<any>(null);

    useEffect(() => {
      const isMobile = window.innerWidth < 768;
      // Drastically reduce particles on mobile
      if (isMobile && Math.random() > 0.15) return;

      const duration = 10 + Math.random() * 10;
      const delay = Math.random() * 10;
      const left = Math.random() * 100;
      const size = 1 + Math.random() * 3;

      setStyle({
        left: `${left}%`,
        bottom: '-20px',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        animation: `chakra-rise ${duration}s linear ${delay}s infinite`,
        opacity: 0,
        filter: 'blur(1px)',
        position: 'absolute' as const,
        borderRadius: '50%',
        pointerEvents: 'none' as const,
        zIndex: 5
      });
    }, [color]);

    if (!style) return null;

    return <div style={style} className="chakra-particle" />;
  });

  // Heartbeat - Active Status
  useEffect(() => {
    if (!user) return;
    const heartbeatRef = ref(db, `users/${user.uid}`);
    const updateHeartbeat = () => update(heartbeatRef, { lastActive: Date.now() });
    updateHeartbeat();
    const interval = setInterval(updateHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const userRef = ref(db, `users/${user.uid}`);
    const unsubUser = onValue(userRef, (snap) => {
      const data = snap.val();
      if (data) {
        setUserProfile(data);
        setProfile(data); // Always sync store profile with DB updates
      }
      setHasLoaded(true);
    });

    const roomsRef = ref(db, 'rooms');
    const unsubRooms = onValue(roomsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const roomsList = Object.entries(data).map(([id, room]: [string, any]) => ({
          id,
          ...room
        }));
        setRooms(roomsList);
      } else {
        setRooms([]);
      }
    });

    return () => {
      unsubUser();
      unsubRooms();
    };
  }, [user, profile, setProfile]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/trailer');
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Scroll size too large! Please choose an image smaller than 2MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const image = new Image();
        image.src = reader.result as string;
        image.onload = async () => {
          // SIMPLE CROP TO SQUARE
          const canvas = document.createElement('canvas');
          const size = Math.min(image.width, image.height);
          canvas.width = 400;
          canvas.height = 400;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(
              image,
              (image.width - size) / 2, (image.height - size) / 2, size, size,
              0, 0, 400, 400
            );
            const base64String = canvas.toDataURL('image/jpeg', 0.7);
            await update(ref(db, `users/${user.uid}`), { photoURL: base64String });
            if (profile) setProfile({ ...profile, photoURL: base64String });
          }
        };
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    };
  };

  const handleUpdateName = async () => {
    if (!newName.trim() || !user) return;
    try {
      await update(ref(db, `users/${user.uid}`), { username: newName.trim() });
      if (profile) setProfile({ ...profile, username: newName.trim() });
      setIsEditingName(false);
    } catch (err) {
      console.error(err);
    }
  };

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createRoom = async (isPrivate = false) => {
    if (!user || !userProfile) return;

    if (!newRoomName.trim()) {
      alert("Please name your mission before deploying!");
      return;
    }

    const roomName = newRoomName.trim();

    try {
      setLoading(true);
      const roomId = generateRoomCode();
      const roomRef = ref(db, `rooms/${roomId}`);

      // Check if room with this ID already exists
      const existing = await get(roomRef);
      if (existing.exists()) {
        // Simple collision handling: try again once or use push key as fallback
        // But for simplicity in this demo, we'll just use the code
      }

      const initialRoom = {
        id: roomId,
        name: roomName,
        host: user.uid,
        status: 'waiting',
        isPrivate,
        createdAt: Date.now(),
        players: {
          [user.uid]: {
            username: userProfile.username || 'Shinobi',
            isReady: true,
            photoURL: userProfile.photoURL || null,
            color: '#ea580c'
          }
        }
      };

      await set(roomRef, initialRoom);
      setNewRoomName('');
      navigate(`/game/${roomId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create mission scroll.");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (rawRoomId: string, isFromQR = false) => {
    if (!user || !userProfile) {
      alert("Summoning failure: You must have an active Shinobi profile to intercept missions.");
      return;
    }

    try {
      setLoading(true);
      // Clean and standardize ID
      let roomId = rawRoomId.trim().toUpperCase();
      
      // Handle full Game URLs
      if (roomId.includes('/GAME/')) {
        const parts = roomId.split('/GAME/');
        roomId = parts[parts.length - 1].split(/[?#]/)[0];
      }
      
      // Strip any extra non-alphanumeric characters but keep it strict
      roomId = roomId.replace(/[^A-Z0-9]/g, '');

      if (!roomId || roomId.length < 3) {
        alert("Invalid Mission Code format.");
        setLoading(false);
        return;
      }

      console.log("Attempting to intercept mission:", roomId);

      const roomRef = ref(db, `rooms/${roomId}`);
      const roomSnap = await get(roomRef);
      
      if (!roomSnap.exists()) {
        alert(`Mission Scroll [${roomId}] not found in the archives.`);
        setLoading(false);
        return;
      }

      const roomData = roomSnap.val();

      // PRIVATE ROOM LOGIC
      if (roomData.isPrivate && !isFromQR && roomData.host !== user.uid) {
        alert("CLASSIFIED INTEL: You need to scan the physical Scroll's QR Code to infiltrate this mission.");
        setLoading(false);
        return;
      }

      if (roomData.status === 'playing') {
        alert("COMBAT IN PROGRESS: This mission has already deployed to the battlefield.");
        setLoading(false);
        return;
      }

      const playersCount = Object.keys(roomData.players || {}).length;
      if (playersCount >= 6) {
        alert("SQUAD CAPACITY FULL: This mission cannot accommodate more Shinobi.");
        setLoading(false);
        return;
      }

      // Prepare player data for the room
      const playerJoinData = {
        username: userProfile.username || 'Shinobi',
        isReady: false,
        photoURL: userProfile.photoURL || null,
        color: '#3b82f6',
        joinedAt: Date.now()
      };

      // Perform the update
      await update(ref(db, `rooms/${roomId}/players/${user.uid}`), playerJoinData);

      // Successfully joined, now navigate
      console.log("Successfully infiltrated room:", roomId);
      navigate(`/game/${roomId}`);
      
    } catch (err: any) {
      console.error("Interception Error:", err);
      alert(`Jutsu Failure: ${err.message || "Failed to establish connection to the mission scroll."}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomId: string) => {
    if (window.confirm("Dissolve this mission?")) {
      await remove(ref(db, `rooms/${roomId}`));
      await remove(ref(db, `gameStates/${roomId}`));
    }
  };



  const claimDailyReward = async () => {
    if (!profile || !user) return;
    const now = Date.now();
    const lastClaim = profile.lastDailyClaim || 0;

    if (now - lastClaim < 24 * 60 * 60 * 1000) {
      alert("Training complete for today. Return tomorrow!");
      return;
    }

    try {
      const newCoins = (profile.coins || 0) + 100;
      await update(ref(db, `users/${user.uid}`), {
        coins: newCoins,
        lastDailyClaim: now
      });
      alert("Daily Training Complete! +100 ₱ obtained.");
    } catch (e) {
      console.error(e);
    }
  };

  if (!profile || !userProfile || !hasLoaded) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 relative overflow-hidden"
        style={{ backgroundColor: colors.bgPrimary, color: colors.bgSecondary }}>
        <RealisticBackground />
        {[...Array(20)].map((_, i) => <ChakraParticle key={i} color={colors.accent} />)}

        <div className="relative z-10 flex flex-col items-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="mb-6">
            <div className="w-24 h-24 rounded-full border-b-4 border-orange-500 flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.4)]">
              <img src="/img/MDLogo.png" className="w-16 h-16 animate-pulse" alt="Loading..." />
            </div>
          </motion.div>
          <h2 className="text-2xl font-black uppercase tracking-[0.4em] italic animate-pulse drop-shadow-lg">Summoning Shinobi...</h2>
        </div>
      </div>
    );
  }

  const rank = getRankFromXP(userProfile?.xp || 0);
  const nextRankInfo = getXPForNextRank(userProfile?.xp || 0);
  // Find the next rank object to get its name
  const nextRankObj = RANKS.find(r => r.level === rank.level + 1);
  const progress = nextRankInfo.percent;

  return (
    <div className="h-screen relative flex flex-col transition-colors duration-700 overflow-hidden"
      style={{
        backgroundColor: colors?.bgPrimary,
        backgroundImage: 'url("/img/LobbyBG.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] pointer-events-none" />
      <RealisticBackground />
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes chakra-rise {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translateY(-300px) scale(1.5); opacity: 0; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .room-item { content-visibility: auto; contain-intrinsic-size: 0 100px; }
      `}} />
      {[...Array(typeof window !== 'undefined' && window.innerWidth < 768 ? 5 : 12)].map((_, i) => <ChakraParticle key={i} color={colors?.accent} />)}
      <AchievementToast />
 
      <div className="relative flex-1 flex flex-col max-w-6xl mx-auto w-full p-2 sm:p-4 overflow-hidden">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 p-2 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] mb-1.5 sm:mb-4 border-2 relative overflow-hidden group/header transition-all border-orange-500/20 z-50"
          style={{ backgroundColor: colors.headerBg }}>
          <div className="absolute inset-0 paper-texture opacity-20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none group-hover/header:bg-orange-500/20 transition-all duration-700" />
          
          <div className="flex items-center gap-3 sm:gap-4 relative z-10 w-full sm:w-auto mb-2 sm:mb-0">
            <div className="relative group/avatar cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
              <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-[2rem] overflow-hidden border-2 shadow-2xl transition-all duration-500 group-hover/avatar:rotate-3 group-hover/avatar:scale-105"
                style={{ borderColor: colors.borderAccent || colors.accent }}>
                <img src={userProfile?.photoURL || "/img/MDLogo.png"} alt="Ninja" className="w-full h-full object-cover" />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-orange-600 rounded-xl text-white shadow-lg scale-90 sm:scale-100 border border-white/20">
                <Camera className="w-3.5 h-3.5" />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleProfilePicChange} />
            </div>

            <div className="flex flex-col min-w-0 flex-1 gap-0.5 sm:gap-1">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-xl border border-white/10 shrink-0">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder={userProfile?.username}
                      className="px-2 py-1 bg-transparent text-xs font-black w-24 sm:w-32 outline-none text-white uppercase"
                    />
                    <button onClick={handleUpdateName} className="p-1 hover:scale-110 text-emerald-500"><Play className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 min-w-0">
                    <h1 className="text-base sm:text-2xl font-black uppercase tracking-tighter italic truncate text-glow" style={{ color: colors.textPrimary }}>
                      {userProfile?.username || 'Shinobi'}
                    </h1>
                    <button onClick={() => { setNewName(userProfile?.username || ''); setIsEditingName(true); }}
                      className="p-1 opacity-50 hover:opacity-100 transition-all">
                      <Edit2 className="w-3.5 h-3.5 text-orange-400" />
                    </button>
                  </div>
                )}
                <div className="hidden xs:flex px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase border border-orange-500/20 shadow-inner shrink-0"
                  style={{ backgroundColor: colors.bgCard, color: colors.accent }}>
                  {rank.badge} {rank.name}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-6 mt-0.5">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <div className="w-full sm:w-48 h-2 rounded-full bg-black/30 overflow-hidden shadow-inner border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]" 
                    />
                  </div>
                  <div className="flex justify-between items-center sm:justify-start">
                    <span className="text-[8px] sm:text-[9px] font-black uppercase opacity-60 tracking-[0.1em] text-[#94a3b8]">
                      {nextRankObj ? `NEXT: ${nextRankObj.name}` : 'MAX RANK'}
                    </span>
                    <span className="xs:hidden text-[8px] font-black text-amber-500 ml-2">{rank.badge}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <CurrencyBill amount={userProfile?.coins || 0} icon={<img src="/img/Currency/1Peso.png" className="w-4.5 h-4.5" />} color="#f59e0b" label="PESO" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0 relative z-10 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2 bg-black/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/5">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFriendsSidebar(!showFriendsSidebar)}
                className={`p-2.5 sm:p-3 rounded-xl transition-all relative border-b-4 shadow-xl flex items-center justify-center btn-shinobi ${showFriendsSidebar ? 'bg-orange-600 text-white shadow-orange-600/20' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                style={showFriendsSidebar ? { borderColor: '#450a0a' } : { borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                {showFriendsSidebar && (
                  <motion.div layoutId="friend-pill" className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-lg" />
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowChat(!showChat)}
                className={`p-2.5 sm:p-3 rounded-xl transition-all relative border-b-4 shadow-xl flex items-center justify-center btn-shinobi ${showChat ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                style={showChat ? { borderColor: '#1e3a8a', backgroundColor: '#2563eb' } : { borderColor: 'rgba(255,255,255,0.05)', backgroundColor: colors.accent }}
              >
                <MessageSquareText className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                {unreadCount > 0 && !showChat && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-red-600 text-white text-[8px] sm:text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce shadow-2xl z-20">
                    {unreadCount}
                  </span>
                )}
              </motion.button>
            </div>
            
            <div className="flex items-center gap-2 bg-black/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/5">
              <ThemeSelector />
              <button onClick={handleLogout} className="p-2.5 sm:p-3 bg-red-600/10 text-red-500 rounded-xl transition-all hover:bg-red-600 hover:text-white border-b-4 border-red-950/20 active:translate-y-1 btn-shinobi shadow-xl">
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 min-h-0">
          <ThreeDCard className="lg:col-span-1 h-full min-h-0">
            <div className="p-3 sm:p-5 rounded-2xl shadow-2xl border-x-4 sm:border-x-8 relative flex flex-col h-full overflow-hidden transition-all"
              style={{ backgroundColor: colors.bgTertiary, borderColor: colors.borderPrimary }}>
              <div className="absolute inset-0 opacity-10 paper-texture pointer-events-none" />
              <CornerKunai className="top-2 left-2 rotate-[-45deg]" />
              <CornerKunai className="bottom-2 right-2 rotate-[135deg]" />

              <nav className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-6 p-1 bg-black/20 rounded-2xl z-10 shrink-0 overflow-x-auto custom-scrollbar no-scrollbar">
                {(['mission', 'friends', 'shop', 'ranking', 'train', 'history'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all relative overflow-hidden min-w-[60px] sm:min-w-0 ${activeTab === tab ? 'text-white shadow-xl translate-y-[-2px]' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    style={activeTab === tab ? { backgroundColor: colors.accent } : {}}
                  >
                    <div className={`${activeTab === tab ? 'scale-110' : 'scale-90 opacity-60'} transition-transform`}>
                      {tab === 'mission' && <Sword className="w-4 h-4 sm:w-5 sm:h-5" />}
                      {tab === 'friends' && <Users className="w-4 h-4 sm:w-5 sm:h-5" />}
                      {tab === 'shop' && <Gift className="w-4 h-4 sm:w-5 sm:h-5" />}
                      {tab === 'ranking' && <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />}
                      {tab === 'train' && <Zap className="w-4 h-4 sm:w-5 sm:h-5" />}
                      {tab === 'history' && <History className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-tighter sm:hidden">
                      {tab === 'friends' ? 'Alliance' : tab}
                    </span>
                  </button>
                ))}
              </nav>

              <div className="flex-1 flex flex-col min-h-0 z-10 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: window.innerWidth < 768 ? 0 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: window.innerWidth < 768 ? 0 : 10 }}
                      transition={{ duration: 0.2 }}
                      className="min-h-full relative z-20"
                    >
                    <TabContent 
                      activeTab={activeTab}
                      newRoomName={newRoomName}
                      setNewRoomName={setNewRoomName}
                      setIsPrivateRoom={setIsPrivateRoom}
                      isPrivateRoom={isPrivateRoom}
                      createRoom={createRoom}
                      loading={loading}
                      colors={colors}
                      joinRoomId={joinRoomId}
                      setJoinRoomId={setJoinRoomId}
                      joinRoom={joinRoom}
                      setShowQRScanner={setShowQRScanner}
                      userProfile={userProfile}
                      claimDailyReward={claimDailyReward}
                      rank={rank}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              
              <div className="hidden sm:block shrink-0 mt-2">
                <button onClick={claimDailyReward} className="w-full p-3 sm:p-4 border-2 rounded-2xl flex items-center justify-between group transition-all hover:scale-105 active:scale-95 shadow-xl relative overflow-hidden" style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' }}>
                  <div className="flex items-center gap-3 relative z-10">
                    <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 group-hover:rotate-12 transition-transform" />
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] sm:text-xs font-black text-emerald-800 uppercase italic">Daily Jutsu Training</span>
                      <span className="text-[8px] sm:text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1">Claim 100 ₱ <Sparkles className="w-3 h-3" /></span>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 relative z-10" />
                </button>
              </div>
            </div>
          </ThreeDCard>

          <ThreeDCard className="lg:col-span-2 h-full min-h-0">
            <div className="p-3 sm:p-6 rounded-2xl shadow-2xl border-x-4 sm:border-x-8 relative flex-1 flex flex-col h-full overflow-hidden transition-all"
              style={{ backgroundColor: colors.bgTertiary, borderColor: colors.borderPrimary }}>
              <div className="absolute inset-0 opacity-10 paper-texture pointer-events-none" />
              <CornerKunai className="top-2 right-2 rotate-[45deg] scale-110" />
              <CornerKunai className="bottom-2 left-2 rotate-[-135deg] scale-110" />

              <div className="flex items-center justify-between mb-3 sm:mb-6 z-10">
                <h2 className="text-sm sm:text-2xl font-black flex items-center gap-2 sm:gap-3 uppercase tracking-tighter italic" style={{ color: colors.textPrimary }}>
                  <div className="p-1.5 sm:p-2 bg-orange-500/10 rounded-lg sm:rounded-xl"><Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700" /></div> Active Missions
                </h2>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 border text-[10px] font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {rooms.length} SEALS OPEN
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                {rooms.length === 0 ? (
                  <div className="text-center py-20 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4" style={{ backgroundColor: colors.scrollBg, borderColor: `${colors.borderPrimary}30` }}>
                    <ScrollText className="w-12 h-12 opacity-20" />
                    <p className="font-black text-lg uppercase tracking-tight opacity-40">No missions found.</p>
                  </div>
                                ) : (
                  <div className="grid gap-4 pb-4">
                    {rooms.map((room) => (
                      <RoomItem 
                        key={room.id} 
                        room={room} 
                        user={user} 
                        colors={colors} 
                        joinRoom={joinRoom} 
                        deleteRoom={deleteRoom} 
                        setQrRoomId={setQrRoomId} 
                        setShowQRScanner={setShowQRScanner} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ThreeDCard>
        </div>
      </div>

      {/* Chat System Toggle Container (Floating Modal Area) - Moved to Left Side per User Request */}
      <div className="fixed bottom-24 left-6 z-50 flex flex-col items-start gap-4 pointer-events-none">
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              className="pointer-events-auto"
            >
              <ChatSystem
                username={userProfile?.username || 'Shinobi'}
                photoURL={userProfile?.photoURL}
                colors={colors}
                isOpen={showChat}
                setIsOpen={setShowChat}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {qrRoomId && (
        <QRModal roomId={qrRoomId} onClose={() => setQrRoomId(null)} colors={colors} />
      )}

      {showQRScanner && (
        <QRScanner
          onClose={() => setShowQRScanner(false)}
          onScan={(id) => {
            setJoinRoomId(id);
            setShowQRScanner(false);
            joinRoom(id, true);
          }}
        />
      )}
      <Footer />

      {/* Friends Sidebar Drawer (Left Side) */}
      <AnimatePresence>
        {showFriendsSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFriendsSidebar(false)}
              className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-[200] w-[300px] sm:w-[360px] bg-white/95 backdrop-blur-xl border-r-4 shadow-[10px_0_50px_rgba(0,0,0,0.3)] flex flex-col pt-24"
              style={{ backgroundColor: colors.bgPrimary, borderColor: colors.borderPrimary }}
            >
              <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setShowFriendsSidebar(false)} className="p-2 hover:bg-black/5 rounded-xl transition-all">
                  <X className="w-6 h-6" style={{ color: colors.textMuted }} />
                </button>
              </div>
              <div className="px-6 py-4 border-b border-white/10 mb-4 bg-orange-600/5">
                <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3" style={{ color: colors.textPrimary }}>
                  <div className="p-2 bg-orange-600 rounded-xl shadow-lg shadow-orange-600/20">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  Shinobi Alliance
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto px-6 custom-scrollbar pb-10">
                <FriendsList user={user} colors={colors} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
