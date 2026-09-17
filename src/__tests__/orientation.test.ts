import { describe, it, expect } from 'vitest';
import {
  resolveEffectiveOrientation,
  detectTiltFromMotion,
} from '../hooks/useOrientation';

describe('Orientation Resolution Logic', () => {
  it('respects manual horizontal setting regardless of screen state', () => {
    expect(resolveEffectiveOrientation('horizontal', true)).toBe('horizontal');
    expect(resolveEffectiveOrientation('horizontal', false)).toBe('horizontal');
  });

  it('respects manual vertical setting regardless of screen state', () => {
    expect(resolveEffectiveOrientation('vertical', true)).toBe('vertical');
    expect(resolveEffectiveOrientation('vertical', false)).toBe('vertical');
  });

  it('dynamically adapts in auto mode based on landscape state', () => {
    // Landscape screen / phone rotated horizontally -> horizontal side-by-side
    expect(resolveEffectiveOrientation('auto', true)).toBe('horizontal');

    // Portrait screen / phone vertical -> vertical stacked
    expect(resolveEffectiveOrientation('auto', false)).toBe('vertical');
  });

  it('detects landscape-left tilt when phone is rotated counter-clockwise', () => {
    // Phone held horizontally to left: beta near 0, gamma negative (-60)
    const tilt = detectTiltFromMotion(10, -60, 'portrait');
    expect(tilt).toBe('landscape-left');
  });

  it('detects landscape-right tilt when phone is rotated clockwise', () => {
    // Phone held horizontally to right: beta near 0, gamma positive (+60)
    const tilt = detectTiltFromMotion(10, 60, 'portrait');
    expect(tilt).toBe('landscape-right');
  });

  it('detects portrait orientation when phone is upright', () => {
    // Phone held upright: beta 75, gamma near 0
    const tilt = detectTiltFromMotion(75, 5, 'landscape-left');
    expect(tilt).toBe('portrait');
  });

  it('preserves current state when phone is nearly flat', () => {
    // Flat on table
    expect(detectTiltFromMotion(5, 5, 'landscape-left')).toBe('landscape-left');
    expect(detectTiltFromMotion(5, 5, 'portrait')).toBe('portrait');
  });
});
