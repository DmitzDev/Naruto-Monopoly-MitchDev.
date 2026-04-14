import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRightLeft, Coins, Landmark, ShieldCheck, ChevronRight, User, Briefcase } from 'lucide-react';
import { BOARD_DATA } from '../../game/boardData';
import { useThemeStore } from '../../store/useThemeStore';

interface Player {
  id: string;
  username: string;
  money: number;
  properties: number[];
  color: string;
  photoURL?: string;
  isBankrupt: boolean;
}

interface TradeModalProps {
  players: Record<string, Player>;
  me: string;
  onClose: () => void;
  onPropose: (trade: any) => void;
}

export default function TradeModal({ players, me, onClose, onPropose }: TradeModalProps) {
  const { colors } = useThemeStore();
  const otherPlayers = Object.values(players || {}).filter(p => p && p.id !== me && !p.isBankrupt);
  const [partnerId, setPartnerId] = useState(otherPlayers[0]?.id || '');
  const partner = players[partnerId];

  const [myCash, setMyCash] = useState(0);
  const [partnerCash, setPartnerCash] = useState(0);
  const [myProps, setMyProps] = useState<number[]>([]);
  const [partnerProps, setPartnerProps] = useState<number[]>([]);

  const toggleProp = (id: number, list: number[], setter: (val: number[]) => void) => {
    if (list.includes(id)) setter(list.filter(p => p !== id));
    else setter([...list, id]);
  };

  const handlePropose = () => {
    if (!partnerId) return;
    onPropose({
      from: me,
      to: partnerId,
      moneyFrom: myCash,
      moneyTo: partnerCash,
      propsFrom: myProps,
      propsTo: partnerProps,
    });
    onClose();
  };

  const getColorHex = (colorName: string) => {
    const colors: any = {
      'brown': '#8B4513', 'lightBlue': '#87CEEB', 'pink': '#FF69B4', 'orange': '#FFA500',
      'red': '#FF0000', 'yellow': '#FFFF00', 'green': '#008000', 'blue': '#0000FF'
    };
    return colors[colorName] || '#ccc';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-4xl h-[95vh] sm:h-[85vh] rounded-[2rem] border-4 shadow-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: colors.bgTertiary, borderColor: colors.borderPrimary }}
      >
        {/* Header - Immersive Scroll Look */}
        <div className="p-4 sm:p-6 border-b-2 flex justify-between items-center bg-black/10 shrink-0"
             style={{ borderColor: `${colors.borderPrimary}30` }}>
          <div className="flex items-center gap-3 sm:gap-4">
             <div className="p-2 sm:p-3 rounded-2xl bg-orange-600/20 text-orange-600 shadow-inner">
               <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6" />
             </div>
             <div>
               <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter leading-none" style={{ color: colors.textPrimary }}>Diplomatic Exchange</h2>
               <p className="text-[9px] sm:text-xs font-bold opacity-50 uppercase tracking-widest mt-1">Negotiate terms with fellow shinobi</p>
             </div>
          </div>
          <button onClick={onClose} 
                  className="p-2 sm:p-3 rounded-full hover:bg-black/10 transition-colors"
                  style={{ color: colors.textMuted }}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
          {/* Side A: Partner Selection & My Offer */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar flex flex-col gap-6 border-b sm:border-b-0 sm:border-r-2"
               style={{ borderColor: `${colors.borderPrimary}30` }}>
            
            {/* Partner Selection */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest mb-3 block opacity-60">Selection of Target</label>
              <div className="flex flex-wrap gap-2">
                {otherPlayers.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => {
                      setPartnerId(p.id);
                      setPartnerCash(0);
                      setPartnerProps([]);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all active:scale-95 ${partnerId === p.id ? 'shadow-lg scale-105' : 'opacity-60'}`}
                    style={{ 
                      backgroundColor: partnerId === p.id ? colors.accent : colors.bgCard,
                      borderColor: partnerId === p.id ? colors.accentBorder : `${colors.borderPrimary}20`,
                      color: partnerId === p.id ? '#fff' : colors.textPrimary
                    }}
                  >
                    <div className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px] overflow-hidden">
                      {p.photoURL ? <img src={p.photoURL} alt={p.username} /> : p.username.charAt(0)}
                    </div>
                    <span className="text-[10px] font-black uppercase">{p.username}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* My Side Resources */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: colors.textAccent }}>
                  <User className="w-3.5 h-3.5" /> Your Contribution
                </h3>
                <div className="px-2 py-0.5 rounded bg-emerald-600/10 text-emerald-600 text-[10px] font-black">
                  ₱{players[me]?.money || 0} Avail
                </div>
              </div>

              <div className="p-4 rounded-3xl border-2 space-y-3" style={{ backgroundColor: colors.bgCard, borderColor: `${colors.borderPrimary}40` }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold opacity-60 uppercase">Currency Offering</span>
                  <span className="text-sm font-black text-emerald-600">₱{myCash}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max={players[me]?.money || 0} 
                  step="50" 
                  value={myCash} 
                  onChange={(e) => setMyCash(Number(e.target.value))} 
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-emerald-600"
                  style={{ backgroundColor: `${colors.borderPrimary}20` }}
                />
              </div>

              <div className="flex-1 min-h-0 flex flex-col gap-2">
                <span className="text-[10px] font-bold opacity-60 uppercase flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Select Properties ({players[me]?.properties?.length || 0})
                </span>
                <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[150px] p-1 custom-scrollbar">
                   {players[me]?.properties?.map(pid => {
                     const tile = BOARD_DATA[pid];
                     const isSelected = myProps.includes(pid);
                     return (
                       <button 
                        key={pid} 
                        onClick={() => toggleProp(pid, myProps, setMyProps)}
                        className={`p-2 rounded-xl border-2 text-[9px] font-black uppercase transition-all flex flex-col gap-1 text-left ${isSelected ? 'scale-105' : ''}`}
                        style={{ 
                          backgroundColor: isSelected ? `${colors.accent}15` : colors.bgCard,
                          borderColor: isSelected ? colors.accent : `${colors.borderPrimary}20`,
                          color: colors.textPrimary 
                        }}
                       >
                         <div className="w-full h-1 rounded-full" style={{ backgroundColor: tile.color ? getColorHex(tile.color) : '#ccc' }} />
                         <span className="truncate">{tile.name}</span>
                       </button>
                     );
                   })}
                </div>
              </div>
            </div>
          </div>

          {/* Side B: Partner Resources & Summary */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar flex flex-col gap-6"
               style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
            
            {!partner ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center">
                 <ShieldCheck className="w-16 h-16 mb-4" />
                 <p className="text-sm font-black uppercase tracking-widest">Select an ally to begin negotiations</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: colors.accent }}>
                    <ShieldCheck className="w-3.5 h-3.5" /> Requisition from {partner.username}
                  </h3>
                  <div className="px-2 py-0.5 rounded bg-orange-600/10 text-orange-600 text-[10px] font-black">
                    ₱{partner.money} Avail
                  </div>
                </div>

                <div className="p-4 rounded-3xl border-2 space-y-3" style={{ backgroundColor: colors.bgCard, borderColor: `${colors.borderPrimary}40` }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold opacity-60 uppercase">Currency Requested</span>
                    <span className="text-sm font-black text-orange-600">₱{partnerCash}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max={partner.money} 
                    step="50" 
                    value={partnerCash} 
                    onChange={(e) => setPartnerCash(Number(e.target.value))} 
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-orange-600"
                    style={{ backgroundColor: `${colors.borderPrimary}20` }}
                  />
                </div>

                <div className="flex-1 min-h-0 flex flex-col gap-2">
                  <span className="text-[10px] font-bold opacity-60 uppercase flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Select Properties ({(partner.properties || []).length})
                  </span>
                  <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[150px] p-1 custom-scrollbar">
                     {partner.properties?.map(pid => {
                       const tile = BOARD_DATA[pid];
                       const isSelected = partnerProps.includes(pid);
                       return (
                         <button 
                          key={pid} 
                          onClick={() => toggleProp(pid, partnerProps, setPartnerProps)}
                          className={`p-2 rounded-xl border-2 text-[9px] font-black uppercase transition-all flex flex-col gap-1 text-left ${isSelected ? 'scale-105' : ''}`}
                          style={{ 
                            backgroundColor: isSelected ? `${colors.accent}15` : colors.bgCard,
                            borderColor: isSelected ? colors.accent : `${colors.borderPrimary}20`,
                            color: colors.textPrimary 
                          }}
                         >
                           <div className="w-full h-1 rounded-full" style={{ backgroundColor: tile.color ? getColorHex(tile.color) : '#ccc' }} />
                           <span className="truncate">{tile.name}</span>
                         </button>
                       );
                     })}
                  </div>
                </div>

                {/* Summary Panel */}
                <div className="mt-4 p-4 rounded-3xl border-2 bg-gradient-to-br from-black/5 to-transparent flex items-center justify-between shadow-inner"
                     style={{ borderColor: `${colors.borderPrimary}20` }}>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black opacity-40 uppercase">Giving Hide</span>
                    <span className="text-xs font-black" style={{ color: colors.textAccent }}>₱{myCash} + {myProps.length}p</span>
                  </div>
                  <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                     <ArrowRightLeft className="w-5 h-5 opacity-40" />
                  </motion.div>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black opacity-40 uppercase">Gaining Hide</span>
                    <span className="text-xs font-black text-orange-600">₱{partnerCash} + {partnerProps.length}p</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 sm:p-6 border-t-2 bg-black/5 shrink-0" 
             style={{ borderColor: `${colors.borderPrimary}30` }}>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!partnerId || (myCash === 0 && partnerCash === 0 && myProps.length === 0 && partnerProps.length === 0)}
            onClick={handlePropose} 
            className="w-full py-4 text-white font-black rounded-2xl border-b-4 flex items-center justify-center gap-3 shadow-xl transition-all uppercase tracking-widest text-sm disabled:opacity-30 disabled:grayscale"
            style={{ backgroundColor: colors.btnPrimary, borderColor: colors.accentBorder }}
          >
             <Landmark className="w-5 h-5" />
             Send Trade Scroll
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
