'use client';

import type { BrainstormMode } from '@/modules/writing-flow/types/flow.types';

type BrainstormModeToggleProps = {
  mode: BrainstormMode;
  onChange: (mode: BrainstormMode) => void;
};

const OPTIONS: { id: BrainstormMode; label: string }[] = [
  { id: 'type', label: 'Type' },
  { id: 'voice', label: 'Voice' },
];

export function BrainstormModeToggle({
  mode,
  onChange,
}: BrainstormModeToggleProps) {
  const isVoice = mode === 'voice';
  return (
    <div
      role="tablist"
      aria-label="Brainstorm mode"
      className="relative flex h-mode-toggle w-mode-toggle-w items-center gap-0.5 rounded-pill border border-line bg-mode-toggle-bg p-0.5"
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute top-0.5 left-0.5 h-6 w-17 rounded-pill bg-surface shadow-sm transition-transform duration-base ease-out-quart ${
          isVoice ? 'translate-x-17' : 'translate-x-0'
        }`}
      />
      {OPTIONS.map((opt) => {
        const isActive = mode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.id)}
            className={`motion-press relative z-10 flex h-6 w-17 items-center justify-center rounded-pill text-meta font-bold ${
              isActive ? 'text-ink-700' : 'text-ink-400'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
