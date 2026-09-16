import { useState, useEffect } from 'react';
import { pad } from '../utils/formatters';

interface ClockState {
  hoursStr: string;
  minutesStr: string;
  secondsStr: string;
  ampm: string;
  dayOfWeekStr: string;
  dateStr: string;
}

export function useClock(format: '12h' | '24h' = '24h'): ClockState {
  const getClockValues = (): ClockState => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    let ampm = '';
    if (format === '12h') {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      if (hours === 0) hours = 12;
    }

    const dayOfWeekStr = now.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    return {
      hoursStr: pad(hours),
      minutesStr: pad(minutes),
      secondsStr: pad(seconds),
      ampm,
      dayOfWeekStr,
      dateStr,
    };
  };

  const [clock, setClock] = useState<ClockState>(getClockValues);

  useEffect(() => {
    // Initial sync
    setClock(getClockValues());

    // Sync to exact next second boundary
    const now = new Date();
    const msToNextSecond = 1000 - now.getMilliseconds();

    let intervalId: number | null = null;
    const timeoutId = window.setTimeout(() => {
      setClock(getClockValues());
      intervalId = window.setInterval(() => {
        setClock(getClockValues());
      }, 1000);
    }, msToNextSecond);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [format]);

  return clock;
}
