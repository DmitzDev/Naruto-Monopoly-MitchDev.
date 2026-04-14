import { create } from 'zustand';
import { ref, update, get } from 'firebase/database';
import { db } from '../firebase/config';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  xpReward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', name: 'First Victory!', description: 'Win your first game', icon: '🏆', condition: 'wins >= 1', xpReward: 200 },
  { id: 'rich_player', name: 'Rich Shinobi', description: 'Have ₱5000+ in a game', icon: '💰', condition: 'money >= 5000', xpReward: 150 },
  { id: 'property_king', name: 'Property King', description: 'Own 10+ properties in a game', icon: '🏰', condition: 'properties >= 10', xpReward: 250 },
  { id: 'hotel_tycoon', name: 'Hotel Tycoon', description: 'Build your first hotel', icon: '🏨', condition: 'hotels >= 1', xpReward: 100 },
  { id: 'monopolist', name: 'Monopolist', description: 'Own a complete color set', icon: '🎨', condition: 'monopoly >= 1', xpReward: 100 },
  { id: 'survivor', name: 'Survivor', description: 'Survive 30+ turns in a game', icon: '🛡️', condition: 'turns >= 30', xpReward: 75 },
  { id: 'trader', name: 'Diplomatic Trader', description: 'Complete 3 trades', icon: '🤝', condition: 'trades >= 3', xpReward: 100 },
  { id: 'comeback', name: 'Comeback King', description: 'Win after being below ₱100', icon: '🔥', condition: 'comeback', xpReward: 300 },
];

export const RANKS = [
  { level: 1, name: 'Academy Student', minXP: 0, badge: '📖' },
  { level: 2, name: 'Genin', minXP: 100, badge: '🥷' },
  { level: 3, name: 'Chunin', minXP: 300, badge: '⚔️' },
  { level: 4, name: 'Special Jonin', minXP: 600, badge: '🗡️' },
  { level: 5, name: 'Jonin', minXP: 1000, badge: '💎' },
  { level: 6, name: 'ANBU', minXP: 1500, badge: '🎭' },
  { level: 7, name: 'SANIN', minXP: 2200, badge: '🐉' },
  { level: 8, name: 'Kage', minXP: 3000, badge: '👑' },
  { level: 9, name: 'HOKAGE', minXP: 4000, badge: '🔱' },
  { level: 10, name: 'SIX PATH OF PAIN', minXP: 5500, badge: '✨' },
];

export function getRankFromXP(xp: number) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXP) rank = r;
    else break;
  }
  return rank;
}

export function getXPForNextRank(xp: number) {
  const currentRank = getRankFromXP(xp);
  const nextRank = RANKS.find(r => r.minXP > currentRank.minXP);
  if (!nextRank) return { current: xp - currentRank.minXP, needed: 0, percent: 100 };
  const current = xp - currentRank.minXP;
  const needed = nextRank.minXP - currentRank.minXP;
  return { current, needed, percent: Math.min(100, (current / needed) * 100) };
}

export async function awardXP(userId: string, amount: number) {
  const userRef = ref(db, `users/${userId}`);
  const snapshot = await get(userRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    const newXP = (data.xp || 0) + amount;
    const newRank = getRankFromXP(newXP);
    await update(userRef, { xp: newXP, rank: newRank.name, level: newRank.level });
    return { newXP, rank: newRank };
  }
  return null;
}

export async function checkAndUnlockAchievement(userId: string, achievementId: string) {
  const userRef = ref(db, `users/${userId}`);
  const snapshot = await get(userRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    const unlockedAchievements = data.achievements || [];
    if (!unlockedAchievements.includes(achievementId)) {
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (achievement) {
        unlockedAchievements.push(achievementId);
        
        // Check if ALL are unlocked now
        let finalAchievements = unlockedAchievements;
        let newXpBonus = achievement.xpReward;
        let cycleReset = false;

        if (unlockedAchievements.length >= ACHIEVEMENTS.length) {
          // Reset for new cycle
          finalAchievements = [];
          newXpBonus += 500; // Big bonus for completing cycle
          cycleReset = true;
        }

        const newXP = (data.xp || 0) + newXpBonus;
        const newRank = getRankFromXP(newXP);
        const prestige = (data.prestige || 0) + (cycleReset ? 1 : 0);

        await update(userRef, { 
          achievements: finalAchievements, 
          xp: newXP,
          rank: newRank.name,
          level: newRank.level,
          prestige: prestige
        });
        return achievement;
      }
    }
  }
  return null;
}

interface ProgressionState {
  toastMessage: string | null;
  toastIcon: string | null;
  showToast: (message: string, icon: string) => void;
  clearToast: () => void;
}

export const useProgressionStore = create<ProgressionState>((set) => ({
  toastMessage: null,
  toastIcon: null,
  showToast: (message, icon) => {
    set({ toastMessage: message, toastIcon: icon });
    setTimeout(() => set({ toastMessage: null, toastIcon: null }), 4000);
  },
  clearToast: () => set({ toastMessage: null, toastIcon: null }),
}));
