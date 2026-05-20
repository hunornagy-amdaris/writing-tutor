'use client';

type QuickActionChipProps = {
  emoji: string;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export function QuickActionChip({
  emoji,
  label,
  selected = false,
  disabled = false,
  onClick,
}: QuickActionChipProps) {
  const bg = selected ? 'bg-accent-violet' : 'bg-surface-muted';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`motion-press flex h-mode-toggle items-center justify-center gap-1 rounded-pill border border-line px-3 py-2 text-meta font-bold text-ink-900 ${bg} disabled:opacity-50`}
    >
      <span aria-hidden>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}
