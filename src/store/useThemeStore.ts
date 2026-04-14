import { create } from 'zustand';

export type ThemeName = 'uchiha' | 'goldenrod';

export interface ThemeColors {
  // Core
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgCard: string;
  bgCardHover: string;
  bgOverlay: string;
  bgInput: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textAccent: string;
  
  // Borders
  borderPrimary: string;
  borderSecondary: string;
  borderAccent: string;
  
  // Accent colors
  accent: string;
  accentHover: string;
  accentBorder: string;
  accentGlow: string;
  
  // Surfaces
  headerBg: string;
  sidebarBg: string;
  sidebarSectionBg: string;
  
  // Buttons
  btnDanger: string;
  btnDangerHover: string;
  btnDangerBorder: string;
  btnPrimary: string;
  btnPrimaryHover: string;
  
  // Misc
  scrollBg: string;
  turnIndicatorBg: string;
  playerCardActive: string;
  playerCardActiveBorder: string;
}

const themes: Record<ThemeName, ThemeColors> = {
  uchiha: {
    bgPrimary: '#050508',
    bgSecondary: '#0f0f1a',
    bgTertiary: '#121220',
    bgCard: '#1a1a2e',
    bgCardHover: '#232345',
    bgOverlay: 'rgba(0,0,0,0.8)',
    bgInput: '#1a1a2e',
    
    textPrimary: '#ffffff', // Pure white for max contrast
    textSecondary: '#e2e8f0',
    textMuted: '#94a3b8',
    textAccent: '#ff4d4d', // Brighter red
    
    borderPrimary: '#2d3748',
    borderSecondary: 'rgba(74, 85, 104, 0.4)',
    borderAccent: '#ef4444',
    
    accent: '#dc2626',
    accentHover: '#b91c1c',
    accentBorder: '#7f1d1d',
    accentGlow: 'rgba(220,38,38,0.4)',
    
    headerBg: '#0f0f1a',
    sidebarBg: '#121220',
    sidebarSectionBg: 'rgba(26,26,46,0.6)',
    
    btnDanger: '#b91c1c',
    btnDangerHover: '#991b1b',
    btnDangerBorder: '#7f1d1d',
    btnPrimary: '#ef4444', // Red primary for Uchiha
    btnPrimaryHover: '#dc2626',
    
    scrollBg: 'rgba(255,255,255,0.05)',
    turnIndicatorBg: '#1a1a2e',
    playerCardActive: 'rgba(220,38,38,0.2)',
    playerCardActiveBorder: '#ef4444',
  },
  goldenrod: {
    bgPrimary: '#140f0a',
    bgSecondary: '#e6d8b8',
    bgTertiary: '#efe1c4',
    bgCard: '#efe1c4',
    bgCardHover: '#e6d8b8',
    bgOverlay: 'rgba(0,0,0,0.75)',
    bgInput: '#ffffff',
    
    textPrimary: '#1a0f06', 
    textSecondary: '#3d2514',
    textMuted: '#4a3728',
    textAccent: '#a66b0a', 
    
    borderPrimary: '#c28722',
    borderSecondary: 'rgba(194, 135, 34, 0.3)',
    borderAccent: '#c28722',
    
    accent: '#c28722',
    accentHover: '#ab771e',
    accentBorder: '#916519',
    accentGlow: 'rgba(194, 135, 34, 0.15)',
    
    headerBg: '#e8d9ba',
    sidebarBg: '#efdfc2',
    sidebarSectionBg: 'rgba(194, 135, 34, 0.1)',
    
    btnDanger: '#9f1239',
    btnDangerHover: '#881337',
    btnDangerBorder: '#4c0519',
    btnPrimary: '#E8A736',
    btnPrimaryHover: '#d1942d',
    
    scrollBg: 'rgba(0,0,0,0.1)',
    turnIndicatorBg: '#FAEFD9',
    playerCardActive: 'rgba(232, 167, 54, 0.2)',
    playerCardActiveBorder: '#E8A736',
  }
};

interface ThemeState {
  currentTheme: ThemeName;
  colors: ThemeColors;
  setTheme: (theme: ThemeName) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const savedTheme = (typeof window !== 'undefined' && localStorage.getItem('monopoly-theme') as ThemeName) || 'goldenrod';
  const initialTheme = themes[savedTheme] ? savedTheme : 'goldenrod';

  return {
    currentTheme: initialTheme,
    colors: themes[initialTheme],
    setTheme: (theme) => {
      localStorage.setItem('monopoly-theme', theme);
      set({ currentTheme: theme, colors: themes[theme] });
    },
  };
});

export const getThemeColors = (theme: ThemeName) => themes[theme];
