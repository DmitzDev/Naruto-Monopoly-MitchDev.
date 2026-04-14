import { BOARD_DATA } from './boardData';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface AIPlayer {
  id: string;
  username: string;
  money: number;
  properties: number[];
  position: number;
  difficulty: AIDifficulty;
}

export const getAIDecision = (ai: AIPlayer, gameState: any) => {
  const currentTile = BOARD_DATA[ai.position];
  
  // 1. BUYING DECISION
  if (['property', 'railroad', 'utility'].includes(currentTile.type)) {
    const isOwned = Object.values(gameState.players).some((p: any) => p.properties?.includes(ai.position));
    if (!isOwned && ai.money >= (currentTile.price || 0)) {
      // Easy: 40% chance to buy
      // Medium: 70% chance to buy
      // Hard: Always buy if ROI is good or helps monopoly
      const rand = Math.random();
      if (ai.difficulty === 'easy' && rand < 0.4) return { action: 'buy' };
      if (ai.difficulty === 'medium' && rand < 0.7) return { action: 'buy' };
      if (ai.difficulty === 'hard') {
         // Hard AI always buys if they have enough buffer (e.g. keep 200 Ryō)
         if (ai.money - (currentTile.price || 0) > 200) return { action: 'buy' };
      }
    }
  }

  // 2. BUILDING DECISION (Only for Medium/Hard)
  if (ai.difficulty !== 'easy') {
    const monopolies = getMonopolies(ai.properties || []);
    for (const propId of monopolies) {
      const tile = BOARD_DATA[propId];
      const currentHouses = gameState.houses?.[propId] || 0;
      if (currentHouses < 5 && ai.money > (tile.houseCost || 0) + 300) {
        return { action: 'buildHouse', propertyId: propId };
      }
    }
  }

  // 3. MORTGAGE DECISION (If money is low)
  if (ai.money < 0) {
    const potentialMortgages = (ai.properties || []).filter(id => !gameState.mortgaged?.includes(id));
    if (potentialMortgages.length > 0) {
      // Mortgage cheapest properties first
      const cheapest = potentialMortgages.sort((a,b) => (BOARD_DATA[a].price || 0) - (BOARD_DATA[b].price || 0))[0];
      return { action: 'mortgage', propertyId: cheapest };
    }
  }

  return { action: 'endTurn' };
};

// Helper to find properties part of a monopoly
const getMonopolies = (properties: number[]) => {
  const monopolies: number[] = [];
  const colorGroups: Record<string, number[]> = {};
  
  BOARD_DATA.forEach(t => {
    if (t.color) {
      if (!colorGroups[t.color]) colorGroups[t.color] = [];
      colorGroups[t.color].push(t.id);
    }
  });

  Object.entries(colorGroups).forEach(([color, ids]) => {
    if (ids.every(id => properties.includes(id))) {
      monopolies.push(...ids);
    }
  });

  return monopolies;
};
