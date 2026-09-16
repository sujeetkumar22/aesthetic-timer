import React from 'react';
import { FlipCard } from '../timer/FlipCard';
import { useClock } from '../../hooks/useClock';

interface ClockViewProps {
  format?: '12h' | '24h';
  onToggleFormat: () => void;
  onFlip?: () => void;
  isFullscreen?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const ClockView: React.FC<ClockViewProps> = ({
  format = '12h',
  onToggleFormat,
  onFlip,
  isFullscreen = false,
  orientation = 'horizontal',
}) => {
  const safeFormat = format || '12h';
  const { hoursStr, minutesStr, secondsStr, ampm, dateStr } = useClock(safeFormat);
  const isVertical = orientation === 'vertical';

  const sizingClass = isVertical
    ? `flip-card-vertical-three ${isFullscreen ? 'flip-card-vertical-fullscreen' : ''}`
    : isFullscreen
    ? 'flip-card-three-fullscreen'
    : 'flip-card-three-windowed';

  const colonDivider = (
    <div
      className="flex flex-col items-center justify-center select-none opacity-35 px-0.5 sm:px-1.5 md:px-2.5"
      style={{
        gap: 'calc(var(--card-h, 160px) * 0.11)',
        paddingBottom: 'calc(var(--card-h, 160px) * 0.02)',
      }}
    >
      <span
        className="rounded-full transition-all duration-300"
        style={{
          backgroundColor: 'var(--digit-color)',
          width: 'calc(var(--card-h, 160px) * 0.045)',
          height: 'calc(var(--card-h, 160px) * 0.045)',
        }}
      />
      <span
        className="rounded-full transition-all duration-300"
        style={{
          backgroundColor: 'var(--digit-color)',
          width: 'calc(var(--card-h, 160px) * 0.045)',
          height: 'calc(var(--card-h, 160px) * 0.045)',
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
      className={`flex flex-col items-center justify-center flex-1 w-full gap-3 sm:gap-5 animate-fade-in select-none ${sizingClass}`}
    >
      {/* Date Banner (TV Showcase Inspired) */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <span
          className="text-xs sm:text-sm md:text-base font-medium tracking-widest uppercase opacity-75"
          style={{ color: 'var(--muted-color)' }}
        >
          {dateStr}
        </span>

        {/* 12H / 24H Toggle */}
        <button
          onClick={onToggleFormat}
          className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold tracking-wider border opacity-70 hover:opacity-100 transition-opacity"
          style={{
            borderColor: 'var(--border-color)',
            color: 'var(--digit-color)',
            backgroundColor: 'var(--card-top)',
          }}
          title="Toggle 12H / 24H time format"
          aria-label="Toggle 12H or 24H format"
        >
          {safeFormat.toUpperCase()}
        </button>
      </div>

      {/* The Big Live Flip Clock */}
      <div
        className={`flex ${
          isVertical
            ? 'flex-col items-center justify-center gap-1.5 sm:gap-2 px-2'
            : 'flex-row items-center justify-center gap-1 sm:gap-2.5 md:gap-4 lg:gap-5 px-1 sm:px-4'
        }`}
      >
        {/* Hours */}
        <div className="relative">
          <FlipCard
            value={hoursStr}
            label="Hours"
            onFlip={onFlip}
            isFullscreen={isFullscreen}
            cardVariant="three-card"
          />
          {/* AM / PM Badge */}
          {ampm && (
            <span
              className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-xs font-bold font-mono border z-50 pointer-events-none"
              style={{
                backgroundColor: 'var(--card-top)',
                borderColor: 'var(--border-color)',
                color: 'var(--digit-color)',
              }}
            >
              {ampm}
            </span>
          )}
        </div>

        {/* Divider */}
        {isVertical ? verticalDivider : colonDivider}

        {/* Minutes */}
        <FlipCard
          value={minutesStr}
          label="Minutes"
          onFlip={onFlip}
          isFullscreen={isFullscreen}
          cardVariant="three-card"
        />

        {/* Divider */}
        {isVertical ? verticalDivider : colonDivider}

        {/* Seconds */}
        <FlipCard
          value={secondsStr}
          label="Seconds"
          onFlip={onFlip}
          isFullscreen={isFullscreen}
          cardVariant="three-card"
        />
      </div>

      {!isFullscreen && (
        <span
          className="text-[10px] sm:text-xs font-medium tracking-widest uppercase opacity-50"
          style={{ color: 'var(--muted-color)' }}
        >
          Live Real-Time Flip Clock
        </span>
      )}
    </div>
  );
};
