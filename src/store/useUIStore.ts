import { create } from 'zustand';

interface UIState {
  isChatOpen: boolean;
  isSidebarOpen: boolean;
  unreadCount: number;
  isTrailerPlaying: boolean;
  setIsChatOpen: (open: boolean) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setUnreadCount: (count: number) => void;
  setIsTrailerPlaying: (playing: boolean) => void;
  toggleChat: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isChatOpen: false,
  isSidebarOpen: false,
  unreadCount: 0,
  isTrailerPlaying: false,
  setIsChatOpen: (open) => set({ isChatOpen: open }),
  setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  setIsTrailerPlaying: (playing) => set({ isTrailerPlaying: playing }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
