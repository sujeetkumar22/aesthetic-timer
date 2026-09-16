import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
  onTogglePlay?: () => void;
  onReset?: () => void;
  onToggleFullscreen?: () => void;
  onExitFullscreen?: () => void;
  onToggleMute?: () => void;
  onAddTime?: (seconds: number) => void;
  onSubtractTime?: (seconds: number) => void;
}

export function useKeyboardShortcuts({
  onTogglePlay,
  onReset,
  onToggleFullscreen,
  onExitFullscreen,
  onToggleMute,
  onAddTime,
  onSubtractTime,
}: KeyboardShortcutHandlers, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is typing in form controls
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Check key
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onTogglePlay?.();
          break;
        case 'KeyR':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onReset?.();
          }
          break;
        case 'KeyF':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onToggleFullscreen?.();
          }
          break;
        case 'KeyM':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onToggleMute?.();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onExitFullscreen?.();
          break;
        case 'Equal': // '+' key
        case 'NumpadAdd':
          e.preventDefault();
          onAddTime?.(60);
          break;
        case 'Minus': // '-' key
        case 'NumpadSubtract':
          e.preventDefault();
          onSubtractTime?.(60);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    enabled,
    onTogglePlay,
    onReset,
    onToggleFullscreen,
    onExitFullscreen,
    onToggleMute,
    onAddTime,
    onSubtractTime,
  ]);
}
