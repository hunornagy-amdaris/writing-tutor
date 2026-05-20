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
  return (
    <div
      role="tablist"
      aria-label="Brainstorm mode"
      className="flex h-mode-toggle w-mode-toggle-w items-center gap-0.5 rounded-pill border border-line bg-mode-toggle-bg p-0.5"
    >
      {OPTIONS.map((opt) => {
        const isActive = mode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.id)}
            className={`flex h-6 w-17 items-center justify-center rounded-pill text-meta font-bold transition-colors ${
              isActive
                ? 'bg-surface text-ink-700 shadow-sm'
                : 'bg-transparent text-ink-400'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
