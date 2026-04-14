import { create } from 'zustand';

export interface PlayerState {
  id: string;
  username: string;
  position: number;
  money: number;
  properties: number[];
  inJail: boolean;
  jailTurns: number;
  color: string;
}

export interface GameState {
  players: Record<string, PlayerState>;
  turnOrder: string[];
  currentTurnIndex: number;
  diceResult: [number, number] | null;
  status: 'waiting' | 'playing' | 'finished';
  logs: string[];
}

interface GameStore extends GameState {
  setGameState: (state: Partial<GameState>) => void;
  addLog: (log: string) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  players: {},
  turnOrder: [],
  currentTurnIndex: 0,
  diceResult: null,
  status: 'waiting',
  logs: [],
  setGameState: (state) => set((prev) => ({ ...prev, ...state })),
  addLog: (log) => set((prev) => ({ logs: [...prev.logs, log] })),
}));
