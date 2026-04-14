import React, { useState, useEffect } from 'react';
import { History, Medal, Coins, ArrowRight, Award } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { db } from '../../firebase/config';
import { ref, onValue, query, limitToLast } from 'firebase/database';
import { ACHIEVEMENTS } from '../../store/useProgressionStore';
import { useThemeStore } from '../../store/useThemeStore';

interface MissionLog {
  id: string;
  name: string;
  winner: string;
  myFinalMoney: number;
  timestamp: number;
}

export default function MissionHistory() {
  const { user, profile } = useAuthStore();
  const { colors } = useThemeStore();
  const [history, setHistory] = useState<MissionLog[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const historyRef = query(ref(db, `users/${user.uid}/history`), limitToLast(10));
    const unsubscribe = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setHistory(Object.entries(data).map(([id, h]: [string, any]) => ({ id, ...h })).reverse());
      }
    });

    const transRef = query(ref(db, `users/${user.uid}/transaction_history`), limitToLast(10));
    const unsubTrans = onValue(transRef, (snap) => {
       const data = snap.val();
       if (data) setTransactions(Object.entries(data).map(([id, t]: [string, any]) => ({ id, ...t })).reverse());
    });

    return () => { unsubscribe(); unsubTrans(); };
  }, [user]);

  return (
    <div 
      className="p-5 rounded-lg shadow-xl border-x-4 flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: colors.bgTertiary, borderColor: colors.borderPrimary }}
    >
       <h2 
          className="text-lg font-black mb-4 flex items-center gap-2 uppercase tracking-tight italic"
          style={{ color: colors.textPrimary }}
       >
          <History className="w-5 h-5" style={{ color: colors.textAccent }} />
          Mission Log & Archives
       </h2>

         <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar min-h-0">
          {/* Realtime Achievements - Mapped to Archives */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 px-1" style={{ color: colors.textMuted }}>Unlocked Archives</h3>
            <div className="grid grid-cols-5 gap-2">
               {profile?.achievements?.map((achId) => {
                  const ach = ACHIEVEMENTS.find(a => a.id === achId);
                  return (
                    <div key={achId} className="aspect-square rounded-lg bg-orange-600/10 border-2 border-orange-500/30 flex items-center justify-center p-1" title={ach?.name}>
                       <span className="text-sm">{ach?.icon || '📜'}</span>
                    </div>
                  );
               })}
               {(!profile?.achievements || profile.achievements.length === 0) && (
                 <div className="col-span-5 text-[9px] font-bold opacity-30 text-center py-4 bg-black/5 rounded-lg">No archives earned yet.</div>
               )}
            </div>
          </div>

          <div className="h-px opacity-20" style={{ backgroundColor: colors.borderSecondary }} />

          {/* Training Logs */}
          <div className="space-y-2">
             <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 px-1" style={{ color: colors.textMuted }}>Training Rewards</h3>
             <div className="space-y-2">
                {transactions.map(t => (
                  <div key={t.id} className="p-2 border rounded-md flex justify-between items-center" style={{ backgroundColor: `${colors.accent}0d`, borderColor: `${colors.accent}33` }}>
                     <span className="text-[9px] font-black uppercase" style={{ color: colors.textPrimary }}>{t.game} Training</span>
                     <div className="flex items-center gap-1">
                        <Coins size={10} style={{ color: colors.textAccent }} />
                        <span className="text-[9px] font-extrabold" style={{ color: '#10b981' }}>+₱{t.amount}</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="h-px opacity-20" style={{ backgroundColor: colors.borderSecondary }} />

          {/* Past Missions */}
          <div className="space-y-3">
             <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 px-1" style={{ color: colors.textMuted }}>Operational History</h3>
             {history.length > 0 ? history.map((h) => (
                <div key={h.id} className="p-3 border-2 rounded flex flex-col gap-2 shadow-sm" style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSecondary }}>
                   <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase leading-none" style={{ color: colors.textPrimary }}>{h.name}</span>
                      <span className="text-[8px] font-bold" style={{ color: colors.textMuted }}>{new Date(h.timestamp).toLocaleDateString()}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                         <Award className="w-3.5 h-3.5" style={{ color: colors.accent }} />
                         <span className="text-[9px] font-black uppercase text-emerald-600">Winner: {h.winner}</span>
                      </div>
                      <div className="flex items-center gap-1">
                         <Coins className="w-3 h-3 text-yellow-600" />
                         <span className="text-[9px] font-black" style={{ color: colors.textSecondary }}>₱{h.myFinalMoney}</span>
                      </div>
                   </div>
                </div>
             )) : (
                <div className="text-center py-10 opacity-30 select-none" style={{ color: colors.textMuted }}>
                   <History size={40} className="mx-auto mb-2" />
                   <p className="text-[10px] font-black uppercase italic">Deployment logs are empty...</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
