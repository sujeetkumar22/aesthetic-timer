import { useState, useRef, useCallback, useEffect } from 'react';
import { StopwatchLap, TimerStatus } from '../types/timer';

export function useStopwatch() {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [laps, setLaps] = useState<StopwatchLap[]>([]);

  const startTimestampRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    if (!startTimestampRef.current) return;

    const now = Date.now();
    const currentElapsed = accumulatedMsRef.current + (now - startTimestampRef.current);
    setElapsedMs(currentElapsed);

    animationFrameIdRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (status === 'running') return;

    startTimestampRef.current = Date.now();
    setStatus('running');

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    animationFrameIdRef.current = requestAnimationFrame(tick);
  }, [status, tick]);

  const pause = useCallback(() => {
    if (status !== 'running') return;

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    if (startTimestampRef.current) {
      accumulatedMsRef.current += Date.now() - startTimestampRef.current;
      startTimestampRef.current = null;
    }

    setElapsedMs(accumulatedMsRef.current);
    setStatus('paused');
  }, [status]);

  const reset = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    startTimestampRef.current = null;
    accumulatedMsRef.current = 0;
    setElapsedMs(0);
    setLaps([]);
    setStatus('idle');
  }, []);

  const togglePlayPause = useCallback(() => {
    if (status === 'running') {
      pause();
    } else {
      start();
    }
  }, [status, pause, start]);

  const addLap = useCallback(() => {
    if (status === 'idle') return;

    const currentTotal = accumulatedMsRef.current + (startTimestampRef.current ? Date.now() - startTimestampRef.current : 0);
    const previousTotal = laps.length > 0 ? laps[0].totalTime : 0;
    const lapTime = currentTotal - previousTotal;

    const newLap: StopwatchLap = {
      id: `${Date.now()}-${laps.length + 1}`,
      lapNumber: laps.length + 1,
      lapTime,
      totalTime: currentTotal,
    };

    setLaps((prev) => [newLap, ...prev]);
  }, [status, laps]);

  // Sync on tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === 'running' && startTimestampRef.current) {
        const currentElapsed = accumulatedMsRef.current + (Date.now() - startTimestampRef.current);
        setElapsedMs(currentElapsed);
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = requestAnimationFrame(tick);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [status, tick]);

  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  return {
    elapsedMs,
    status,
    laps,
    start,
    pause,
    reset,
    togglePlayPause,
    addLap,
  };
}
