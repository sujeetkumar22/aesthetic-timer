import { describe, it, expect } from 'vitest';
import {
  pad,
  formatSecondsToTime,
  formatTimeDisplay,
  formatMsToStopwatch,
  durationToLabel,
} from '../utils/formatters';

describe('formatters utility', () => {
  it('pads single digit numbers correctly', () => {
    expect(pad(0)).toBe('00');
    expect(pad(5)).toBe('05');
    expect(pad(9)).toBe('09');
    expect(pad(10)).toBe('10');
    expect(pad(59)).toBe('59');
    expect(pad(-1)).toBe('00');
  });

  it('converts seconds to parsed time correctly', () => {
    expect(formatSecondsToTime(0)).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    expect(formatSecondsToTime(59)).toEqual({ hours: 0, minutes: 0, seconds: 59 });
    expect(formatSecondsToTime(60)).toEqual({ hours: 0, minutes: 1, seconds: 0 });
    expect(formatSecondsToTime(1500)).toEqual({ hours: 0, minutes: 25, seconds: 0 });
    expect(formatSecondsToTime(3600)).toEqual({ hours: 1, minutes: 0, seconds: 0 });
    expect(formatSecondsToTime(5400)).toEqual({ hours: 1, minutes: 30, seconds: 0 });
    expect(formatSecondsToTime(5437)).toEqual({ hours: 1, minutes: 30, seconds: 37 });
  });

  it('formats time display for 2-unit and 3-unit views', () => {
    const twentyFiveMin = formatTimeDisplay(1500);
    expect(twentyFiveMin.hoursStr).toBe('00');
    expect(twentyFiveMin.minutesStr).toBe('25');
    expect(twentyFiveMin.secondsStr).toBe('00');
    expect(twentyFiveMin.hasHours).toBe(false);
    expect(twentyFiveMin.compactString).toBe('25:00');

    const oneHourThirty = formatTimeDisplay(5400);
    expect(oneHourThirty.hoursStr).toBe('01');
    expect(oneHourThirty.minutesStr).toBe('30');
    expect(oneHourThirty.secondsStr).toBe('00');
    expect(oneHourThirty.hasHours).toBe(true);
    expect(oneHourThirty.compactString).toBe('01:30:00');
  });

  it('formats milliseconds to stopwatch format', () => {
    const sw = formatMsToStopwatch(65432); // 65.432s = 1m 5s 43cs
    expect(sw.minutesStr).toBe('01');
    expect(sw.secondsStr).toBe('05');
    expect(sw.hundredthsStr).toBe('43');
    expect(sw.formatted).toBe('01:05.43');
  });

  it('generates readable duration labels', () => {
    expect(durationToLabel(1500)).toBe('25m');
    expect(durationToLabel(3600)).toBe('1h');
    expect(durationToLabel(5400)).toBe('1h 30m');
    expect(durationToLabel(45)).toBe('45s');
  });
});
