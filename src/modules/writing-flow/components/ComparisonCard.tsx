import type { SentenceFixPair } from '@/modules/writing-flow/types/review.types';

type ComparisonCardProps = {
  pair: NonNullable<SentenceFixPair>;
};

export function ComparisonCard({ pair }: ComparisonCardProps) {
  return (
    <div className="w-full overflow-hidden rounded-button border border-line bg-canvas">
      <div className="flex items-center gap-3 px-3 py-2">
        <span className="text-eyebrow font-bold text-danger">YOURS</span>
        <span className="text-base-13 font-normal text-ink-900">{pair.yours}</span>
      </div>
      <div className="h-px w-full bg-line" aria-hidden />
      <div className="flex items-center gap-3 px-3 py-2">
        <span className="text-eyebrow font-bold text-success">BETTER</span>
        <span className="text-base-13 font-bold text-ink-900">{pair.better}</span>
      </div>
    </div>
  );
}
