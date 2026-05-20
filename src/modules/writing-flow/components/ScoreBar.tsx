import type { ScoreBarData, ScoreBarCellValue } from '@/modules/writing-flow/types/review.types';

type ScoreBarProps = {
  data: ScoreBarData;
};

export function ScoreBar({ data }: ScoreBarProps) {
  return (
    <section
      aria-label="Overall score"
      className="motion-fade-in-up flex h-score-bar w-full items-center rounded-card border border-line bg-surface px-3"
    >
      <div className="flex h-score-overall-h w-score-overall items-center rounded-button bg-accent-violet-soft px-3">
        <span className="text-2xl font-extrabold leading-none text-ink-600">
          {data.overall}
        </span>
        <span className="ml-1 self-end pb-1 text-eyebrow font-semibold text-ink-600/40">
          /{data.overallOutOf}
        </span>
      </div>
      <div className="mx-3 h-score-divider w-px bg-line" aria-hidden />
      <ul className="flex flex-1 items-center justify-between">
        {data.cells.map((cell) => (
          <ScoreCell key={cell.key} cell={cell} />
        ))}
      </ul>
    </section>
  );
}

function ScoreCell({ cell }: { cell: ScoreBarCellValue }) {
  const isPerfect = cell.numerator >= cell.denominator;
  const numColor = isPerfect ? 'text-success' : 'text-danger';
  return (
    <li className="flex flex-col items-start gap-0.5">
      <span className={`text-sm font-extrabold leading-tight ${numColor}`}>
        {cell.numerator}/{cell.denominator}
      </span>
      <span className="text-tiny font-bold text-ink-400">{cell.label}</span>
    </li>
  );
}
