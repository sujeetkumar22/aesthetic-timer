import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Home,
  Share2,
  Music,
  SlidersHorizontal,
  CloudRain,
  Waves,
  Wind,
  Sparkles,
  Clock,
  Smartphone,
} from 'lucide-react';
import { TimerStatus, ThemeId, AmbientSoundType, ViewOrientation } from '../../types/timer';
import { ThemeSelector } from '../common/ThemeSelector';

interface TimerControlsProps {
  status: TimerStatus;
  currentDurationSeconds?: number;
  currentTheme?: ThemeId;
  onSelectTheme?: (theme: ThemeId) => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onSelectPreset?: (seconds: number) => void;
  onAddTime: (seconds: number) => void;
  onSubtractTime: (seconds: number) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isAmbientPlaying?: boolean;
  currentAmbientType?: AmbientSoundType;
  onToggleAmbient?: (type?: AmbientSoundType) => void;
  onSelectAmbientType?: (type: AmbientSoundType) => void;
  onOpenSettings?: () => void;
  onOpenExactTimeModal?: () => void;
  onReturnToSetup?: () => void;
  onShare?: () => void;
  viewOrientation?: ViewOrientation;
  onToggleOrientation?: () => void;
  className?: string;
}

const PRESET_TICKS = [
  { label: '01', seconds: 1 * 60 },
  { label: '15', seconds: 15 * 60 },
  { label: '30', seconds: 30 * 60 },
  { label: '45', seconds: 45 * 60 },
  { label: '60', seconds: 60 * 60 },
];

const AMBIENT_OPTIONS: { id: AmbientSoundType; label: string; icon: React.ReactNode }[] = [
  { id: 'rain', label: 'Rain', icon: <CloudRain className="w-3.5 h-3.5" /> },
  { id: 'brown', label: 'Brown Noise', icon: <Waves className="w-3.5 h-3.5" /> },
  { id: 'white', label: 'White Noise', icon: <Wind className="w-3.5 h-3.5" /> },
  { id: 'alpha', label: 'Zen 432Hz', icon: <Sparkles className="w-3.5 h-3.5" /> },
];

export const TimerControls: React.FC<TimerControlsProps> = ({
  status,
  currentDurationSeconds = 1500,
  currentTheme,
  onSelectTheme,
  onTogglePlay,
  onReset,
  onSelectPreset,
  isFullscreen,
  onToggleFullscreen,
  soundEnabled,
  onToggleSound,
  isAmbientPlaying = false,
  currentAmbientType = 'rain',
  onToggleAmbient,
  onSelectAmbientType,
  onOpenSettings,
  onOpenExactTimeModal,
  onReturnToSetup,
  onShare,
  viewOrientation = 'horizontal',
  onToggleOrientation,
  className = '',
}) => {
  const isRunning = status === 'running';
  const [showAmbientMenu, setShowAmbientMenu] = useState(false);

  return (
    <div className={`flex flex-col items-center gap-3 select-none transition-all duration-300 relative ${className}`}>
      {/* 1. TOP MINI ROW: Play / Pause & Reset buttons */}
      <div
        className="flex items-center justify-center gap-4 transition-colors"
        style={{ color: 'var(--digit-color)' }}
      >
        <button
          onClick={onTogglePlay}
          className="p-2 opacity-75 hover:opacity-100 transition-all active:scale-95"
          title={isRunning ? 'Pause (Space)' : 'Play (Space)'}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        >
          {isRunning ? (
            <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          ) : (
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current translate-x-0.5" />
          )}
        </button>

        <button
          onClick={onReset}
          className="p-2 opacity-75 hover:opacity-100 transition-all active:scale-95"
          title="Reset timer (R)"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* 2. MIDDLE SLIDER TRACK: [01 ... 15 ... 30 ... 45 ... 60] */}
      {onSelectPreset && (
        <div className="flex flex-col items-center w-60 sm:w-80 px-2 py-1">
          <div
            className="flex justify-between w-full text-[11px] font-mono pb-1 px-1 transition-colors"
            style={{ color: 'var(--muted-color)' }}
          >
            {PRESET_TICKS.map((t) => (
              <span
                key={t.label}
                onClick={() => onSelectPreset(t.seconds)}
                className={`cursor-pointer transition-colors hover:opacity-100 ${
                  Math.round(currentDurationSeconds / 60) === Math.round(t.seconds / 60)
                    ? 'font-bold opacity-100'
                    : 'opacity-60'
                }`}
                style={{
                  color:
                    Math.round(currentDurationSeconds / 60) === Math.round(t.seconds / 60)
                      ? 'var(--digit-color)'
                      : 'var(--muted-color)',
                }}
              >
                {t.label}
              </span>
            ))}
          </div>

          <div
            className="relative w-full h-1.5 rounded-full cursor-pointer flex items-center border transition-colors"
            style={{
              backgroundColor: 'var(--card-bottom)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{
                width: `${Math.min(100, Math.max(0, (currentDurationSeconds / 3600) * 100))}%`,
                backgroundColor: 'var(--muted-color)',
              }}
            />
            <div
              className="absolute w-3.5 h-3.5 rounded-full shadow-md -translate-x-1/2 transition-all pointer-events-none"
              style={{
                left: `${Math.min(100, Math.max(0, (currentDurationSeconds / 3600) * 100))}%`,
                backgroundColor: 'var(--digit-color)',
              }}
            />
            <input
              type="range"
              min="60"
              max="3600"
              step="60"
              value={Math.min(3600, currentDurationSeconds)}
              onChange={(e) => onSelectPreset(parseInt(e.target.value, 10))}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              aria-label="Preset duration slider"
            />
          </div>
        </div>
      )}

      {/* 3. QUICK THEME PALETTE SWATCHES */}
      {currentTheme && onSelectTheme && (
        <div className="py-0.5">
          <ThemeSelector currentTheme={currentTheme} onSelectTheme={onSelectTheme} />
        </div>
      )}

      {/* Ambient Soundscapes Popover Menu */}
      {showAmbientMenu && onToggleAmbient && (
        <div
          className="absolute bottom-16 p-2 rounded-2xl border shadow-2xl backdrop-blur-md flex flex-col gap-1 z-50 animate-fade-in text-xs min-w-[145px] transition-colors"
          style={{
            backgroundColor: 'var(--card-top)',
            borderColor: 'var(--border-color)',
            color: 'var(--digit-color)',
          }}
        >
          <div
            className="text-[10px] font-semibold tracking-wider uppercase px-2 py-1 opacity-70"
            style={{ color: 'var(--muted-color)' }}
          >
            Focus Soundscapes
          </div>
          {AMBIENT_OPTIONS.map((opt) => {
            const isActive = isAmbientPlaying && currentAmbientType === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  onSelectAmbientType?.(opt.id);
                  onToggleAmbient(opt.id);
                  setShowAmbientMenu(false);
                }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all ${
                  isActive ? 'font-bold shadow-sm' : 'opacity-80 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--card-bottom)' : 'transparent',
                  color: 'var(--digit-color)',
                }}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 4. BOTTOM UTILITY ICON ROW */}
      <div
        className="flex items-center justify-center gap-4 sm:gap-6 pt-1 transition-colors"
        style={{ color: 'var(--digit-color)' }}
      >
        {/* Master Sound Mute/Unmute */}
        <button
          onClick={onToggleSound}
          className="p-1.5 opacity-75 hover:opacity-100 transition-all"
          title={soundEnabled ? 'Mute sound (M)' : 'Unmute sound (M)'}
          aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4 text-red-500" />
          )}
        </button>

        {/* Ambient Soundscapes Menu */}
        {onToggleAmbient && (
          <button
            onClick={() => setShowAmbientMenu((prev) => !prev)}
            className={`p-1.5 transition-all ${
              isAmbientPlaying
                ? 'text-emerald-500 font-bold scale-110'
                : 'opacity-75 hover:opacity-100'
            }`}
            title={`Ambient Soundscapes (${currentAmbientType})`}
            aria-label="Toggle ambient focus noise menu"
          >
            <Music className="w-4 h-4" />
          </button>
        )}

        {/* Settings / Preferences */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-1.5 opacity-75 hover:opacity-100 transition-all"
            title="Timer Preferences"
            aria-label="Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}

        {/* Exact Time Modal */}
        {onOpenExactTimeModal && (
          <button
            onClick={onOpenExactTimeModal}
            className="p-1.5 opacity-75 hover:opacity-100 transition-all"
            title="Set Exact Time (e.g. 2 hours 45 minutes)"
            aria-label="Set Exact Time"
          >
            <Clock className="w-4 h-4" />
          </button>
        )}

        {/* Share Link */}
        {onShare && (
          <button
            onClick={onShare}
            className="p-1.5 opacity-75 hover:opacity-100 transition-all"
            title="Share Timer Link"
            aria-label="Share Timer Link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}

        {/* View Orientation Toggle */}
        {onToggleOrientation && (
          <button
            onClick={onToggleOrientation}
            className="relative p-1.5 opacity-75 hover:opacity-100 transition-all"
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

        {/* Fullscreen Button */}
        <button
          onClick={onToggleFullscreen}
          className="p-1.5 opacity-75 hover:opacity-100 transition-all"
          title={isFullscreen ? 'Exit Fullscreen (F / Esc)' : 'Fullscreen (F)'}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>

        {/* Home / Return to Setup */}
        {onReturnToSetup && (
          <button
            onClick={onReturnToSetup}
            className="p-1.5 opacity-75 hover:opacity-100 transition-all"
            title="Setup Screen"
            aria-label="Return to Setup"
          >
            <Home className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
