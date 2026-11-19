import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 
  | 'microdose-studio'
  | 'gif-garaje'
  | 'royal-emerald'
  | 'midnight-aurora'
  | 'sapphire-celestial';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  surfaceBg: string;
  gradientText: string;
  badgeStyle: string;
  isLight?: boolean;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'microdose-studio': {
    id: 'microdose-studio',
    name: 'Microdose Studio (Light & Ethereal)',
    tagline: 'Luminous White, Dreamy Aurora Blurs & Royal Cobalt Blue',
    primaryColor: '#2563EB',
    accentColor: '#10B981',
    surfaceBg: '#FFFFFF',
    gradientText: 'from-[#0B0F19] via-[#1E293B] to-[#3B82F6]',
    badgeStyle: 'bg-[#0F172A] text-white font-medium rounded-full shadow-sm',
    isLight: true
  },
  'gif-garaje': {
    id: 'gif-garaje',
    name: 'GIF Garaje Creative',
    tagline: 'Acid Lime #CCFF00, Neon Violet & Kinetic Brutalism',
    primaryColor: '#CCFF00',
    accentColor: '#8B5CF6',
    surfaceBg: '#08090D',
    gradientText: 'from-white via-[#CCFF00] to-[#8B5CF6]',
    badgeStyle: 'bg-[#CCFF00] text-black font-extrabold uppercase font-mono shadow-gif-lime',
    isLight: false
  },
  'royal-emerald': {
    id: 'royal-emerald',
    name: 'Sovereign Emerald & Gold',
    tagline: 'Imperial 24K Gold & Deep Velvet Emerald',
    primaryColor: '#10B981',
    accentColor: '#F59E0B',
    surfaceBg: '#070A12',
    gradientText: 'from-amber-200 via-amber-400 to-yellow-500',
    badgeStyle: 'bg-amber-400/10 text-amber-300 border border-amber-400/30',
    isLight: false
  },
  'midnight-aurora': {
    id: 'midnight-aurora',
    name: 'Midnight Aurora Cyber',
    tagline: 'Electric Cyan, Neon Fuchsia & Ultraviolet',
    primaryColor: '#00F0FF',
    accentColor: '#FF2E74',
    surfaceBg: '#040714',
    gradientText: 'from-cyan-300 via-teal-300 to-fuchsia-400',
    badgeStyle: 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/30',
    isLight: false
  },
  'sapphire-celestial': {
    id: 'sapphire-celestial',
    name: 'Sapphire Celestial',
    tagline: 'Royal Blue Velvet, Cobalt & Deep Space Azure',
    primaryColor: '#3B82F6',
    accentColor: '#00F0FF',
    surfaceBg: '#050914',
    gradientText: 'from-blue-200 via-sky-300 to-indigo-400',
    badgeStyle: 'bg-blue-400/10 text-blue-300 border border-blue-400/30',
    isLight: false
  }
};

interface ThemeContextType {
  theme: ThemeId;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>('microdose-studio');

  useEffect(() => {
    const saved = localStorage.getItem('recolab_royal_theme') as ThemeId;
    if (saved && THEMES[saved]) {
      setThemeState(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      setThemeState('microdose-studio');
      document.documentElement.setAttribute('data-theme', 'microdose-studio');
    }
  }, []);

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    localStorage.setItem('recolab_royal_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeConfig: THEMES[theme], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
