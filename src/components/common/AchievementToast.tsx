import React from 'react';
import { useProgressionStore } from '../../store/useProgressionStore';
import { useThemeStore } from '../../store/useThemeStore';

export default function AchievementToast() {
  const { toastMessage, toastIcon, clearToast } = useProgressionStore();
  const { colors } = useThemeStore();
  
  if (!toastMessage) return null;
  
  return (
    <div 
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-8 duration-500"
      onClick={clearToast}
    >
      <div 
        className="flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border-2 cursor-pointer hover:scale-105 transition-transform"
        style={{
          background: `linear-gradient(135deg, ${colors.bgCard}, ${colors.bgTertiary})`,
          borderColor: colors.borderAccent,
          boxShadow: `0 0 30px ${colors.accentGlow}, 0 10px 40px rgba(0,0,0,0.3)`,
        }}
      >
        <span className="text-2xl animate-bounce">{toastIcon}</span>
        <div className="flex flex-col">
          <span 
            className="text-[9px] font-black uppercase tracking-widest"
            style={{ color: colors.textMuted }}
          >
            Achievement Unlocked!
          </span>
          <span 
            className="text-sm font-black uppercase tracking-tight"
            style={{ color: colors.textAccent }}
          >
            {toastMessage}
          </span>
        </div>
        <div 
          className="w-2 h-2 rounded-full animate-pulse ml-2"
          style={{ backgroundColor: colors.accent }}
        />
      </div>
    </div>
  );
}
