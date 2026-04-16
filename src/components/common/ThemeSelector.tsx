import React from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeSelector() {
  const { currentTheme, setTheme, colors } = useThemeStore();

  const toggleTheme = () => {
    setTheme(currentTheme === 'uchiha' ? 'goldenrod' : 'uchiha');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1, translateY: -2 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="p-3 rounded-2xl border-2 transition-all shadow-xl flex items-center justify-center btn-shinobi overflow-hidden relative group"
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.borderPrimary,
        boxShadow: `0 10px 20px ${currentTheme === 'uchiha' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(232, 167, 54, 0.15)'}`
      }}
      title={`Switch to ${currentTheme === 'uchiha' ? 'Goldenrod' : 'Uchiha'} Theme`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {currentTheme === 'uchiha' ? (
          <motion.div
            key="moon"
            initial={{ y: 20, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.3, ease: "backOut" }}
          >
            <Moon className="w-5 h-5 text-red-500 fill-red-500/20 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 20, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: -45 }}
            transition={{ duration: 0.3, ease: "backOut" }}
          >
            <Sun className="w-5 h-5 text-amber-500 fill-amber-500/20 drop-shadow-[0_0_8px_rgba(232,167,54,0.5)]" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full opacity-50"
        style={{ backgroundColor: currentTheme === 'uchiha' ? '#ef4444' : '#f59e0b' }}
      />
    </motion.button>
  );
}
