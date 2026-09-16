import { describe, it, expect } from 'vitest';
import { formatTimeDisplay, formatSecondsToTime } from '../utils/formatters';

describe('Timer engine calculation and edge cases', () => {
  it('correctly calculates remaining time across arbitrary timestamp deltas', () => {
    const durationSec = 1500; // 25 minutes
    const startTimestamp = 1700000000000;
    const targetTimestamp = startTimestamp + durationSec * 1000;

    // Simulate 12.3 seconds elapsed
    const now1 = startTimestamp + 12300;
    const remainingMs1 = Math.max(0, targetTimestamp - now1);
    const remainingSec1 = Math.ceil(remainingMs1 / 1000);
    expect(remainingSec1).toBe(1488); // 1500 - 12 = 1488
    expect(formatTimeDisplay(remainingSec1).compactString).toBe('24:48');

    // Simulate switching tabs for 5 minutes (300 seconds)
    const now2 = startTimestamp + 312300;
    const remainingMs2 = Math.max(0, targetTimestamp - now2);
    const remainingSec2 = Math.ceil(remainingMs2 / 1000);
    expect(remainingSec2).toBe(1188); // 1500 - 312 = 1188
    expect(formatTimeDisplay(remainingSec2).compactString).toBe('19:48');

    // Simulate reaching zero
    const nowDone = targetTimestamp + 1000;
    const remainingDone = Math.max(0, targetTimestamp - nowDone);
    expect(remainingDone).toBe(0);
    expect(formatTimeDisplay(0).compactString).toBe('00:00');
  });

  it('prevents negative time and handles edge conditions', () => {
    expect(formatSecondsToTime(-50)).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    expect(formatTimeDisplay(-999).compactString).toBe('00:00');
    expect(formatTimeDisplay(0).compactString).toBe('00:00');
  });

  it('handles large durations safely without overflow', () => {
    const large = 86400 * 2; // 2 days (48 hours)
    const { hours, minutes, seconds } = formatSecondsToTime(large);
    expect(hours).toBe(48);
    expect(minutes).toBe(0);
    expect(seconds).toBe(0);
  });
});
