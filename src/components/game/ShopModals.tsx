import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, ShoppingBag, Star, Zap, Medal, Check, Lock, Coins, Shield, Sparkles } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  colors: any;
  userProfile?: any;
}

export const LeaderboardModal = ({ isOpen, onClose, colors, rankings }: any) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-md rounded-[2.5rem] border-4 p-6 overflow-hidden flex flex-col max-h-[80vh]"
          style={{ backgroundColor: colors.bgPrimary, borderColor: colors.borderPrimary }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h2 className="text-2xl font-black uppercase italic flex items-center gap-3" style={{ color: colors.textPrimary }}>
              <Trophy className="text-amber-500" /> Hall of Fame
            </h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-all">
              <X style={{ color: colors.textMuted }} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
            {rankings.map((player: any, index: number) => (
              <div
                key={player.id}
                className="flex items-center gap-4 p-3 rounded-2xl border-2 transition-all"
                style={{ 
                  backgroundColor: index < 3 ? `${colors.accent}15` : 'rgba(255,255,255,0.03)',
                  borderColor: index < 3 ? colors.accent : 'transparent'
                }}
              >
                <div className="w-8 font-black text-center text-lg" style={{ color: index < 3 ? colors.accent : colors.textMuted }}>
                  #{index + 1}
                </div>
                <div className="w-10 h-10 rounded-full border-2 overflow-hidden bg-black/20" style={{ borderColor: index < 3 ? colors.accent : 'transparent' }}>
                  <img src={player.photoURL || '/img/MDLogo.png'} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black uppercase text-xs truncate" style={{ color: colors.textPrimary }}>{player.username}</h4>
                  <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{player.rank || 'Genin'}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-amber-500">{player.xp} XP</div>
                  <div className="text-[8px] font-bold opacity-40">{player.wins || 0} WINS</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const ShopModal = ({ isOpen, onClose, colors, userProfile }: ModalProps) => {
  const skins = [
    { id: 'skin_itachi', name: 'Legendary Itachi', price: 5000, category: 'Akatsuki', rarity: 'Legendary', icon: '/img/characters/Akatsuki/ITACHI/Itachi1.png' },
    { id: 'skin_minato', name: 'Yellow Flash', price: 7500, category: 'Hokage', rarity: 'Mythic', icon: '/img/characters/Minato/MINATO.png' },
    { id: 'premium_pass', name: 'Shinobi Battle Pass', price: 15000, category: 'Pass', rarity: 'Exclusive', icon: '/img/MDLogo.png' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-[500px] rounded-[3rem] border-4 p-8 overflow-hidden flex flex-col max-h-[85vh]"
            style={{ backgroundColor: colors.bgTertiary, borderColor: colors.borderPrimary }}
            onClick={e => e.stopPropagation()}
          >
             {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <ShoppingBag size={300} />
            </div>

            <div className="flex items-center justify-between mb-8 shrink-0 relative z-10">
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter" style={{ color: colors.textPrimary }}>
                  Shinobi Shop
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/30">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-black text-amber-500">{userProfile?.xp || 0}</span>
                  </div>
                  <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-none">Available Funds</span>
                </div>
              </div>
              <button onClick={onClose} className="p-3 rounded-2xl hover:bg-white/5 transition-all">
                <X className="w-6 h-6" style={{ color: colors.textMuted }} />
              </button>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6 relative z-10">
              {skins.map(skin => (
                <div 
                  key={skin.id}
                  className="group relative flex flex-col p-4 rounded-[2rem] border-2 bg-black/20 hover:bg-black/30 transition-all border-white/5"
                >
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/40">
                    {skin.rarity}
                  </div>
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent rounded-full blur-xl group-hover:scale-125 transition-transform" />
                    <img src={skin.icon} className="w-full h-full object-contain relative z-10" />
                  </div>
                  <h3 className="font-black text-xs uppercase mb-1" style={{ color: colors.textPrimary }}>{skin.name}</h3>
                  <p className="text-[9px] font-bold opacity-40 mb-4 uppercase tracking-tighter">{skin.category} Cosmetic</p>
                  
                  <button 
                    disabled={userProfile?.xp < skin.price}
                    className="w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border-b-4 transition-all active:translate-y-1 flex items-center justify-center gap-2 group/btn"
                    style={{ 
                      backgroundColor: userProfile?.xp >= skin.price ? colors.accent : '#1e293b',
                      borderColor: userProfile?.xp >= skin.price ? colors.accentBorder : '#0f172a',
                      color: userProfile?.xp >= skin.price ? 'white' : 'rgba(255,255,255,0.2)'
                    }}
                  >
                    {userProfile?.xp >= skin.price ? (
                      <>UNLOCK: {skin.price}</>
                    ) : (
                      <>NEED {skin.price - (userProfile?.xp || 0)} MORE</>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 shrink-0 text-center relative z-10">
              <p className="text-[9px] font-bold opacity-40 uppercase tracking-[0.3em]">More legendary skins arrive every week!</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const BattleModal = ({ isOpen, battleData, onCombatFinish, colors }: any) => {
  const [selectedMove, setSelectedMove] = React.useState<null | string>(null);
  const [combatLog, setCombatLog] = React.useState("COMMENCING SHINOBI DUEL...");
  const [isFinishing, setIsFinishing] = React.useState(false);

  const moves = [
    { id: 'taijutsu', name: 'Taijutsu', chakra: 0, power: 'Moderate', desc: 'Physical combat. No Chakra needed.', icon: <Zap /> },
    { id: 'ninjutsu', name: 'Ninjutsu', chakra: 30, power: 'High', desc: 'Powerful techniques. Uses 30 Chakra.', icon: <Sparkles /> },
    { id: 'genjutsu', name: 'Genjutsu', chakra: 20, power: 'Utility', desc: 'Tactical illusion. Uses 20 Chakra.', icon: <Shield /> },
  ];

  const handleMove = (move: any) => {
    if (selectedMove || isFinishing) return;
    setSelectedMove(move.id);
    setCombatLog(`EXECUTING ${move.name.toUpperCase()}...`);
    
    // SFX Trigger
    const sfx = new Audio(move.id === 'ninjutsu' ? '/audio/jutsu.mp3' : '/audio/strike.mp3');
    sfx.volume = 0.3;
    sfx.play().catch(() => {});

    setTimeout(() => {
      const win = Math.random() > 0.4;
      const result = win ? "VICTORY! YOU PENETRATED THE DEFENSE!" : "DEFEAT! THE OPPONENT OVERWHELMED YOU.";
      setCombatLog(result);
      
      setTimeout(() => {
        setIsFinishing(true);
        onCombatFinish(win, move.id);
      }, 1500);
    }, 1500);
  };

  // AI Auto-Move Logic
  React.useEffect(() => {
    if (isOpen && battleData?.attacker?.isAI && !selectedMove) {
      const timer = setTimeout(() => {
        const aiChakra = battleData.attacker.chakra || 0;
        const difficulty = battleData.attacker.difficulty || 'medium';
        
        let moveIdx = 0;
        if (aiChakra >= 30 && (difficulty === 'hard' || Math.random() > 0.5)) moveIdx = 1; // Ninjutsu
        else if (aiChakra >= 20 && Math.random() > 0.7) moveIdx = 2; // Genjutsu
        
        handleMove(moves[moveIdx]);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, battleData]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.8, y: 100 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 100 }}
            className="w-full max-w-xl rounded-[4rem] border-8 p-10 overflow-hidden relative shadow-[0_0_100px_rgba(0,0,0,1)]"
            style={{ backgroundColor: '#0a0a0f', borderColor: colors.accent }}
          >
            {/* Close Button */}
            {(selectedMove || battleData?.attacker?.isAI) && (
              <button 
                onClick={onCombatFinish ? () => onCombatFinish(false, 'taijutsu') : undefined}
                className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            )}
            {/* Battle Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent animate-pulse pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center gap-10 mb-10 w-full justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-3xl border-4 border-emerald-500 overflow-hidden bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <img src={battleData?.attacker?.photoURL || '/img/MDLogo.png'} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Attacker</span>
                </div>

                <div className="text-6xl font-black italic text-white/10 select-none">VS</div>

                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-3xl border-4 border-red-500 overflow-hidden bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                    <img src={battleData?.defender?.photoURL || '/img/MDLogo.png'} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Defender</span>
                </div>
              </div>

              <div className="w-full bg-black/50 border-2 border-white/5 rounded-[2.5rem] p-6 mb-10 text-center">
                <p className="text-xl font-black italic uppercase tracking-tighter text-orange-400 animate-in fade-in slide-in-from-bottom-2">
                   {combatLog}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-40 mt-2">Mission Area: {battleData?.tileName}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {moves.map(move => (
                  <button
                    key={move.id}
                    onClick={() => handleMove(move)}
                    disabled={!!selectedMove || (battleData?.attacker?.chakra || 0) < move.chakra}
                    className="flex flex-col items-center p-6 rounded-[2.5rem] border-2 transition-all active:scale-95 disabled:opacity-20 disabled:grayscale relative group overflow-hidden"
                    style={{ 
                      backgroundColor: selectedMove === move.id ? colors.accent : 'rgba(255,255,255,0.03)',
                      borderColor: selectedMove === move.id ? 'white' : 'rgba(255,255,255,0.1)'
                    }}
                  >
                    <div className="text-2xl mb-3 opacity-60 group-hover:scale-125 transition-transform">{move.icon}</div>
                    <span className="text-sm font-black uppercase italic mb-1 text-white">{move.name}</span>
                    <span className="text-[9px] font-bold opacity-40 uppercase tracking-tighter leading-none mb-4 text-white">Power: {move.power}</span>
                    <div className="mt-auto px-3 py-1 bg-white/5 rounded-full border border-white/10">
                       <span className="text-[8px] font-black text-blue-400">{move.chakra} CHAKRA</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

