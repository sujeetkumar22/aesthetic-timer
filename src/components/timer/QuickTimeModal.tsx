import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Clock, Sparkles } from 'lucide-react';
import { parseTimeString } from '../../utils/urlParser';
import { pad, formatSecondsToTime } from '../../utils/formatters';

interface QuickTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetTime: (seconds: number) => void;
  currentDurationSeconds?: number;
}

const QUICK_PRESETS = [
  { label: '15m', seconds: 15 * 60 },
  { label: '25m', seconds: 25 * 60 },
  { label: '45m', seconds: 45 * 60 },
  { label: '1h', seconds: 60 * 60 },
  { label: '1.5h', seconds: 90 * 60 },
  { label: '2h', seconds: 120 * 60 },
  { label: '2h 45m', seconds: (2 * 60 + 45) * 60 },
  { label: '3h', seconds: 180 * 60 },
];

export const QuickTimeModal: React.FC<QuickTimeModalProps> = ({
  isOpen,
  onClose,
  onSetTime,
  currentDurationSeconds = 1500,
}) => {
  const { hours, minutes, seconds } = formatSecondsToTime(currentDurationSeconds);
  const [h, setH] = useState(pad(hours));
  const [m, setM] = useState(pad(minutes));
  const [s, setS] = useState(pad(seconds));
  const [nlInput, setNlInput] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  const hoursInputRef = useRef<HTMLInputElement>(null);
  const minutesInputRef = useRef<HTMLInputElement>(null);
  const secondsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const formatted = formatSecondsToTime(currentDurationSeconds);
      setH(pad(formatted.hours));
      setM(pad(formatted.minutes));
      setS(pad(formatted.seconds));
      setNlInput('');
      setParseError(null);
      setTimeout(() => {
        hoursInputRef.current?.select();
      }, 50);
    }
  }, [isOpen, currentDurationSeconds]);

  if (!isOpen) return null;

  const calculateTotal = (hh: string, mm: string, ss: string) => {
    const total = (parseInt(hh, 10) || 0) * 3600 + (parseInt(mm, 10) || 0) * 60 + (parseInt(ss, 10) || 0);
    return Math.max(0, total);
  };

  const handleApply = () => {
    const total = calculateTotal(h, m, s);
    if (total <= 0) {
      setParseError('Please specify a duration greater than 0.');
      return;
    }
    onSetTime(total);
    onClose();
  };

  const handleNlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlInput.trim()) return;
    const parsed = parseTimeString(nlInput);
    if (parsed && parsed > 0) {
      const formatted = formatSecondsToTime(parsed);
      setH(pad(formatted.hours));
      setM(pad(formatted.minutes));
      setS(pad(formatted.seconds));
      setParseError(null);
      onSetTime(parsed);
      onClose();
    } else {
      setParseError('Could not recognize time. Try "2 hours 45 minutes", "2h 45m", or "90m".');
    }
  };

  const handleNlChange = (val: string) => {
    setNlInput(val);
    if (parseError) setParseError(null);
    const parsed = parseTimeString(val);
    if (parsed && parsed > 0) {
      const formatted = formatSecondsToTime(parsed);
      setH(pad(formatted.hours));
      setM(pad(formatted.minutes));
      setS(pad(formatted.seconds));
    }
  };

  const handleAddMinutes = (addedMinutes: number) => {
    const currentTotal = calculateTotal(h, m, s);
    const newTotal = Math.max(0, currentTotal + addedMinutes * 60);
    const formatted = formatSecondsToTime(newTotal);
    setH(pad(formatted.hours));
    setM(pad(formatted.minutes));
    setS(pad(formatted.seconds));
  };

  const handleClear = () => {
    setH('00');
    setM('00');
    setS('00');
  };

  const handleSelectPreset = (sec: number) => {
    const formatted = formatSecondsToTime(sec);
    setH(pad(formatted.hours));
    setM(pad(formatted.minutes));
    setS(pad(formatted.seconds));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-8 flex flex-col gap-6"
        style={{
          backgroundColor: 'var(--card-top)',
          borderColor: 'var(--border-color)',
          color: 'var(--digit-color)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 opacity-80" />
            <h2 className="text-xl font-bold font-sans">Set Exact Timer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 transition-colors opacity-70 hover:opacity-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Natural Language Input */}
        <form onSubmit={handleNlSubmit} className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wider uppercase opacity-75" style={{ color: 'var(--muted-color)' }}>
            Quick Type (e.g. "2 hours 45 minutes", "2h 45m", "165m")
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={nlInput}
                onChange={(e) => handleNlChange(e.target.value)}
                placeholder="e.g. 2 hours 45 minutes, 90m, 2.5h..."
                className="w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none transition-all"
                style={{
                  backgroundColor: 'var(--card-bottom)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--digit-color)',
                }}
              />
              <Sparkles className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-4 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 border"
              style={{
                backgroundColor: 'var(--card-bottom)',
                borderColor: 'var(--border-color)',
                color: 'var(--digit-color)',
              }}
            >
              Parse
            </button>
          </div>
          {parseError && <p className="text-xs text-rose-400 mt-1">{parseError}</p>}
        </form>

        {/* Visual HH:MM:SS Inputs */}
        <div className="flex flex-col items-center">
          <div
            className="flex items-center justify-center gap-2 sm:gap-4 p-4 rounded-2xl border shadow-inner"
            style={{
              backgroundColor: 'var(--card-bottom)',
              borderColor: 'var(--border-color)',
            }}
          >
            {/* Hours */}
            <div className="flex flex-col items-center">
              <input
                ref={hoursInputRef}
                type="text"
                inputMode="numeric"
                value={h}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setH(clean);
                  if (clean.length === 2) minutesInputRef.current?.focus();
                }}
                onBlur={() => {
                  let num = parseInt(h, 10) || 0;
                  num = Math.min(99, Math.max(0, num));
                  setH(pad(num));
                }}
                onFocus={(e) => e.target.select()}
                className="w-16 sm:w-20 h-16 sm:h-20 text-center text-3xl sm:text-4xl font-bold rounded-xl border focus:outline-none shadow-sm"
                style={{
                  backgroundColor: 'var(--card-top)',
                  color: 'var(--digit-color)',
                  borderColor: 'var(--border-color)',
                  fontFamily: 'var(--font-digits)',
                }}
                aria-label="Hours"
              />
              <span className="mt-1 text-[10px] font-semibold tracking-wider uppercase opacity-70" style={{ color: 'var(--muted-color)' }}>
                Hours
              </span>
            </div>

            <span className="text-2xl sm:text-3xl font-light pb-4 opacity-40">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <input
                ref={minutesInputRef}
                type="text"
                inputMode="numeric"
                value={m}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setM(clean);
                  if (clean.length === 2) secondsInputRef.current?.focus();
                }}
                onBlur={() => {
                  let num = parseInt(m, 10) || 0;
                  num = Math.min(59, Math.max(0, num));
                  setM(pad(num));
                }}
                onFocus={(e) => e.target.select()}
                className="w-16 sm:w-20 h-16 sm:h-20 text-center text-3xl sm:text-4xl font-bold rounded-xl border focus:outline-none shadow-sm"
                style={{
                  backgroundColor: 'var(--card-top)',
                  color: 'var(--digit-color)',
                  borderColor: 'var(--border-color)',
                  fontFamily: 'var(--font-digits)',
                }}
                aria-label="Minutes"
              />
              <span className="mt-1 text-[10px] font-semibold tracking-wider uppercase opacity-70" style={{ color: 'var(--muted-color)' }}>
                Minutes
              </span>
            </div>

            <span className="text-2xl sm:text-3xl font-light pb-4 opacity-40">:</span>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <input
                ref={secondsInputRef}
                type="text"
                inputMode="numeric"
                value={s}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setS(clean);
                }}
                onBlur={() => {
                  let num = parseInt(s, 10) || 0;
                  num = Math.min(59, Math.max(0, num));
                  setS(pad(num));
                }}
                onFocus={(e) => e.target.select()}
                className="w-16 sm:w-20 h-16 sm:h-20 text-center text-3xl sm:text-4xl font-bold rounded-xl border focus:outline-none shadow-sm"
                style={{
                  backgroundColor: 'var(--card-top)',
                  color: 'var(--digit-color)',
                  borderColor: 'var(--border-color)',
                  fontFamily: 'var(--font-digits)',
                }}
                aria-label="Seconds"
              />
              <span className="mt-1 text-[10px] font-semibold tracking-wider uppercase opacity-70" style={{ color: 'var(--muted-color)' }}>
                Seconds
              </span>
            </div>
          </div>

          {/* Quick Increment Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
            <button
              type="button"
              onClick={() => handleAddMinutes(60)}
              className="px-2.5 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95 opacity-80 hover:opacity-100"
              style={{ backgroundColor: 'var(--card-top)', borderColor: 'var(--border-color)' }}
            >
              +1 hr
            </button>
            <button
              type="button"
              onClick={() => handleAddMinutes(30)}
              className="px-2.5 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95 opacity-80 hover:opacity-100"
              style={{ backgroundColor: 'var(--card-top)', borderColor: 'var(--border-color)' }}
            >
              +30 min
            </button>
            <button
              type="button"
              onClick={() => handleAddMinutes(15)}
              className="px-2.5 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95 opacity-80 hover:opacity-100"
              style={{ backgroundColor: 'var(--card-top)', borderColor: 'var(--border-color)' }}
            >
              +15 min
            </button>
            <button
              type="button"
              onClick={() => handleAddMinutes(5)}
              className="px-2.5 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95 opacity-80 hover:opacity-100"
              style={{ backgroundColor: 'var(--card-top)', borderColor: 'var(--border-color)' }}
            >
              +5 min
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95 opacity-60 hover:opacity-100"
              style={{ backgroundColor: 'var(--card-top)', borderColor: 'var(--border-color)' }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase opacity-70 text-center" style={{ color: 'var(--muted-color)' }}>
            Popular Presets
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {QUICK_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleSelectPreset(p.seconds)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95 opacity-80 hover:opacity-100"
                style={{
                  backgroundColor: 'var(--card-bottom)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--digit-color)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95 border opacity-80 hover:opacity-100"
            style={{
              backgroundColor: 'var(--card-bottom)',
              borderColor: 'var(--border-color)',
              color: 'var(--digit-color)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 shadow-lg"
            style={{
              backgroundColor: 'var(--digit-color)',
              color: 'var(--bg-color)',
            }}
          >
            <Play className="w-4 h-4 fill-current" />
            Set & Start Timer
          </button>
        </div>
      </div>
    </div>
  );
};