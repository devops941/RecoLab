import React, { useState } from 'react';
import { useTheme, THEMES, ThemeId } from '../../context/ThemeContext';
import { Palette, Check, Sparkles, Crown } from 'lucide-react';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 transition-all hover:border-amber-400/40 shadow-sm"
        title="Switch Royal Theme"
      >
        <Palette className="w-4 h-4 text-amber-400" />
        <span className="hidden sm:inline text-[11px] font-mono">{THEMES[theme].name.split(' ')[0]}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 royal-glass rounded-2xl shadow-2xl border border-amber-500/30 p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150 backdrop-blur-2xl">
            <div className="px-2 py-1.5 mb-2 border-b border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 font-mono flex items-center space-x-1.5">
                <Crown className="w-3.5 h-3.5" />
                <span>Select Imperial Palette</span>
              </span>
              <span className="text-[9px] text-gray-400 font-mono">5 Themes</span>
            </div>

            <div className="space-y-1.5">
              {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
                const t = THEMES[tId];
                const isActive = theme === tId;
                return (
                  <button
                    key={tId}
                    onClick={() => {
                      setTheme(tId);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between border ${
                      isActive
                        ? 'bg-white/10 border-amber-400/50 shadow-royal-gold'
                        : 'hover:bg-white/5 border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex -space-x-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black shadow"
                          style={{ backgroundColor: t.primaryColor }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black shadow"
                          style={{ backgroundColor: t.accentColor }}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white leading-tight flex items-center space-x-1">
                          <span>{t.name}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 leading-none mt-0.5">{t.tagline}</div>
                      </div>
                    </div>

                    {isActive && (
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
