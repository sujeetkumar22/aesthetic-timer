import React from 'react';
import {
  X,
  Volume2,
  Palette,
  Type,
  Sliders,
  Keyboard,
  Check,
  Monitor,
  CloudRain,
  Waves,
  Wind,
  Sparkles,
} from 'lucide-react';
import { AppSettings, ThemeId, FontId, AmbientSoundType } from '../../types/timer';
import { THEMES, FONTS } from '../../utils/themes';
import { soundSynth } from '../../utils/soundSynth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
}

const AMBIENT_PRESETS: { id: AmbientSoundType; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'rain', label: 'Rain', desc: 'Gentle pink/brown rain shower', icon: <CloudRain className="w-4 h-4 text-sky-400" /> },
  { id: 'brown', label: 'Brown Noise', desc: 'Deep warm low-frequency roar', icon: <Waves className="w-4 h-4 text-amber-400" /> },
  { id: 'white', label: 'White Noise', desc: 'Crisp static frequency masking', icon: <Wind className="w-4 h-4 opacity-70" /> },
  { id: 'alpha', label: 'Zen 432Hz', desc: 'Dual-oscillator Alpha binaural wave', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const handleToggleNotifications = async () => {
    if (!settings.desktopNotifications) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            onUpdateSettings((s) => ({ ...s, desktopNotifications: true }));
          } else {
            alert('Notification permission was denied. Please allow notifications in your browser settings.');
          }
        } catch (e) {
          // ignore
        }
      }
    } else {
      onUpdateSettings((s) => ({ ...s, desktopNotifications: false }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="border rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl p-6 sm:p-8 transition-colors"
        style={{
          backgroundColor: 'var(--card-color)',
          borderColor: 'var(--border-color)',
          color: 'var(--digit-color)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b pb-4 mb-6"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5" />
            <h2 className="text-xl font-bold tracking-tight">
              Settings & Preferences
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:opacity-100 transition-colors opacity-70"
            style={{ color: 'var(--digit-color)' }}
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-sm">
          {/* 1. Theme Palette Selector */}
          <div>
            <h3
              className="text-xs font-semibold tracking-wider uppercase mb-3 flex items-center gap-2"
              style={{ color: 'var(--muted-color)' }}
            >
              <Palette className="w-3.5 h-3.5" /> Color Theme
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {THEMES.map((theme) => {
                const isSelected = settings.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() =>
                      onUpdateSettings((s) => ({ ...s, theme: theme.id }))
                    }
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'font-bold shadow-md'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      borderColor: isSelected ? 'var(--digit-color)' : 'var(--border-color)',
                      backgroundColor: isSelected ? 'var(--card-top)' : 'transparent',
                      color: 'var(--digit-color)',
                    }}
                  >
                    <span
                      className="w-4 h-4 rounded-full shadow-inner flex-shrink-0"
                      style={{ backgroundColor: theme.colorSwatch }}
                    />
                    <span className="truncate">{theme.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Aesthetic Typography */}
          <div>
            <h3
              className="text-xs font-semibold tracking-wider uppercase mb-3 flex items-center gap-2"
              style={{ color: 'var(--muted-color)' }}
            >
              <Type className="w-3.5 h-3.5" /> Timer Typography
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FONTS.map((font) => {
                const isSelected = settings.fontFamily === font.id;
                return (
                  <button
                    key={font.id}
                    onClick={() =>
                      onUpdateSettings((s) => ({ ...s, fontFamily: font.id }))
                    }
                    className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                      isSelected ? 'font-bold shadow-sm' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      borderColor: isSelected ? 'var(--digit-color)' : 'var(--border-color)',
                      backgroundColor: isSelected ? 'var(--card-top)' : 'transparent',
                      color: 'var(--digit-color)',
                    }}
                  >
                    <div style={{ fontFamily: font.cssFamily }} className="text-base font-bold pb-0.5">
                      24:59
                    </div>
                    <div className="text-[11px] opacity-70 truncate">{font.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Display & Killer Features (Screen Wake Lock & Notifications) */}
          <div>
            <h3
              className="text-xs font-semibold tracking-wider uppercase mb-3 flex items-center gap-2"
              style={{ color: 'var(--muted-color)' }}
            >
              <Monitor className="w-3.5 h-3.5" /> Display & Focus
            </h3>
            <div
              className="space-y-3 p-4 rounded-2xl border transition-colors"
              style={{
                backgroundColor: 'var(--card-bottom)',
                borderColor: 'var(--border-color)',
              }}
            >
              {/* Keep Screen Awake */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Keep Screen Awake</div>
                  <div className="text-[11px] opacity-75" style={{ color: 'var(--muted-color)' }}>
                    Prevents screen from sleeping or dimming during sessions
                  </div>
                </div>
                <button
                  onClick={() =>
                    onUpdateSettings((s) => ({
                      ...s,
                      keepScreenAwake: !s.keepScreenAwake,
                    }))
                  }
                  className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0 border"
                  style={{
                    backgroundColor: settings.keepScreenAwake ? 'var(--digit-color)' : 'var(--card-top)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <span
                    className={`block w-4 h-4 rounded-full transition-transform absolute top-0.5 ${
                      settings.keepScreenAwake ? 'translate-x-5' : 'translate-x-1'
                    }`}
                    style={{
                      backgroundColor: settings.keepScreenAwake ? 'var(--bg-color)' : 'var(--muted-color)',
                    }}
                  />
                </button>
              </div>

              {/* Desktop Tab Notifications */}
              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <div className="font-medium">Desktop Notifications</div>
                  <div className="text-[11px] opacity-75" style={{ color: 'var(--muted-color)' }}>
                    Alert you when sessions finish even if you switch tabs
                  </div>
                </div>
                <button
                  onClick={handleToggleNotifications}
                  className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0 border"
                  style={{
                    backgroundColor: settings.desktopNotifications ? 'var(--digit-color)' : 'var(--card-top)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <span
                    className={`block w-4 h-4 rounded-full transition-transform absolute top-0.5 ${
                      settings.desktopNotifications ? 'translate-x-5' : 'translate-x-1'
                    }`}
                    style={{
                      backgroundColor: settings.desktopNotifications ? 'var(--bg-color)' : 'var(--muted-color)',
                    }}
                  />
                </button>
              </div>

              {/* Clock Format */}
              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <div className="font-medium">Flip Clock Mode Format</div>
                  <div className="text-[11px] opacity-75" style={{ color: 'var(--muted-color)' }}>
                    12-Hour (AM/PM) or 24-Hour International
                  </div>
                </div>
                <button
                  onClick={() =>
                    onUpdateSettings((s) => ({
                      ...s,
                      clockFormat: s.clockFormat === '12h' ? '24h' : '12h',
                    }))
                  }
                  className="text-xs px-3 py-1 rounded-lg font-mono font-bold border transition-colors"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--card-top)',
                    color: 'var(--digit-color)',
                  }}
                >
                  {(settings.clockFormat || '12h').toUpperCase()}
                </button>
              </div>
            </div>
          </div>

          {/* 4. Audio & Soundscapes */}
          <div>
            <h3
              className="text-xs font-semibold tracking-wider uppercase mb-3 flex items-center gap-2"
              style={{ color: 'var(--muted-color)' }}
            >
              <Volume2 className="w-3.5 h-3.5" /> Audio & Focus Soundscapes
            </h3>
            <div
              className="space-y-3.5 p-4 rounded-2xl border transition-colors"
              style={{
                backgroundColor: 'var(--card-bottom)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Master Sound</span>
                <button
                  onClick={() =>
                    onUpdateSettings((s) => {
                      const nextVal = !s.soundEnabled;
                      soundSynth.setMuted(!nextVal);
                      return { ...s, soundEnabled: nextVal };
                    })
                  }
                  className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0 border"
                  style={{
                    backgroundColor: settings.soundEnabled ? 'var(--digit-color)' : 'var(--card-top)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <span
                    className={`block w-4 h-4 rounded-full transition-transform absolute top-0.5 ${
                      settings.soundEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                    style={{
                      backgroundColor: settings.soundEnabled ? 'var(--bg-color)' : 'var(--muted-color)',
                    }}
                  />
                </button>
              </div>

              {settings.soundEnabled && (
                <>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs opacity-80" style={{ color: 'var(--muted-color)' }}>Volume</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.volume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onUpdateSettings((s) => ({ ...s, volume: val }));
                      }}
                      className="w-32 cursor-pointer"
                      style={{ accentColor: 'var(--digit-color)' }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-xs" style={{ color: 'var(--muted-color)' }}>Mechanical Flip Sound</span>
                    <button
                      onClick={() =>
                        onUpdateSettings((s) => ({
                          ...s,
                          flipSoundEnabled: !s.flipSoundEnabled,
                        }))
                      }
                      className="text-xs px-2.5 py-1 rounded-md font-medium border transition-colors"
                      style={{
                        borderColor: 'var(--border-color)',
                        backgroundColor: settings.flipSoundEnabled ? 'var(--card-top)' : 'transparent',
                        color: 'var(--digit-color)',
                      }}
                    >
                      {settings.flipSoundEnabled ? 'On' : 'Off'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--muted-color)' }}>Completion Chime</span>
                    <button
                      onClick={() =>
                        onUpdateSettings((s) => ({
                          ...s,
                          completionSoundEnabled: !s.completionSoundEnabled,
                        }))
                      }
                      className="text-xs px-2.5 py-1 rounded-md font-medium border transition-colors"
                      style={{
                        borderColor: 'var(--border-color)',
                        backgroundColor: settings.completionSoundEnabled ? 'var(--card-top)' : 'transparent',
                        color: 'var(--digit-color)',
                      }}
                    >
                      {settings.completionSoundEnabled ? 'On' : 'Off'}
                    </button>
                  </div>

                  {/* Ambient Focus Soundscapes Selection */}
                  <div className="pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-xs font-medium block mb-2" style={{ color: 'var(--muted-color)' }}>
                      Default Ambient Focus Soundscape
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {AMBIENT_PRESETS.map((amb) => {
                        const isSelected = settings.ambientType === amb.id;
                        return (
                          <button
                            key={amb.id}
                            onClick={() => {
                              onUpdateSettings((s) => ({ ...s, ambientType: amb.id }));
                              soundSynth.setAmbientType(amb.id, settings.volume);
                            }}
                            className={`p-2 rounded-xl border text-left flex items-start gap-2 transition-all ${
                              isSelected
                                ? 'font-semibold shadow-sm'
                                : 'opacity-75 hover:opacity-100'
                            }`}
                            style={{
                              borderColor: isSelected ? 'var(--digit-color)' : 'var(--border-color)',
                              backgroundColor: isSelected ? 'var(--card-top)' : 'transparent',
                              color: 'var(--digit-color)',
                            }}
                          >
                            <span className="mt-0.5">{amb.icon}</span>
                            <div className="overflow-hidden">
                              <div className="text-xs font-medium truncate">{amb.label}</div>
                              <div className="text-[10px] opacity-70 truncate" style={{ color: 'var(--muted-color)' }}>
                                {amb.desc}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 5. Pomodoro Custom Timers */}
          <div>
            <h3
              className="text-xs font-semibold tracking-wider uppercase mb-3 flex items-center gap-2"
              style={{ color: 'var(--muted-color)' }}
            >
              <Sliders className="w-3.5 h-3.5" /> Pomodoro Settings
            </h3>
            <div
              className="grid grid-cols-2 gap-3 p-4 rounded-2xl border text-xs transition-colors"
              style={{
                backgroundColor: 'var(--card-bottom)',
                borderColor: 'var(--border-color)',
              }}
            >
              <label className="flex flex-col gap-1">
                <span style={{ color: 'var(--muted-color)' }}>Focus (min)</span>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={settings.pomodoro.focusMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 25;
                    onUpdateSettings((s) => ({
                      ...s,
                      pomodoro: { ...s.pomodoro, focusMinutes: val },
                    }));
                  }}
                  className="p-2 rounded-lg font-medium border focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--card-top)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--digit-color)',
                  }}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span style={{ color: 'var(--muted-color)' }}>Short Break (min)</span>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.pomodoro.shortBreakMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 5;
                    onUpdateSettings((s) => ({
                      ...s,
                      pomodoro: { ...s.pomodoro, shortBreakMinutes: val },
                    }));
                  }}
                  className="p-2 rounded-lg font-medium border focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--card-top)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--digit-color)',
                  }}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span style={{ color: 'var(--muted-color)' }}>Long Break (min)</span>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.pomodoro.longBreakMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 15;
                    onUpdateSettings((s) => ({
                      ...s,
                      pomodoro: { ...s.pomodoro, longBreakMinutes: val },
                    }));
                  }}
                  className="p-2 rounded-lg font-medium border focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--card-top)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--digit-color)',
                  }}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span style={{ color: 'var(--muted-color)' }}>Intervals before Long Break</span>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={settings.pomodoro.sessionsBeforeLongBreak}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 4;
                    onUpdateSettings((s) => ({
                      ...s,
                      pomodoro: { ...s.pomodoro, sessionsBeforeLongBreak: val },
                    }));
                  }}
                  className="p-2 rounded-lg font-medium border focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--card-top)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--digit-color)',
                  }}
                />
              </label>
            </div>
          </div>

          {/* 6. Keyboard Shortcuts */}
          <div>
            <h3
              className="text-xs font-semibold tracking-wider uppercase mb-3 flex items-center gap-2"
              style={{ color: 'var(--muted-color)' }}
            >
              <Keyboard className="w-3.5 h-3.5" /> Shortcuts
            </h3>
            <div
              className="grid grid-cols-2 gap-2 p-3 rounded-2xl border text-xs transition-colors"
              style={{
                backgroundColor: 'var(--card-bottom)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-color)' }}>Start / Pause</span>
                <kbd className="px-1.5 py-0.5 rounded font-mono border" style={{ backgroundColor: 'var(--card-top)', borderColor: 'var(--border-color)', color: 'var(--digit-color)' }}>Space</kbd>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-color)' }}>Reset</span>
                <kbd className="px-1.5 py-0.5 rounded font-mono border" style={{ backgroundColor: 'var(--card-top)', borderColor: 'var(--border-color)', color: 'var(--digit-color)' }}>R</kbd>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-color)' }}>Fullscreen</span>
                <kbd className="px-1.5 py-0.5 rounded font-mono border" style={{ backgroundColor: 'var(--card-top)', borderColor: 'var(--border-color)', color: 'var(--digit-color)' }}>F</kbd>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-color)' }}>Mute</span>
                <kbd className="px-1.5 py-0.5 rounded font-mono border" style={{ backgroundColor: 'var(--card-top)', borderColor: 'var(--border-color)', color: 'var(--digit-color)' }}>M</kbd>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-color)' }}>+1 Minute</span>
                <kbd className="px-1.5 py-0.5 rounded font-mono border" style={{ backgroundColor: 'var(--card-top)', borderColor: 'var(--border-color)', color: 'var(--digit-color)' }}>↑</kbd>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-color)' }}>-1 Minute</span>
                <kbd className="px-1.5 py-0.5 rounded font-mono border" style={{ backgroundColor: 'var(--card-top)', borderColor: 'var(--border-color)', color: 'var(--digit-color)' }}>↓</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-6 pt-4 border-t flex justify-end"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full font-semibold text-sm shadow-md transition-all active:scale-95"
            style={{
              backgroundColor: 'var(--digit-color)',
              color: 'var(--bg-color)',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
