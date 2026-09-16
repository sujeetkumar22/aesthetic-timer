import React, { useState, useRef, useEffect } from 'react';
import { Target, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FocusIntentionProps {
  intention: string;
  onUpdateIntention: (goal: string) => void;
  className?: string;
}

export const FocusIntention: React.FC<FocusIntentionProps> = ({
  intention,
  onUpdateIntention,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(intention || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(intention || '');
  }, [intention]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onUpdateIntention(value.trim());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(intention);
      setIsEditing(false);
    }
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.3 },
      });
    } catch (err) {}
    onUpdateIntention('');
  };

  if (isEditing) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md animate-fade-in ${className}`}
        style={{
          backgroundColor: 'var(--card-top)',
          borderColor: 'var(--border-color)',
          color: 'var(--digit-color)',
        }}
      >
        <Target className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder="What is your focus goal?"
          maxLength={60}
          className="bg-transparent text-xs font-medium focus:outline-none w-48 sm:w-64 placeholder:text-neutral-500"
        />
        <button
          onClick={handleSave}
          className="p-1 hover:opacity-100 opacity-60 transition-opacity"
          aria-label="Save goal"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (intention) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        className={`group flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md cursor-pointer transition-all hover:scale-[1.02] ${className}`}
        style={{
          backgroundColor: 'var(--card-top)',
          borderColor: 'var(--border-color)',
          color: 'var(--digit-color)',
        }}
        title="Click to edit focus intention"
      >
        <Target className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
        <span className="text-xs font-medium tracking-wide truncate max-w-[200px] sm:max-w-[320px]">
          {intention}
        </span>
        <button
          onClick={handleComplete}
          className="p-0.5 rounded-full hover:bg-emerald-500/20 text-neutral-400 hover:text-emerald-400 transition-colors ml-1"
          title="Mark complete!"
          aria-label="Mark intention complete"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdateIntention('');
          }}
          className="p-0.5 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-60 transition-opacity"
          title="Clear intention"
          aria-label="Clear intention"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs opacity-40 hover:opacity-90 hover:bg-white/5 transition-all border border-transparent hover:border-white/10 ${className}`}
      style={{ color: 'var(--muted-color)' }}
    >
      <Target className="w-3 h-3" />
      <span>Set focus intention</span>
    </button>
  );
};
