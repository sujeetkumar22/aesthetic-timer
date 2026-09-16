import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/layout/Header';
import { LandingHero } from './components/layout/LandingHero';
import { TimerSetup } from './components/setup/TimerSetup';
import { FlipDisplay } from './components/timer/FlipDisplay';
import { TimerControls } from './components/timer/TimerControls';
import { CompletionModal } from './components/timer/CompletionModal';
import { PomodoroView } from './components/modes/PomodoroView';
import { StopwatchView } from './components/modes/StopwatchView';
import { ClockView } from './components/modes/ClockView';
import { SettingsModal } from './components/layout/SettingsModal';
import { QuickTimeModal } from './components/timer/QuickTimeModal';
import { Toast } from './components/common/Toast';
import { FocusIntention } from './components/common/FocusIntention';

import { useTimer } from './hooks/useTimer';
import { usePomodoro } from './hooks/usePomodoro';
import { useStopwatch } from './hooks/useStopwatch';
import { useFullscreen } from './hooks/useFullscreen';
import { useSound } from './hooks/useSound';
import { useWakeLock } from './hooks/useWakeLock';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useLocalStorage } from './hooks/useLocalStorage';

import { AppSettings, TimerMode, ThemeId, AmbientSoundType } from './types/timer';
import { getTimerFromLocation, generateShareUrl, copyTextToClipboard } from './utils/urlParser';
import { formatTimeDisplay } from './utils/formatters';
import { soundSynth } from './utils/soundSynth';
import { FONTS } from './utils/themes';

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  flipSoundEnabled: true,
  warningSoundEnabled: true,
  completionSoundEnabled: true,
  volume: 0.5,
  theme: 'classic',
  fontFamily: 'outfit',
  ambientType: 'rain',
  autoHideControls: true,
  clockFormat: '12h',
  keepScreenAwake: true,
  desktopNotifications: false,
  focusIntention: '',
  lastDurationSeconds: 1500, // 25 minutes
  lastMode: 'countdown',
  pomodoro: {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
  },
};

export const App: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('bigtimer_settings_v2', DEFAULT_SETTINGS);
  const [mode, setMode] = useState<TimerMode>(settings.lastMode || 'countdown');
  const [isSetupView, setIsSetupView] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isExactTimeModalOpen, setIsExactTimeModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inactivity auto-hide timer for controls in running/fullscreen mode
  const [areControlsVisible, setAreControlsVisible] = useState<boolean>(true);
  const inactivityTimeoutRef = useRef<number | null>(null);

  // Screen Wake Lock
  useWakeLock(settings.keepScreenAwake);

  // Audio system
  const { unlock, playFlip, playWarning, playCompletion } = useSound(settings);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(false);

  // Fullscreen hook
  const { isFullscreen, toggleFullscreen, exitFullscreen } = useFullscreen();

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Desktop Notifications
  const sendNotification = useCallback(
    (title: string, body: string) => {
      if (
        settings.desktopNotifications &&
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
          });
        } catch (err) {}
      }
    },
    [settings.desktopNotifications]
  );

  const handleToggleAmbient = (type?: AmbientSoundType) => {
    unlock();
    const soundType = type || settings.ambientType;
    const playing = soundSynth.toggleAmbientSound(settings.volume, soundType);
    setIsAmbientPlaying(playing);
    showToast(playing ? `Ambient: ${soundType.toUpperCase()}` : 'Ambient Sound: Off');
  };

  const handleSelectAmbientType = (type: AmbientSoundType) => {
    setSettings((s) => ({ ...s, ambientType: type }));
    soundSynth.setAmbientType(type, settings.volume);
    setIsAmbientPlaying(true);
    showToast(`Ambient: ${type.toUpperCase()}`);
  };

  const handleToggleMute = useCallback(() => {
    setSettings((s) => {
      const nextVal = !s.soundEnabled;
      soundSynth.setMuted(!nextVal);
      showToast(nextVal ? 'Sound Enabled' : 'Sound Muted');
      return { ...s, soundEnabled: nextVal };
    });
  }, [setSettings]);

  // Focus Intention
  const handleUpdateIntention = (goal: string) => {
    setSettings((s) => ({ ...s, focusIntention: goal }));
    if (goal) {
      showToast(`Target set: "${goal}"`);
    }
  };

  // Timer Hook
  const timer = useTimer({
    initialDurationSeconds: settings.lastDurationSeconds,
    onComplete: () => {
      playCompletion();
      sendNotification("Time's up! — BigTimer", "Your countdown session has finished.");
    },
    onWarningTick: () => {
      playWarning();
    },
  });

  // Pomodoro Hook
  const pomodoro = usePomodoro({
    settings: settings.pomodoro,
    onPhaseChange: () => {
      playCompletion();
    },
  });

  // Pomodoro sync with timer
  const pomoTimer = useTimer({
    initialDurationSeconds: pomodoro.currentDurationSeconds,
    onComplete: () => {
      playCompletion();
      const nextPhaseName = pomodoro.phase === 'focus' ? 'Break' : 'Focus Session';
      sendNotification(`Session Complete! — BigTimer`, `Ready for next ${nextPhaseName}.`);
      const { duration } = pomodoro.advancePhase();
      pomoTimer.reset(duration);
    },
    onWarningTick: () => {
      playWarning();
    },
  });

  // Stopwatch Hook
  const stopwatch = useStopwatch();

  // Parse URL on mount
  useEffect(() => {
    const urlTime = getTimerFromLocation();
    if (urlTime && urlTime > 0) {
      timer.reset(urlTime);
      setSettings((s) => ({ ...s, lastDurationSeconds: urlTime }));
      setIsSetupView(false);
      timer.start(urlTime);
      showToast(`Loaded ${Math.round(urlTime / 60)} minute timer from link`);
    }
  }, []);

  // Update browser document title with remaining time or status
  useEffect(() => {
    if (mode === 'countdown') {
      if (timer.status === 'running' || timer.status === 'paused') {
        const { compactString } = formatTimeDisplay(timer.remainingSeconds);
        document.title = `(${compactString}) BigTimer`;
      } else {
        document.title = 'BigTimer — Beautiful Fullscreen Timer';
      }
    } else if (mode === 'pomodoro') {
      if (pomoTimer.status === 'running' || pomoTimer.status === 'paused') {
        const { compactString } = formatTimeDisplay(pomoTimer.remainingSeconds);
        document.title = `(${compactString}) ${pomodoro.phase === 'focus' ? 'Focus' : 'Break'} — BigTimer`;
      } else {
        document.title = 'Pomodoro — BigTimer';
      }
    } else if (mode === 'stopwatch') {
      if (stopwatch.status === 'running') {
        document.title = `⏱ Stopwatch — BigTimer`;
      } else {
        document.title = 'Stopwatch — BigTimer';
      }
    } else if (mode === 'clock') {
      document.title = 'Flip Clock — BigTimer';
    }
  }, [mode, timer.status, timer.remainingSeconds, pomoTimer.status, pomoTimer.remainingSeconds, pomodoro.phase, stopwatch.status]);

  // Apply Theme attribute
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', settings.theme);

    if (settings.theme === 'babyPink' || settings.theme === 'cream') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [settings.theme]);

  // Apply Aesthetic Font Family
  useEffect(() => {
    const root = document.documentElement;
    const fontObj = FONTS.find((f) => f.id === settings.fontFamily) || FONTS[0];
    root.style.setProperty('--font-digits', fontObj.cssFamily);
    root.style.setProperty('--app-font', fontObj.cssFamily);
  }, [settings.fontFamily]);

  // Handle user activity to reset inactivity fade
  const handleUserActivity = useCallback(() => {
    setAreControlsVisible(true);
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    const isRunning =
      (mode === 'countdown' && timer.status === 'running') ||
      (mode === 'pomodoro' && pomoTimer.status === 'running') ||
      (mode === 'stopwatch' && stopwatch.status === 'running') ||
      mode === 'clock';

    if (isRunning || isFullscreen) {
      inactivityTimeoutRef.current = window.setTimeout(() => {
        setAreControlsVisible(false);
      }, 3500);
    }
  }, [mode, timer.status, pomoTimer.status, stopwatch.status, isFullscreen]);

  useEffect(() => {
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    };
  }, [handleUserActivity]);

  // Play / Pause toggle
  const handleTogglePlay = useCallback(() => {
    unlock();
    if (mode === 'countdown') {
      if (isSetupView) {
        setIsSetupView(false);
        timer.start();
      } else {
        timer.togglePlayPause();
      }
    } else if (mode === 'pomodoro') {
      pomoTimer.togglePlayPause();
    } else if (mode === 'stopwatch') {
      stopwatch.togglePlayPause();
    }
  }, [unlock, mode, isSetupView, timer, pomoTimer, stopwatch]);

  // Reset handler
  const handleReset = useCallback(() => {
    if (mode === 'countdown') {
      timer.reset();
    } else if (mode === 'pomodoro') {
      pomoTimer.reset(pomodoro.currentDurationSeconds);
    } else if (mode === 'stopwatch') {
      stopwatch.reset();
    }
  }, [mode, timer, pomoTimer, pomodoro.currentDurationSeconds, stopwatch]);

  // Theme Select Handler
  const handleSelectTheme = (newTheme: ThemeId) => {
    setSettings((s) => ({ ...s, theme: newTheme }));
  };

  // Keyboard Shortcuts Hook
  useKeyboardShortcuts({
    onTogglePlay: handleTogglePlay,
    onReset: handleReset,
    onToggleFullscreen: toggleFullscreen,
    onExitFullscreen: exitFullscreen,
    onToggleMute: handleToggleMute,
    onAddTime: (sec) => {
      if (mode === 'countdown') {
        timer.adjustTime(sec);
        showToast('+1 minute');
      }
    },
    onSubtractTime: (sec) => {
      if (mode === 'countdown') {
        timer.adjustTime(-sec);
        showToast('-1 minute');
      }
    },
  });

  // Start Countdown from Setup
  const handleStartCountdown = (durationSec: number) => {
    unlock();
    timer.reset(durationSec);
    setSettings((s) => ({ ...s, lastDurationSeconds: durationSec }));
    setIsSetupView(false);
    timer.start(durationSec);
  };

  // Preset Selection
  const handleSelectPreset = (seconds: number) => {
    timer.reset(seconds);
    setSettings((s) => ({ ...s, lastDurationSeconds: seconds }));
  };

  // Mode Selection
  const handleSelectMode = (newMode: TimerMode) => {
    setMode(newMode);
    setSettings((s) => ({ ...s, lastMode: newMode }));
  };

  // Share Timer Link
  const handleShare = async () => {
    const url = generateShareUrl(timer.totalDuration);
    const success = await copyTextToClipboard(url);
    if (success) {
      showToast('Timer link copied to clipboard!');
    } else {
      showToast('Could not copy link');
    }
  };

  const isTimerRunning =
    (mode === 'countdown' && timer.status === 'running') ||
    (mode === 'pomodoro' && pomoTimer.status === 'running') ||
    (mode === 'stopwatch' && stopwatch.status === 'running');

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between overflow-x-hidden transition-colors duration-400 font-sans ${
        isFullscreen ? 'h-screen overflow-hidden p-0 cursor-none-when-idle' : ''
      }`}
      style={{
        backgroundColor: 'var(--bg-color)',
        color: 'var(--digit-color)',
        fontFamily: 'var(--font-digits)',
      }}
    >
      {/* Top Header (Overlaid in fullscreen, in flow otherwise) */}
      <div
        className={`transition-opacity duration-300 ${
          isFullscreen ? 'fixed top-0 left-0 right-0 z-40' : ''
        } ${
          (isTimerRunning || isFullscreen) && !areControlsVisible
            ? 'opacity-0 pointer-events-none'
            : 'opacity-100'
        }`}
      >
        <Header
          currentMode={mode}
          onSelectMode={handleSelectMode}
          soundEnabled={settings.soundEnabled}
          onToggleSound={handleToggleMute}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isTimerRunning={!isSetupView && isTimerRunning}
          onLogoClick={() => setIsSetupView(true)}
        />
      </div>

      {/* Main Content Stage */}
      <main
        className={`flex-1 flex flex-col items-center justify-center w-full relative ${
          isFullscreen ? 'h-full w-full px-2 sm:px-4' : 'px-2 sm:px-6'
        }`}
      >
        {/* VIEW 1: COUNTDOWN TIMER */}
        {mode === 'countdown' && (
          <>
            {isSetupView ? (
              <div className="w-full flex flex-col items-center justify-center my-auto">
                <LandingHero
                  onQuickStart={handleStartCountdown}
                  onScrollToSetup={() => {
                    const setupEl = document.getElementById('timer-setup');
                    if (setupEl) {
                      setupEl.scrollIntoView({ behavior: 'smooth' });
                      const input = setupEl.querySelector('input');
                      if (input) input.focus();
                    }
                  }}
                />
                <TimerSetup
                  durationSeconds={timer.totalDuration}
                  currentTheme={settings.theme}
                  onSelectTheme={handleSelectTheme}
                  onStart={handleStartCountdown}
                  onSelectPreset={handleSelectPreset}
                />
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center my-auto py-2">
                {/* Minimalist Focus Intention */}
                <FocusIntention
                  intention={settings.focusIntention}
                  onUpdateIntention={handleUpdateIntention}
                  className={isFullscreen ? 'mb-2 sm:mb-4 scale-105' : 'mb-8'}
                />

                {/* Massive Split-Flap Display */}
                <FlipDisplay
                  totalSeconds={timer.remainingSeconds}
                  onFlip={playFlip}
                  statusBadge={timer.status === 'running' ? 'Focus Session' : 'Timer Paused (Click to edit)'}
                  isFullscreen={isFullscreen}
                  showHoursAlways={timer.totalDuration >= 3600}
                  onBadgeClick={() => setIsExactTimeModalOpen(true)}
                />

                {/* Floating Controls with Theme Swatches */}
                <div
                  className={`transition-opacity duration-300 ${
                    isFullscreen
                      ? 'fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 flex justify-center'
                      : 'mt-8 sm:mt-12'
                  } ${
                    !areControlsVisible && (isTimerRunning || isFullscreen)
                      ? 'opacity-0 pointer-events-none'
                      : 'opacity-100'
                  }`}
                >
                  <TimerControls
                    status={timer.status}
                    currentDurationSeconds={timer.totalDuration}
                    currentTheme={settings.theme}
                    onSelectTheme={handleSelectTheme}
                    onTogglePlay={handleTogglePlay}
                    onReset={handleReset}
                    onSelectPreset={(sec) => {
                      timer.reset(sec);
                      setSettings((s) => ({ ...s, lastDurationSeconds: sec }));
                      timer.start(sec);
                    }}
                    onAddTime={(sec) => timer.adjustTime(sec)}
                    onSubtractTime={(sec) => timer.adjustTime(-sec)}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                    soundEnabled={settings.soundEnabled}
                    onToggleSound={handleToggleMute}
                    isAmbientPlaying={isAmbientPlaying}
                    currentAmbientType={settings.ambientType}
                    onToggleAmbient={handleToggleAmbient}
                    onSelectAmbientType={handleSelectAmbientType}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onOpenExactTimeModal={() => setIsExactTimeModalOpen(true)}
                    onReturnToSetup={() => {
                      timer.pause();
                      setIsSetupView(true);
                    }}
                    onShare={handleShare}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* VIEW 2: POMODORO TIMER */}
        {mode === 'pomodoro' && (
          <div className="w-full flex flex-col items-center justify-center my-auto py-2">
            {/* Minimalist Focus Intention */}
            <FocusIntention
              intention={settings.focusIntention}
              onUpdateIntention={handleUpdateIntention}
              className={isFullscreen ? 'mb-2 sm:mb-4 scale-105' : 'mb-8'}
            />

            <PomodoroView
              phase={pomodoro.phase}
              remainingSeconds={pomoTimer.remainingSeconds}
              status={pomoTimer.status}
              completedSessions={pomodoro.completedSessions}
              sessionsBeforeLongBreak={settings.pomodoro.sessionsBeforeLongBreak}
              onTogglePlay={handleTogglePlay}
              onReset={() => pomoTimer.reset(pomodoro.currentDurationSeconds)}
              onSkipPhase={() => {
                const { duration } = pomodoro.advancePhase();
                pomoTimer.reset(duration);
              }}
              onSetPhase={(newPhase) => {
                const dur = pomodoro.setManualPhase(newPhase);
                pomoTimer.reset(dur);
              }}
              onFlip={playFlip}
              isFullscreen={isFullscreen}
            />

            {/* Bottom Controls */}
            <div
              className={`transition-opacity duration-300 ${
                isFullscreen
                  ? 'fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 flex justify-center'
                  : 'mt-6'
              } ${
                !areControlsVisible && (isTimerRunning || isFullscreen)
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-100'
              }`}
            >
              <TimerControls
                status={pomoTimer.status}
                currentTheme={settings.theme}
                onSelectTheme={handleSelectTheme}
                onTogglePlay={handleTogglePlay}
                onReset={() => pomoTimer.reset(pomodoro.currentDurationSeconds)}
                onAddTime={(sec) => pomoTimer.adjustTime(sec)}
                onSubtractTime={(sec) => pomoTimer.adjustTime(-sec)}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
                soundEnabled={settings.soundEnabled}
                onToggleSound={handleToggleMute}
                isAmbientPlaying={isAmbientPlaying}
                currentAmbientType={settings.ambientType}
                onToggleAmbient={handleToggleAmbient}
                onSelectAmbientType={handleSelectAmbientType}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onReturnToSetup={() => {
                  pomoTimer.pause();
                  setMode('countdown');
                  setIsSetupView(true);
                }}
              />
            </div>
          </div>
        )}

        {/* VIEW 3: STOPWATCH */}
        {mode === 'stopwatch' && (
          <div className="w-full flex flex-col items-center justify-center my-auto py-2">
            <StopwatchView
              elapsedMs={stopwatch.elapsedMs}
              status={stopwatch.status}
              laps={stopwatch.laps}
              onTogglePlay={stopwatch.togglePlayPause}
              onReset={stopwatch.reset}
              onAddLap={stopwatch.addLap}
              onFlip={playFlip}
              isFullscreen={isFullscreen}
            />

            <div
              className={`transition-opacity duration-300 ${
                isFullscreen
                  ? 'fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 flex justify-center'
                  : 'mt-8'
              } ${
                !areControlsVisible && (isTimerRunning || isFullscreen)
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-100'
              }`}
            >
              <TimerControls
                status={stopwatch.status}
                currentTheme={settings.theme}
                onSelectTheme={handleSelectTheme}
                onTogglePlay={stopwatch.togglePlayPause}
                onReset={stopwatch.reset}
                onAddTime={() => {}}
                onSubtractTime={() => {}}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
                soundEnabled={settings.soundEnabled}
                onToggleSound={handleToggleMute}
                isAmbientPlaying={isAmbientPlaying}
                currentAmbientType={settings.ambientType}
                onToggleAmbient={handleToggleAmbient}
                onSelectAmbientType={handleSelectAmbientType}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onReturnToSetup={() => {
                  stopwatch.pause();
                  setMode('countdown');
                  setIsSetupView(true);
                }}
              />
            </div>
          </div>
        )}

        {/* VIEW 4: LIVE REAL-TIME FLIP CLOCK */}
        {mode === 'clock' && (
          <div className="w-full flex flex-col items-center justify-center my-auto py-2">
            <ClockView
              format={settings.clockFormat}
              onToggleFormat={() => {
                const next = settings.clockFormat === '12h' ? '24h' : '12h';
                setSettings((s) => ({ ...s, clockFormat: next }));
                showToast(`Clock Format: ${next.toUpperCase()}`);
              }}
              onFlip={playFlip}
              isFullscreen={isFullscreen}
            />

            {/* Distraction-Free Controls */}
            <div
              className={`transition-opacity duration-300 ${
                isFullscreen
                  ? 'fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 flex justify-center'
                  : 'mt-8 sm:mt-12'
              } ${
                !areControlsVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <TimerControls
                status="running"
                currentTheme={settings.theme}
                onSelectTheme={handleSelectTheme}
                onTogglePlay={() => {}}
                onReset={() => {}}
                onAddTime={() => {}}
                onSubtractTime={() => {}}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
                soundEnabled={settings.soundEnabled}
                onToggleSound={handleToggleMute}
                isAmbientPlaying={isAmbientPlaying}
                currentAmbientType={settings.ambientType}
                onToggleAmbient={handleToggleAmbient}
                onSelectAmbientType={handleSelectAmbientType}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Completion Modal */}
      {mode === 'countdown' && timer.status === 'completed' && (
        <CompletionModal
          title="Time's up"
          subtitle="Session finished. Take a moment to stretch and breathe."
          onRestart={() => {
            timer.reset(timer.totalDuration);
            timer.start();
          }}
          onNewTimer={() => {
            timer.reset(timer.totalDuration);
            setIsSetupView(true);
          }}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      {/* Exact Time Modal */}
      <QuickTimeModal
        isOpen={isExactTimeModalOpen}
        onClose={() => setIsExactTimeModalOpen(false)}
        onSetTime={(sec) => {
          timer.reset(sec);
          setSettings((s) => ({ ...s, lastDurationSeconds: sec }));
          setIsSetupView(false);
          timer.start(sec);
          showToast(`Started timer: ${formatTimeDisplay(sec).compactString}`);
        }}
        currentDurationSeconds={timer.totalDuration}
      />

      {/* Floating Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Subtle Distraction-Free Footer */}
      {!isFullscreen && isSetupView && mode === 'countdown' && (
        <footer className="w-full text-center py-6 text-xs select-none border-t border-white/5 opacity-60">
          <p>BIGTIMER &mdash; Distraction-free mechanical fullscreen timer</p>
        </footer>
      )}
    </div>
  );
};
