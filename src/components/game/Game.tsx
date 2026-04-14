import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useProgressionStore, ACHIEVEMENTS, getRankFromXP, getXPForNextRank, awardXP, checkAndUnlockAchievement } from '../../store/useProgressionStore';
import { db } from '../../firebase/config';
import { ref, onValue, set, remove, update, push, get, serverTimestamp, query, orderByChild, limitToLast } from 'firebase/database';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { FloatingShuriken, SakuraPetal, RealisticBackground, ThreeDCard } from '../common/UIComponents';
import { X, Trophy, ShoppingBag, Star, Zap, Medal, Check, Lock, Coins, Shield, Sparkles, LogOut, Users, Play, Loader2, AlertCircle, Home, History, ScrollText, Copy, Plus, Trash2, Landmark, CreditCard, TrendingUp, ChevronLeft, ChevronRight, Menu, Volume2, VolumeX, MessageSquareText, MessageCircle, QrCode, Skull } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import Board2D from './Board2D';
import Dice2D from './Dice2D';
import ChatSystem from './ChatSystem';
import { BOARD_DATA, getColorHex } from '../../game/boardData';
import CurrencyBill from '../common/CurrencyBill';
import TradeModal from './TradeModal';
import ThemeSelector from '../common/ThemeSelector';
import AchievementToast from '../common/AchievementToast';
import { rollDice, buyProperty, endTurn, payJailFine, buyHouse, mortgageProperty, unmortgageProperty, sellHouse } from '../../game/gameLogic';
import { LeaderboardModal, ShopModal, BattleModal } from './ShopModals';
import { proposeTrade, executeTrade } from '../../game/tradeLogic';
import { takeLoan, repayLoan } from '../../game/bankingLogic';
import { getAIDecision } from '../../game/aiLogic';
import { QRCodeCanvas } from 'qrcode.react';

const CHARACTER_OPTIONS = [
  // HOKAGE
  { name: 'Naruto', image: '/img/characters/Naruto/NARUTO.png', id: 'naruto', frames: 5, category: 'HOKAGE' },
  { name: 'Minato', image: '/img/characters/Minato/MINATO.png', id: 'minato', frames: 8, category: 'HOKAGE' },
  { name: 'Kakashi', image: '/img/characters/Kakashi/KAKASHI.png', id: 'kakashi', frames: 7, category: 'HOKAGE' },
  { name: 'Sasuke', image: '/img/characters/Sasuke/SASUKE.png', id: 'sasuke', frames: 4, category: 'HOKAGE' },
  { name: 'Sakura', image: '/img/characters/Sakura/SAKURA.png', id: 'sakura', frames: 5, category: 'HOKAGE' },
  
  // KAGE
  { name: 'Gaara', image: '/img/characters/Gaara/GAARA.png', id: 'gaara', frames: 4, category: 'KAGE' },
  { name: 'Jiraiya', image: '/img/characters/Jiraiya/JIRAYA.png', id: 'jiraya', frames: 6, category: 'KAGE' },
  { name: 'Guy', image: '/img/characters/Mighty Guy/GUY.png', id: 'guy', frames: 7, category: 'KAGE' },
  { name: 'Shikamaru', image: '/img/characters/Shikamaru/SHIKA.png', id: 'shika', frames: 8, category: 'KAGE' },
  { name: 'Hinata', image: '/img/characters/Hinata/HINATA.png', id: 'hinata', frames: 4, category: 'KAGE' },
  
  // AKATSUKI
  { name: 'Itachi', image: '/img/characters/Akatsuki/ITACHI/Itachi1.png', id: 'akatsuki-itachi', frames: 11, category: 'AKATSUKI' },
  { name: 'Pain', image: '/img/characters/Akatsuki/YAHIKO/Yahiko1.png', id: 'pain', frames: 9, category: 'AKATSUKI' },
  { name: 'Deidara', image: '/img/characters/Akatsuki/DEDA/DEDA1.png', id: 'deidara', frames: 7, category: 'AKATSUKI' },
  { name: 'Kakuzu', image: '/img/characters/Akatsuki/KAKU/KAKU1.png', id: 'kakuzu', frames: 7, category: 'AKATSUKI' },
  { name: 'Sasori', image: '/img/characters/Akatsuki/SASORI/SASORI1.png', id: 'sasori', frames: 7, category: 'AKATSUKI' },
  { name: 'Hidan', image: '/img/characters/Akatsuki/HIDAN/HIDAN1.png', id: 'hidan', frames: 6, category: 'AKATSUKI' },
  { name: 'Orochimaru', image: '/img/characters/Akatsuki/ORICHIMARU/ORICHIMARU1.png', id: 'orochimaru', frames: 6, category: 'AKATSUKI' },
  { name: 'Zetsu', image: '/img/characters/Akatsuki/ZETSU/ZETSU1.png', id: 'zetsu', frames: 6, category: 'AKATSUKI' },
];



const CharacterSelectionCard = React.memo(({ char, isSelected, isTaken, onSelect, colors }: any) => {
  const [frame, setFrame] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile('ontouchstart' in window || window.innerWidth < 768);
  }, []);

  useEffect(() => {
    // Disable frame animation on mobile unless hovered/touched to save resources
    if (!isHovered || char.frames <= 1) {
      setFrame(1);
      return;
    }

    let lastTime = 0;
    const fps = isMobile ? 8 : 12; // Slower on mobile
    const interval = 1000 / fps;
    let frameId: number;

    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const progress = time - lastTime;

      if (progress > interval) {
        setFrame(prev => (prev >= char.frames ? 1 : prev + 1));
        lastTime = time;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isHovered, char.frames, isMobile]);

  const framePath = useMemo(() => {
    if (frame === 1) return char.image;
    const parts = char.image.split('/');
    const filename = parts.pop()?.replace('.png', '') || 'NARUTO';
    const baseName = filename.replace(/[0-9]+$/, '');
    return `${parts.join('/')}/${baseName}${frame}.png`;
  }, [frame, char.image]);

  return (
    <motion.button
      disabled={isTaken}
      onClick={() => onSelect(char.image)}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      whileTap={isTaken ? {} : { scale: 0.95 }}
      // Use simpler animations for mobile popups
      initial={false}
      className={`group flex flex-col items-center gap-2 p-2 rounded-2xl border-2 transition-all relative overflow-hidden ${isTaken ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
      style={{
        backgroundColor: isSelected ? `${colors.accent}15` : colors.bgCard,
        borderColor: isSelected ? colors.accent : `${colors.borderSecondary}40`,
        boxShadow: isSelected && !isMobile ? `0 0 20px ${colors.accentGlow}` : 'none',
        willChange: 'transform'
      }}
    >
      {isSelected && (
        <div className="absolute top-0 right-0 p-1 z-10">
          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
        </div>
      )}
      {isTaken && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rotate-12">
          <span className="text-[10px] font-black text-white px-2 py-0.5 bg-red-600 rounded">ENGAGED</span>
        </div>
      )}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 overflow-hidden shadow-lg relative group-hover:scale-105 transition-transform"
        style={{ borderColor: isSelected ? colors.accent : `${colors.borderPrimary}40`, backgroundColor: colors.bgSecondary }}>
        <img
          src={framePath}
          alt={char.name}
          className="w-full h-full object-contain scale-110 drop-shadow-2xl transition-all"
          loading="lazy"
        />
        {!isMobile && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />}
      </div>
      <span className="text-[9px] sm:text-[10px] font-black uppercase text-center tracking-wider px-1" style={{ color: isSelected ? colors.accent : colors.textPrimary }}>
        {char.name}
      </span>
      {isHovered && !isTaken && !isMobile && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent/40 animate-pulse" />
      )}
    </motion.button>
  );
});

function NewFriendPopup({ notification, onClose, userProfile, currentUserId }: { notification: any, onClose: () => void, userProfile: any, currentUserId: string }) {
  if (!notification) return null;

  const handleAccept = async () => {
    try {
      // Add the person who sent the request to my alliance
      const friendRef = ref(db, `users/${currentUserId}/friends/${notification.fromId}`);
      await set(friendRef, {
        username: notification.username || 'Shinobi',
        photoURL: notification.photoURL || null,
        id: notification.fromId,
        addedAt: Date.now()
      });
      onClose();
    } catch (e) {
      console.error(e);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
      <div className="relative w-full max-w-sm glass-ui p-8 rounded-[3rem] border-4 border-orange-500/50 shadow-[0_0_100px_rgba(251,146,60,0.4)] flex flex-col items-center text-center">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
           <div className="w-24 h-24 rounded-3xl border-4 border-orange-500 overflow-hidden shadow-2xl bg-white group">
              <img src={notification.photoURL || "/img/MDLogo.png"} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
           </div>
        </div>
        
        <div className="mt-12 mb-6">
           <div className="px-4 py-1 bg-orange-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest mb-2 shadow-lg animate-bounce">Alliance Invitation</div>
           <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter">{notification.username}</h3>
           <p className="text-sm font-bold text-orange-400 uppercase tracking-widest">{notification.rank || 'Genin'}</p>
        </div>

        <div className="w-full grid grid-cols-2 gap-3 mb-8">
           <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Treasury</span>
              <span className="text-sm font-black text-emerald-400 italic">P{(notification.coins || 0).toLocaleString()}</span>
           </div>
           <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Combat Tier</span>
              <span className="text-sm font-black text-white italic">Lvl {Math.floor((notification.xp || 0) / 100) + 1}</span>
           </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={handleAccept}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl uppercase tracking-[0.2em] shadow-xl border-b-4 border-emerald-950 active:translate-y-1 transition-all text-xs"
          >
            Form Strategic Bond
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3 bg-white/5 text-slate-400 font-bold rounded-2xl uppercase tracking-widest hover:bg-white/10 transition-all text-[9px]"
          >
            Decline Proposal
          </button>
        </div>
      </div>
    </motion.div>
  );
}


export default function Game() {
  const { roomId } = useParams<{ roomId: string }>();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Global Image Preloader for character animations
  useEffect(() => {
    CHARACTER_OPTIONS.forEach(char => {
      // Only preload 1 frame on mobile to save memory/data, or up to 3 on desktop
      const maxFrames = isMobile ? 1 : Math.min(char.frames, 3);
      for (let i = 1; i <= maxFrames; i++) {
        let path = char.image;
        if (i > 1) {
          const parts = char.image.split('/');
          const filename = parts.pop()?.replace('.png', '') || 'NARUTO';
          const baseName = filename.replace(/[0-9]+$/, '');
          path = `${parts.join('/')}/${baseName}${i}.png`;
        }
        const img = new Image();
        img.src = path;
      }
    });
    // Preload Board and other heavy assets
    const board = new Image(); board.src = '/img/Board.png';
    const bg = new Image(); bg.src = '/img/GameBG.png';
  }, []);

  const { user, profile } = useAuthStore();
  const { colors, currentTheme } = useThemeStore();
  const { showToast } = useProgressionStore();
  const { unreadCount, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showTrade, setShowTrade] = useState(false);
  const [showBanking, setShowBanking] = useState(false);
  const [loanAmount, setLoanAmount] = useState(200);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'status' | 'intel' | 'chat'>('status');
  const [showAchievements, setShowAchievements] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showCharSelect, setShowCharSelect] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [musicPath, setMusicPath] = useState('/video/BatlleSound.mp4');
  const [turnTimeLeft, setTurnTimeLeft] = useState(10);
  const [showChat, setShowChat] = useState(false);
  const [showSkipCountdown, setShowSkipCountdown] = useState(false);
  const [showFriendsSelection, setShowFriendsSelection] = useState(false);
  const [activeNotification, setActiveNotification] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<'HOKAGE' | 'KAGE' | 'AKATSUKI'>('HOKAGE');
  const [gameState, setGameState] = useState<any>(null);
  const [showShop, setShowShop] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [globalRankings, setGlobalRankings] = useState<any[]>([]);
  const [dayNight, setDayNight] = useState<'day' | 'night'>('day');
  const [activeBattle, setActiveBattle] = useState<any>(null);
  const [selectedTileId, setSelectedTileId] = useState<number | null>(null);
  const [showAkatsukiIntro, setShowAkatsukiIntro] = useState(false);
  const [showHokageIntro, setShowHokageIntro] = useState(false);

  const addFriend = useCallback(async (player: any) => {
    if (!user?.uid || !player.id || player.id === user.uid) return;
    try {
      // 1. Add to my alliance
      const friendRef = ref(db, `users/${user.uid}/friends/${player.id}`);
      await set(friendRef, {
        username: player.username || 'Shinobi',
        photoURL: player.photoURL || null,
        id: player.id,
        addedAt: Date.now()
      });

      // 2. Notify the other player
      const notifyRef = ref(db, `users/${player.id}/notifications/${user.uid}`);
      await set(notifyRef, {
        username: userProfile?.username || user.displayName || 'Shinobi',
        photoURL: userProfile?.photoURL || user.photoURL || null,
        fromId: user.uid,
        rank: getRankFromXP(userProfile?.xp || 0).name,
        xp: userProfile?.xp || 0,
        coins: userProfile?.coins || 0,
        timestamp: serverTimestamp()
      });

      alert(`Recruited ${player.username} to your Shinobi alliance!`);
    } catch (e) {
      console.error(e);
    }
  }, [user, userProfile]);

  // Computed Values
  const isHost = room?.host === user?.uid;
  const handleExitGame = async () => {
    if (isHost && room?.status === 'playing') {
      if (window.confirm("Host leaving will end the mission for everyone. Continue?")) {
        await remove(ref(db, `rooms/${roomId}`));
        await remove(ref(db, `gameStates/${roomId}`));
        navigate('/lobby');
      }
    } else {
      navigate('/lobby');
    }
  };

  const playersArr: [string, any][] = room?.players ? Object.entries(room.players) : [];
  const allReady = playersArr.every(([_, p]: [string, any]) => p && (p.isAI || (p.isReady && p.photoURL)));
  const myPlayerState = gameState?.players?.[user?.uid || ''];
  const isMyTurn = !!(gameState && gameState.turnOrder?.length && gameState.currentTurnIndex !== undefined && gameState.turnOrder[gameState.currentTurnIndex] === user?.uid);
  const currentTile = (gameState && myPlayerState) ? BOARD_DATA[myPlayerState.position || 0] : null;
  const canBuy = !!(currentTile?.price && !Object.values(gameState?.players || {}).some((p: any) => (p?.properties || []).includes(myPlayerState?.position || 0)));
  const myLoan = gameState?.loans?.[user?.uid || ''];

  const [myFriends, setMyFriends] = useState<any[]>([]);

  const THEME_SOUNDS = [
    { name: 'Battle Anthems', path: '/video/BatlleSound.mp4' },
    { name: 'Naruto Theme', path: '/video/Naruto Shippuden Theme Song.mp4' },
  ];

  // Friend List Listener for Sidebar
  useEffect(() => {
     if (!user) return;
     const friendsRef = ref(db, `users/${user.uid}/friends`);
     const unsub = onValue(friendsRef, (snap) => {
        if (snap.exists()) {
           setMyFriends(Object.entries(snap.val()).map(([id, f]: [string, any]) => ({ id, ...f })));
        } else {
           setMyFriends([]);
        }
     });
     return () => unsub();
  }, [user]);

  // Listen for Recruitment Notifications
  useEffect(() => {
    if (!user) return;
    const notifyRef = ref(db, `users/${user.uid}/notifications`);
    const unsub = onValue(notifyRef, (snap) => {
      if (snap.exists()) {
        const notifications = snap.val();
        const latestId = Object.keys(notifications).pop();
        if (latestId) {
          setActiveNotification(notifications[latestId]);
          // Clean up notification after showing
          remove(ref(db, `users/${user.uid}/notifications/${latestId}`));
        }
      }
    });
    return () => unsub();
  }, [user]);

  // Background Music logic
  useEffect(() => {
    if (room?.status === 'playing' && !isMuted && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Silent fail if blocked - user needs interaction
      });
    } else {
      audioRef.current?.pause();
    }
  }, [room?.status, isMuted, musicPath]);

  // Load Global Leaderboard (Limited to Top 10 to save quota)
  useEffect(() => {
    if (!showLeaderboard) return;
    const usersRef = query(ref(db, 'users'), orderByChild('xp'), limitToLast(10));
    const unsub = onValue(usersRef, (snap) => {
      if (snap.exists()) {
        const data = Object.entries(snap.val()).map(([id, u]: [string, any]) => ({ id, ...u }));
        setGlobalRankings(data.sort((a, b) => (b.xp || 0) - (a.xp || 0)));
      }
    });
    return () => unsub();
  }, [showLeaderboard]);

  // Load user profile for XP/achievements
  useEffect(() => {
    if (!user) return;
    const userRef = ref(db, `users/${user.uid}`);
    const unsub = onValue(userRef, (snap) => {
      if (snap.exists()) setUserProfile(snap.val());
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || !roomId) {
      navigate('/login');
      return;
    }

    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoom(data);
        setLoading(false);
      } else {
        if (loading) {
          setError('Room not found or has been closed.');
          setLoading(false);
        } else {
          setError('The mission has concluded or been dissolved.');
        }
      }
    });

    const gameStateRef = ref(db, `gameStates/${roomId}`);
    const unsubGS = onValue(gameStateRef, (snapshot) => {
      if (snapshot.exists()) {
        setGameState(snapshot.val());
      }
    });

    return () => {
      unsubscribe();
      unsubGS();
    };
  }, [roomId, user, navigate]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [JSON.stringify(room?.gameState?.logs)]);

  // Sync local activeBattle with Firebase activeBattleData
  useEffect(() => {
    if (gameState?.activeBattleData) {
       const b = gameState.activeBattleData;
       setActiveBattle({
          ...b,
          attacker: gameState.players[b.attackerId],
          defender: gameState.players[b.defenderId]
       });
    } else {
       setActiveBattle(null);
    }
  }, [gameState?.activeBattleData]);

  // Battle Trigger Interceptor (Only Host runs this to sync all clients)
  useEffect(() => {
    if (!gameState || !roomId || gameState.activeBattleData || !isHost || gameState.isGameOver) return;
    
    const currentIndex = gameState.currentTurnIndex;
    const currentPlayerId = gameState.turnOrder?.[currentIndex];
    if (!currentPlayerId) return;
    
    const player = gameState.players[currentPlayerId];
    if (gameState.diceResult && !gameState.battleTriggered) {
      const tile = BOARD_DATA[player.position];
      const ownerEntry = Object.entries(gameState.players).find(([id, p]: [string, any]) => 
        (p.properties || []).includes(player.position) && id !== currentPlayerId
      );

      if (ownerEntry) {
        const [ownerId, owner] = ownerEntry;
        update(ref(db, `gameStates/${roomId}`), { 
           activeBattleData: {
              attackerId: currentPlayerId,
              defenderId: ownerId,
              tileName: tile.name,
              originalRent: Array.isArray(tile.rent) ? tile.rent[0] : (tile.rent || 0)
           },
           battleTriggered: true 
        });
      }
    }
  }, [gameState?.diceResult, gameState?.currentTurnIndex, isHost]);

  // Achievement checking
  useEffect(() => {
    if (!user || !room?.gameState) return;
    const gs = room.gameState;
    const myState = gs.players?.[user.uid];
    if (!myState || myState.isBankrupt) return;

    // Rich Player check
    if (myState.money >= 5000) {
      checkAndUnlockAchievement(user.uid, 'rich_player').then(a => {
        if (a) showToast(a.name, a.icon);
      });
    }

    // Property King check
    if ((myState.properties || []).length >= 10) {
      checkAndUnlockAchievement(user.uid, 'property_king').then(a => {
        if (a) showToast(a.name, a.icon);
      });
    }

    // Monopolist check
    const colorGroups: Record<string, number[]> = {};
    BOARD_DATA.forEach(t => {
      if (t.color) {
        if (!colorGroups[t.color]) colorGroups[t.color] = [];
        colorGroups[t.color].push(t.id);
      }
    });
    const hasMonopoly = Object.values(colorGroups).some(ids =>
      ids.every(id => (myState.properties || []).includes(id))
    );
    if (hasMonopoly) {
      checkAndUnlockAchievement(user.uid, 'monopolist').then(a => {
        if (a) showToast(a.name, a.icon);
      });
    }

    // Hotel Tycoon check
    if (gs.houses) {
      const hasHotel = Object.values(gs.houses).some((h: any) => h >= 5);
      if (hasHotel) {
        checkAndUnlockAchievement(user.uid, 'hotel_tycoon').then(a => {
          if (a) showToast(a.name, a.icon);
        });
      }
    }

    // Day/Night Cycle Trigger (Every 10 total turns)
    const turnCount = gameState?.logs?.length || 0;
    setDayNight(Math.floor(turnCount / 10) % 2 === 0 ? 'day' : 'night');

    // Game over - win check
    if (gs.isGameOver || room.status === 'finished') {
      const activePlayers = gs.turnOrder?.filter((id: string) => !gs.players[id]?.isBankrupt) || [];
      const isWinner = activePlayers.length === 1 && activePlayers[0] === user.uid;
      
      // Award participation XP to all players who were in the game
      if (Object.keys(gs.players || {}).includes(user.uid)) {
        const statsKey = `stats_recorded_${user.uid}_${roomId}`;
        if (!sessionStorage.getItem(statsKey)) {
          const xpGain = isWinner ? 250 : 50;
          const winGain = isWinner ? 1 : 0;
          const lossGain = isWinner ? 0 : 1;
          
          update(ref(db, `users/${user.uid}`), {
            xp: (profile?.xp || 0) + xpGain,
            wins: (profile?.wins || 0) + winGain,
            losses: (profile?.losses || 0) + lossGain
          }).then(() => {
            sessionStorage.setItem(statsKey, 'true');
            if (isWinner) {
              checkAndUnlockAchievement(user.uid, 'first_win').then(a => {
                if (a) showToast(a.name, a.icon);
              });
            }
          });
        }
      }
    }
  }, [room?.gameState, user, profile]);

  // AI Turn Handling - Robust Implementation
  useEffect(() => {
    const isHost = room?.host === user?.uid;
    if (!gameState || !roomId || !isHost || gameState.isGameOver) return;
    
    const currentIndex = gameState.currentTurnIndex ?? 0;
    const currentPlayerId = gameState.turnOrder ? gameState.turnOrder[currentIndex] : null;
    
    // Only proceed if it is an AI player and it's their turn
    if (!currentPlayerId || !currentPlayerId.startsWith('ai_')) return;

    const performAIMove = async () => {
      // Re-fetch latest snapshot to be absolutely sure
      const gsRef = ref(db, `gameStates/${roomId}`);
      const snap = await get(gsRef);
      if (!snap.exists()) return;
      const gs = snap.val();

      try {
        if (!gs.diceResult) {
          // AI Thinking... (Visual only via Local state if needed, but we'll use DB logs)
          await rollDice(roomId, currentPlayerId, gs);
        } else {
          // AI Decision Phase
          const player = gs.players[currentPlayerId];
          const tile = BOARD_DATA[player.position];
          const canAfford = player.money >= (tile.price || 0);
          const isOwnable = (tile.type === 'property' || tile.type === 'railroad' || tile.type === 'utility');
          const isOwned = Object.values(gs.players).some((p: any) => p && p.properties?.includes(player.position));

          if (isOwnable && !isOwned && canAfford && Math.random() > 0.25) {
            await buyProperty(roomId, currentPlayerId, gs);
          }
          
          // Realistic pause before ending turn
          setTimeout(async () => {
             // Always fetch latest for endTurn to prevent state overwrites
             const latestSnap = await get(gsRef);
             if (latestSnap.exists()) {
               await endTurn(roomId, latestSnap.val());
             }
          }, 1500);
        }
      } catch (e) {
        console.error("AI automated operation failed:", e);
        // Emergency end turn if stuck
        setTimeout(() => endTurn(roomId, gs), 3000);
      }
    };

    const timer = setTimeout(performAIMove, 2000);
    return () => clearTimeout(timer);
  }, [gameState?.currentTurnIndex, gameState?.diceResult, room?.host, user?.uid, roomId]);

  // Turn Timer & Auto-Skip Logic
  useEffect(() => {
    if (room?.status !== 'playing' || !gameState || gameState.isGameOver) return;

    // Timer only runs if the current player has NOT rolled yet
    if (gameState.diceResult || !gameState.turnOrder?.length) {
      setTurnTimeLeft(10);
      setShowSkipCountdown(false);
      return;
    }

    const timer = setInterval(() => {
      const elapsed = Date.now() - (gameState.turnStartedAt || Date.now());
      // Total 15 seconds (10s + 5s final warning)
      const totalAllowed = 15;
      const remaining = Math.max(0, totalAllowed - Math.floor(elapsed / 1000));
      setTurnTimeLeft(remaining);

      // Show warning in last 5 seconds
      if (remaining <= 5 && remaining > 0) {
        setShowSkipCountdown(true);
      } else {
        setShowSkipCountdown(false);
      }

      // If time is up and it's my turn (or if I'm host and it's someone else's turn who is taking too long)
      if (remaining === 0 && isHost) {
        const currentPlayerId = gameState.turnOrder[gameState.currentTurnIndex];
        endTurn(roomId!, gameState);

        // Add log
        const logRef = ref(db, `gameStates/${roomId}/logs`);
        get(logRef).then(snap => {
          const logs = snap.val() || [];
          update(ref(db, `gameStates/${roomId}`), {
            logs: [...logs, `Mission critical failure! ${gameState.players[currentPlayerId]?.username} skipped turn.`].slice(-15)
          });
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState?.turnStartedAt, gameState?.diceResult, gameState?.currentTurnIndex, isHost, roomId, room?.status]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-6"
      style={{ backgroundColor: colors.bgPrimary }}>
      <div className="relative w-24 h-24 mb-4">
        <div className="absolute inset-0 border-8 rounded-full" style={{ borderColor: `${colors.accent}33` }} />
        <div className="absolute inset-0 border-8 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.accent, borderTopColor: 'transparent' }} />
      </div>
      <p className="font-black uppercase tracking-[0.3em] animate-pulse" style={{ color: colors.accent }}>Establishing Connection...</p>
    </div>
  );

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
      style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <RealisticBackground />
      <AlertCircle className="w-16 h-16 text-red-500 mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
      <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter italic">Mission Failure</h2>
      <p className="max-w-md mb-8 font-bold opacity-75">{error}</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/lobby')}
        className="px-10 py-4 text-white font-black rounded-2xl uppercase tracking-[0.3em] shadow-2xl border-b-8 active:translate-y-1 transition-all text-xs"
        style={{ backgroundColor: colors.accent, borderColor: colors.accentBorder }}
      >
        Recall to Base
      </motion.button>
    </div>
  );


  const handleBackToLobby = async () => {
    if (!user || !roomId) return;
    try {
      if (isHost && room.status !== 'playing') {
        await remove(ref(db, `rooms/${roomId}`));
      } else if (room.status !== 'playing') {
        await remove(ref(db, `rooms/${roomId}/players/${user.uid}`));
      }
      navigate('/lobby');
    } catch (e) { console.error(e); }
  };

  const toggleReady = async () => {
    if (!user || !roomId || !room.players[user.uid]) return;
    const currentReady = room.players[user.uid].isReady;
    await update(ref(db, `rooms/${roomId}/players/${user.uid}`), { isReady: !currentReady });
  };

  const startGame = async () => {
    if (!isHost || !allReady || playersArr.length < 2) {
      if (!allReady) {
        const missingChar = playersArr.find(([_, p]) => !p.photoURL);
        if (missingChar) {
          alert(`Wait! ${missingChar[1].username || 'A shinobi'} hasn't selected a character skin yet.`);
          return;
        }
        alert("Ensure all players are ready before starting the mission.");
      }
      return;
    }
    const turnOrder = playersArr.map(([id]) => id).sort(() => Math.random() - 0.5);
    const initialPlayers: Record<string, any> = {};
    turnOrder.forEach((id, idx) => {
      const p = room.players?.[id];
      if (!p) return;
      initialPlayers[id] = {
        id,
        username: p.username || 'Shinobi',
        money: 1500,
        chakra: 100,
        maxChakra: 100,
        position: 0,
        color: ['#E71414', '#145EE7', '#14E74B', '#E7D414', '#E714D4', '#14E74B'][idx % 6],
        isBankrupt: false,
        properties: [],
        photoURL: p.photoURL || '',
        isAI: p.isAI || false,
        difficulty: p.difficulty || null,
        inJail: false,
        jailTurns: 0
      };
    });

    const initialGameState = {
      players: initialPlayers,
      turnOrder,
      currentTurnIndex: 0,
      diceResult: null,
      owners: {},
      houses: {},
      mortgaged: [],
      loans: {},
      logs: ['The Mission has begun! Good luck Shinobi.'],
      activeMission: null,
      isGameOver: false,
      turnStartedAt: Date.now(),
      totalTurns: 0
    };

    // Award XP for playing
    if (user) awardXP(user.uid, 50);

    const updates = {
      [`rooms/${roomId}/status`]: 'playing',
      [`gameStates/${roomId}`]: initialGameState
    };

    await update(ref(db), updates);
  };

  const handleRollDice = () => {
    if (isMyTurn && !gameState?.diceResult && user && roomId) {
      rollDice(roomId, user.uid, gameState);
    }
  };
  const handleBuyProperty = () => {
    if (isMyTurn) {
      buyProperty(roomId!, user!.uid, gameState);
      if (user) awardXP(user.uid, 10);
    }
  };
  const handleEndTurn = () => { if (isMyTurn) endTurn(roomId!, gameState); };
  const handlePayJailFine = () => { if (isMyTurn) payJailFine(roomId!, user!.uid, gameState); };
  const handleBuyHouse = (propId: number) => {
    if (isMyTurn) {
      buyHouse(roomId!, user!.uid, propId, gameState);
      if (user) awardXP(user.uid, 20);
    }
  };
  const handleTakeLoan = () => {
    if (isMyTurn && user) takeLoan(roomId!, user.uid, loanAmount, gameState);
    setShowBanking(false);
  };
  const handleRepayLoan = () => {
    if (user) repayLoan(roomId!, user.uid, gameState);
    setShowBanking(false);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addAI = async (diff: 'easy' | 'medium' | 'hard') => {
    if (!isHost || playersArr.length >= 6) return;

    const usedImages = playersArr.map(([_, p]: [string, any]) => p.photoURL);
    const availablePool = CHARACTER_OPTIONS.filter(char => !usedImages.includes(char.image));

    if (availablePool.length === 0) {
      alert("No more shinobi of this rank are available for recruitment!");
      return;
    }

    const randomChar = availablePool[Math.floor(Math.random() * availablePool.length)];
    const aiId = `ai_${diff}_${Date.now()}`;

    await update(ref(db, `users/${user!.uid}`), { // Keep record of AI under host's session
      [`ai_players/${aiId}`]: true
    });

    await update(ref(db, `rooms/${roomId}/players/${aiId}`), {
      username: `${randomChar.name} AI`,
      isReady: true,
      isAI: true,
      difficulty: diff,
      photoURL: randomChar.image
    });
  };


  const removeAI = async (aiId: string) => {
    if (!isHost) return;
    await remove(ref(db, `rooms/${roomId}/players/${aiId}`));
  };

  // Calculate net worth for a player
  const getNetWorth = (p: any) => {
    if (!p) return 0;
    let worth = p.money || 0;
    (p.properties || []).forEach((propId: number) => {
      const tile = BOARD_DATA[propId];
      if (tile) {
        worth += tile.price || 0;
        const houses = gameState?.houses?.[propId] || 0;
        worth += houses * (tile.houseCost || 0);
      }
    });
    return worth;
  };

  const rank = getRankFromXP(userProfile?.xp || 0);
  const xpProgress = getXPForNextRank(userProfile?.xp || 0);
  const unlockedAchievements = userProfile?.achievements || [];

  return (
    <div className="h-screen flex flex-col font-serif overflow-hidden select-none relative"
      style={{
        backgroundColor: colors.bgPrimary,
        backgroundImage: 'url("/img/GameBG.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>

      <AchievementToast />
      <RealisticBackground />

      {/* Navbar */}
      <header className="shrink-0 flex items-center justify-between px-3 sm:px-8 py-2.5 sm:py-5 border-b relative z-30"
        style={{ backgroundColor: `${colors.headerBg}f2`, borderColor: `${colors.borderPrimary}30` }}>
        
        {/* Brand/Lobby Name Section */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={handleBackToLobby}>
            <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 p-1 shadow-lg group-hover:rotate-12 transition-transform">
              <img src="/img/MDLogo.png" alt="Logo" className="w-full h-full object-contain brightness-110" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xs sm:text-xl font-black italic tracking-tighter leading-none" style={{ color: colors.textPrimary }}>
                {room?.name || 'ARENA'}
              </h1>
              <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 ml-0.5">
                {room?.status === 'playing' ? 'Combat Phase' : 'Mission Prep'}
              </span>
            </div>
          </div>
        </div>

        {/* Header Action Section - Cleaned up for mobile */}
        <div className="flex items-center gap-1.5 sm:gap-4 relative z-10">
          {userProfile && (
            <div className="hidden xs:flex flex-col items-end gap-1 px-3 border-l-2 border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-[7px] sm:text-[9px] font-black uppercase text-amber-500 tracking-tighter">Combat XP</span>
                <span className="text-[7px] sm:text-[9px] font-bold" style={{ color: colors.textMuted }}>{userProfile.xp || 0} XP</span>
              </div>
              <div className="w-16 sm:w-24 h-1 sm:h-1.5 bg-black/40 rounded-full border border-white/5 overflow-hidden shadow-inner">
                <motion.div initial={{ width: 0 }} animate={{ width: `${xpProgress.percent}%` }} className="h-full bg-amber-500 shadow-[0_0_10px_#f59e0b]" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 p-0.5 sm:p-1 rounded-lg sm:rounded-2xl bg-black/10 border border-white/5 shadow-inner">
            <ThemeSelector />
            <div className="hidden xs:block w-px h-4 sm:h-6 bg-white/10 mx-0.5 sm:mx-1" />

            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setShowFriendsSelection(!showFriendsSelection)}
              className="p-1 sm:p-2 rounded-lg sm:rounded-xl transition-all bg-orange-600 text-white shadow-lg border-b-2 sm:border-b-4 border-orange-950"
            >
              <Users size={16} />
            </motion.button>

            <button
              onClick={() => setShowLeaderboard(true)}
              className="hidden lg:flex p-1 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500 text-white shadow-lg border-b-2 sm:border-b-4 border-amber-950"
              title="Hall of Fame"
            >
              <Trophy size={16} />
            </button>

            <button
              onClick={() => setShowShop(true)}
              className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-indigo-600 text-white shadow-lg border-b-2 sm:border-b-4 border-indigo-950"
              title="Shinobi Shop"
            >
              <ShoppingBag size={16} />
            </button>

            <button
              onClick={() => {
                setSidebarOpen(!sidebarOpen);
                if (showChat) setShowChat(false);
              }}
              className="p-1 sm:p-2 rounded-lg sm:rounded-xl transition-all bg-emerald-600 text-white shadow-lg border-b-2 sm:border-b-4 border-emerald-950"
            >
              <Shield size={16} />
            </button>
          </div>

          <button
            onClick={handleBackToLobby}
            className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-orange-600 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg border-b-2 sm:border-b-4 border-orange-950 active:translate-y-0.5 transition-all"
          >
            <Home size={14} />
            <span className="hidden sm:inline">Lobby</span>
          </button>
        </div>
      </header>

      {/* Achievements Modal */}
      {showAchievements && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAchievements(false)}>
          <div className="bg-white rounded-[2rem] border-4 w-full max-w-md p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]"
            style={{ borderColor: colors.accent, backgroundColor: colors.bgPrimary }}
            onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3"
                style={{ color: colors.textPrimary }}>
                <Trophy className="w-7 h-7 text-amber-500" /> Mission Log
              </h2>
              <button onClick={() => setShowAchievements(false)} className="p-2 rounded-xl hover:bg-black/5 transition-all">
                <X className="w-6 h-6" style={{ color: colors.textMuted }} />
              </button>
            </div>

            {/* Progress Overview */}
            <div className="mb-8 p-4 rounded-3xl bg-black/5 border border-black/5 shrink-0">
              <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Operational Status</span>
                  <span className="text-sm font-black italic uppercase" style={{ color: colors.accent }}>{rank.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold" style={{ color: colors.textMuted }}>{userProfile?.xp || 0} Total XP</span>
                </div>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden bg-black/10 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress.percent}%` }}
                  className="h-full rounded-full shadow-lg"
                  style={{
                    background: `linear-gradient(90deg, ${colors.accent}, ${colors.accentHover})`,
                    boxShadow: `0 0 10px ${colors.accentGlow}`
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[9px] font-bold" style={{ color: colors.textMuted }}>LVL {rank.badge}</span>
                <span className="text-[9px] font-bold" style={{ color: colors.textMuted }}>Next: {xpProgress.needed} XP</span>
              </div>
            </div>

            {/* Achievement Scroll Map */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {ACHIEVEMENTS.map(ach => {
                const isUnlocked = unlockedAchievements.includes(ach.id);
                return (
                  <motion.div
                    key={ach.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${isUnlocked ? '' : 'opacity-40 grayscale pointer-events-none'}`}
                    style={{
                      backgroundColor: isUnlocked ? `${colors.accent}08` : 'transparent',
                      borderColor: isUnlocked ? colors.accent : `${colors.borderSecondary}40`,
                    }}>
                    {isUnlocked && <div className="absolute top-0 right-0 p-1 bg-emerald-500 rounded-bl-xl shadow-lg z-10"><Check className="w-3 h-3 text-white" /></div>}
                    <div className="text-3xl filter drop-shadow-md">{ach.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-black uppercase text-xs tracking-tight" style={{ color: colors.textPrimary }}>{ach.name}</h4>
                      <p className="text-[10px] font-bold leading-tight mt-0.5 opacity-60" style={{ color: colors.textSecondary }}>{ach.description}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 shadow-xl border border-white/5">
                      <Zap className="w-3 h-3 text-orange-500 fill-orange-500" />
                      <span className="text-[9px] font-black text-white">+{ach.xpReward}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Primary Interface Layout */}
      <div className="flex-1 flex flex-col sm:flex-row relative overflow-hidden bg-black/5">

        {/* Battle Arena & Strategic Display */}
        <div className="flex-1 relative flex flex-col min-h-0">

          {(room?.status === 'playing' || gameState) ? (
            <div className="flex-1 relative flex flex-col items-center min-h-0 pt-2 sm:pt-4">
              {/* Large 3D Board Rendering */}
              <div className="flex-1 w-full flex flex-col items-center justify-start sm:justify-center p-1 sm:p-4 overflow-hidden relative"
                style={{ perspective: typeof window !== 'undefined' && window.innerWidth < 768 ? 'none' : '2500px' }}>
                <motion.div
                  initial={{ rotateX: 0, rotateZ: 0, scale: 0.9 }}
                  animate={{
                    rotateX: (room?.status === 'playing' && typeof window !== 'undefined' && window.innerWidth >= 768) ? 10 : 0,
                    scale: 1,
                    y: (room?.status === 'playing' && typeof window !== 'undefined' && window.innerWidth >= 768) ? 10 : 0
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`relative z-10 shadow-[0_50px_100px_rgba(0,0,0,0.6)] rounded-[1.5rem] sm:rounded-[3rem] overflow-hidden border-2 sm:border-8 border-orange-950/20 w-full max-w-[min(98vw,60vh,800px)] sm:max-w-[min(98vw,80vh,800px)] aspect-square flex items-center justify-center p-1 sm:p-4 transition-all duration-1000 ${dayNight === 'night' ? 'brightness-50 saturate-150 sepia-[0.3] hue-rotate-[10deg]' : 'brightness-110'}`}
                  style={{ backgroundColor: 'transparent' }}>
                  
                  <div className="absolute inset-0 bg-orange-950/10 -z-10" />
                  {dayNight === 'night' && (
                    <div className="absolute inset-0 bg-blue-900/10 pointer-events-none mix-blend-overlay z-20" />
                  )}
                  {gameState ? (
                    <Board2D 
                      gameState={gameState} 
                      roomId={roomId} 
                      onTileClick={(id) => setSelectedTileId(id)} 
                      players={gameState.players} 
                      missionTarget={gameState.activeMission?.targetTile}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4 opacity-50 animate-pulse">
                      <ScrollText className="w-16 h-16 text-orange-500" />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Opening Arena Scroll...</p>
                    </div>
                  )}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 to-transparent opacity-50" />

                  {/* Floating Property Card Intel Overlay - Only show if no card/purchase active */}
                  <AnimatePresence>
                    {gameState?.diceResult && !gameState.isGameOver && !gameState.activeCard && !gameState.activePurchase && (
                      <PropertyIntelOverlay
                        tileId={(gameState.players[gameState.turnOrder[gameState.currentTurnIndex]]?.position || 0)}
                        colors={colors}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Transparent Floating Timer - Now Centered */}
                <AnimatePresence>
                  {showSkipCountdown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] pointer-events-none"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.2, 1], color: ['#fff', '#ef4444', '#fff'] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-7xl sm:text-9xl font-black italic tracking-tighter opacity-80 bg-transparent drop-shadow-[0_0_30px_rgba(0,0,0,1)]"
                      >
                        {turnTimeLeft}
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>


              </div>

              {/* Tactical Command Toolbar (Floating) */}
              {isMyTurn && !gameState?.isGameOver && (
                <div className="fixed bottom-4 left-0 right-0 sm:bottom-0 z-[100] pointer-events-none flex flex-col items-center lg:items-end lg:pr-12 lg:pb-12">
                  <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    className="pointer-events-auto flex flex-col items-center gap-3 sm:gap-5 p-4 sm:p-8 rounded-[2.5rem] sm:rounded-[4rem] bg-slate-950/95 backdrop-blur-3xl border-2 shadow-[0_30px_100px_rgba(0,0,0,0.9)] relative overflow-hidden w-[92%] sm:w-full max-w-[360px] sm:max-w-[440px]"
                    style={{ borderColor: `${colors.accent}66` }}
                  >
                    {/* Subtle Pulsing Background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
                    <motion.div 
                      animate={{ opacity: [0.05, 0.1, 0.05] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.1),transparent)] pointer-events-none" 
                    />

                    <div className="flex flex-col items-center relative z-10 w-full gap-4 sm:gap-7">
                      <div className="flex items-center gap-3 sm:gap-5 w-full">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-orange-500/50" />
                        <h3 className="text-[10px] sm:text-xs font-black uppercase italic tracking-[0.4em] text-white/40 font-syne">Strategy</h3>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-orange-500/50" />
                      </div>

                      {!gameState.diceResult ? (
                        <button
                          onClick={handleRollDice}
                          className="w-full relative group btn-shinobi"
                        >
                          <div className="absolute -inset-1 sm:-inset-2 bg-orange-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-500"></div>
                          <div className="relative px-6 py-4 sm:px-12 sm:py-7 bg-gradient-to-br from-orange-500 to-orange-700 text-white font-black rounded-2xl sm:rounded-[2.5rem] border-b-4 sm:border-b-8 border-orange-950 uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:translate-y-1 active:border-b-2 hover:scale-[1.02] shadow-[0_15px_30px_rgba(234,88,12,0.3)] text-xs sm:text-lg">
                            <Zap className="w-5 h-5 sm:w-8 sm:h-8 fill-white animate-pulse" /> ROLL DICE
                          </div>
                        </button>
                      ) : (
                        <div className="flex flex-col gap-3 w-full">
                          <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={handleBuyProperty}
                            disabled={!canBuy}
                            className={`w-full py-4 sm:py-7 relative overflow-hidden font-black rounded-2xl sm:rounded-[2.5rem] border-b-4 sm:border-b-8 shadow-2xl disabled:opacity-30 disabled:grayscale uppercase tracking-[0.2em] text-[10px] sm:text-base italic transition-all active:translate-y-1 active:border-b-2 ${canBuy ? 'bg-emerald-600 border-emerald-950 text-white shadow-emerald-900/40' : 'bg-slate-800 border-slate-950 text-slate-500 shadow-none'}`}
                          >
                            {canBuy ? (isMobile ? "BUY PROPERTY" : "PURCHASE LAND") : "OWNED / N-A"}
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={handleEndTurn}
                            className="w-full py-3 sm:py-5 bg-white/5 hover:bg-white/10 text-white/90 font-black rounded-xl sm:rounded-3xl border-b-2 border-white/10 uppercase tracking-[0.2em] text-[9px] sm:text-xs italic transition-all active:translate-y-1"
                          >
                            Finish Mission
                          </motion.button>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 sm:gap-5 w-full pt-4 border-t border-white/5">
                        <button
                          onClick={() => setShowTrade(true)}
                          className="py-3 sm:py-5 bg-white/5 hover:bg-orange-500/10 text-white font-black rounded-2xl text-[9px] sm:text-[11px] uppercase border border-white/5 tracking-widest flex items-center justify-center gap-2.5 transition-all group"
                        >
                          <MessageSquareText className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" /> INTEL
                        </button>
                        <button
                          onClick={() => setShowBanking(true)}
                          className="py-3 sm:py-5 bg-white/5 hover:bg-emerald-500/10 text-white font-black rounded-2xl text-[9px] sm:text-[11px] uppercase border border-white/5 tracking-widest flex items-center justify-center gap-2.5 transition-all group"
                        >
                          <Landmark className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" /> BANK
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          ) : (
            /* Immersive Pre-game Lobby */
            <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4 z-20">
             <div
                className="p-4 sm:p-10 rounded-[2.5rem] sm:rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-4 w-full max-w-[520px] h-[90vh] sm:h-auto max-h-[92vh] relative overflow-hidden glass-ui animate-in zoom-in-95 duration-700 flex flex-col"
                style={{ backgroundColor: `${colors.bgTertiary}f2`, borderColor: colors.borderPrimary }}>

                {/* Background Shuriken Decor */}
                <div className="absolute -top-10 -right-10 opacity-10 rotate-45 transform pointer-events-none">
                  <FloatingShuriken style={{ width: '200px', height: '200px' }} />
                </div>

                <div className="flex flex-col items-center justify-center border-b pb-4 mb-4 gap-2 shrink-0 relative"
                  style={{ borderColor: `${colors.borderPrimary}30` }}>
                  <div className="px-3 py-1 bg-orange-600 rounded-full shadow-lg mb-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] italic text-white">Mission Prep</span>
                  </div>
                  <h2 
                    className="text-2xl sm:text-4xl font-black uppercase tracking-tighter italic text-center drop-shadow-md"
                    style={{ color: colors.textPrimary }}
                  >
                    Shinobi Arena
                  </h2>
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="absolute top-0 right-0 p-2 bg-white/5 rounded-xl hover:bg-white/10 border border-white/10 transition-all opacity-50 hover:opacity-100"
                  >
                    <QrCode className="w-4 h-4 text-orange-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 py-2">
                  <AnimatePresence>
                    {playersArr.map(([id, p]: [string, any]) => {
                      if (!p) return null;
                      return (
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: 20, opacity: 0 }}
                          key={id}
                          className="flex items-center gap-3 sm:gap-5 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-2 transition-all relative overflow-hidden group shadow-sm"
                          style={{
                            backgroundColor: p.isReady ? `${colors.accent}15` : 'rgba(255,255,255,0.03)',
                            borderColor: p.isReady ? colors.accent : `${colors.borderPrimary}20`
                          }}>
                          
                          {/* Recruit/Add Friend Button - Now on the left side */}
                          {!p.isAI && id !== (user?.uid || '') && (
                            <button 
                              onClick={() => addFriend(p)}
                              className="p-2.5 sm:p-3 rounded-xl bg-orange-600/20 text-orange-400 hover:bg-orange-600 hover:text-white transition-all border border-orange-500/30 group/add shrink-0"
                              title="Recruit to Alliance"
                            >
                              <Plus className="w-4 h-4 group-hover/add:rotate-90 transition-transform" />
                            </button>
                          )}

                          <div className="relative shrink-0">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl border-2 border-orange-500/30 overflow-hidden bg-white/5">
                              <img src={p.photoURL || '/img/MDLogo.png'} className="w-full h-full object-contain scale-110" />
                            </div>
                            {p.isReady && (
                              <div className="absolute -top-1 -right-1 bg-emerald-500 p-1 rounded-full border border-white shadow-lg">
                                <Check className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black uppercase text-[10px] sm:text-sm truncate italic" style={{ color: colors.textPrimary }}>
                              {p.username || 'Shinobi'}
                            </h4>
                            <div className="flex items-center gap-1 opacity-50">
                              <div className="h-1 w-1 rounded-full bg-orange-400" />
                              <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-widest truncate">
                                {id === room?.host ? 'Leader' : 'Elite'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            {!p.isAI && id === (user?.uid || '') ? (
                              <button onClick={() => setShowCharSelect(true)}
                                className="flex flex-col items-center justify-center p-3 sm:p-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-xl transition-all active:scale-95 border-b-4 border-orange-950 group h-14 w-14">
                                <Medal className="w-5 h-5 fill-current mb-0.5 group-hover:rotate-12 transition-transform" />
                                <span className="text-[8px] font-black uppercase tracking-tighter">SKIN</span>
                              </button>
                            ) : isHost && p.isAI && (
                              <button onClick={() => removeAI(id)}
                                className="p-3 rounded-xl bg-red-600/80 hover:bg-red-700 text-white shadow-lg transition-all active:scale-90 border-b-4 border-red-950">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                 <div className="shrink-0 pt-6 border-t-2 mt-4 space-y-5" style={{ borderColor: `${colors.borderPrimary}30` }}>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button onClick={toggleReady}
                      className="flex-1 py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl border-b-4 transition-all hover:brightness-110 active:translate-y-1 text-[10px] sm:text-xs"
                      style={{
                        backgroundColor: room?.players?.[user?.uid || '']?.isReady ? colors.accent : '#10b981',
                        borderColor: room?.players?.[user?.uid || '']?.isReady ? colors.accentBorder : '#065f46',
                        color: '#fff' // Keep white for filled colorful buttons
                      }}>
                      {room?.players?.[user?.uid || '']?.isReady ? 'Stand Down' : 'Declare Ready'}
                    </button>
                    {isHost && (
                      <button onClick={startGame} disabled={!allReady || playersArr.length < 2}
                        className="flex-1 py-4 disabled:bg-slate-300 disabled:opacity-50 font-black rounded-2xl border-b-4 border-orange-950 flex items-center justify-center gap-3 shadow-2xl transition-all hover:brightness-110 active:translate-y-1 text-[10px] sm:text-xs"
                        style={{ backgroundColor: colors.btnPrimary, color: '#fff' }}>
                        <Zap className="w-4 h-4 fill-white" /> IGNITE BATTLE
                      </button>
                    )}
                  </div>

                  {isHost && playersArr.length < 6 && (
                    <div className="pt-2 px-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                        <p className="text-[10px] font-black uppercase text-center tracking-[0.3em] opacity-80 italic" style={{ color: colors.textPrimary }}>Summon AI Allies</p>
                        <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
                      </div>
                      <div className="flex gap-3">
                        {['easy', 'medium', 'hard'].map((diff) => (
                          <button key={diff} onClick={() => addAI(diff as any)}
                            className="flex-1 py-3 transition-all font-black rounded-xl border text-[9px] uppercase tracking-widest active:scale-95 shadow-sm"
                            style={{ 
                              backgroundColor: colors.bgCard, 
                              borderColor: `${colors.accent}44`,
                              color: colors.textPrimary 
                            }}>
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Character Selection Seamless Overlay */}
          <AnimatePresence>
            {showCharSelect && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 md:backdrop-blur-md"
                  onClick={() => setShowCharSelect(false)}
                >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="relative w-full max-w-[480px] rounded-[3rem] border-4 shadow-[0_40px_100px_rgba(0,0,0,1)] p-8 overflow-hidden"
                  style={{ backgroundColor: colors.bgTertiary, borderColor: colors.borderPrimary }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-10 pointer-events-none" />

                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-600/20">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <h2 
                        className="text-2xl font-black uppercase tracking-tighter italic"
                        style={{ color: colors.textPrimary }}
                      >
                        Select Your Skin
                      </h2>
                    </div>
                    <button onClick={() => setShowCharSelect(false)} className="p-2 rounded-full hover:bg-black/10 transition-all">
                      <X className="w-6 h-6" style={{ color: colors.textMuted }} />
                    </button>
                  </div>
                  <div className="flex gap-2 mb-6 relative z-10 overflow-x-auto pb-2 custom-scrollbar">
                    {(['HOKAGE', 'KAGE', 'AKATSUKI'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          if (cat === 'AKATSUKI' && activeCategory !== 'AKATSUKI') {
                            setShowAkatsukiIntro(true);
                          } else if (cat === 'HOKAGE' && activeCategory !== 'HOKAGE') {
                            setShowHokageIntro(true);
                          }
                          setActiveCategory(cat);
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-b-4 active:translate-y-1 ${
                          activeCategory === cat 
                            ? 'text-white border-orange-900 shadow-lg' 
                            : 'bg-black/20 text-slate-500 border-transparent'
                        }`}
                        style={activeCategory === cat ? { backgroundColor: colors.accent } : {}}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 xxs:grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 gap-3 max-h-[min(60vh,500px)] overflow-y-auto pr-1 custom-scrollbar p-1 pb-6 relative z-10">
                    {(CHARACTER_OPTIONS || []).filter(c => c.category === activeCategory).map(char => {
                      const isSelected = (room?.players?.[user?.uid || ''] as any)?.photoURL === char.image;
                      const isTaken = Object.entries(room?.players || {}).some(([pid, p]: [string, any]) =>
                        p && p.photoURL === char.image && pid !== user?.uid
                      );

                      return (
                        <CharacterSelectionCard
                          key={char.id}
                          char={char}
                          isSelected={isSelected}
                          isTaken={isTaken}
                          colors={colors}
                          onSelect={async (img: string) => {
                            if (!user?.uid || !roomId) return;
                            try {
                              await update(ref(db, `rooms/${roomId}/players/${user.uid}`), { photoURL: img });
                              setShowCharSelect(false);
                            } catch (e) {
                              console.error("Failed to select skin:", e);
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                </motion.div>
                
                {/* Akatsuki Cinematic Intro Overlay */}
                <AnimatePresence>
                  {showAkatsukiIntro && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center p-0"
                    >
                       <video 
                          src="/video/AkatsukiTeam.mp4" 
                          autoPlay 
                          onEnded={() => setShowAkatsukiIntro(false)}
                          className="w-full h-full object-cover"
                          preload="none"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
                       <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 1 }}
                          className="absolute bottom-12 flex flex-col items-center gap-4"
                       >
                          <p className="text-red-500 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">INITIATING AKATSUKI PROTOCOL</p>
                          <button 
                             onClick={() => setShowAkatsukiIntro(false)} 
                             className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-full uppercase tracking-widest text-[10px] shadow-[0_0_30px_rgba(220,38,38,0.5)] border-b-4 border-red-950 active:translate-y-1 transition-all"
                          >
                             Enter Hideout
                          </button>
                       </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hokage Cinematic Intro Overlay */}
                <AnimatePresence>
                  {showHokageIntro && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center p-0"
                    >
                       <video 
                          src="/video/HokageTeam.mp4" 
                          autoPlay 
                          onEnded={() => setShowHokageIntro(false)}
                          className="w-full h-full object-cover"
                          preload="none"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
                       <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 1 }}
                          className="absolute bottom-12 flex flex-col items-center gap-4"
                       >
                          <p className="text-orange-500 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">WILL OF FIRE INHERITED</p>
                          <button 
                             onClick={() => setShowHokageIntro(false)} 
                             className="px-10 py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-full uppercase tracking-widest text-[10px] shadow-[0_0_30px_rgba(234,88,12,0.5)] border-b-4 border-orange-950 active:translate-y-1 transition-all"
                          >
                             Proceed to Village
                          </button>
                       </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Sidebar - Mission Status & Intel */}
        {(room?.status === 'playing' || room?.status === 'finished' || room?.status === 'lobby' || gameState) && (
          <>
            {/* Mobile sidebar overlay */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[140] lg:hidden bg-black/70 backdrop-blur-sm"
                  onClick={() => setSidebarOpen(false)}
                />
              )}
            </AnimatePresence>

            <div className={`
              fixed top-0 left-0 h-full lg:h-[calc(100vh-80px)] lg:top-20
              w-[300px] sm:w-[320px]
              flex flex-col z-[150] shadow-2xl overflow-hidden glass-ui transition-all duration-500 ease-[cubic-bezier(0.4,0,1,1)]
              ${sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
            `} style={{ backgroundColor: `${colors.sidebarBg}f2`, borderColor: colors.borderPrimary, borderRightWidth: '2px' }}>

              {/* Sidebar Header & Tabs */}
              <div className="shrink-0 flex flex-col border-b"
                style={{ borderColor: `${colors.borderPrimary}50`, backgroundColor: `${colors.headerBg}f2` }}>
                <div className="p-4 pb-2 flex items-center justify-between">
                  <h3 className="font-black text-xs flex items-center gap-3 uppercase tracking-widest text-white italic"
                    style={{ color: colors.textPrimary }}>
                    <ScrollText className="w-5 h-5 text-orange-500" /> MISSION CONTROL
                  </h3>
                  <button className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all" onClick={() => setSidebarOpen(false)}>
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex mt-3 px-3 gap-1.5 sm:gap-2 pb-2">
                  <button onClick={() => setSidebarTab('status')}
                    className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-all text-[8px] sm:text-[10px] font-black tracking-widest rounded-xl border-b-4 uppercase`}
                    style={{
                      color: sidebarTab === 'status' ? 'white' : colors.textMuted,
                      backgroundColor: sidebarTab === 'status' ? colors.accent : 'rgba(255,255,255,0.05)',
                      borderColor: sidebarTab === 'status' ? colors.accentBorder : 'transparent'
                    }}>
                    <Users className="w-3.5 h-3.5" /> <span className="hidden xs:inline">STATUS</span>
                  </button>
                  <button onClick={() => setSidebarTab('intel')}
                    className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-all text-[8px] sm:text-[10px] font-black tracking-widest rounded-xl border-b-4 uppercase`}
                    style={{
                      color: sidebarTab === 'intel' ? 'white' : colors.textMuted,
                      backgroundColor: sidebarTab === 'intel' ? colors.accent : 'rgba(255,255,255,0.05)',
                      borderColor: sidebarTab === 'intel' ? colors.accentBorder : 'transparent'
                    }}>
                    <History className="w-3.5 h-3.5" /> <span className="hidden xs:inline">INTEL</span>
                  </button>
                  <button onClick={() => setSidebarTab('chat')}
                    className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-all text-[8px] sm:text-[10px] font-black tracking-widest rounded-xl border-b-4 uppercase`}
                    style={{
                      color: sidebarTab === 'chat' ? 'white' : colors.textMuted,
                      backgroundColor: sidebarTab === 'chat' ? colors.accent : 'rgba(255,255,255,0.05)',
                      borderColor: sidebarTab === 'chat' ? colors.accentBorder : 'transparent'
                    }}>
                    <MessageCircle className="w-3.5 h-3.5" /> <span className="hidden xs:inline">CHAT</span>
                  </button>
                </div>
              </div>

              {/* Sidebar Content Scroll */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10 pointer-events-none" />

                {sidebarTab === 'status' ? (
                  <div className="flex-1 p-3 space-y-4 overflow-y-auto custom-scrollbar relative z-10">
                    <AnimatePresence mode="popLayout">
                      {Object.values((gameState?.players || {}) as any).filter(p => !!p).map((p: any) => {
                        const isActive = (gameState?.turnOrder || [])[gameState?.currentTurnIndex || 0] === p.id && !p.isBankrupt;
                        const netWorth = getNetWorth(p);
                        const playerLoan = gameState?.loans?.[p.id];

                        return (
                          <ThreeDCard key={p.id}>
                            <motion.div
                              layout
                              className={`p-4 rounded-[2rem] border-2 transition-all relative overflow-hidden group ${p.isBankrupt ? 'grayscale opacity-30 scale-95' : ''}`}
                              style={{
                                backgroundColor: isActive ? colors.playerCardActive : 'rgba(255,255,255,0.03)',
                                borderColor: isActive ? colors.accent : `${colors.borderSecondary}30`,
                                boxShadow: isActive ? `0 15px 40px ${colors.accentGlow}` : 'none'
                              }}>

                              <div className="flex items-center gap-4 relative z-10">
                                <div className="relative shrink-0">
                                  <div className={`w-16 h-16 rounded-[1.25rem] border-2 shadow-2xl overflow-hidden flex items-center justify-center bg-white/10 ${isActive ? 'animate-pulse' : ''}`}
                                    style={{ borderColor: isActive ? colors.accent : colors.borderPrimary }}>
                                    <img src={p.photoURL || '/img/characters/Naruto/NARUTO.png'} alt={p.username}
                                      className="w-full h-full object-contain scale-110 drop-shadow-xl" />
                                  </div>
                                  {isActive && !p.isBankrupt && (
                                    <motion.div
                                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                                      className="absolute -top-1 -right-1 bg-orange-600 p-1.5 rounded-full border-2 border-white shadow-xl z-20"
                                    >
                                      <Zap className="w-3.5 h-3.5 text-white fill-white animate-pulse" />
                                    </motion.div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className={`font-black uppercase text-sm truncate tracking-tight transition-colors ${isActive ? 'text-orange-950' : 'text-white'}`}>
                                    {p.username}
                                  </h4>
                                  <div className="flex flex-col gap-1.5 mt-2">
                                    <motion.div
                                      animate={isActive ? { scale: [1, 1.02, 1] } : {}}
                                      transition={{ repeat: Infinity, duration: 2.5 }}
                                      className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-black/40 border border-white/5 mt-2 shadow-inner"
                                    >
                                      <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <Coins className="w-4 h-4 text-emerald-400" />
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase text-emerald-500 tracking-[0.2em] leading-none mb-0.5 opacity-60">Treasury</span>
                                        <span className="text-base font-black tracking-tight text-white italic">
                                          ₱{(p.money || 0).toLocaleString()}
                                        </span>
                                      </div>
                                    </motion.div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.1em]">Combat Pwr: ₱{netWorth}</span>
                                      {playerLoan && (
                                        <div className="px-2 py-0.5 bg-red-600/20 border border-red-500/30 rounded-full flex items-center gap-1 animate-pulse">
                                          <Landmark className="w-2.5 h-2.5 text-red-500" />
                                          <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">Indebted</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Territory Badges */}
                              {!p.isBankrupt && p.properties && p.properties.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/5">
                                  {p.properties.map((propId: number) => (
                                    <div key={propId} className="w-3 h-3 rounded-md border-2 border-white/10 shadow-lg hover:scale-125 transition-all"
                                      style={{ backgroundColor: BOARD_DATA[propId]?.color ? getColorHex(BOARD_DATA[propId].color!) : '#444' }}
                                      title={BOARD_DATA[propId]?.name} />
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          </ThreeDCard>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                ) : sidebarTab === 'intel' ? (
                  /* Strategic Intel / Scroll of Records */
                  <div className="flex-1 flex flex-col p-4 overflow-hidden relative z-10 bg-black/10">
                    <div className="shrink-0 mb-4 flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 italic">Mission Archives</span>
                      </div>
                      <History className="w-4 h-4 text-slate-500" />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                      <AnimatePresence mode="popLayout">
                        {(gameState?.logs || []).length > 0 ? (
                          [...gameState.logs].reverse().map((log: string, i: number) => (
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              key={i}
                              className={`group/log p-3 rounded-2xl border-l-[6px] border-orange-600/50 shadow-sm border-y border-r flex items-start gap-3 transition-all hover:brightness-95`}
                              style={{ 
                                backgroundColor: colors.bgCard, 
                                borderColor: `${colors.borderPrimary}33` 
                              }}
                            >
                              <div className="mt-1 shrink-0">
                                {log.toLowerCase().includes('roll') || log.toLowerCase().includes('move') ? <Zap className="w-3.5 h-3.5 text-orange-400" /> :
                                  log.toLowerCase().includes('buy') || log.toLowerCase().includes('seize') ? <Landmark className="w-3.5 h-3.5 text-emerald-400" /> :
                                    log.toLowerCase().includes('pay') || log.toLowerCase().includes('rent') ? <Coins className="w-3.5 h-3.5 text-red-400" /> :
                                      log.toLowerCase().includes('failed') ? <X className="w-3.5 h-3.5 text-red-500" /> :
                                        <ScrollText className="w-3.5 h-3.5 text-slate-400" />}
                              </div>
                              <p className="text-[11px] font-bold leading-relaxed italic lowercase first-letter:uppercase opacity-90 group-hover:first-letter:scale-110 transition-transform" style={{ color: colors.textPrimary }}>
                                {log}
                              </p>
                            </motion.div>
                          ))
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center opacity-10 gap-4 grayscale">
                            <ScrollText className="w-16 h-16" />
                            <p className="text-[12px] font-black uppercase tracking-[0.4em] text-center">No mission data recorded in this scroll</p>
                          </div>
                        )}
                      </AnimatePresence>
                      <div ref={logsEndRef} />
                    </div>

                    {/* Tactics Board (Bottom of Intel) */}
                    <div className="mt-5 shrink-0 bg-orange-600/10 backdrop-blur-xl rounded-[2.5rem] p-6 border-2 border-orange-600/30 shadow-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">Tactical Summary</p>
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-black/20 rounded-2xl border border-white/5">
                          <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Chakra Pool</span>
                          <span className="text-sm font-black text-emerald-400">₱{gameState?.freeParkingMoney || 0}</span>
                        </div>
                        <div className="p-3 bg-black/20 rounded-2xl border border-white/5">
                          <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Elite Active</span>
                          <span className="text-sm font-black text-white">{Object.keys(gameState?.players || {}).length} Units</span>
                        </div>
                    </div>
                  </div>
                </div>
              ) : (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <ChatSystem
                      roomId={roomId}
                      username={userProfile?.username || 'Shinobi'}
                      photoURL={userProfile?.photoURL}
                      colors={colors}
                      isEmbedded={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- Global Modals & Overlays --- */}

      {/* QR Mission Seal Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 50 }}
              className="relative w-full max-w-sm rounded-[3.5rem] border-4 shadow-2xl overflow-hidden flex flex-col items-center p-10 sm:p-14"
              style={{
                backgroundColor: colors.bgTertiary,
                borderColor: colors.accent,
                backgroundImage: 'url("/img/LobbyBG.png")',
                backgroundSize: 'cover'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
              <div className="relative z-10 flex flex-col items-center w-full">
                <div className="text-center mb-10">
                  <div className="inline-block px-4 py-1 bg-orange-600 rounded-full text-[10px] font-black text-white uppercase tracking-[0.3em] mb-3 shadow-lg">Forbidden Seal</div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter text-white italic drop-shadow-2xl">Summoning Ritual</h3>
                </div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="p-6 bg-white rounded-[3rem] shadow-[0_0_80px_rgba(251,146,60,0.5)] border-8 border-orange-500/30 mb-10"
                >
                  <QRCodeCanvas
                    value={`${window.location.origin}/game/${roomId}`}
                    size={240}
                    level="H"
                    includeMargin={false}
                  />
                </motion.div>

                <div className="flex flex-col items-center gap-6 w-full">
                  <div className="px-8 py-3 bg-white/5 backdrop-blur-xl border-2 border-white/10 rounded-2xl flex flex-col items-center gap-1 w-full">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Forbidden Mission ID</span>
                    <span className="text-xl font-black text-orange-500 tracking-[0.2em]">{roomId}</span>
                  </div>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="w-full py-5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-3xl uppercase tracking-[0.3em] shadow-2xl border-b-8 border-orange-950 active:translate-y-1 transition-all text-xs"
                  >
                    Seal the Scroll
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trade Strategy Modal */}
      {showTrade && gameState && (
        <TradeModal
          players={gameState.players}
          me={user?.uid || ''}
          onClose={() => setShowTrade(false)}
          onPropose={(offer) => proposeTrade(roomId!, offer)}
        />
      )}

      {/* Diplomatic Trade Alert */}
      <AnimatePresence>
        {gameState?.pendingTrade && gameState.pendingTrade.to === user?.uid && (
          <motion.div
            initial={{ y: -100, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: -100, x: '-50%', opacity: 0 }}
            className="fixed top-24 left-1/2 z-[300] glass-ui border-4 p-8 rounded-[3rem] shadow-[0_30px_90px_rgba(0,0,0,0.6)] max-w-sm w-[90%] flex flex-col items-center border-orange-500/50"
          >
            <div className="p-4 bg-orange-600 rounded-2xl mb-5 shadow-lg animate-bounce">
              <ScrollText className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-black uppercase italic text-center mb-2 text-white text-xl tracking-tighter">Diplomatic Proposal</h3>
            <p className="text-xs font-bold text-center mb-8 text-slate-300 leading-relaxed">
              A messenger from <b>{gameState.players?.[gameState.pendingTrade.from]?.username || 'a Mystery Villa'}'s</b> squad has arrived with a trade contract.
            </p>
            <div className="flex gap-4 w-full">
              <button onClick={() => executeTrade(roomId!, gameState)}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl transition-all active:scale-95 border-b-4 border-emerald-950">Accept Scroll</button>
              <button onClick={() => update(ref(db, `rooms/${roomId}/gameState/pendingTrade`), null)}
                className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl transition-all active:scale-95 border-b-4 border-red-950">Decline Tactics</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Village Treasury / Banking Sheet */}
      <AnimatePresence>
        {showBanking && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 inset-x-0 z-[600] lg:left-auto lg:right-8 lg:bottom-8 lg:w-[360px] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] lg:shadow-2xl glass-ui rounded-t-[4rem] lg:rounded-[3.5rem] border-t-8 lg:border-4 overflow-hidden border-amber-600/50"
            style={{ backgroundColor: `${colors.bgSecondary}f2` }}
          >
            <div className="p-2 flex flex-col items-center border-b border-white/5">
              <div className="w-16 h-1.5 bg-white/20 rounded-full my-4 lg:hidden" />
              <button onClick={() => setShowBanking(false)} className="hidden lg:block p-3 ml-auto text-white/30 hover:text-white transition-all"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-8 pb-12">
              <div className="flex items-center gap-5 mb-10">
                <div className="p-4 bg-amber-600 rounded-[1.5rem] shadow-[0_15px_30px_rgba(217,119,6,0.4)]">
                  <Landmark className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-widest text-lg text-white italic">Village Treasury</h3>
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em] leading-none mt-1">Resource Management</p>
                </div>
              </div>

              {myLoan ? (
                <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-[2.5rem] border-2 border-amber-500/20 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Skull className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Active Debt Scroll</p>
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-3xl font-black text-white italic tracking-tighter">₱{myLoan.totalOwed}</span>
                    <span className="text-[9px] font-black text-red-500 uppercase px-3 py-1 bg-red-600/10 rounded-full border border-red-500/20 animate-pulse">Critical Interest</span>
                  </div>
                  <div className="flex flex-col gap-2 text-[10px] font-bold text-slate-400 italic mb-8">
                    <div className="flex justify-between"><span>Tax Rate:</span> <span className="text-white">{(myLoan.interest * 100)}%</span></div>
                    <div className="flex justify-between"><span>Repayment Window:</span> <span className="text-amber-500">{Math.max(0, myLoan.turnsDue - ((gameState.totalTurns || 0) - myLoan.turnsTaken))} Turns</span></div>
                  </div>
                  {myPlayerState && myPlayerState.money >= myLoan.totalOwed && (
                    <button onClick={handleRepayLoan} className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-3xl border-b-8 border-emerald-950 uppercase text-[11px] tracking-[0.2em] shadow-xl transition-all active:translate-y-1">
                      CLEAR ALL DEBT (₱{myLoan.totalOwed})
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
                    <label className="text-[11px] font-black uppercase tracking-[0.4em] block mb-5 text-slate-400 text-center">Request War Allocation</label>
                    <input
                      type="range" min="50" max="500" step="50" value={loanAmount}
                      onChange={e => setLoanAmount(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-orange-600 mb-6"
                    />
                    <div className="flex justify-between items-center bg-black/30 p-4 rounded-2xl border border-white/5">
                      <span className="text-3xl font-black text-white italic tracking-tighter">₱{loanAmount}</span>
                      <div className="text-right">
                        <span className="block text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">+15% Interest</span>
                        <span className="text-[10px] font-bold text-slate-400">Total: ₱{Math.ceil(loanAmount * 1.15)}</span>
                      </div>
                    </div>
                  </div>

                  <button onClick={handleTakeLoan}
                    className="w-full py-5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-3xl border-b-8 border-orange-950 uppercase tracking-[0.3em] shadow-2xl transition-all active:translate-y-1 flex items-center justify-center gap-4 text-xs">
                    <Sparkles className="w-5 h-5 fill-white" /> ACCESS TREASURY
                  </button>
                  <p className="text-[10px] font-bold text-center text-slate-400 italic px-4">
                    "A ninja who fails to manage resources is no better than a genin in a jounin's world."
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shinobi Alliance Sidebar (Game View) */}
      <AnimatePresence>
        {showFriendsSelection && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFriendsSelection(false)}
              className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-[1001] w-[300px] sm:w-[360px] glass-ui shadow-[20px_0_60px_rgba(0,0,0,0.5)] border-r-4 flex flex-col p-8"
              style={{ backgroundColor: `${colors.bgPrimary}f2`, borderColor: colors.borderPrimary }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-600 rounded-2xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black uppercase italic text-white">Alliance</h3>
                </div>
                <button onClick={() => setShowFriendsSelection(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <X className="w-6 h-6 text-white/50" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pt-4">
                <div className="space-y-4">
                  <div className="px-4 py-2 bg-orange-600/20 rounded-full border border-orange-500/30 mb-6 flex items-center justify-center gap-2">
                    <Zap className="w-3 h-3 text-orange-400 rotate-12" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-400">Shinobi Alliance</p>
                  </div>
                  
                  {myFriends.length === 0 ? (
                    <div className="p-8 text-center opacity-30 flex flex-col items-center gap-4">
                      <Users className="w-12 h-12" />
                      <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">No strategic allies recruited yet.</p>
                    </div>
                  ) : (
                    myFriends.map((f: any) => (
                      <motion.div 
                        key={f.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="p-4 bg-slate-900/60 rounded-[2rem] border border-white/5 relative overflow-hidden group shadow-xl"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 to-transparent pointer-events-none" />
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="w-12 h-12 rounded-xl border-2 border-orange-500/30 overflow-hidden shadow-inner group-hover:border-orange-500 transition-all">
                            <img src={f.photoURL || "/img/MDLogo.png"} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-xs uppercase truncate text-white italic tracking-tight">{f.username}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Strategic Partner</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[7px] font-black text-slate-500 uppercase mb-0.5">Tactical Tier</span>
                            <span className="text-[10px] font-black text-orange-400 italic">RANK S</span>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-orange-600/30 to-transparent" />
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Friend Recruitment Notification */}
      <AnimatePresence>
        {activeNotification && (
          <NewFriendPopup 
            notification={activeNotification} 
            onClose={() => setActiveNotification(null)} 
            userProfile={userProfile}
            currentUserId={user?.uid || ''}
          />
        )}
      </AnimatePresence>
      {/* Extra Features: Modals */}
      <LeaderboardModal 
        isOpen={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)} 
        colors={colors} 
        rankings={globalRankings} 
      />
      <ShopModal 
        isOpen={showShop} 
        onClose={() => setShowShop(false)} 
        colors={colors} 
        userProfile={userProfile} 
      />
      <BattleModal
        isOpen={!!activeBattle}
        battleData={activeBattle}
        colors={colors}
        onCombatFinish={async (win: boolean, moveId: string) => {
          if (!activeBattle || !roomId || !isHost) return;
          const attackerId = activeBattle.attackerId;
          const defenderId = activeBattle.defenderId;
          const rent = activeBattle.originalRent;
          
          let finalRent = win ? Math.floor(rent * 0.5) : Math.floor(rent * 1.5);
          let chakraCost = moveId === 'ninjutsu' ? 30 : (moveId === 'genjutsu' ? 20 : 0);

          const updates: any = {};
          updates[`gameStates/${roomId}/players/${attackerId}/money`] = gameState.players[attackerId].money - finalRent;
          updates[`gameStates/${roomId}/players/${attackerId}/chakra`] = Math.max(0, gameState.players[attackerId].chakra - chakraCost);
          updates[`gameStates/${roomId}/players/${defenderId}/money`] = gameState.players[defenderId].money + finalRent;
          
          await update(ref(db), updates);
          setActiveBattle(null);
          setTimeout(() => endTurn(roomId, gameState), 1000);
        }}
      />

      <AnimatePresence>
        {gameState?.isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square max-w-[1000px] bg-gradient-to-r from-orange-600/10 via-transparent to-orange-600/10 rounded-full animate-pulse" />
              <FloatingShuriken count={15} />
            </div>

            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              className="relative w-full max-w-lg glass-ui p-8 sm:p-14 rounded-[3.5rem] border-4 shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col items-center text-center overflow-hidden"
              style={{ 
                borderColor: gameState.players[gameState.turnOrder.find((id: string) => !gameState.players[id].isBankrupt) || '']?.id === user?.uid 
                  ? '#10b981' : '#ef4444',
                backgroundColor: 'rgba(15, 23, 42, 0.98)'
              }}
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-10 pointer-events-none" />

              {(() => {
                const winnerId = gameState.turnOrder.find((id: string) => !gameState.players[id].isBankrupt);
                const isWinner = winnerId === user?.uid;
                
                return (
                  <>
                    <motion.div
                      initial={{ rotate: -10, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.3 }}
                      className={`px-8 py-3 rounded-2xl mb-8 border-b-8 shadow-2xl ${isWinner ? 'bg-emerald-600 border-emerald-900' : 'bg-red-600 border-red-950'}`}
                    >
                      <h2 className="text-4xl sm:text-6xl font-black uppercase text-white tracking-tightest italic leading-none py-2">
                        {isWinner ? 'VICTORY' : 'DEFEAT'}
                      </h2>
                    </motion.div>

                    <div className="w-40 h-40 rounded-[2.5rem] border-4 mb-8 overflow-hidden shadow-2xl relative group"
                      style={{ borderColor: isWinner ? '#10b981' : '#ef4444' }}>
                      <img 
                        src={gameState.players[winnerId || '']?.photoURL || '/img/MDLogo.png'} 
                        className="w-full h-full object-contain scale-125 transition-transform group-hover:scale-135" 
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-md py-2 border-t border-white/10">
                         <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">MISSION CHAMPION</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-black uppercase text-white italic mb-2 tracking-tighter">
                      {gameState.players[winnerId || '']?.username}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10 max-w-xs">
                      {isWinner 
                        ? "You have proven your worth as a legendary shinobi. The village stands strong thanks to your tactics."
                        : "Even the strongest shinobi face setbacks. Return to your training and prepare for the next mission."
                      }
                    </p>

                    <div className="grid grid-cols-2 gap-4 w-full mb-10">
                      <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
                        <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Final Wealth</span>
                        <span className="text-xl font-black text-emerald-400 italic">₱{(gameState.players[user?.uid || '']?.money || 0).toLocaleString()}</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
                        <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Combat Rank</span>
                        <span className={`text-xl font-black italic ${isWinner ? 'text-amber-500' : 'text-slate-300'}`}>
                          {isWinner ? 'S-RANK' : 'A-RANK'}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={handleBackToLobby}
                      className={`w-full py-5 font-black rounded-3xl uppercase tracking-[0.3em] shadow-2xl transition-all active:translate-y-1 text-sm border-b-8 flex items-center justify-center gap-4 ${isWinner ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-950 text-white' : 'bg-orange-600 hover:bg-orange-700 border-orange-950 text-white'}`}
                    >
                      <LogOut className="w-5 h-5" /> RECALL TO BASE
                    </button>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ------------------------------------------------------------------------------------------------
// HIGH-FIDELITY COMPONENTS FOR BOARD INTERACTIVITY
// ------------------------------------------------------------------------------------------------

function PropertyIntelOverlay({ tileId, colors }: { tileId: number, colors: any }) {
  const tile = BOARD_DATA[tileId] as any;
  if (!tile || !tile.name || ['go', 'jail', 'parking', 'gotojail', 'chest', 'chance', 'tax'].includes(tile.type)) return null;

  const typeLabel = tile.type === 'property' ? 'STRATEGIC TERRITORY' :
    tile.type === 'utility' ? 'VILLAGE UTILITY' : 'TRANSIT HUB';

  const tileColor = tile.color ? getColorHex(tile.color) : (tile.type === 'utility' ? '#3b82f6' : '#f59e0b');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7, y: 10 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] w-[170px] sm:w-[240px] pointer-events-none"
    >
      <div className="relative glass-ui rounded-[2rem] border-4 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden p-0.5"
        style={{ borderColor: `${tileColor}80`, backgroundColor: 'rgba(15, 23, 42, 0.95)' }}>

        {/* Header Strip */}
        <div className="h-10 sm:h-14 rounded-t-[1.7rem] flex flex-col items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: tileColor }}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-30" />
          <div className="relative z-10 flex flex-col items-center px-2">
            <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-black/60 leading-none mb-0.5 sm:mb-1">{typeLabel}</span>
            <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-tight text-black italic drop-shadow-sm text-center leading-tight">{tile.name}</h4>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-2 sm:p-4 flex flex-col gap-2 sm:gap-3">
          <div className="flex justify-between items-center border-b border-white/10 pb-1.5 sm:pb-2">
            <span className="text-[7px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Entry Tax</span>
            <span className="text-[11px] sm:text-sm font-black text-white italic">₱{(Array.isArray(tile.rent) ? tile.rent[0] : (tile.rent || 0)).toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
            <div className="flex flex-col gap-0.5 p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[6px] sm:text-[7px] font-bold text-slate-500 uppercase">Valuation</span>
              <span className="text-[9px] sm:text-[11px] font-black text-emerald-400 italic">₱{(tile.price || 0).toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-0.5 p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[6px] sm:text-[7px] font-bold text-slate-500 uppercase">Collateral</span>
              <span className="text-[9px] sm:text-[11px] font-black text-orange-400 italic">₱{Math.floor((tile.price || 0) / 2).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-1 sm:mt-2 flex justify-center opacity-30">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-white/20 flex items-center justify-center">
              <Landmark className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Texture Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-5 pointer-events-none" />
      </div>

      {/* Small Decorative Scroll Handles */}
      <div className="absolute -top-2 left-4 right-4 h-4 rounded-full bg-[#8b5e3c] border-2 border-[#5c3c24] -z-10 shadow-lg" />
      <div className="absolute -bottom-2 left-4 right-4 h-4 rounded-full bg-[#8b5e3c] border-2 border-[#5c3c24] -z-10 shadow-lg" />
    </motion.div>
  );
}
