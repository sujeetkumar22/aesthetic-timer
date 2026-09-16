import React from 'react';

interface PresetSelectorProps {
  selectedDuration: number;
  onSelect: (seconds: number) => void;
  className?: string;
}

const PRESETS = [
  { label: '5m', seconds: 5 * 60 },
  { label: '15m', seconds: 15 * 60 },
  { label: '25m', seconds: 25 * 60 },
  { label: '45m', seconds: 45 * 60 },
  { label: '1h', seconds: 60 * 60 },
  { label: '1.5h', seconds: 90 * 60 },
  { label: '2h', seconds: 120 * 60 },
  { label: '2h 45m', seconds: (2 * 60 + 45) * 60 },
  { label: '3h', seconds: 180 * 60 },
];

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  selectedDuration,
  onSelect,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 ${className}`}>
      {PRESETS.map((preset) => {
        const isSelected = selectedDuration === preset.seconds;
        return (
          <button
            key={preset.label}
            onClick={() => onSelect(preset.seconds)}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all active:scale-95 border ${
              isSelected ? 'font-bold shadow-md' : 'opacity-80 hover:opacity-100'
            }`}
            style={{
              backgroundColor: isSelected ? 'var(--digit-color)' : 'var(--card-top)',
              color: isSelected ? 'var(--bg-color)' : 'var(--digit-color)',
              borderColor: isSelected ? 'var(--digit-color)' : 'var(--border-color)',
            }}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
};
