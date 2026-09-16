import { describe, it, expect } from 'vitest';
import { parseTimeString, formatDurationToSlug } from '../utils/urlParser';

describe('urlParser utility', () => {
  it('parses colon-separated durations', () => {
    expect(parseTimeString('25:00')).toBe(1500);
    expect(parseTimeString('01:30:00')).toBe(5400);
    expect(parseTimeString('00:05:30')).toBe(330);
    expect(parseTimeString('10:15')).toBe(615);
  });

  it('parses natural language and exact duration strings', () => {
    expect(parseTimeString('2 hours 45 minutes')).toBe(9900);
    expect(parseTimeString('two hours 45 minutes')).toBe(9900);
    expect(parseTimeString('2 hrs 45 mins')).toBe(9900);
    expect(parseTimeString('2h 45m')).toBe(9900);
    expect(parseTimeString('2h45m')).toBe(9900);
    expect(parseTimeString('02:45:00')).toBe(9900);
    expect(parseTimeString('165m')).toBe(9900);
    expect(parseTimeString('2.5h')).toBe(9000);
    expect(parseTimeString('2 hours')).toBe(7200);
    expect(parseTimeString('45 minutes')).toBe(2700);
    expect(parseTimeString('2%20hours%2045%20minutes')).toBe(9900);
  });

  it('parses shorthand duration strings (e.g. 25m, 1h, 1h30m, 45s)', () => {
    expect(parseTimeString('25m')).toBe(1500);
    expect(parseTimeString('45m')).toBe(2700);
    expect(parseTimeString('1h')).toBe(3600);
    expect(parseTimeString('1h30m')).toBe(5400);
    expect(parseTimeString('2h15m30s')).toBe(8130);
    expect(parseTimeString('90s')).toBe(90);
  });

  it('handles single numbers gracefully', () => {
    expect(parseTimeString('25')).toBe(1500); // 25 minutes
    expect(parseTimeString('5')).toBe(300);
  });

  it('returns null for invalid inputs without crashing', () => {
    expect(parseTimeString('')).toBeNull();
    expect(parseTimeString('invalid')).toBeNull();
    expect(parseTimeString('-10m')).toBeNull();
    expect(parseTimeString('abc:def')).toBeNull();
  });

  it('formats durations to clean URL slugs', () => {
    expect(formatDurationToSlug(1500)).toBe('25m');
    expect(formatDurationToSlug(3600)).toBe('1h');
    expect(formatDurationToSlug(5400)).toBe('1h30m');
    expect(formatDurationToSlug(45)).toBe('45s');
  });
});
