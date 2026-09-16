import { useState, useCallback } from 'react';
import { PomodoroPhase, PomodoroSettings } from '../types/timer';

interface UsePomodoroOptions {
  settings: PomodoroSettings;
  onPhaseChange?: (newPhase: PomodoroPhase) => void;
}

export function usePomodoro({ settings, onPhaseChange }: UsePomodoroOptions) {
  const [phase, setPhase] = useState<PomodoroPhase>('focus');
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  const getDurationForPhase = useCallback((currentPhase: PomodoroPhase): number => {
    switch (currentPhase) {
      case 'focus':
        return settings.focusMinutes * 60;
      case 'shortBreak':
        return settings.shortBreakMinutes * 60;
      case 'longBreak':
        return settings.longBreakMinutes * 60;
    }
  }, [settings]);

  const advancePhase = useCallback((): { nextPhase: PomodoroPhase; duration: number } => {
    let nextPhase: PomodoroPhase;

    if (phase === 'focus') {
      const newSessionCount = completedSessions + 1;
      setCompletedSessions(newSessionCount);

      if (newSessionCount % settings.sessionsBeforeLongBreak === 0) {
        nextPhase = 'longBreak';
      } else {
        nextPhase = 'shortBreak';
      }
    } else {
      nextPhase = 'focus';
    }

    setPhase(nextPhase);
    onPhaseChange?.(nextPhase);
    return {
      nextPhase,
      duration: getDurationForPhase(nextPhase),
    };
  }, [phase, completedSessions, settings, getDurationForPhase, onPhaseChange]);

  const setManualPhase = useCallback((newPhase: PomodoroPhase) => {
    setPhase(newPhase);
    onPhaseChange?.(newPhase);
    return getDurationForPhase(newPhase);
  }, [getDurationForPhase, onPhaseChange]);

  const resetPomodoro = useCallback(() => {
    setPhase('focus');
    setCompletedSessions(0);
  }, []);

  return {
    phase,
    completedSessions,
    currentDurationSeconds: getDurationForPhase(phase),
    advancePhase,
    setManualPhase,
    resetPomodoro,
  };
}
