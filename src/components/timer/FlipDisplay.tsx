import React from 'react';
import { FlipCard } from './FlipCard';
import { formatTimeDisplay } from '../../utils/formatters';

interface FlipDisplayProps {
  totalSeconds: number;
  onFlip?: () => void;
  showHoursAlways?: boolean;
  statusBadge?: string;
  isFullscreen?: boolean;
  onBadgeClick?: () => void;
  orientation?: 'horizontal' | 'vertical';
}

export const FlipDisplay: React.FC<FlipDisplayProps> = ({
  totalSeconds,
  onFlip,
  showHoursAlways = false,
  statusBadge,
  isFullscreen = false,
  onBadgeClick,
  orientation = 'horizontal',
}) => {
  const { hoursStr, minutesStr, secondsStr, hasHours } = formatTimeDisplay(totalSeconds);
  const showHours = showHoursAlways || hasHours;
  const isThreeCard = showHours;
  const isVertical = orientation === 'vertical';

  const sizingClass = isVertical
    ? isThreeCard
      ? `flip-card-vertical-three ${isFullscreen ? 'flip-card-vertical-fullscreen' : ''}`
      : `flip-card-vertical-two ${isFullscreen ? 'flip-card-vertical-fullscreen' : ''}`
    : isThreeCard
    ? isFullscreen
      ? 'flip-card-three-fullscreen'
      : 'flip-card-three-windowed'
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
    <div className={`flex flex-col items-center justify-center max-w-full transition-all duration-300 ${sizingClass}`}>
      {/* Status / Context Badge above clock */}
      {statusBadge && (
        <button
          type="button"
          onClick={onBadgeClick}
          disabled={!onBadgeClick}
          className={`mb-3 sm:mb-5 px-3.5 py-1 rounded-full text-xs sm:text-sm font-medium tracking-widest uppercase opacity-75 hover:opacity-100 transition-all ${
            onBadgeClick ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
          }`}
          style={{
            color: 'var(--muted-color)',
            backgroundColor: onBadgeClick ? 'var(--card-top)' : 'transparent',
          }}
          title={onBadgeClick ? 'Click to set exact timer duration' : undefined}
        >
          {statusBadge}
        </button>
      )}

      {/* Flip Cards Grid */}
      <div
        className={`flex ${
          isVertical
            ? 'flex-col items-center justify-center gap-1.5 sm:gap-2 px-2'
            : 'flex-row items-center justify-center gap-1.5 sm:gap-3 md:gap-5 lg:gap-6 px-1 sm:px-4'
        }`}
      >
        {/* Hours Group (if > 0 or always enabled) */}
        {showHours && (
          <>
            <FlipCard
              value={hoursStr}
              label="Hours"
              onFlip={onFlip}
              isFullscreen={isFullscreen}
              cardVariant="three-card"
            />
            {isVertical ? verticalDivider : colonDivider}
          </>
        )}

        {/* Minutes Card */}
        <FlipCard
          value={minutesStr}
          label={showHours ? 'Minutes' : undefined}
          onFlip={onFlip}
          isFullscreen={isFullscreen}
          cardVariant={isThreeCard ? 'three-card' : 'two-card'}
        />

        {/* Center Divider Dots */}
        {isVertical ? verticalDivider : colonDivider}

        {/* Seconds Card */}
        <FlipCard
          value={secondsStr}
          label={showHours ? 'Seconds' : undefined}
          onFlip={onFlip}
          isFullscreen={isFullscreen}
          cardVariant={isThreeCard ? 'three-card' : 'two-card'}
        />
      </div>
    </div>
  );
};
