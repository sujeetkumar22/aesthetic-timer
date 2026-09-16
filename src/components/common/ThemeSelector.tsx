import React from 'react';
import { THEMES } from '../../utils/themes';
import { ThemeId } from '../../types/timer';

interface ThemeSelectorProps {
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 p-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 ${className}`}>
      {THEMES.map((t) => {
        const isSelected = currentTheme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onSelectTheme(t.id)}
            className={`group relative w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-all duration-200 flex items-center justify-center ${
              isSelected
                ? 'scale-110 ring-2 ring-white/80 shadow-md'
                : 'hover:scale-105 opacity-80 hover:opacity-100'
            }`}
            style={{ backgroundColor: t.colorSwatch }}
            title={t.name}
            aria-label={`Switch to ${t.name} theme`}
          >
            {isSelected && (
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  t.id === 'cream' || t.id === 'babyPink' ? 'bg-neutral-800' : 'bg-white'
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
