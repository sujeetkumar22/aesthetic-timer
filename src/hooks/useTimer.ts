import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerStatus } from '../types/timer';

interface UseTimerOptions {
  initialDurationSeconds?: number;
  onComplete?: () => void;
  onWarningTick?: (secondsLeft: number) => void;
  onSecondTick?: (secondsLeft: number) => void;
}

export function useTimer({
  initialDurationSeconds = 1500, // 25 minutes default
  onComplete,
  onWarningTick,
  onSecondTick,
}: UseTimerOptions = {}) {
  const [totalDuration, setTotalDuration] = useState<number>(initialDurationSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialDurationSeconds);
  const [status, setStatus] = useState<TimerStatus>('idle');

  // References to preserve precise timing without interval drift
  const targetTimestampRef = useRef<number | null>(null);
  const remainingMsRef = useRef<number>(initialDurationSeconds * 1000);
  const lastWarningSecondRef = useRef<number | null>(null);
  const lastDispatchedSecondRef = useRef<number>(initialDurationSeconds);
  const animationFrameIdRef = useRef<number | null>(null);

  // Sync state if initial duration changes while idle
  useEffect(() => {
    if (status === 'idle') {
      setTotalDuration(initialDurationSeconds);
      setRemainingSeconds(initialDurationSeconds);
      remainingMsRef.current = initialDurationSeconds * 1000;
      lastDispatchedSecondRef.current = initialDurationSeconds;
    }
  }, [initialDurationSeconds, status]);

  // References for latest callbacks to prevent closure staleness
  const onCompleteRef = useRef(onComplete);
  const onWarningTickRef = useRef(onWarningTick);
  const onSecondTickRef = useRef(onSecondTick);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onWarningTickRef.current = onWarningTick;
    onSecondTickRef.current = onSecondTick;
  });

  // Handle countdown calculation using Date.now()
  const tick = useCallback(() => {
    if (!targetTimestampRef.current) return;

    const now = Date.now();
    const remainingMs = Math.max(0, targetTimestampRef.current - now);
    remainingMsRef.current = remainingMs;

    const currentSec = Math.ceil(remainingMs / 1000);
    setRemainingSeconds(currentSec);

    // Call onSecondTick when second boundary changes
    if (currentSec !== lastDispatchedSecondRef.current) {
      lastDispatchedSecondRef.current = currentSec;
      onSecondTickRef.current?.(currentSec);

      // Warning ticks for 3, 2, 1
      if (currentSec <= 3 && currentSec > 0 && lastWarningSecondRef.current !== currentSec) {
        lastWarningSecondRef.current = currentSec;
        onWarningTickRef.current?.(currentSec);
      }
    }

    if (remainingMs <= 0) {
      targetTimestampRef.current = null;
      setStatus('completed');
      setRemainingSeconds(0);
      onCompleteRef.current?.();
      return;
    }

    animationFrameIdRef.current = requestAnimationFrame(tick);
  }, []);

  // Start the countdown
  const start = useCallback((durationInSeconds?: number) => {
    const duration = durationInSeconds !== undefined ? durationInSeconds : remainingSeconds;
    if (duration <= 0) return;

    const durationMs = duration * 1000;
    targetTimestampRef.current = Date.now() + durationMs;
    remainingMsRef.current = durationMs;
    setTotalDuration(duration);
    setRemainingSeconds(duration);
    lastDispatchedSecondRef.current = duration;
    lastWarningSecondRef.current = null;
    setStatus('running');

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    animationFrameIdRef.current = requestAnimationFrame(tick);
  }, [remainingSeconds, tick]);

  // Pause the countdown
  const pause = useCallback(() => {
    if (status !== 'running') return;

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    if (targetTimestampRef.current) {
      remainingMsRef.current = Math.max(0, targetTimestampRef.current - Date.now());
      targetTimestampRef.current = null;
    }

    const currentSec = Math.ceil(remainingMsRef.current / 1000);
    setRemainingSeconds(currentSec);
    setStatus('paused');
  }, [status]);

  // Resume the countdown
  const resume = useCallback(() => {
    if (status !== 'paused') return;

    targetTimestampRef.current = Date.now() + remainingMsRef.current;
    setStatus('running');

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    animationFrameIdRef.current = requestAnimationFrame(tick);
  }, [status, tick]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (status === 'running') {
      pause();
    } else if (status === 'paused') {
      resume();
    } else if (status === 'idle' || status === 'completed') {
      start(totalDuration);
    }
  }, [status, pause, resume, start, totalDuration]);

  // Reset to initial or specified duration
  const reset = useCallback((newDurationSeconds?: number) => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    targetTimestampRef.current = null;
    const dur = newDurationSeconds !== undefined ? newDurationSeconds : totalDuration;
    const safeDur = Math.max(1, dur);

    setTotalDuration(safeDur);
    setRemainingSeconds(safeDur);
    remainingMsRef.current = safeDur * 1000;
    lastDispatchedSecondRef.current = safeDur;
    lastWarningSecondRef.current = null;
    setStatus('idle');
  }, [totalDuration]);

  // Add or subtract seconds
  const adjustTime = useCallback((deltaSeconds: number) => {
    const deltaMs = deltaSeconds * 1000;

    if (status === 'running' && targetTimestampRef.current) {
      const newTarget = Math.max(Date.now() + 1000, targetTimestampRef.current + deltaMs);
      targetTimestampRef.current = newTarget;
      remainingMsRef.current = newTarget - Date.now();
      const newSec = Math.ceil(remainingMsRef.current / 1000);
      setRemainingSeconds(newSec);
      setTotalDuration((prev) => Math.max(newSec, prev + deltaSeconds));
    } else {
      const newDuration = Math.max(1, remainingSeconds + deltaSeconds);
      remainingMsRef.current = newDuration * 1000;
      setRemainingSeconds(newDuration);
      setTotalDuration((prev) => Math.max(newDuration, prev));
    }
  }, [status, remainingSeconds]);

  // Handle visibility change to guarantee zero drift even on suspended tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === 'running' && targetTimestampRef.current) {
        // Immediate sync
        const remainingMs = Math.max(0, targetTimestampRef.current - Date.now());
        remainingMsRef.current = remainingMs;
        const currentSec = Math.ceil(remainingMs / 1000);
        setRemainingSeconds(currentSec);

        if (remainingMs <= 0) {
          targetTimestampRef.current = null;
          setStatus('completed');
          onComplete?.();
        } else {
          if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = requestAnimationFrame(tick);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [status, tick, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  return {
    totalDuration,
    remainingSeconds,
    status,
    start,
    pause,
    resume,
    togglePlayPause,
    reset,
    adjustTime,
    setRemainingSeconds,
    setTotalDuration,
  };
}
