'use client';

type StartWritingButtonProps = {
  onClick: () => void;
};

export function StartWritingButton({ onClick }: StartWritingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="motion-press motion-fade-in-up flex h-see-score items-center justify-center rounded-pill bg-magenta px-3 py-2 text-xs font-bold text-surface"
    >
      Start writing →
    </button>
  );
}
