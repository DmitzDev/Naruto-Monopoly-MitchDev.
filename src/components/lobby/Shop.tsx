import React, { useState } from 'react';
import { ShoppingBag, Star, Check, Coins, Layers, Image as ImageIcon, User, Zap, X, Search, Maximize2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { db } from '../../firebase/config';
import { ref, update } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';

interface ShopItem {
  id: string;
  name: string;
  price: number;
  type: 'token' | 'dice' | 'board';
  preview: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'kunai', name: 'Golden Kunai', price: 500, type: 'token', preview: '🔱' },
  { id: 'shuriken', name: 'Shadow Shuriken', price: 300, type: 'token', preview: '💠' },
  { id: 'scroll', name: 'Sage Scroll', price: 1000, type: 'token', preview: '📜' },
  { id: 'flame_dice', name: 'Will of Fire Dice', price: 200, type: 'dice', preview: '🔥' },
  { id: 'lightning_dice', name: 'Chidori Dice', price: 250, type: 'dice', preview: '⚡' },
  // Boards
  { id: 'war_board', name: '4th Ninja War', price: 2000, type: 'board', preview: '/img/Board/4thGreatNinjaWarBoard.jpg' },
  { id: 'akatsuki_board', name: 'Akatsuki Hideout', price: 2500, type: 'board', preview: '/img/Board/AkatsukiBoard.jpg' },
  { id: 'hagoromo_board', name: 'Sage of Six Paths', price: 5000, type: 'board', preview: '/img/Board/HagoromoBoard.jpg' },
  { id: 'kage_board', name: 'The Five Kages', price: 3000, type: 'board', preview: '/img/Board/KageBoard.png' },
  { id: 'tentails_board', name: 'Ten-Tails Arena', price: 4000, type: 'board', preview: '/img/Board/Ten-TailsBoard.jpg' },
];

export default function Shop() {
  const { profile, user, setProfile } = useAuthStore();
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'token' | 'dice' | 'board'>('board');
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const buyItem = async (item: ShopItem) => {
    if (!profile || !user || profile.coins < item.price) return;
    
    const ownedField = item.type === 'board' ? 'ownedBoards' : 'ownedSkins';
    const owned = profile[ownedField] || [];
    if (owned.includes(item.id)) return;

    const newCoins = profile.coins - item.price;
    const newOwned = [...owned, item.id];

    await update(ref(db, `users/${user.uid}`), {
      coins: newCoins,
      [ownedField]: newOwned
    });

    setProfile({ ...profile, coins: newCoins, [ownedField]: newOwned });
  };

  const selectItem = async (itemId: string, type: string) => {
    if (!user) return;
    let field = '';
    if (type === 'token') field = 'selectedToken';
    else if (type === 'dice') field = 'selectedDice';
    else if (type === 'board') field = 'activeBoard';

    await update(ref(db, `users/${user.uid}`), { [field]: itemId });
    setProfile({ ...profile!, [field]: itemId });
  };

  if (!profile) return null;

  return (
    <div 
      className="p-5 rounded-[2rem] shadow-2xl border-2 flex flex-col h-full overflow-hidden backdrop-blur-md"
      style={{ backgroundColor: `${colors.bgTertiary}cc`, borderColor: colors.borderPrimary }}
    >
        {/* Responsive Shop Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col">
            <h2 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter italic text-glow" style={{ color: colors.textPrimary }}>
              <ShoppingBag className="w-6 h-6 text-orange-500" />
              Village Emporium
            </h2>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Shinobi Merchant Guild</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 border border-white/10 shadow-inner w-full sm:w-auto justify-center sm:justify-start">
             <Coins className="w-4 h-4 text-emerald-500" />
             <span className="text-sm font-black text-white italic">{(profile.coins || 0).toLocaleString()} RYO</span>
          </div>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-black/20 rounded-2xl border border-white/5">
           {[
             { id: 'board', label: 'Boards', icon: Layers },
             { id: 'token', label: 'Skins', icon: User },
             { id: 'dice', label: 'Dice', icon: Zap }
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)} 
               className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-b-4 active:translate-y-1 ${activeTab === tab.id ? 'bg-orange-600 text-white border-orange-950 shadow-lg' : 'text-slate-400 border-transparent hover:text-white'}`}
             >
               <tab.icon className="w-3.5 h-3.5" />
               <span className="hidden xs:inline">{tab.label}</span>
             </button>
           ))}
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar pb-6">
          {SHOP_ITEMS.filter(i => i.type === activeTab).map(item => {
            const userCoins = Number(profile.coins || 0);
            const itemPrice = Number(item.price);
            const isOwned = (item.type === 'board' ? profile.ownedBoards : profile.ownedSkins)?.includes(item.id);
            const isSelected = profile.selectedToken === item.id || profile.selectedDice === item.id || profile.activeBoard === item.id;
            const canAfford = userCoins >= itemPrice;
            
            return (
              <div 
                key={item.id} 
                className="group relative flex flex-col rounded-3xl border-2 transition-all p-3 sm:p-4 bg-black/20 hover:bg-black/30 shadow-lg"
                style={{ borderColor: isSelected ? colors.accent : 'rgba(255,255,255,0.05)' }}
              >
                 {/* Price Tag Overlay */}
                 {!isOwned && (
                   <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-1">
                      <Coins className="w-2.5 h-2.5 text-amber-500" />
                      <span className="text-[9px] font-black text-white">{item.price} RYO</span>
                   </div>
                 )}

                 <div 
                   className="aspect-video sm:aspect-square md:aspect-video mb-3 rounded-2xl overflow-hidden border-2 border-white/5 bg-black/40 flex items-center justify-center relative shadow-inner cursor-zoom-in group"
                   onClick={() => item.type === 'board' && setZoomImage(item.preview)}
                 >
                    {item.type === 'board' ? (
                       <>
                        <img src={item.preview} className="w-full h-full object-cover transition-transform group-hover:scale-110" loading="lazy" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Maximize2 className="text-white w-6 h-6 animate-pulse" />
                        </div>
                       </>
                    ) : (
                       <span className="text-4xl filter drop-shadow-md">{item.preview}</span>
                    )}
                    {isSelected && (
                       <div className="absolute top-2 right-2 p-1.5 bg-orange-600 rounded-full shadow-lg border border-white/20 z-10">
                          <Check size={10} className="text-white" />
                       </div>
                    )}
                 </div>

                 <div className="flex flex-col gap-0.5 mb-4 px-1">
                   <span className="text-xs font-black uppercase tracking-tight text-white italic truncate">{item.name}</span>
                   <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">{item.type === 'board' ? '戰術地圖' : item.type} Tactical Assets</span>
                 </div>

                 <div className="mt-auto">
                   {isOwned ? (
                     <button 
                      onClick={() => selectItem(item.id, item.type)}
                      className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-b-4 active:translate-y-1 ${isSelected ? 'bg-emerald-600 border-emerald-950 text-white' : 'bg-slate-800 border-slate-950 text-white hover:bg-slate-700'}`}
                     >
                       {isSelected ? 'DEPLOYED' : 'EQUIP'}
                     </button>
                   ) : (
                     <button 
                      onClick={() => buyItem(item)}
                      disabled={!canAfford}
                      className={`w-full py-2.5 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-b-4 active:translate-y-1 shadow-xl
                        ${canAfford ? 'bg-orange-600 border-orange-950 hover:bg-orange-500' : 'bg-slate-700/50 border-slate-900 opacity-50 grayscale cursor-not-allowed'}
                      `}
                     >
                       {canAfford ? `BUY [${item.price} RYO]` : 'LACKING RYO'}
                     </button>
                   )}
                 </div>
              </div>
            );
          })}
        </div>

        {/* Zoom Modal */}
        <AnimatePresence>
          {zoomImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomImage(null)}
              className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-4 sm:p-10 cursor-zoom-out"
            >
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setZoomImage(null)}
                className="absolute top-6 right-6 p-4 bg-white/10 text-white rounded-full border border-white/20 hover:bg-white/20 transition-all z-[610]"
              >
                <X size={32} />
              </motion.button>

              <motion.div 
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                className="relative w-full max-w-5xl aspect-video rounded-[2rem] overflow-hidden border-8 border-white/10 shadow-[0_0_100px_rgba(234,88,12,0.3)]"
                onClick={e => e.stopPropagation()}
              >
                <img src={zoomImage} className="w-full h-full object-contain bg-black" alt="Arena Preview" />
                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                   <p className="text-white font-black uppercase italic tracking-widest text-lg">Arena Strategic Intel</p>
                   <p className="text-slate-400 text-xs font-bold uppercase">Inspect the layout before deployment</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
