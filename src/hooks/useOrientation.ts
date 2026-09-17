import { useState, useEffect, useCallback } from 'react';
import { ViewOrientation } from '../types/timer';

export type DeviceTilt = 'portrait' | 'landscape-left' | 'landscape-right' | 'flat' | 'unknown';

export interface OrientationState {
  setting: ViewOrientation;
  effectiveOrientation: 'horizontal' | 'vertical';
  isLandscape: boolean;
  isVirtualLandscape: boolean;
  virtualRotationAngle: number;
  screenOrientation: 'landscape' | 'portrait';
  deviceTilt: DeviceTilt;
}

/**
 * Resolves effective display orientation ('horizontal' | 'vertical') based on
 * user setting ('auto' | 'horizontal' | 'vertical') and whether device/viewport is landscape.
 */
export function resolveEffectiveOrientation(
  setting: ViewOrientation = 'auto',
  isLandscape: boolean
): 'horizontal' | 'vertical' {
  if (setting === 'horizontal') return 'horizontal';
  if (setting === 'vertical') return 'vertical';
  return isLandscape ? 'horizontal' : 'vertical';
}

/**
 * Detects physical device tilt with hysteresis based on accelerometer/gyroscope angles (beta/gamma).
 */
export function detectTiltFromMotion(
  beta: number | null,
  gamma: number | null,
  currentTilt: DeviceTilt = 'portrait'
): DeviceTilt {
  if (beta === null || gamma === null) {
    return currentTilt;
  }

  const absBeta = Math.abs(beta);
  const absGamma = Math.abs(gamma);

  // Phone is lying almost flat on a table (screen facing up or down)
  if (absBeta < 22 && absGamma < 22) {
    return currentTilt === 'unknown' ? 'portrait' : currentTilt;
  }

  // Hysteresis thresholds to prevent jitter when user holds phone at diagonal angles
  const isCurrentlyLandscape = currentTilt === 'landscape-left' || currentTilt === 'landscape-right';
  const delta = isCurrentlyLandscape ? 5 : 12;

  // Landscape tilt check (phone rotated 90 degrees)
  if (absGamma > absBeta + delta && absGamma > 32) {
    return gamma < 0 ? 'landscape-left' : 'landscape-right';
  }

  // Portrait tilt check (phone upright or slightly tilted towards face)
  if (absBeta > absGamma + delta && absBeta > 30) {
    return 'portrait';
  }

  return currentTilt;
}

/**
 * Checks if the browser viewport is currently in landscape mode.
 */
export function checkIsViewportLandscape(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Screen Orientation API
  const screenType = window.screen?.orientation?.type;
  if (screenType && screenType.startsWith('landscape')) {
    return true;
  }

  // 2. CSS Media Query
  if (window.matchMedia && window.matchMedia('(orientation: landscape)').matches) {
    return true;
  }

  // 3. Viewport Dimensions fallback
  return window.innerWidth > window.innerHeight;
}

export function useOrientation(setting: ViewOrientation = 'auto'): OrientationState {
  const [viewportLandscape, setViewportLandscape] = useState<boolean>(() => checkIsViewportLandscape());
  const [deviceTilt, setDeviceTilt] = useState<DeviceTilt>('portrait');

  // Handle viewport changes (OS-level screen rotation, window resize, media query)
  const updateViewportOrientation = useCallback(() => {
    setViewportLandscape(checkIsViewportLandscape());
  }, []);

  useEffect(() => {
    updateViewportOrientation();

    // 1. Screen orientation change listener
    const screenOrientation = window.screen?.orientation;
    if (screenOrientation && 'addEventListener' in screenOrientation) {
      screenOrientation.addEventListener('change', updateViewportOrientation);
    }

    // 2. CSS media query listener
    let mediaQuery: MediaQueryList | null = null;
    let mqHandler: ((e: MediaQueryListEvent) => void) | null = null;
    if (window.matchMedia) {
      mediaQuery = window.matchMedia('(orientation: landscape)');
      mqHandler = (e: MediaQueryListEvent) => {
        setViewportLandscape(e.matches);
      };
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', mqHandler);
      } else if ('addListener' in mediaQuery) {
        (mediaQuery as any).addListener(mqHandler);
      }
    }

    // 3. Window resize and orientationchange fallbacks
    window.addEventListener('resize', updateViewportOrientation);
    window.addEventListener('orientationchange', updateViewportOrientation);

    return () => {
      if (screenOrientation && 'removeEventListener' in screenOrientation) {
        screenOrientation.removeEventListener('change', updateViewportOrientation);
      }
      if (mediaQuery && mqHandler) {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', mqHandler);
        } else if ('removeListener' in mediaQuery) {
          (mediaQuery as any).removeListener(mqHandler);
        }
      }
      window.removeEventListener('resize', updateViewportOrientation);
      window.removeEventListener('orientationchange', updateViewportOrientation);
    };
  }, [updateViewportOrientation]);

  // Handle hardware device orientation (for cases where system auto-rotate is locked in portrait on mobile)
  useEffect(() => {
    let lastEventTime = 0;

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      // Throttle sensor events to ~15-20fps for optimal battery & performance
      const now = Date.now();
      if (now - lastEventTime < 60) return;
      lastEventTime = now;

      if (event.beta !== null && event.gamma !== null) {
        setDeviceTilt((prev) => detectTiltFromMotion(event.beta, event.gamma, prev));
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });
    }

    return () => {
      if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
    };
  }, []);

  // Determine virtual landscape (when mobile viewport is portrait, but user physically tilted phone horizontally)
  const isPhysicalLandscape = deviceTilt === 'landscape-left' || deviceTilt === 'landscape-right';
  const isVirtualLandscape = setting === 'auto' && !viewportLandscape && isPhysicalLandscape;
  const virtualRotationAngle = isVirtualLandscape
    ? (deviceTilt === 'landscape-left' ? 90 : -90)
    : 0;

  // General landscape flag: either native viewport landscape or physically tilted landscape
  const isLandscape = viewportLandscape || (setting === 'auto' && isPhysicalLandscape);

  const effectiveOrientation = resolveEffectiveOrientation(setting, isLandscape);
  const screenOrientation: 'landscape' | 'portrait' = viewportLandscape ? 'landscape' : 'portrait';

  return {
    setting,
    effectiveOrientation,
    isLandscape,
    isVirtualLandscape,
    virtualRotationAngle,
    screenOrientation,
    deviceTilt,
  };
}
