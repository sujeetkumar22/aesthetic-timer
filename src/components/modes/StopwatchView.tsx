import React from 'react';
import { FlipCard } from '../timer/FlipCard';
import { TimerStatus, StopwatchLap } from '../../types/timer';
import { formatMsToStopwatch } from '../../utils/formatters';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';

interface StopwatchViewProps {
  elapsedMs: number;
  status: TimerStatus;
  laps: StopwatchLap[];
  onTogglePlay: () => void;
  onReset: () => void;
  onAddLap: () => void;
  onFlip?: () => void;
  isFullscreen?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const StopwatchView: React.FC<StopwatchViewProps> = ({
  elapsedMs,
  status,
  laps,
  onTogglePlay,
  onReset,
  onAddLap,
  onFlip,
  isFullscreen = false,
  orientation = 'horizontal',
}) => {
  const isRunning = status === 'running';
  const { minutesStr, secondsStr, hundredthsStr } = formatMsToStopwatch(elapsedMs);
  const isVertical = orientation === 'vertical';

  const sizingClass = isVertical
    ? `flip-card-vertical-two ${isFullscreen ? 'flip-card-vertical-fullscreen' : ''}`
    : isFullscreen
    ? 'flip-card-two-fullscreen'
    : 'flip-card-two-windowed';

  const colonDivider = (
    <div
      className="flex flex-col items-center justify-center select-none opacity-35 px-0.5 sm:px-1.5 md:px-2.5"
      style={{
        gap: 'calc(var(--card-h, 180px) * 0.11)',
        paddingBottom: 'calc(var(--card-h, 180px) * 0.02)',
      }}
    >
      <span
        className="rounded-full transition-all duration-300"
        style={{
          backgroundColor: 'var(--digit-color)',
          width: 'calc(var(--card-h, 180px) * 0.045)',
          height: 'calc(var(--card-h, 180px) * 0.045)',
        }}
      />
      <span
        className="rounded-full transition-all duration-300"
        style={{
          backgroundColor: 'var(--digit-color)',
          width: 'calc(var(--card-h, 180px) * 0.045)',
          height: 'calc(var(--card-h, 180px) * 0.045)',
        }}
      />
    </div>
  );

  const verticalDivider = (
    <div className="flex items-center justify-center gap-2 py-0.5 select-none opacity-35">
      <span
        className="w-1.5 h-1.5 rounded-full transition-all duration-300"
        style={{ backgroundColor: 'var(--digit-color)' }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full transition-all duration-300"
        style={{ backgroundColor: 'var(--digit-color)' }}
      />
    </div>
  );

  return (
    <div
      className={`flex flex-col items-center justify-center flex-1 w-full gap-3 sm:gap-6 animate-fade-in ${sizingClass}`}
    >
      {/* Stopwatch Hero Flip Display */}
      <div
        className={`flex ${
          isVertical
            ? 'flex-col items-center justify-center gap-2 px-2'
            : 'flex-row items-center justify-center gap-1 sm:gap-2.5 md:gap-4 px-1 sm:px-4'
        }`}
      >
        <FlipCard
          value={minutesStr}
          label="Minutes"
          onFlip={onFlip}
          isFullscreen={isFullscreen}
          cardVariant="two-card"
        />
        {isVertical ? verticalDivider : colonDivider}
        <FlipCard
          value={secondsStr}
          label="Seconds"
          onFlip={onFlip}
          isFullscreen={isFullscreen}
          cardVariant="two-card"
        />

        {/* Hundredths Box */}
        <div className={`flex items-center justify-center ${isVertical ? 'pt-1 gap-2' : 'flex-col pl-1 sm:pl-2'}`}>
          <div
            className="px-2.5 py-1.5 sm:px-3 sm:py-2.5 md:px-4 md:py-3 rounded-xl sm:rounded-2xl border font-mono font-bold text-base sm:text-2xl md:text-3xl tabular-nums shadow-lg transition-colors"
            style={{
              backgroundColor: 'var(--card-top)',
              borderColor: 'var(--border-color)',
              color: 'var(--digit-color)',
            }}
          >
            .{hundredthsStr}
          </div>
          <span
            className={`${isVertical ? 'text-[11px]' : 'mt-1 sm:mt-2 text-[9px] sm:text-xs'} tracking-wider uppercase font-medium transition-colors`}
            style={{ color: 'var(--muted-color)' }}
          >
            MS
          </span>
        </div>
      </div>

      {/* Controls (non-fullscreen only) */}
      {!isFullscreen && (
        <div
          className="flex items-center gap-3 sm:gap-4 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border shadow-xl transition-colors"
          style={{
            backgroundColor: 'var(--card-top)',
            borderColor: 'var(--border-color)',
          }}
        >
          {/* Reset */}
          <button
            onClick={onReset}
            className="p-2 sm:p-2.5 rounded-full transition-all active:scale-95 opacity-75 hover:opacity-100"
            style={{ color: 'var(--digit-color)' }}
            title="Reset Stopwatch"
            aria-label="Reset Stopwatch"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Start / Pause */}
          <button
            onClick={onTogglePlay}
            className="p-3 sm:p-4 rounded-full transition-all active:scale-95 shadow-lg flex items-center justify-center"
            style={{
              backgroundColor: 'var(--digit-color)',
              color: 'var(--bg-color)',
            }}
            title={isRunning ? 'Pause' : 'Start'}
            aria-label={isRunning ? 'Pause stopwatch' : 'Start stopwatch'}
          >
            {isRunning ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Lap */}
          <button
            onClick={onAddLap}
            disabled={status === 'idle'}
            className={`p-2 sm:p-2.5 rounded-full transition-all active:scale-95 ${
              status === 'idle'
                ? 'opacity-30 cursor-not-allowed'
                : 'opacity-75 hover:opacity-100'
            }`}
            style={{ color: 'var(--digit-color)' }}
            title="Record Lap"
            aria-label="Record Lap"
          >
            <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}

      {/* Laps List */}
      {!isFullscreen && laps.length > 0 && (
        <div
          className="w-full max-w-sm max-h-40 sm:max-h-48 overflow-y-auto no-scrollbar border rounded-2xl p-3 sm:p-4 mt-1 transition-colors"
          style={{
            backgroundColor: 'var(--card-bottom)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div
            className="flex justify-between text-[11px] sm:text-xs font-semibold border-b pb-2 mb-2 uppercase tracking-wider transition-colors"
            style={{
              color: 'var(--muted-color)',
              borderColor: 'var(--border-color)',
            }}
          >
            <span>Lap</span>
            <span>Split</span>
            <span>Total</span>
          </div>
          <div className="flex flex-col gap-1 font-mono text-xs sm:text-sm">
            {laps.map((lap) => {
              const lapFormatted = formatMsToStopwatch(lap.lapTime).formatted;
              const totalFormatted = formatMsToStopwatch(lap.totalTime).formatted;
              return (
                <div key={lap.id} className="flex justify-between py-1 transition-colors" style={{ color: 'var(--digit-color)' }}>
                  <span style={{ color: 'var(--muted-color)' }}>#{lap.lapNumber}</span>
                  <span className="opacity-80">+{lapFormatted}</span>
                  <span className="font-semibold">{totalFormatted}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
