import React from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface LandingHeroProps {
  onQuickStart: (seconds: number) => void;
  onScrollToSetup: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onQuickStart,
  onScrollToSetup,
}) => {
  return (
    <div className="flex flex-col items-center text-center max-w-3xl mx-auto px-4 pt-2 sm:pt-6 pb-10">
      {/* Badge */}
      <div
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium mb-6 backdrop-blur-md transition-colors"
        style={{
          backgroundColor: 'var(--card-top)',
          borderColor: 'var(--border-color)',
          color: 'var(--muted-color)',
        }}
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        Distraction-Free Cinematic Timer
      </div>

      {/* Main Headline */}
      <h1
        className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4 font-display transition-colors"
        style={{ color: 'var(--digit-color)' }}
      >
        Time, beautifully.
      </h1>

      {/* Subheadline */}
      <p
        className="text-base sm:text-xl font-normal max-w-xl mb-8 leading-relaxed transition-colors opacity-90"
        style={{ color: 'var(--muted-color)' }}
      >
        One simple timer. Full screen. Zero distractions. Built for focus, deep work, workouts, and everything in between.
      </p>

      {/* Action CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-14 w-full sm:w-auto">
        <button
          onClick={onScrollToSetup}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold transition-all active:scale-95 shadow-lg"
          style={{
            backgroundColor: 'var(--digit-color)',
            color: 'var(--bg-color)',
          }}
        >
          Start a Timer
        </button>
        <button
          onClick={() => onQuickStart(25 * 60)}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full font-medium transition-all active:scale-95 border"
          style={{
            backgroundColor: 'var(--card-top)',
            borderColor: 'var(--border-color)',
            color: 'var(--digit-color)',
          }}
        >
          Try 25 minutes
        </button>
      </div>

      {/* Feature Highlights Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full text-left pt-6 border-t"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div
          className="flex flex-col gap-2 p-4 sm:p-5 rounded-2xl border transition-colors"
          style={{
            backgroundColor: 'var(--card-bottom)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-1">
            <Zap className="w-4 h-4" />
          </div>
          <h3
            className="text-sm font-semibold transition-colors"
            style={{ color: 'var(--digit-color)' }}
          >
            Built for focus.
          </h3>
          <p
            className="text-xs leading-relaxed transition-colors opacity-80"
            style={{ color: 'var(--muted-color)' }}
          >
            Eliminate cognitive clutter with an interface stripped down to what matters most: pure time.
          </p>
        </div>

        <div
          className="flex flex-col gap-2 p-4 sm:p-5 rounded-2xl border transition-colors"
          style={{
            backgroundColor: 'var(--card-bottom)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-1">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3
            className="text-sm font-semibold transition-colors"
            style={{ color: 'var(--digit-color)' }}
          >
            Beautiful on your desk.
          </h3>
          <p
            className="text-xs leading-relaxed transition-colors opacity-80"
            style={{ color: 'var(--muted-color)' }}
          >
            Inspired by classic split-flap mechanical boards. Elevates your workspace monitor or iPad.
          </p>
        </div>

        <div
          className="flex flex-col gap-2 p-4 sm:p-5 rounded-2xl border transition-colors"
          style={{
            backgroundColor: 'var(--card-bottom)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3
            className="text-sm font-semibold transition-colors"
            style={{ color: 'var(--digit-color)' }}
          >
            Simple in seconds.
          </h3>
          <p
            className="text-xs leading-relaxed transition-colors opacity-80"
            style={{ color: 'var(--muted-color)' }}
          >
            Hit space to run, F for fullscreen, share custom timer links with a single click.
          </p>
        </div>
      </div>
    </div>
  );
};
