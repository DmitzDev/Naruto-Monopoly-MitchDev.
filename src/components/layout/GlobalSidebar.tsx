import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquareText } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import ChatSystem from '../game/ChatSystem';
import { useLocation } from 'react-router-dom';

export default function GlobalSidebar() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { user, profile } = useAuthStore();
  const { colors } = useThemeStore();
  const location = useLocation();

  const roomId = React.useMemo(() => {
    const match = location.pathname.match(/\/game\/([^/]+)/);
    return match ? match[1] : undefined;
  }, [location]);

  if (!user || !profile) return null;

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2500]"
          />

          {/* Sidebar - Purely Chat System Only */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-[300px] sm:w-[380px] z-[2600] flex flex-col shadow-2xl border-r-4"
            style={{ backgroundColor: colors.bgTertiary, borderColor: colors.borderPrimary }}
          >
            {/* Sidebar Header */}
            <div className="p-4 flex items-center justify-between border-b-2"
                 style={{ backgroundColor: colors.headerBg, borderColor: colors.borderSecondary }}>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-orange-600/10 flex items-center justify-center border border-orange-500/30">
                    <MessageSquareText className="w-4 h-4 text-orange-600" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted">VILLAGE COMMS</span>
              </div>
              <button onClick={toggleSidebar} className="p-1 hover:bg-black/10 rounded-full transition-all active:scale-90">
                <X className="w-4 h-4 text-muted" />
              </button>
            </div>

            {/* Sidebar Content - ONLY CHAT */}
            <div className="flex-1 flex flex-col min-h-0">
               <ChatSystem 
                  roomId={roomId}
                  username={profile.username || user.displayName || 'Ninja'}
                  photoURL={profile.photoURL || user.photoURL || ''}
                  colors={colors}
                  isEmbedded={true}
               />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
