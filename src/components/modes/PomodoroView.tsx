import React from 'react';
import { FlipDisplay } from '../timer/FlipDisplay';
import { PomodoroPhase, TimerStatus } from '../../types/timer';
import { Play, Pause, RotateCcw, SkipForward, Coffee, Flame, Moon } from 'lucide-react';

interface PomodoroViewProps {
  phase: PomodoroPhase;
  remainingSeconds: number;
  status: TimerStatus;
  completedSessions: number;
  sessionsBeforeLongBreak: number;
  onTogglePlay: () => void;
  onReset: () => void;
  onSkipPhase: () => void;
  onSetPhase: (phase: PomodoroPhase) => void;
  onFlip?: () => void;
  isFullscreen?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const PomodoroView: React.FC<PomodoroViewProps> = ({
  phase,
  remainingSeconds,
  status,
  completedSessions,
  sessionsBeforeLongBreak,
  onTogglePlay,
  onReset,
  onSkipPhase,
  onSetPhase,
  onFlip,
  isFullscreen = false,
  orientation = 'horizontal',
}) => {
  const isRunning = status === 'running';

  const phaseConfig = {
    focus: {
      label: 'Focus Session',
      icon: <Flame className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-500 dark:text-amber-300',
    },
    shortBreak: {
      label: 'Short Break',
      icon: <Coffee className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    },
    longBreak: {
      label: 'Long Break',
      icon: <Moon className="w-4 h-4 text-blue-400" />,
      color: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300',
    },
  };

  const currentConfig = phaseConfig[phase];
  const currentSessionIndex = (completedSessions % sessionsBeforeLongBreak) + 1;

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full gap-4 sm:gap-6 animate-fade-in">
      {/* Subtle Phase Indicator & Round Counter */}
      <div className="flex flex-col items-center gap-2">
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-semibold tracking-wider uppercase backdrop-blur-md ${currentConfig.color}`}
        >
          {currentConfig.icon}
          {currentConfig.label}
        </div>

        <div
          className="flex items-center gap-2 text-xs font-medium transition-colors"
          style={{ color: 'var(--muted-color)' }}
        >
          <span>Round {currentSessionIndex} of {sessionsBeforeLongBreak}</span>
          <div className="flex gap-1.5">
            {Array.from({ length: sessionsBeforeLongBreak }).map((_, i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor:
                    i < (completedSessions % sessionsBeforeLongBreak)
                      ? 'var(--digit-color)'
                      : i === (completedSessions % sessionsBeforeLongBreak)
                      ? '#f59e0b'
                      : 'var(--border-color)',
                  opacity: i < (completedSessions % sessionsBeforeLongBreak) ? 1 : 0.4,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* The Big Flip Clock */}
      <FlipDisplay
        totalSeconds={remainingSeconds}
        onFlip={onFlip}
        isFullscreen={isFullscreen}
        orientation={orientation}
      />

      {/* Mode Sub-Controls (in non-fullscreen or when controls visible) */}
      {!isFullscreen && (
        <>
          <div
            className="flex items-center gap-4 backdrop-blur-md px-5 py-2 rounded-full border shadow-xl transition-colors"
            style={{
              backgroundColor: 'var(--card-top)',
              borderColor: 'var(--border-color)',
            }}
          >
            <button
              onClick={onReset}
              className="p-2.5 rounded-full transition-all active:scale-95 opacity-75 hover:opacity-100"
              style={{ color: 'var(--digit-color)' }}
              title="Reset Phase"
              aria-label="Reset Phase"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={onTogglePlay}
              className="p-3.5 sm:p-4 rounded-full transition-all active:scale-95 shadow-lg flex items-center justify-center"
              style={{
                backgroundColor: 'var(--digit-color)',
                color: 'var(--bg-color)',
              }}
              title={isRunning ? 'Pause' : 'Start'}
              aria-label={isRunning ? 'Pause timer' : 'Start timer'}
            >
              {isRunning ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={onSkipPhase}
              className="p-2.5 rounded-full transition-all active:scale-95 opacity-75 hover:opacity-100"
              style={{ color: 'var(--digit-color)' }}
              title="Skip to next phase"
              aria-label="Skip phase"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Phase Selectors */}
          <div className="flex items-center gap-2">
            {(['focus', 'shortBreak', 'longBreak'] as PomodoroPhase[]).map((p) => {
              const isActive = phase === p;
              const label = p === 'focus' ? 'Focus' : p === 'shortBreak' ? 'Short Break' : 'Long Break';
              return (
                <button
                  key={p}
                  onClick={() => onSetPhase(p)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                    isActive ? 'font-bold shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--digit-color)' : 'var(--card-top)',
                    color: isActive ? 'var(--bg-color)' : 'var(--digit-color)',
                    borderColor: isActive ? 'var(--digit-color)' : 'var(--border-color)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
