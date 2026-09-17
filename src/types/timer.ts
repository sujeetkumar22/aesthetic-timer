export type TimerMode = 'countdown' | 'pomodoro' | 'stopwatch' | 'clock';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export type PomodoroPhase = 'focus' | 'shortBreak' | 'longBreak';

export type ThemeId = 'classic' | 'babyPink' | 'lavender' | 'cream' | 'cyan' | 'matcha' | 'sunset';

export type FontId = 'outfit' | 'jakarta' | 'dmsans' | 'bebas' | 'oswald';

export type AmbientSoundType = 'rain' | 'brown' | 'white' | 'alpha';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  colorSwatch: string;
  isDark: boolean;
}

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

export interface StopwatchLap {
  id: string;
  lapNumber: number;
  lapTime: number; // in milliseconds
  totalTime: number; // in milliseconds
}

export type ViewOrientation = 'auto' | 'horizontal' | 'vertical';

export interface AppSettings {
  soundEnabled: boolean;
  flipSoundEnabled: boolean;
  warningSoundEnabled: boolean;
  completionSoundEnabled: boolean;
  volume: number;
  theme: ThemeId;
  fontFamily: FontId;
  ambientType: AmbientSoundType;
  autoHideControls: boolean;
  clockFormat: '12h' | '24h';
  viewOrientation: ViewOrientation;
  keepScreenAwake: boolean;
  desktopNotifications: boolean;
  focusIntention: string;
  lastDurationSeconds: number;
  lastMode: TimerMode;
  pomodoro: PomodoroSettings;
}

export interface ParsedTime {
  hours: number;
  minutes: number;
  seconds: number;
}
