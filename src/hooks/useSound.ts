import { useCallback, useEffect, useRef } from 'react';
import { soundSynth } from '../utils/soundSynth';
import { AppSettings } from '../types/timer';

export function useSound(settings: AppSettings) {
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
    // Keep hardware mute strictly in sync with settings
    soundSynth.setMuted(!settings.soundEnabled);
  }, [settings]);

  const unlock = useCallback(() => {
    soundSynth.unlockAudio();
  }, []);

  const playFlip = useCallback(() => {
    const s = settingsRef.current;
    if (s.soundEnabled && s.flipSoundEnabled && !soundSynth.getIsMuted()) {
      soundSynth.playFlipTick(s.volume);
    }
  }, []);

  const playWarning = useCallback(() => {
    const s = settingsRef.current;
    if (s.soundEnabled && s.warningSoundEnabled && !soundSynth.getIsMuted()) {
      soundSynth.playWarningTick(s.volume);
    }
  }, []);

  const playCompletion = useCallback(() => {
    const s = settingsRef.current;
    if (s.soundEnabled && s.completionSoundEnabled && !soundSynth.getIsMuted()) {
      soundSynth.playCompletionChime(s.volume);
    }
  }, []);

  return {
    unlock,
    playFlip,
    playWarning,
    playCompletion,
  };
}
