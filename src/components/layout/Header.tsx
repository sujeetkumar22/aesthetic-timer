import React from 'react';
import { TimerMode, ViewOrientation } from '../../types/timer';
import { ModeTabs } from '../setup/ModeTabs';
import { Settings, Volume2, VolumeX, Maximize2, Minimize2, Smartphone } from 'lucide-react';

interface HeaderProps {
  currentMode: TimerMode;
  onSelectMode: (mode: TimerMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  isTimerRunning: boolean;
  onLogoClick: () => void;
  viewOrientation?: ViewOrientation;
  onToggleOrientation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  soundEnabled,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
  onOpenSettings,
  isTimerRunning,
  onLogoClick,
  viewOrientation = 'horizontal',
  onToggleOrientation,
}) => {
  return (
    <header className="w-full flex flex-col sm:flex-row items-center justify-between px-3 sm:px-8 py-3 sm:py-5 select-none z-30 transition-opacity duration-300">
      {/* Top Bar on Mobile / Inline on Desktop */}
      <div className="w-full sm:w-auto flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 text-left group transition-transform active:scale-95"
          aria-label="Return to Timer Setup"
        >
          <span
            className="font-display font-extrabold tracking-widest text-base sm:text-xl transition-colors"
            style={{ color: 'var(--digit-color)' }}
          >
            BIGTIMER
          </span>
        </button>

        {/* Quick Action Utilities on Mobile */}
        <div
          className="flex sm:hidden items-center gap-1.5 transition-colors"
          style={{ color: 'var(--muted-color)' }}
        >
          {onToggleOrientation && (
            <button
              onClick={onToggleOrientation}
              className="relative p-1.5 hover:opacity-100 opacity-80 rounded-full transition-all"
              title={
                viewOrientation === 'auto'
                  ? 'Orientation: Auto (Rotates with Phone)'
                  : viewOrientation === 'vertical'
                  ? 'Orientation: Vertical (Stacked)'
                  : 'Orientation: Horizontal (Side by Side)'
              }
              aria-label="Toggle View Orientation"
            >
              <Smartphone
                className={`w-4 h-4 transition-transform duration-300 ${
                  viewOrientation === 'horizontal' ? 'rotate-90' : ''
                }`}
              />
              {viewOrientation === 'auto' && (
                <span
                  className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm"
                  title="Auto-rotate enabled"
                />
              )}
            </button>
          )}

          <button
            onClick={onToggleSound}
            className="p-1.5 hover:opacity-100 opacity-80 rounded-full transition-all"
            title={soundEnabled ? 'Mute sound (M)' : 'Unmute sound (M)'}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-red-400" />
            )}
          </button>

          <button
            onClick={onToggleFullscreen}
            className="p-1.5 hover:opacity-100 opacity-80 rounded-full transition-all"
            title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 hover:opacity-100 opacity-80 rounded-full transition-all"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Tabs (Cleanly available on both Mobile and Desktop when timer is not running) */}
      {!isTimerRunning && (
        <div className="flex justify-center w-full sm:w-auto mt-2 sm:mt-0">
          <ModeTabs currentMode={currentMode} onSelectMode={onSelectMode} />
        </div>
      )}

      {/* Quick Action Utilities on Desktop */}
      <div
        className="hidden sm:flex items-center gap-2 sm:gap-3 transition-colors"
        style={{ color: 'var(--muted-color)' }}
      >
        {onToggleOrientation && (
          <button
            onClick={onToggleOrientation}
            className="relative p-2 hover:opacity-100 opacity-80 rounded-full transition-all"
            title={
              viewOrientation === 'auto'
                ? 'Orientation: Auto (Rotates with Phone)'
                : viewOrientation === 'vertical'
                ? 'Orientation: Vertical (Stacked)'
                : 'Orientation: Horizontal (Side by Side)'
            }
            aria-label="Toggle View Orientation"
          >
            <Smartphone
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${
                viewOrientation === 'horizontal' ? 'rotate-90' : ''
              }`}
            />
            {viewOrientation === 'auto' && (
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-sm"
                title="Auto-rotate enabled"
              />
            )}
          </button>
        )}

        <button
          onClick={onToggleSound}
          className="p-2 hover:opacity-100 opacity-80 rounded-full transition-all"
          title={soundEnabled ? 'Mute sound (M)' : 'Unmute sound (M)'}
          aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
          )}
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-2 hover:opacity-100 opacity-80 rounded-full transition-all"
          title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 hover:opacity-100 opacity-80 rounded-full transition-all"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </header>
  );
};
