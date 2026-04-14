import React, { useState } from 'react';
import { useThemeStore, ThemeName } from '../../store/useThemeStore';
import { Palette } from 'lucide-react';

const themeOptions: { id: ThemeName; name: string; preview: string[]; icon: string }[] = [
  { id: 'uchiha', name: 'Uchiha', preview: ['#0f0f1a', '#ef4444', '#2d3748'], icon: '👁️' },
  { id: 'goldenrod', name: 'Goldenrod', preview: ['#FAEFD9', '#E8A736', '#2d1a0a'], icon: '📜' },
];

export default function ThemeSelector() {
  const { currentTheme, setTheme, colors } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all hover:scale-105 active:scale-95 text-[10px] font-black uppercase tracking-wider"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.borderPrimary,
          color: colors.textSecondary,
        }}
        title="Change Theme"
      >
        <Palette className="w-3.5 h-3.5" style={{ color: colors.textAccent }} />
        <span className="hidden sm:inline">Theme</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div 
            className="absolute left-0 top-full mt-2 w-48 rounded-xl border-2 shadow-2xl z-50 overflow-hidden"
            style={{
              backgroundColor: colors.bgTertiary,
              borderColor: colors.borderPrimary,
              boxShadow: `0 10px 40px rgba(0,0,0,0.3)`,
            }}
          >
            <div 
              className="px-3 py-2 border-b text-[9px] font-black uppercase tracking-widest"
              style={{ borderColor: colors.borderSecondary, color: colors.textMuted }}
            >
              Select Theme
            </div>
            {themeOptions.map((theme) => (
              <button
                key={theme.id}
                onClick={() => { setTheme(theme.id); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all hover:brightness-110 border-b last:border-0`}
                style={{
                  backgroundColor: currentTheme === theme.id ? colors.playerCardActive : 'transparent',
                  boxShadow: currentTheme === theme.id ? `inset 0 0 0 2px ${colors.borderAccent}` : 'none',
                  borderColor: colors.borderSecondary
                }}
              >
                <span className="text-sm">{theme.icon}</span>
                <div className="flex flex-col items-start min-w-0">
                  <span 
                    className="text-[10px] font-black uppercase tracking-tight truncate w-full"
                    style={{ color: colors.textPrimary }}
                  >
                    {theme.name}
                  </span>
                </div>
                <div className="flex gap-0.5 ml-auto">
                  {theme.preview.map((c, i) => (
                    <div key={i} className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
