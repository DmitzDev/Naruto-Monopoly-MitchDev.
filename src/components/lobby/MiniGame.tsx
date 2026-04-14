import React, { useState, useEffect } from 'react';
import { Zap, PlayCircle, Coins, Target, Swords, Trophy, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { db } from '../../firebase/config';
import { ref, update, push } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';

// Stable Game Components
const ConcentrationGame = ({ onReward, onClose, colors }: any) => {
  const [pos, setPos] = React.useState(0);
  const [result, setResult] = React.useState<number | null>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPos(p => (p >= 100 ? 0 : p + 5));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handleStrike = () => {
    if (pos >= 43 && pos <= 57) setResult(50);
    else setResult(0);
  };

  if (result !== null) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className={`text-3xl font-black uppercase italic tracking-tighter ${result > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {result > 0 ? `PERFECT FOCUS! +P${result}` : 'CHAKRA LEAKED...'}
        </div>
        <button 
          type="button"
          onClick={() => result > 0 ? onReward(result, 'Concentration') : onClose()}
          className="px-10 py-3 bg-slate-800 text-white font-black rounded-xl border-b-4 border-black hover:bg-slate-700 transition-all active:translate-y-1"
        >
          Return to Grounds
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 py-4">
      <div className="relative w-full h-12 bg-black/40 rounded-full border-4 border-slate-800 overflow-hidden shadow-inner">
        <div className="absolute inset-y-0 left-[43%] right-[43%] bg-blue-500/30 animate-pulse border-x-2 border-blue-500/20" />
        <motion.div
          className="absolute inset-y-0 w-3 bg-yellow-400 shadow-[0_0_20px_yellow] z-10"
          style={{ left: `${pos}%` }}
        />
      </div>
      <button 
        type="button"
        onClick={handleStrike} 
        className="w-full py-5 bg-orange-600 text-white font-black rounded-2xl border-b-8 border-orange-950 text-xl shadow-2xl active:translate-y-2 active:border-b-4 transition-all"
      >
        CONCENTRATE!
      </button>
      <p className="text-center text-[10px] font-black uppercase opacity-40 tracking-widest">Strike when the yellow bar hits the blue zone</p>
    </div>
  );
};

const ShurikenGame = ({ onReward, colors }: any) => {
  const [targetPos, setTargetPos] = React.useState({ x: 50, y: 50 });
  const [hits, setHits] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(10);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTargetPos({ x: 15 + Math.random() * 70, y: 15 + Math.random() * 70 });
    }, 750);
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    if (timeLeft <= 0) {
      onReward(hits * 10, 'Shuriken');
      clearInterval(interval);
      clearInterval(timer);
    }
    return () => { clearInterval(interval); clearInterval(timer); };
  }, [timeLeft, hits, onReward]);

  return (
    <div className="relative w-full aspect-square bg-slate-900 rounded-3xl overflow-hidden border-8 border-slate-800 cursor-crosshair shadow-2xl">
      <div className="absolute top-4 right-6 text-white text-2xl font-black drop-shadow-lg">TIME: {timeLeft}s</div>
      <div className="absolute top-4 left-6 text-emerald-400 text-2xl font-black drop-shadow-lg">HITS: {hits}</div>

      <motion.button
        type="button"
        initial={false}
        animate={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
        onClick={() => setHits(h => h + 1)}
        className="absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center group"
      >
        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl group-hover:bg-red-500/40 transition-all" />
        <Target className="w-full h-full text-red-500 drop-shadow-[0_0_12px_red] group-active:scale-90 transition-transform" />
      </motion.button>

      <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20" />
    </div>
  );
};

export default function MiniGame() {
  const { profile, user, setProfile } = useAuthStore();
  const { colors } = useThemeStore();
  const [activeGame, setActiveGame] = useState<'concentration' | 'shuriken' | 'slots' | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  const handleReward = async (amount: number, gameName: string) => {
    if (!profile || !user) return;
    const newCoins = (profile.coins || 0) + amount;

    await update(ref(db, `users/${user.uid}`), { coins: newCoins });
    await push(ref(db, `users/${user.uid}/transaction_history`), {
      type: 'minigame',
      game: gameName,
      amount: amount,
      timestamp: Date.now()
    });

    setProfile({ ...profile, coins: newCoins });
    setCooldowns(prev => ({ ...prev, [gameName]: Date.now() + 30000 }));
    setActiveGame(null);
  };

  return (
    <div 
      className="p-5 rounded-3xl shadow-xl border-4 flex flex-col gap-4"
      style={{ backgroundColor: colors.bgSecondary, borderColor: colors.borderPrimary }}
    >
        <div 
          className="flex items-center justify-between border-b-2 pb-4"
          style={{ borderColor: colors.borderSecondary }}
        >
            <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6" style={{ color: colors.textAccent }} />
                <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: colors.textPrimary }}>Training Grounds</h2>
            </div>
            {activeGame && (
                <button 
                  type="button"
                  onClick={() => setActiveGame(null)} 
                  className="text-xs font-black uppercase text-red-600 transition-opacity hover:opacity-70"
                >
                  Surrender
                </button>
            )}
        </div>

        {!activeGame ? (
            <div className="grid grid-cols-1 gap-3">
                <button 
                  type="button"
                  onClick={() => setActiveGame('concentration')} 
                  className="p-4 rounded-2xl border-2 transition-all group flex items-center justify-between"
                  style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSecondary }}
                >
                    <div className="flex items-center gap-3">
                        <Zap className="w-8 h-8 text-blue-500 group-hover:animate-pulse" />
                        <div className="text-left">
                            <h3 className="font-black uppercase text-sm" style={{ color: colors.textPrimary }}>Chakra Focus</h3>
                            <p className="text-[10px] font-bold opacity-60" style={{ color: colors.textMuted }}>Test your timing (High Reward)</p>
                        </div>
                    </div>
                    <span className="text-sm font-black text-emerald-600">P50</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setActiveGame('shuriken')} 
                  className="p-4 rounded-2xl border-2 transition-all group flex items-center justify-between"
                  style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSecondary }}
                >
                    <div className="flex items-center gap-3">
                        <Target className="w-8 h-8 text-red-500 group-hover:rotate-45 transition-transform" />
                        <div className="text-left">
                            <h3 className="font-black uppercase text-sm" style={{ color: colors.textPrimary }}>Shuriken Target</h3>
                            <p className="text-[10px] font-bold opacity-60" style={{ color: colors.textMuted }}>Quick reflex challenge</p>
                        </div>
                    </div>
                    <span className="text-sm font-black text-emerald-600">P10/hit</span>
                </button>
            </div>
        ) : (
            <div>
                {activeGame === 'concentration' && (
                  <ConcentrationGame 
                    onReward={handleReward} 
                    onClose={() => setActiveGame(null)} 
                    colors={colors} 
                  />
                )}
                {activeGame === 'shuriken' && (
                  <ShurikenGame 
                    onReward={handleReward} 
                    colors={colors} 
                  />
                )}
            </div>
        )}

        <div className="mt-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase opacity-60" style={{ color: colors.textPrimary }}>
            <img src="/img/Currency/1Peso.png" className="w-4 h-4 shadow-sm" />
            <span>Earn Peso to upgrade your village</span>
        </div>
    </div>
  );
}
