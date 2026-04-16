import { create } from 'zustand';
import { User } from 'firebase/auth';

interface UserProfile {
  username: string;
  email: string;
  photoURL?: string;
  ownedSkins?: string[];
  selectedToken?: string;
  selectedDice?: string;
  lastDailyClaim?: number;
  wins: number;
  losses: number;
  coins: number;
  achievements?: string[];
  xp?: number;
  rank?: string;
  level?: number;
  prestige?: number;
  ownedBoards?: string[];
  activeBoard?: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
