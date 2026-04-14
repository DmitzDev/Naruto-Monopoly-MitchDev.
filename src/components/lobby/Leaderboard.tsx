import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { Trophy, Medal, Star, Shield, User, Coins, ScrollText } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { getRankFromXP } from '../../store/useProgressionStore';
import { motion } from 'framer-motion';

interface PlayerStat {
  username: string;
  wins: number;
  coins: number;
  xp: number;
  photoURL?: string;
  id: string;
}

export default function Leaderboard() {
  const { profile } = useAuthStore();
  const { colors } = useThemeStore();
  const [topPlayers, setTopPlayers] = useState<PlayerStat[]>([]);

  useEffect(() => {
    const usersRef = query(ref(db, 'users'), orderByChild('xp'), limitToLast(100));
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, p]: [string, any]) => ({
          id,
          username: p.username || 'Shinobi',
          wins: p.wins || 0,
          coins: p.coins || 0,
          xp: p.xp || 0,
          photoURL: p.photoURL || null
        }));
        
        const sortedList = list.sort((a, b) => b.xp - a.xp);
        setTopPlayers(sortedList);
      } else {
        setTopPlayers([]);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div 
      className="p-3 sm:p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-x-4 border-b-8 flex flex-col h-full overflow-hidden relative group"
      style={{ backgroundColor: colors.bgTertiary, borderColor: colors.borderPrimary }}
    >
        <div className="absolute inset-0 paper-texture opacity-10 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-6 relative z-10 px-2">
          <h2 className="text-base sm:text-2xl font-black flex items-center gap-3 uppercase tracking-tighter italic" style={{ color: colors.textPrimary }}>
            <div className="p-2 bg-amber-500/10 rounded-xl shadow-inner"><Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" /></div> Hall of Fame
          </h2>
          <div className="flex items-center gap-2 px-3 py-1 sm:py-2 rounded-full bg-black/5 border text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-inner" style={{ color: colors.textMuted }}>
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> {topPlayers.length} SHINOBI
          </div>
        </div>
        
        <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar space-y-3 relative z-10">
          {topPlayers.map((p, i) => {
            const rankInfo = getRankFromXP(p.xp);
            const isMe = p.username === profile?.username;
            const level = Math.floor(p.xp / 1000) + 1;
            
            return (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={`${p.id}-${i}`} 
                className={`flex items-center justify-between p-3 sm:p-4 rounded-[1.5rem] border-2 transition-all relative overflow-hidden group/item ${isMe ? 'shadow-[0_10px_30px_rgba(234,88,12,0.3)]' : 'shadow-md shadow-black/20'}`}
                style={{ 
                  backgroundColor: i === 0 ? `${colors.accent}1a` : isMe ? `${colors.accent}1a` : colors.bgCard,
                  borderColor: i === 0 ? colors.accent : isMe ? colors.accent : colors.borderSecondary
                }}
              >
                {isMe && <div className="absolute top-0 right-0 px-3 py-0.5 bg-orange-600 text-white text-[7px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">YOU</div>}
                
                <div className="flex items-center gap-2 sm:gap-4 relative z-10">
                   <div className="relative shrink-0">
                      <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 shadow-xl p-0.5 ${i === 0 ? 'border-amber-500 scale-105' : 'border-black/10'}`}>
                        <img src={p.photoURL || "/img/MDLogo.png"} alt="" className="w-full h-full object-cover rounded-xl" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                        {i === 0 ? <Medal className="w-6 h-6 text-amber-500 drop-shadow-lg animate-bounce" /> : <div className="p-1 bg-black/60 rounded-lg backdrop-blur-md border border-white/10"><span className="text-[10px] font-black text-white">{i + 1}</span></div>}
                      </div>
                   </div>

                   <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <span className="text-xs sm:text-base font-black uppercase tracking-tighter italic truncate" style={{ color: colors.textPrimary }}>{p.username}</span>
                        <div className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter shadow-sm flex items-center gap-1 border-b-2" 
                          style={{ backgroundColor: colors.bgTertiary, borderColor: colors.borderPrimary, color: colors.accent }}>
                          {rankInfo.badge} {rankInfo.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 opacity-80">
                         <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-orange-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>LVL {level}</span>
                         </div>
                         <div className="flex items-center gap-1">
                            <Coins className="w-3 h-3 text-amber-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#f59e0b]">₱{p.coins.toLocaleString()}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div 
                    className="flex items-center gap-1 px-3 py-1.5 rounded-2xl border-b-4 shadow-lg hover:scale-105 transition-transform"
                    style={{ backgroundColor: colors.bgInput, borderColor: colors.borderSecondary }}
                  >
                    <Star className="w-3.5 h-3.5" style={{ color: colors.textAccent, fill: colors.textAccent }} />
                    <span className="text-[10px] sm:text-xs font-black" style={{ color: colors.textPrimary }}>{p.wins} <span className="hidden sm:inline">WARS</span></span>
                  </div>
                  <div className="hidden sm:block h-1 w-20 bg-black/10 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-orange-600 rounded-full" style={{ width: `${Math.min(100, (p.xp % 1000) / 10)}%` }} />
                  </div>
                </div>
              </motion.div>
            );
          })}
          {topPlayers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-20 scale-150">
              <ScrollText className="w-16 h-16 mb-4" />
              <p className="font-black uppercase tracking-widest italic">Scroll of Records Empty</p>
            </div>
          )}
        </div>
    </div>
  );
}
