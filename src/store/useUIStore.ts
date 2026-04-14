import { create } from 'zustand';

interface UIState {
  isChatOpen: boolean;
  isSidebarOpen: boolean;
  unreadCount: number;
  setIsChatOpen: (open: boolean) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setUnreadCount: (count: number) => void;
  toggleChat: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isChatOpen: false,
  isSidebarOpen: false,
  unreadCount: 0,
  setIsChatOpen: (open) => set({ isChatOpen: open }),
  setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
