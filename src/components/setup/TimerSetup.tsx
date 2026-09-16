import React, { useState, useEffect, useRef } from 'react';
import { Play, Sparkles } from 'lucide-react';
import { PresetSelector } from './PresetSelector';
import { ThemeSelector } from '../common/ThemeSelector';
import { pad, formatSecondsToTime } from '../../utils/formatters';
import { parseTimeString } from '../../utils/urlParser';
import { ThemeId } from '../../types/timer';

interface TimerSetupProps {
  durationSeconds: number;
  currentTheme?: ThemeId;
  onSelectTheme?: (theme: ThemeId) => void;
  onStart: (seconds: number) => void;
  onSelectPreset: (seconds: number) => void;
}

export const TimerSetup: React.FC<TimerSetupProps> = ({
  durationSeconds,
  currentTheme,
  onSelectTheme,
  onStart,
  onSelectPreset,
}) => {
  const { hours, minutes, seconds } = formatSecondsToTime(durationSeconds);
  const [h, setH] = useState(pad(hours));
  const [m, setM] = useState(pad(minutes));
  const [s, setS] = useState(pad(seconds));
  const [nlQuery, setNlQuery] = useState('');
  const [nlError, setNlError] = useState<string | null>(null);

  const hoursInputRef = useRef<HTMLInputElement>(null);
  const minutesInputRef = useRef<HTMLInputElement>(null);
  const secondsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const formatted = formatSecondsToTime(durationSeconds);
    setH(pad(formatted.hours));
    setM(pad(formatted.minutes));
    setS(pad(formatted.seconds));
  }, [durationSeconds]);

  const handleStart = () => {
    const totalSec = (parseInt(h, 10) || 0) * 3600 + (parseInt(m, 10) || 0) * 60 + (parseInt(s, 10) || 0);
    const validSec = Math.max(1, totalSec || 60);
    onStart(validSec);
  };

  const handleAddMinutes = (addedMinutes: number) => {
    const currentTotal = (parseInt(h, 10) || 0) * 3600 + (parseInt(m, 10) || 0) * 60 + (parseInt(s, 10) || 0);
    const newTotal = Math.max(0, currentTotal + addedMinutes * 60);
    const formatted = formatSecondsToTime(newTotal);
    setH(pad(formatted.hours));
    setM(pad(formatted.minutes));
    setS(pad(formatted.seconds));
    onSelectPreset(newTotal);
  };

  const handleClear = () => {
    setH('00');
    setM('00');
    setS('00');
    onSelectPreset(0);
  };

  const handleInputChange = (
    val: string,
    setter: (v: string) => void,
    nextRef?: React.RefObject<HTMLInputElement | null>
  ) => {
    const clean = val.replace(/\D/g, '').slice(0, 2);
    setter(clean);
    if (clean.length === 2 && nextRef) {
      nextRef.current?.focus();
      nextRef.current?.select();
    }
  };

  const handleBlur = (
    val: string,
    setter: (v: string) => void,
    max: number
  ) => {
    let num = parseInt(val, 10);
    if (isNaN(num)) num = 0;
    num = Math.min(max, Math.max(0, num));
    setter(pad(num));

    const currentH = setter === setH ? num : parseInt(h, 10) || 0;
    const currentM = setter === setM ? num : parseInt(m, 10) || 0;
    const currentS = setter === setS ? num : parseInt(s, 10) || 0;
    const total = currentH * 3600 + currentM * 60 + currentS;
    if (total > 0) onSelectPreset(total);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleStart();
    }
  };

  const handleNlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    const parsed = parseTimeString(nlQuery);
    if (parsed && parsed > 0) {
      setNlError(null);
      const formatted = formatSecondsToTime(parsed);
      setH(pad(formatted.hours));
      setM(pad(formatted.minutes));
      setS(pad(formatted.seconds));
      onSelectPreset(parsed);
      onStart(parsed);
    } else {
      setNlError('Could not recognize time. Try "2 hours 45 minutes", "2h 45m", or "90m".');
    }
  };

  const handleNlChange = (val: string) => {
    setNlQuery(val);
    if (nlError) setNlError(null);
    const parsed = parseTimeString(val);
    if (parsed && parsed > 0) {
      const formatted = formatSecondsToTime(parsed);
      setH(pad(formatted.hours));
      setM(pad(formatted.minutes));
      setS(pad(formatted.seconds));
      onSelectPreset(parsed);
    }
  };

  return (
    <div id="timer-setup" className="flex flex-col items-center text-center max-w-2xl mx-auto px-4 py-6 scroll-mt-20">
      {/* Quick Natural Language Bar */}
      <form onSubmit={handleNlSubmit} className="w-full max-w-md mb-6 flex flex-col gap-1.5">
        <div className="relative flex items-center">
          <input
            type="text"
            value={nlQuery}
            onChange={(e) => handleNlChange(e.target.value)}
            placeholder="Type exact time (e.g. 2 hours 45 minutes, 90m)..."
            className="w-full px-4 py-3 pr-24 rounded-2xl border text-sm font-medium focus:outline-none transition-all shadow-sm"
            style={{
              backgroundColor: 'var(--card-top)',
              borderColor: 'var(--border-color)',
              color: 'var(--digit-color)',
            }}
          />
          <button
            type="submit"
            className="absolute right-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm flex items-center gap-1.5"
            style={{
              backgroundColor: 'var(--digit-color)',
              color: 'var(--bg-color)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Set
          </button>
        </div>
        {nlError && <p className="text-xs text-rose-400">{nlError}</p>}
      </form>

      {/* Visual Input Panel */}
      <div className="mb-4">
        <div
          className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 p-4 sm:p-6 rounded-3xl border shadow-2xl backdrop-blur-sm"
          style={{
            backgroundColor: 'var(--card-color)',
            borderColor: 'var(--border-color)',
          }}
        >
          {/* Hours Input */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <input
                ref={hoursInputRef}
                type="text"
                inputMode="numeric"
                value={h}
                onChange={(e) => handleInputChange(e.target.value, setH, minutesInputRef)}
                onBlur={() => handleBlur(h, setH, 99)}
                onFocus={(e) => e.target.select()}
                onKeyDown={handleKeyDown}
                className="w-[68px] sm:w-28 md:w-32 h-[68px] sm:h-28 md:h-32 text-center text-3xl sm:text-6xl md:text-7xl font-bold rounded-xl sm:rounded-2xl border transition-all shadow-inner focus:outline-none"
                style={{
                  backgroundColor: 'var(--card-bottom)',
                  color: 'var(--digit-color)',
                  borderColor: 'var(--border-color)',
                  fontFamily: 'var(--font-digits)',
                }}
                aria-label="Hours"
              />
            </div>
            <span
              className="mt-2 text-xs font-semibold tracking-wider uppercase"
              style={{ color: 'var(--muted-color)' }}
            >
              Hours
            </span>
          </div>

          <span
            className="text-3xl sm:text-5xl font-light pb-6 select-none opacity-40"
            style={{ color: 'var(--digit-color)' }}
          >
            :
          </span>

          {/* Minutes Input */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <input
                ref={minutesInputRef}
                type="text"
                inputMode="numeric"
                value={m}
                onChange={(e) => handleInputChange(e.target.value, setM, secondsInputRef)}
                onBlur={() => handleBlur(m, setM, 59)}
                onFocus={(e) => e.target.select()}
                onKeyDown={handleKeyDown}
                className="w-[68px] sm:w-28 md:w-32 h-[68px] sm:h-28 md:h-32 text-center text-3xl sm:text-6xl md:text-7xl font-bold rounded-xl sm:rounded-2xl border transition-all shadow-inner focus:outline-none"
                style={{
                  backgroundColor: 'var(--card-bottom)',
                  color: 'var(--digit-color)',
                  borderColor: 'var(--border-color)',
                  fontFamily: 'var(--font-digits)',
                }}
                aria-label="Minutes"
              />
            </div>
            <span
              className="mt-2 text-xs font-semibold tracking-wider uppercase"
              style={{ color: 'var(--muted-color)' }}
            >
              Minutes
            </span>
          </div>

          <span
            className="text-3xl sm:text-5xl font-light pb-6 select-none opacity-40"
            style={{ color: 'var(--digit-color)' }}
          >
            :
          </span>

          {/* Seconds Input */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <input
                ref={secondsInputRef}
                type="text"
                inputMode="numeric"
                value={s}
                onChange={(e) => handleInputChange(e.target.value, setS)}
                onBlur={() => handleBlur(s, setS, 59)}
                onFocus={(e) => e.target.select()}
                onKeyDown={handleKeyDown}
                className="w-[68px] sm:w-28 md:w-32 h-[68px] sm:h-28 md:h-32 text-center text-3xl sm:text-6xl md:text-7xl font-bold rounded-xl sm:rounded-2xl border transition-all shadow-inner focus:outline-none"
                style={{
                  backgroundColor: 'var(--card-bottom)',
                  color: 'var(--digit-color)',
                  borderColor: 'var(--border-color)',
                  fontFamily: 'var(--font-digits)',
                }}
                aria-label="Seconds"
              />
            </div>
            <span
              className="mt-2 text-xs font-semibold tracking-wider uppercase"
              style={{ color: 'var(--muted-color)' }}
            >
              Seconds
            </span>
          </div>
        </div>

        {/* Quick Stepper Increment Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3">
          <button
            type="button"
            onClick={() => handleAddMinutes(60)}
            className="px-3 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95 opacity-80 hover:opacity-100"
            style={{ backgroundColor: 'var(--card-top)', borderColor: 'var(--border-color)', color: 'var(--digit-color)' }}
          >
            +1 hr
          </button>
          <button
            type="button"
            onClick={() => handleAddMinutes(30)}
            className="px-3 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95 opacity-80 hover:opacity-100"
            style={{ backgroundColor: 'var(--card-top)', borderColor: 'var(--border-color)' }}
          >
            +30 min
          </button>
          <button
            type="button"
            onClick={() => handleAddMinutes(15)}
            className="px-3 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95 opacity-80 hover:opacity-100"
            style={{ backgroundColor: 'var(--card-top)', borderColor: 'var(--border-color)' }}
          >
            +15 min
          </button>
          <button
            type="button"
            onClick={() => handleAddMinutes(5)}
            className="px-3 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95 opacity-80 hover:opacity-100"
            style={{ backgroundColor: 'var(--card-top)', borderColor: 'var(--border-color)' }}
          >
            +5 min
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95 opacity-60 hover:opacity-100"
            style={{ backgroundColor: 'var(--card-top)', borderColor: 'var(--border-color)' }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Start Button */}
      <div className="flex flex-col items-center gap-4 w-full mb-8">
        <button
          onClick={handleStart}
          className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 font-bold text-lg rounded-full transition-all active:scale-95 shadow-xl"
          style={{
            backgroundColor: 'var(--digit-color)',
            color: 'var(--bg-color)',
          }}
        >
          <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
          Start Timer
        </button>
      </div>

      {/* Quick Presets */}
      <div className="w-full flex flex-col items-center gap-3 mb-6">
        <span
          className="text-xs font-medium tracking-wider uppercase"
          style={{ color: 'var(--muted-color)' }}
        >
          Quick presets
        </span>
        <PresetSelector
          selectedDuration={durationSeconds}
          onSelect={(sec) => {
            onSelectPreset(sec);
          }}
        />
      </div>

      {/* Quick Theme Swatches */}
      {currentTheme && onSelectTheme && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <span
            className="text-xs font-medium tracking-wider uppercase"
            style={{ color: 'var(--muted-color)' }}
          >
            Color Theme
          </span>
          <ThemeSelector currentTheme={currentTheme} onSelectTheme={onSelectTheme} />
        </div>
      )}
    </div>
  );
};
