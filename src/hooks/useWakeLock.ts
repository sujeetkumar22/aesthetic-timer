import { useEffect, useRef, useState } from 'react';

export function useWakeLock(enabled: boolean = true) {
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const wakeLockSentinelRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('wakeLock' in navigator)) {
      return;
    }

    let isMounted = true;

    const requestWakeLock = async () => {
      try {
        if (wakeLockSentinelRef.current) return;
        const sentinel = await (navigator as any).wakeLock.request('screen');
        if (!isMounted) {
          sentinel.release();
          return;
        }
        wakeLockSentinelRef.current = sentinel;
        setIsLocked(true);

        sentinel.addEventListener('release', () => {
          if (isMounted) {
            wakeLockSentinelRef.current = null;
            setIsLocked(false);
          }
        });
      } catch (err) {
        // WakeLock request rejected (e.g. low battery, background tab)
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockSentinelRef.current) {
        wakeLockSentinelRef.current.release().catch(() => {});
        wakeLockSentinelRef.current = null;
      }
      setIsLocked(false);
    };
  }, [enabled]);

  return { isLocked };
}
