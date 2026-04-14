import React from 'react';
import { motion } from 'framer-motion';
import { BOARD_DATA } from '../../game/boardData';

interface CardPopupProps {
  card: any;
  player: any;
  onClose: () => void;
}

export const CardPopup = ({ card, player, onClose }: CardPopupProps) => {
  if (!card) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -50 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[180px] sm:w-[280px]"
    >
      <div className="relative group">
        <motion.img 
          src={card.image} 
          alt="Shinobi Card" 
          className="w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
          style={{ mixBlendMode: 'multiply' }}
          animate={{ 
            rotateY: [0, 5, -5, 0],
            y: [0, -5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        
        {/* Subtle Player Indicator */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
           <span className="bg-black/80 px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-black text-white uppercase tracking-widest border border-white/10 shadow-xl">
             {player?.username}'s Mission
           </span>
        </div>
      </div>
    </motion.div>
  );
};

interface PurchasePopupProps {
  purchase: any;
  player: any;
  onClose: () => void;
}

export const PurchasePopup = ({ purchase, player, onClose }: PurchasePopupProps) => {
  const tile = BOARD_DATA[purchase.propertyId];
  if (!tile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[200px] sm:w-[320px]"
    >
      <div className="relative group">
        <img 
          src={purchase.image} 
          alt={tile.name} 
          className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)]"
          style={{ mixBlendMode: 'multiply' }}
        />
        
        {/* Subtle Acquisition Info */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
           <span className="bg-emerald-600 px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-black text-white uppercase tracking-tighter shadow-lg border border-emerald-400/20">
             TERRITORY SEIZED: {tile.name}
           </span>
           <span className="text-[7px] font-bold text-white/50 uppercase tracking-widest">
             By {player?.username}
           </span>
        </div>
      </div>
    </motion.div>
  );
};
