import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BOARD_DATA } from '../../game/boardData';
import Dice2D from './Dice2D';
import { useThemeStore } from '../../store/useThemeStore';
import { CardPopup, PurchasePopup } from './GamePopups';
import { useAuthStore } from '../../store/useAuthStore';

interface Player {
  id: string;
  username: string;
  position: number;
  color: string;
  photoURL?: string;
  money: number;
  isBankrupt: boolean;
  properties: number[];
}

interface Board2DProps {
  gameState: any;
  players: Record<string, Player>;
}

interface CharConfig {
  folder: string;
  prefix: string;
  frames: number;
  useOne?: boolean;
}

const CHAR_ANI_CONFIG: Record<string, CharConfig> = {
  'naruto': { folder: 'Naruto', prefix: 'NARUTO', frames: 5 },
  'sasuke': { folder: 'Sasuke', prefix: 'SASUKE', frames: 4 },
  'sakura': { folder: 'Sakura', prefix: 'SAKURA', frames: 5 },
  'kakashi': { folder: 'Kakashi', prefix: 'KAKASHI', frames: 7 },
  'itachi': { folder: 'Akatsuki/ITACHI', prefix: 'Itachi', frames: 11, useOne: true },
  'pain': { folder: 'Akatsuki/YAHIKO', prefix: 'Yahiko', frames: 9, useOne: true },
  'yahiko': { folder: 'Akatsuki/YAHIKO', prefix: 'Yahiko', frames: 9, useOne: true },
  'deidara': { folder: 'Akatsuki/DEDA', prefix: 'DEDA', frames: 7, useOne: true },
  'deda': { folder: 'Akatsuki/DEDA', prefix: 'DEDA', frames: 7, useOne: true },
  'kakuzu': { folder: 'Akatsuki/KAKU', prefix: 'KAKU', frames: 7, useOne: true },
  'kaku': { folder: 'Akatsuki/KAKU', prefix: 'KAKU', frames: 7, useOne: true },
  'sasori': { folder: 'Akatsuki/SASORI', prefix: 'SASORI', frames: 7, useOne: true },
  'hidan': { folder: 'Akatsuki/HIDAN', prefix: 'HIDAN', frames: 6, useOne: true },
  'orochimaru': { folder: 'Akatsuki/ORICHIMARU', prefix: 'ORICHIMARU', frames: 6, useOne: true },
  'zetsu': { folder: 'Akatsuki/ZETSU', prefix: 'ZETSU', frames: 6, useOne: true },
  'gaara': { folder: 'Gaara', prefix: 'GAARA', frames: 4 },
  'hinata': { folder: 'Hinata', prefix: 'HINATA', frames: 4 },
  'jiraya': { folder: 'Jiraya', prefix: 'JIRAYA', frames: 6 },
  'guy': { folder: 'Mighty Guy', prefix: 'GUY', frames: 7 },
  'shika': { folder: 'Shikamaru', prefix: 'SHIKA', frames: 8 },
  'minato': { folder: 'Minato', prefix: 'MINATO', frames: 8 },
};

// Global image cache to prevent flickers on first load
const imagePreloader = new Set<string>();

const CharacterToken = React.memo(({ player, index, totalPlayers, getTilePosition2D, getPlayerOffset }: {
  player: Player, index: number, totalPlayers: number,
  getTilePosition2D: (i: number) => { x: string, y: string },
  getPlayerOffset: (i: number, t: number) => { offsetX: number, offsetY: number }
}) => {
  const [displayedPos, setDisplayedPos] = React.useState(player.position);
  const [currentFrame, setCurrentFrame] = React.useState(1);
  const [isMoving, setIsMoving] = React.useState(false);
  const targetPos = player.position;

  const charId = React.useMemo(() => {
    if (!player.photoURL || player.photoURL.startsWith('data:')) return 'naruto';
    const filename = player.photoURL.split('/').pop()?.split('.')[0] || 'naruto';
    // Handle cases like "MINATO2" -> "minato"
    const baseId = filename.toLowerCase().replace(/[0-9]/g, '');
    return CHAR_ANI_CONFIG[baseId] ? baseId : 'naruto';
  }, [player.photoURL]);

  const config = CHAR_ANI_CONFIG[charId] || CHAR_ANI_CONFIG['naruto'];

  // Preload all frames for this character on mount
  React.useEffect(() => {
    for (let i = 1; i <= config.frames; i++) {
        const frameSuffix = (i === 1 && !config.useOne) ? '' : i.toString();
        const path = `/img/characters/${config.folder}/${config.prefix}${frameSuffix}.png`;
        if (!imagePreloader.has(path)) {
            const img = new Image();
            img.src = path;
            imagePreloader.add(path);
        }
    }
  }, [config]);

  // Handle step-by-step movement
  React.useEffect(() => {
    if (displayedPos !== targetPos) {
      setIsMoving(true);
      const moveTimer = setTimeout(() => {
        setDisplayedPos(prev => (prev + 1) % 40);
      }, 250); // Slightly faster move interval
      return () => clearTimeout(moveTimer);
    } else {
      setIsMoving(false);
    }
  }, [displayedPos, targetPos]);

  // High-performance animation loop using requestAnimationFrame
  React.useEffect(() => {
    if (!isMoving) {
      setCurrentFrame(1);
      return;
    }

    let lastTime = 0;
    const fps = 12; // Adjusted for smooth anime feel
    const interval = 1000 / fps;
    let frameId: number;

    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const progress = time - lastTime;

      if (progress > interval) {
        setCurrentFrame(prev => (prev >= config.frames ? 1 : prev + 1));
        lastTime = time;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isMoving, config.frames]);

  const { x, y } = getTilePosition2D(displayedPos);
  const { offsetX, offsetY } = getPlayerOffset(index, totalPlayers);

  const frameSuffix = (currentFrame === 1 && !config.useOne) ? '' : currentFrame.toString();
  const imagePath = isMoving
    ? `/img/characters/${config.folder}/${config.prefix}${frameSuffix}.png`
    : (player.photoURL || `/img/characters/Naruto/NARUTO.png`);

  const charStyle = React.useMemo(() => {
    const pos = displayedPos % 40;
    if (pos >= 0 && pos <= 10) return { scaleX: -1, rotate: 0 };
    if (pos > 10 && pos <= 20) return { scaleX: -1, rotate: -90 };
    if (pos > 20 && pos <= 30) return { scaleX: 1, rotate: 0 };
    return { scaleX: -1, rotate: 90 };
  }, [displayedPos]);

  return (
    <motion.div
      initial={false}
      animate={{
        left: `calc(${x} + ${offsetX}%)`,
        top: `calc(${y} + ${offsetY}%)`,
        opacity: 1,
        scale: 1
      }}
      transition={{
        type: "tween",
        ease: "easeInOut",
        duration: 0.3
      }}
      style={{ willChange: 'top, left', zIndex: isMoving ? 110 : 100 }}
      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    >
      <div className="relative group">
        <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center pointer-events-none"
          style={{ filter: player.isBankrupt ? 'grayscale(1) opacity(0.5)' : 'none' }}>
          <img
            src={imagePath}
            alt={player.username}
            className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] scale-110 transition-all"
            style={{
              transform: `scaleX(${charStyle.scaleX}) rotate(${charStyle.rotate}deg)`,
              willChange: 'transform'
            }}
            loading="eager"
          />
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 px-2 py-0.5 rounded-full bg-black/70 text-white text-[9px] sm:text-[11px] font-black uppercase whitespace-nowrap shadow-xl border border-white/20 z-10 transition-opacity"
          style={{ opacity: isMoving ? 0.4 : 1 }}>
          {player.username}
        </div>
      </div>
    </motion.div>
  );
});

interface BoardProps {
  gameState: any;
  players: any;
  onTileClick?: (id: number) => void;
  roomId?: string;
  missionTarget?: number;
  boardImage?: string;
}

export default function Board2D({ gameState, players, onTileClick, roomId, missionTarget, boardImage }: BoardProps) {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Pre-calculate property owner map for O(1) lookups during render
  const propertyOwnerMap = React.useMemo(() => {
    const map: Record<number, any> = {};
    Object.values(players || {}).forEach((p: any) => {
      if (p && Array.isArray(p.properties)) {
        p.properties.forEach((propId: number) => {
          map[propId] = p;
        });
      }
    });
    return map;
  }, [players]);

  const getTilePosition2D = (index: number) => {
    const side = Math.floor(index / 10);
    const pos = index % 10;
    const cornerSize = 14.5;
    const tileSize = (100 - (cornerSize * 2)) / 9;

    let x = 0;
    let y = 0;

    if (side === 0) {
      x = 100 - cornerSize / 2 - (pos === 0 ? 0 : (pos - 0.5) * tileSize + cornerSize / 2);
      if (pos === 0) x = 100 - cornerSize / 2 - 2;
      y = 100 - cornerSize / 2 - 2;
    } else if (side === 1) {
      x = cornerSize / 2 + 2;
      y = 100 - cornerSize / 2 - (pos === 0 ? 0 : (pos - 0.5) * tileSize + cornerSize / 2);
      if (pos === 0) y = 100 - cornerSize / 2 - 2;
    } else if (side === 2) {
      x = cornerSize / 2 + (pos === 0 ? 0 : (pos - 0.5) * tileSize + cornerSize / 2);
      if (pos === 0) x = cornerSize / 2 + 1;
      y = cornerSize / 2 + 1;
    } else if (side === 3) {
      x = 100 - cornerSize / 2 - 2;
      y = cornerSize / 2 + (pos === 0 ? 0 : (pos - 0.5) * tileSize + cornerSize / 2);
      if (pos === 0) y = cornerSize / 2 + 1;
    }

    if (index === 0) { x = 91.5; y = 91.5; }
    if (index === 10) { x = 8.5; y = 91.5; }
    if (index === 20) { x = 8.5; y = 8.5; }
    if (index === 30) { x = 91.5; y = 8.5; }

    return { x: `${x}%`, y: `${y}%` };
  };

  const getPlayerOffset = (playerIndex: number, totalPlayers: number) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const radius = isMobile ? 2 : 3.5;
    const angle = totalPlayers > 0 ? (playerIndex / totalPlayers) * Math.PI * 2 : 0;
    return {
      offsetX: Math.cos(angle) * radius,
      offsetY: Math.sin(angle) * radius
    };
  };

  const playerList = React.useMemo(() =>
    Object.values(players || {}).filter((p: any) => p && !p.isBankrupt),
    [players]
  );

  const [hoveredTile, setHoveredTile] = React.useState<number | null>(null);

  return (
    <div className={`relative w-full aspect-square max-w-[800px] lg:max-w-[1000px] mx-auto rounded-lg overflow-hidden border-4 ${isMobile ? 'shadow-lg' : 'shadow-2xl'}`}
      style={{ backgroundColor: colors.bgSecondary, borderColor: colors.borderPrimary }}>

      {/* Board Image - Dynamic based on selection */}
      <img
        src={boardImage || "/img/Board.png"}
        alt="Monopoly Board"
        className="absolute inset-0 w-full h-full object-contain"
        loading="eager"
      />

      {/* Property Markers - Optimized with pre-calculated map */}
      {BOARD_DATA.map((tile) => {
        if (!tile || tile.id === undefined) return null;
        const owner = propertyOwnerMap[tile.id];
        const houses = gameState?.houses?.[tile.id] || 0;
        const isMortgaged = gameState?.mortgaged?.includes(tile.id);
        const pos = getTilePosition2D(tile.id);

        return (
          <div key={tile.id} 
            onClick={() => onTileClick?.(tile.id)}
            onMouseEnter={() => setHoveredTile(tile.id)}
            onMouseLeave={() => setHoveredTile(null)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 cursor-pointer z-[40] transition-all rounded-xl ${hoveredTile === tile.id ? 'bg-white/10 brightness-125' : ''}`}
            style={{ 
              left: pos.x, 
              top: pos.y,
            }}
          >
            {/* Shinobi Property Seal */}
            {owner && (
               <motion.div 
                 initial={{ scale: 0, rotate: -45 }}
                 animate={{ scale: 1, rotate: 0 }}
                 className="absolute inset-[15%] rounded-full border-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden"
                 style={{ 
                   borderColor: owner.color, 
                   backgroundColor: `${owner.color}10`,
                   boxShadow: `0 0 10px ${owner.color}40, inset 0 0 10px ${owner.color}20`
                 }}
               >
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-full h-full border border-dashed opacity-30 rounded-full"
                    style={{ borderColor: owner.color }}
                  />
                  <img 
                    src={owner.photoURL || "/img/MDLogo.png"} 
                    className="w-[70%] h-[70%] object-contain rounded-full border border-white/20 shadow-inner z-10" 
                    alt="" 
                  />
               </motion.div>
            )}
            {/* Tooltip */}
            <AnimatePresence>
              {hoveredTile === tile.id && (tile.type === 'property' || tile.type === 'railroad' || tile.type === 'utility') && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-slate-900/95 backdrop-blur-md rounded-2xl border-2 border-white/10 shadow-2xl z-[500] w-40 pointer-events-none"
                  style={{ borderColor: owner ? owner.color : 'rgba(255,255,255,0.1)' }}
                >
                  <p className="text-[10px] font-black uppercase text-white tracking-widest leading-none mb-1 truncate">{tile.name}</p>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Rent</span>
                    <span className="text-[10px] font-black text-emerald-400">₱{(Array.isArray(tile.rent) ? (houses > 0 ? tile.rent[houses] : tile.rent[0]) : (tile.rent || 0))}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Owner</span>
                    <span className="text-[10px] font-black text-orange-400 uppercase truncate ml-2">
                       {owner ? owner.username : 'VACANT'}
                    </span>
                  </div>
                  {isMortgaged && (
                    <div className="mt-1 pt-1 border-t border-white/10 text-center">
                      <span className="text-[8px] font-black text-red-500 uppercase animate-pulse">Mortgaged</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

             {houses > 0 && (
               <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-3 flex gap-0.5 z-20">
                 {Array.from({ length: Math.min(houses, 4) }).map((_, i) => (
                   <div key={i} className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-sm shadow-[0_0_5px_rgba(16,185,129,0.5)] border border-emerald-400/30" />
                 ))}
                 {houses === 5 && <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 rounded-sm shadow-[0_0_8px_rgba(220,38,38,0.6)] border border-red-400/30" />}
               </div>
             )}
             {isMortgaged && (
               <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black/80 rounded-full flex items-center justify-center border border-white/20 shadow-lg z-30">
                 <span className="text-[6px] sm:text-[8px] font-black text-white uppercase tracking-tighter">M</span>
               </div>
             )}
          </div>
        );
      })}

      {/* Mission Target Highlight */}
      {missionTarget !== undefined && (
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 z-[30] pointer-events-none"
          style={{ 
            left: getTilePosition2D(missionTarget).x, 
            top: getTilePosition2D(missionTarget).y 
          }}
        >
          <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-full bg-red-600/20 border-2 border-red-600 animate-pulse flex items-center justify-center">
             <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 border-red-400 rotate-45 p-0.5">
                <div className="w-full h-full bg-red-600 rounded-full" />
             </div>
          </div>
        </div>
      )}

      {/* Players */}
      <AnimatePresence>
        {playerList.map((player: any, idx: number) => (
          <CharacterToken
            key={player.id}
            player={player}
            index={idx}
            totalPlayers={playerList.length}
            getTilePosition2D={getTilePosition2D}
            getPlayerOffset={getPlayerOffset}
          />
        ))}
      </AnimatePresence>

      {/* Center UI Overlay */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none w-full h-full flex flex-col items-center justify-center gap-4`}>
        {(!gameState?.activeCard && !gameState?.activePurchase) && (
          <div className={isMobile ? 'scale-[0.5]' : 'scale-90 sm:scale-100'}>
            <Dice2D result={gameState?.diceResult} />
          </div>
        )}

        {/* Dynamic Popups - Scaled properly for the board size */}
        <AnimatePresence>
          {gameState?.activeCard && (
            <div className={isMobile ? 'scale-[0.55]' : 'scale-100'}>
              <CardPopup 
                key="card-popup"
                card={gameState.activeCard} 
                player={players[gameState.activeCard.userId]} 
                onClose={() => {}} 
              />
            </div>
          )}

          {gameState?.activePurchase && (
            <div className={isMobile ? 'scale-[0.55]' : 'scale-100'}>
              <PurchasePopup 
                key="purchase-popup"
                purchase={gameState.activePurchase} 
                player={players[gameState.activePurchase.userId]} 
                onClose={() => {}} 
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
