export type TileType = 'property' | 'railroad' | 'utility' | 'chance' | 'chest' | 'tax' | 'go' | 'jail' | 'parking' | 'gotojail';

export interface TileData {
  id: number;
  name: string;
  type: TileType;
  price?: number;
  rent?: number[]; // [base, 1 house, 2 houses, 3 houses, 4 houses, hotel]
  color?: string;
  houseCost?: number;
  mortgage?: number;
}

export function getColorHex(color?: string) {
  switch (color) {
    case 'brown': return '#8B4513';
    case 'lightblue': return '#87CEEB';
    case 'pink': return '#FF69B4';
    case 'orange': return '#FFA500';
    case 'red': return '#FF0000';
    case 'yellow': return '#FFFF00';
    case 'green': return '#008000';
    case 'darkblue': return '#00008B';
    default: return '#E2E8F0'; // Default slate-200
  }
}

export interface CardData {
  id: number;
  text: string;
  action: 'money' | 'move' | 'jail';
  amount?: number;
  position?: number;
}

export const CHANCE_CARDS: CardData[] = [
  { id: 1, text: "Summoning Jutsu: Advance to GO. (Collect 200 Ryō)", action: 'move', position: 0 },
  { id: 2, text: "Shadow Clone Success: Collect 200 Ryō for mission bonus.", action: 'money', amount: 200 },
  { id: 3, text: "Medic-nin Fee: Pay 50 Ryō.", action: 'money', amount: -50 },
  { id: 4, text: "Caught by ANBU! Go directly to Jail.", action: 'jail' },
  { id: 5, text: "Paper Bomb Trap: Pay 50 Ryō fine.", action: 'money', amount: -50 },
  { id: 6, text: "Body Flicker Jutsu: Travel to Sunagakure.", action: 'move', position: 14 },
];

export const CHEST_CARDS: CardData[] = [
  { id: 1, text: "S-Rank Mission Complete: Advance to GO. (Collect 200 Ryō)", action: 'move', position: 0 },
  { id: 2, text: "Inherited Will: Collect 100 Ryō.", action: 'money', amount: 100 },
  { id: 3, text: "Hospitalized after Battle: Pay 100 Ryō.", action: 'money', amount: -100 },
  { id: 4, text: "Sentenced to Prison: Go directly to Jail.", action: 'jail' },
  { id: 5, text: "Genin Exam Success: Collect 10 Ryō.", action: 'money', amount: 10 },
  { id: 6, text: "Selling Ninja Tools: Collect 50 Ryō.", action: 'money', amount: 50 },
];

export const BOARD_DATA: TileData[] = [
  { id: 0, name: "START LINE", type: "go" },
  { id: 1, name: "Ichiraku Ramen", type: "property", color: "brown", price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, mortgage: 30 },
  { id: 2, name: "Mission Scroll", type: "chest" },
  { id: 3, name: "Entry Gates", type: "property", color: "brown", price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, mortgage: 30 },
  { id: 4, name: "Shinobi Tax", type: "tax", price: 200 },
  { id: 5, name: "Leaf Train", type: "railroad", price: 200, rent: [25, 50, 100, 200], mortgage: 100 },
  { id: 6, name: "Ninja Academy", type: "property", color: "lightblue", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgage: 50 },
  { id: 7, name: "Jutsu Scroll", type: "chance" },
  { id: 8, name: "Hidden Leaf Forest", type: "property", color: "lightblue", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgage: 50 },
  { id: 9, name: "Hokage Monument", type: "property", color: "lightblue", price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, mortgage: 60 },
  { id: 10, name: "Jail / Just Visiting", type: "jail" },
  { id: 11, name: "Chunin Exams", type: "property", color: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgage: 70 },
  { id: 12, name: "Ninja Tools", type: "utility", price: 150, mortgage: 75 },
  { id: 13, name: "Hidden Forest", type: "property", color: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgage: 70 },
  { id: 14, name: "Sunagakure", type: "property", color: "pink", price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, mortgage: 80 },
  { id: 15, name: "Sand Train", type: "railroad", price: 200, rent: [25, 50, 100, 200], mortgage: 100 },
  { id: 16, name: "Mount Myoboku", type: "property", color: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgage: 90 },
  { id: 17, name: "Mission Scroll", type: "chest" },
  { id: 18, name: "Valley of the End", type: "property", color: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgage: 90 },
  { id: 19, name: "Uchiha District", type: "property", color: "orange", price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, mortgage: 100 },
  { id: 20, name: "Free Parking", type: "parking" },
  { id: 21, name: "Akatsuki Hideout", type: "property", color: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgage: 110 },
  { id: 22, name: "Jutsu Scroll", type: "chance" },
  { id: 23, name: "Hidden Rain Village", type: "property", color: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgage: 110 },
  { id: 24, name: "Orochimaru Hideout", type: "property", color: "red", price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, mortgage: 120 },
  { id: 25, name: "Sound Train", type: "railroad", price: 200, rent: [25, 50, 100, 200], mortgage: 100 },
  { id: 26, name: "Samurai Bridge", type: "property", color: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgage: 130 },
  { id: 27, name: "Five Kage Summit", type: "property", color: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgage: 130 },
  { id: 28, name: "Chakra", type: "utility", price: 150, mortgage: 75 },
  { id: 29, name: "Otsutsuki Dimension", type: "property", color: "yellow", price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150, mortgage: 140 },
  { id: 30, name: "Go To Jail", type: "gotojail" },
  { id: 31, name: "Kaguya's Palace", type: "property", color: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgage: 150 },
  { id: 32, name: "Hyuga Compound", type: "property", color: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgage: 150 },
  { id: 33, name: "Ninja Mission Chest", type: "chest" },
  { id: 34, name: "Senju Jutsu", type: "property", color: "green", price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200, mortgage: 160 },
  { id: 35, name: "Cloud Train", type: "railroad", price: 200, rent: [25, 50, 100, 200], mortgage: 100 },
  { id: 36, name: "Jutsu Scroll", type: "chance" },
  { id: 37, name: "Hokage's Office", type: "property", color: "darkblue", price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200, mortgage: 175 },
  { id: 38, name: "Luxury Tax", type: "tax", price: 100 },
  { id: 39, name: "Naruto's House", type: "property", color: "darkblue", price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, mortgage: 200 },
];

// 3D CONSTANTS
export const BOARD_SIZE_3D = 12.8;
export const BOARD_THICKNESS = 0.2;
export const TILE_SIZE = 1.2;
export const CORNER_SIZE = 1.6;

export function getTilePosition(index: number): [number, number, number] {
  const side = Math.floor(index / 10);
  const pos = index % 10;
  const offset = (10 * TILE_SIZE) / 2 - TILE_SIZE / 2;
  const cornerOffset = offset + (CORNER_SIZE - TILE_SIZE) / 2;

  if (index === 0) return [cornerOffset, 0, cornerOffset];
  if (index === 10) return [-cornerOffset, 0, cornerOffset];
  if (index === 20) return [-cornerOffset, 0, -cornerOffset];
  if (index === 30) return [cornerOffset, 0, -cornerOffset];

  if (side === 0) return [cornerOffset - CORNER_SIZE/2 - TILE_SIZE/2 - (pos - 1) * TILE_SIZE, 0, cornerOffset];
  if (side === 1) return [-cornerOffset, 0, cornerOffset - CORNER_SIZE/2 - TILE_SIZE/2 - (pos - 1) * TILE_SIZE];
  if (side === 2) return [-cornerOffset + CORNER_SIZE/2 + TILE_SIZE/2 + (pos - 1) * TILE_SIZE, 0, -cornerOffset];
  if (side === 3) return [cornerOffset, 0, -cornerOffset + CORNER_SIZE/2 + TILE_SIZE/2 + (pos - 1) * TILE_SIZE];

  return [0, 0, 0];
}

export function getTileRotation(index: number): [number, number, number] {
  const side = Math.floor(index / 10);
  if (index % 10 === 0) return [-Math.PI / 2, 0, 0];
  if (side === 0) return [-Math.PI / 2, 0, 0];
  if (side === 1) return [-Math.PI / 2, 0, -Math.PI / 2];
  if (side === 2) return [-Math.PI / 2, 0, Math.PI];
  if (side === 3) return [-Math.PI / 2, 0, Math.PI / 2];
  return [-Math.PI / 2, 0, 0];
}
