import React from 'react';
import { TimerMode } from '../../types/timer';
import { Timer, Brain, Clock, Calendar } from 'lucide-react';

interface ModeTabsProps {
  currentMode: TimerMode;
  onSelectMode: (mode: TimerMode) => void;
  className?: string;
}

export const ModeTabs: React.FC<ModeTabsProps> = ({ currentMode, onSelectMode, className = '' }) => {
  const modes: { id: TimerMode; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    { id: 'countdown', label: 'Countdown', shortLabel: 'Timer', icon: <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'pomodoro', label: 'Pomodoro', shortLabel: 'Pomo', icon: <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'stopwatch', label: 'Stopwatch', shortLabel: 'Watch', icon: <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'clock', label: 'Flip Clock', shortLabel: 'Clock', icon: <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
  ];

  return (
    <div
      className={`inline-flex items-center p-0.5 sm:p-1 rounded-full border backdrop-blur-md transition-colors ${className}`}
      style={{
        backgroundColor: 'var(--nav-bg, rgba(0,0,0,0.3))',
        borderColor: 'var(--border-color)',
      }}
    >
      {modes.map((mode) => {
        const isActive = currentMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onSelectMode(mode.id)}
            className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-sm font-medium transition-all active:scale-95 ${
              isActive
                ? 'shadow-sm font-semibold'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: isActive ? 'var(--digit-color)' : 'transparent',
              color: isActive ? 'var(--bg-color)' : 'var(--digit-color)',
            }}
          >
            {mode.icon}
            <span className="hidden sm:inline">{mode.label}</span>
            <span className="sm:hidden">{mode.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
};
