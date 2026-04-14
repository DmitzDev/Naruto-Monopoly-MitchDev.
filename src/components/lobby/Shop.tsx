import React, { useState } from 'react';
import { ShoppingBag, Star, Check, Coins } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { db } from '../../firebase/config';
import { ref, update } from 'firebase/database';

interface ShopItem {
  id: string;
  name: string;
  price: number;
  type: 'token' | 'dice' | 'theme';
  preview: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'kunai', name: 'Golden Kunai', price: 500, type: 'token', preview: '🔱' },
  { id: 'shuriken', name: 'Shadow Shuriken', price: 300, type: 'token', preview: '💠' },
  { id: 'scroll', name: 'Sage Scroll', price: 1000, type: 'token', preview: '📜' },
  { id: 'flame_dice', name: 'Will of Fire Dice', price: 200, type: 'dice', preview: '🔥' },
  { id: 'lightning_dice', name: 'Chidori Dice', price: 250, type: 'dice', preview: '⚡' },
];

export default function Shop() {
  const { profile, user, setProfile } = useAuthStore();
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'token' | 'dice'>('token');

  const buyItem = async (item: ShopItem) => {
    if (!profile || !user || profile.coins < item.price) return;
    
    const owned = profile.ownedSkins || [];
    if (owned.includes(item.id)) return;

    const newCoins = profile.coins - item.price;
    const newOwned = [...owned, item.id];

    await update(ref(db, `users/${user.uid}`), {
      coins: newCoins,
      ownedSkins: newOwned
    });

    setProfile({ ...profile, coins: newCoins, ownedSkins: newOwned });
  };

  const selectItem = async (itemId: string, type: string) => {
    if (!user) return;
    const field = type === 'token' ? 'selectedToken' : 'selectedDice';
    await update(ref(db, `users/${user.uid}`), { [field]: itemId });
    setProfile({ ...profile!, [field]: itemId });
  };

  if (!profile) return null;

  return (
    <div 
      className="p-5 rounded-lg shadow-xl border-x-4 flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: colors.bgTertiary, borderColor: colors.borderPrimary }}
    >
        <div className="flex items-center justify-between mb-4">
          <h2 
            className="text-lg font-black flex items-center gap-2 uppercase tracking-tight"
            style={{ color: colors.textPrimary }}
          >
            <ShoppingBag className="w-5 h-5" style={{ color: colors.textAccent }} />
            Village Emporium
          </h2>
          <div 
            className="flex items-center gap-1 px-2 py-0.5 rounded border"
            style={{ backgroundColor: `${colors.accent}33`, borderColor: `${colors.accent}4d` }}
          >
             <Coins className="w-3 h-3" style={{ color: colors.textAccent }} />
             <span className="text-[10px] font-black" style={{ color: colors.textPrimary }}>{profile.coins}</span>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
           <button 
             onClick={() => setActiveTab('token')} 
             className={`flex-1 py-1 rounded text-[10px] font-black uppercase border-b-2 transition-colors`}
             style={{ 
               backgroundColor: activeTab === 'token' ? colors.borderPrimary : colors.bgCard,
               color: activeTab === 'token' ? colors.bgPrimary : colors.textSecondary,
               borderColor: activeTab === 'token' ? 'rgba(0,0,0,0.3)' : colors.borderSecondary
             }}
           >
             Tokens
           </button>
           <button 
             onClick={() => setActiveTab('dice')} 
             className={`flex-1 py-1 rounded text-[10px] font-black uppercase border-b-2 transition-colors`}
             style={{ 
               backgroundColor: activeTab === 'dice' ? colors.borderPrimary : colors.bgCard,
               color: activeTab === 'dice' ? colors.bgPrimary : colors.textSecondary,
               borderColor: activeTab === 'dice' ? 'rgba(0,0,0,0.3)' : colors.borderSecondary
             }}
           >
             Dice
           </button>
        </div>

        <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1 custom-scrollbar">
          {SHOP_ITEMS.filter(i => i.type === activeTab).map(item => {
            const isOwned = profile.ownedSkins?.includes(item.id);
            const isSelected = profile.selectedToken === item.id || profile.selectedDice === item.id;
            
            return (
              <div 
                key={item.id} 
                className="p-2 rounded flex flex-col items-center border-2"
                style={{ backgroundColor: colors.bgCard, borderColor: colors.borderSecondary }}
              >
                 <div className="text-2xl mb-1">{item.preview}</div>
                 <span className="text-[9px] font-black uppercase text-center mb-1" style={{ color: colors.textPrimary }}>{item.name}</span>
                 {isOwned ? (
                   <button 
                    onClick={() => selectItem(item.id, item.type)}
                    className={`w-full py-1 rounded text-[8px] font-black uppercase flex items-center justify-center gap-1 transition-all`}
                    style={{ 
                      backgroundColor: isSelected ? '#059669' : colors.accent,
                      color: '#fff'
                    }}
                   >
                     {isSelected ? <Check size={10}/> : 'Select'}
                   </button>
                 ) : (
                   <button 
                    onClick={() => buyItem(item)}
                    disabled={profile.coins < item.price}
                    className="w-full py-1 disabled:opacity-50 text-white rounded text-[8px] font-black uppercase transition-all"
                    style={{ backgroundColor: colors.btnPrimary }}
                   >
                     ₱{item.price}
                   </button>
                 )}
              </div>
            );
          })}
        </div>
    </div>
  );
}
