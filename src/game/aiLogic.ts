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

// Helper to find properties part of a monopoly or close to one
const getMonopolies = (properties: number[]) => {
  const colorGroups: Record<string, number[]> = {};
  
  BOARD_DATA.forEach(t => {
    if (t.color) {
      if (!colorGroups[t.color]) colorGroups[t.color] = [];
      colorGroups[t.color].push(t.id);
    }
  });

  const completeMonopolies: number[] = [];
  const nearMonopolies: number[] = [];

  Object.entries(colorGroups).forEach(([color, ids]) => {
    const ownedCount = ids.filter(id => properties.includes(id)).length;
    if (ownedCount === ids.length) {
      completeMonopolies.push(...ids);
    } else if (ownedCount >= ids.length - 1 && ids.length > 1) {
      nearMonopolies.push(...ids);
    }
  });

  return { complete: completeMonopolies, near: nearMonopolies };
};

export const getAIDecision = (ai: AIPlayer, gameState: any) => {
  const currentTile = BOARD_DATA[ai.position];
  const { complete, near } = getMonopolies(ai.properties || []);
  
  // 1. BUYING DECISION (Aggressive for monopolies)
  if (currentTile.type === 'property' || currentTile.type === 'railroad' || currentTile.type === 'utility') {
    const isOwned = Object.values(gameState.players).some((p: any) => p.properties?.includes(ai.position));
    if (!isOwned && ai.money >= (currentTile.price || 0)) {
       const completesMonopoly = near.includes(ai.position);
       const buffer = ai.difficulty === 'hard' ? 150 : (ai.difficulty === 'medium' ? 100 : 50);
       
       if (completesMonopoly || ai.money - (currentTile.price || 0) > buffer) {
          return { action: 'buy' };
       }
    }
  }

  // 2. BUILDING DECISION (Prioritize complete sets)
  if (ai.difficulty !== 'easy' && complete.length > 0) {
    // Sort monopolies by potential rent (price)
    const sortedMonopolies = [...complete].sort((a, b) => (BOARD_DATA[b].price || 0) - (BOARD_DATA[a].price || 0));
    for (const propId of sortedMonopolies) {
      const tile = BOARD_DATA[propId];
      const currentHouses = gameState.houses?.[propId] || 0;
      const buildBuffer = ai.difficulty === 'hard' ? 400 : 250;
      if (currentHouses < 5 && ai.money > (tile.houseCost || 0) + buildBuffer) {
        return { action: 'buildHouse', propertyId: propId };
      }
    }
  }

  // 3. EMERGENCY MORTGAGE
  if (ai.money < 0) {
    const potentialMortgages = (ai.properties || [])
      .filter(id => !gameState.mortgaged?.includes(id))
      .filter(id => !complete.includes(id)) // Try not to mortgage monopolies
      .sort((a,b) => (BOARD_DATA[a].price || 0) - (BOARD_DATA[b].price || 0));
    
    if (potentialMortgages.length > 0) {
      return { action: 'mortgage', propertyId: potentialMortgages[0] };
    }
    
    // If we MUST mortgage a monopoly, do the cheapest one
    const monopolyMortgages = complete.filter(id => !gameState.mortgaged?.includes(id));
    if (monopolyMortgages.length > 0) {
       return { action: 'mortgage', propertyId: monopolyMortgages[0] };
    }
  }

  return { action: 'endTurn' };
};

