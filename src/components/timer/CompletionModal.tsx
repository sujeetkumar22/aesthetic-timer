import React, { useEffect } from 'react';
import { RotateCcw, PlusCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CompletionModalProps {
  onRestart: () => void;
  onNewTimer: () => void;
  title?: string;
  subtitle?: string;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  onRestart,
  onNewTimer,
  title = "Time's up",
  subtitle = "Well done. Take a breath and reset.",
}) => {
  useEffect(() => {
    // Gentle celebration burst
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#a1a1aa', '#e4e4e7', '#60a5fa'],
        disableForReducedMotion: true,
      });
    } catch (e) {
      // Confetti fallback
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="border rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl flex flex-col items-center text-center transition-colors"
        style={{
          backgroundColor: 'var(--card-color)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Subtle glowing ring icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        {/* Title */}
        <h2
          className="text-3xl font-bold tracking-tight mb-2 font-display transition-colors"
          style={{ color: 'var(--digit-color)' }}
        >
          {title}
        </h2>

        {/* Subtitle */}
        <p
          className="text-sm mb-8 max-w-xs leading-relaxed transition-colors opacity-85"
          style={{ color: 'var(--muted-color)' }}
        >
          {subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-full font-semibold transition-all active:scale-95 shadow-md"
            style={{
              backgroundColor: 'var(--digit-color)',
              color: 'var(--bg-color)',
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
          <button
            onClick={onNewTimer}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-full font-medium transition-all active:scale-95 border"
            style={{
              backgroundColor: 'var(--card-top)',
              borderColor: 'var(--border-color)',
              color: 'var(--digit-color)',
            }}
          >
            <PlusCircle className="w-4 h-4" />
            Set New Timer
          </button>
        </div>
      </div>
    </div>
  );
};
