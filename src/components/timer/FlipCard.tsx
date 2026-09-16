import React, { useState, useEffect, useRef } from 'react';

interface FlipCardProps {
  value: string;
  label?: string;
  onFlip?: () => void;
  isFullscreen?: boolean;
  cardVariant?: 'two-card' | 'three-card';
  className?: string;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  value,
  label,
  onFlip,
  isFullscreen = false,
  cardVariant,
  className = '',
}) => {
  const [currentVal, setCurrentVal] = useState(value);
  const [prevVal, setPrevVal] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const safetyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (value !== currentVal) {
      setPrevVal(currentVal);
      setCurrentVal(value);
      setIsFlipping(true);
      onFlip?.();

      // Fallback safety timeout in case tab is throttled or animationEnd doesn't fire
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
      safetyTimeoutRef.current = window.setTimeout(() => {
        setIsFlipping(false);
        setPrevVal(value);
      }, 500);
    }
  }, [value, currentVal, onFlip]);

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    // Only respond to the lower flap completion
    if (e.animationName === 'dropLower') {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
      setIsFlipping(false);
      setPrevVal(currentVal);
    }
  };

  useEffect(() => {
    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, []);

  const sizeClass = cardVariant
    ? cardVariant === 'three-card'
      ? isFullscreen
        ? 'flip-card-three-fullscreen'
        : 'flip-card-three-windowed'
      : isFullscreen
      ? 'flip-card-two-fullscreen'
      : 'flip-card-two-windowed'
    : '';

  return (
    <div className={`flex flex-col items-center select-none ${sizeClass} ${className}`}>
      {/* 3D Perspective Flip Box */}
      <div
        className="relative flip-perspective rounded-2xl sm:rounded-3xl lg:rounded-[36px] shadow-2xl transition-all duration-300"
        style={{
          width: 'var(--card-w, 19rem)',
          height: 'var(--card-h, 23rem)',
        }}
      >
        {/* Soft Ambient Theme Glow behind card */}
        <div
          className="absolute -inset-1 rounded-3xl lg:rounded-[40px] opacity-50 blur-md pointer-events-none transition-all duration-300"
          style={{ backgroundColor: 'var(--glow-color, rgba(0,0,0,0))' }}
        />

        {/* 1. UPPER STATIC HALF (Displays target/new value) */}
        <div
          className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden rounded-t-2xl sm:rounded-t-3xl lg:rounded-t-[36px] border-t border-x z-10"
          style={{
            backgroundColor: 'var(--card-top)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
          <div
            className="absolute top-0 left-0 w-full h-[200%] flex items-center justify-center font-bold tracking-tight tabular-nums leading-none"
            style={{
              color: 'var(--digit-color)',
              fontFamily: 'var(--font-digits)',
              fontSize: 'var(--digit-size, 11rem)',
            }}
          >
            {currentVal}
          </div>
        </div>

        {/* 2. LOWER STATIC HALF (Displays previous value during flip, new value once finished) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden rounded-b-2xl sm:rounded-b-3xl lg:rounded-b-[36px] border-b border-x z-10"
          style={{
            backgroundColor: 'var(--card-bottom)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
          <div
            className="absolute -top-[100%] left-0 w-full h-[200%] flex items-center justify-center font-bold tracking-tight tabular-nums leading-none"
            style={{
              color: 'var(--digit-color)',
              fontFamily: 'var(--font-digits)',
              fontSize: 'var(--digit-size, 11rem)',
            }}
          >
            {isFlipping ? prevVal : currentVal}
          </div>
        </div>

        {/* 3. UPPER ANIMATING FLAP (Folds down 0deg -> -90deg, uncovers upper static half) */}
        {isFlipping && (
          <div
            className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden rounded-t-2xl sm:rounded-t-3xl lg:rounded-t-[36px] border-t border-x flip-card-half animate-fold-upper z-20"
            style={{
              backgroundColor: 'var(--card-top)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div
              className="absolute top-0 left-0 w-full h-[200%] flex items-center justify-center font-bold tracking-tight tabular-nums leading-none"
              style={{
                color: 'var(--digit-color)',
                fontFamily: 'var(--font-digits)',
                fontSize: 'var(--digit-size, 11rem)',
              }}
            >
              {prevVal}
            </div>
            {/* Shading overlay as flap folds away */}
            <div className="absolute inset-0 bg-black shadow-overlay-upper pointer-events-none" />
          </div>
        )}

        {/* 4. LOWER ANIMATING FLAP (Drops down 90deg -> 0deg with 'both' fill mode, settles smoothly) */}
        {isFlipping && (
          <div
            onAnimationEnd={handleAnimationEnd}
            className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden rounded-b-2xl sm:rounded-b-3xl lg:rounded-b-[36px] border-b border-x flip-card-half animate-drop-lower z-30"
            style={{
              backgroundColor: 'var(--card-bottom)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div
              className="absolute -top-[100%] left-0 w-full h-[200%] flex items-center justify-center font-bold tracking-tight tabular-nums leading-none"
              style={{
                color: 'var(--digit-color)',
                fontFamily: 'var(--font-digits)',
                fontSize: 'var(--digit-size, 11rem)',
              }}
            >
              {currentVal}
            </div>
            {/* Subtle highlight overlay that dissipates as flap lands */}
            <div className="absolute inset-0 bg-white highlight-overlay-lower pointer-events-none" />
          </div>
        )}

        {/* 5. SEAM DIVIDER (Razor-thin split line) */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[2px] z-40 pointer-events-none flex flex-col justify-center">
          <div
            className="w-full h-[1px]"
            style={{ backgroundColor: 'var(--seam-line)' }}
          />
          <div
            className="w-full h-[1px]"
            style={{ backgroundColor: 'var(--seam-highlight)' }}
          />
        </div>

        {/* 6. Lateral Hinge Pins */}
        <div
          className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 sm:w-3.5 h-3.5 sm:h-5 rounded-sm z-50 pointer-events-none opacity-80"
          style={{ backgroundColor: 'var(--seam-line)' }}
        />
        <div
          className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 sm:w-3.5 h-3.5 sm:h-5 rounded-sm z-50 pointer-events-none opacity-80"
          style={{ backgroundColor: 'var(--seam-line)' }}
        />
      </div>

      {/* Label under card */}
      {label && (
        <span
          className="mt-2.5 sm:mt-3 text-[11px] sm:text-xs md:text-sm font-medium tracking-widest uppercase select-none transition-colors"
          style={{ color: 'var(--muted-color)' }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
