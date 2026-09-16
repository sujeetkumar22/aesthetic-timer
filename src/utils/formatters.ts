import { ParsedTime } from '../types/timer';

export const pad = (num: number): string => {
  const clamped = Math.max(0, Math.floor(num));
  return clamped < 10 ? `0${clamped}` : `${clamped}`;
};

export const formatSecondsToTime = (totalSeconds: number): ParsedTime => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return { hours, minutes, seconds };
};

export const formatTimeDisplay = (totalSeconds: number): {
  hoursStr: string;
  minutesStr: string;
  secondsStr: string;
  hasHours: boolean;
  compactString: string;
} => {
  const { hours, minutes, seconds } = formatSecondsToTime(totalSeconds);
  const hoursStr = pad(hours);
  const minutesStr = pad(minutes);
  const secondsStr = pad(seconds);
  const hasHours = hours > 0;

  const compactString = hasHours
    ? `${hoursStr}:${minutesStr}:${secondsStr}`
    : `${minutesStr}:${secondsStr}`;

  return { hoursStr, minutesStr, secondsStr, hasHours, compactString };
};

export const formatMsToStopwatch = (totalMs: number): {
  minutesStr: string;
  secondsStr: string;
  hundredthsStr: string;
  formatted: string;
} => {
  const safeMs = Math.max(0, Math.floor(totalMs));
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((safeMs % 1000) / 10);

  const minutesStr = pad(minutes);
  const secondsStr = pad(seconds);
  const hundredthsStr = pad(hundredths);

  return {
    minutesStr,
    secondsStr,
    hundredthsStr,
    formatted: `${minutesStr}:${secondsStr}.${hundredthsStr}`
  };
};

export const durationToLabel = (totalSeconds: number): string => {
  const { hours, minutes, seconds } = formatSecondsToTime(totalSeconds);
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 && hours === 0) parts.push(`${seconds}s`);
  return parts.length > 0 ? parts.join(' ') : '0s';
};
