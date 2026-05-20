import type { RubricCell, RubricScores } from '@/modules/writing-flow/lib/score-mapping';

type ScoreCardVariant = 'initial' | 'after';

type ScoreCardProps = {
  variant: ScoreCardVariant;
  rubric: RubricScores;
};

const HEADER_BG: Record<ScoreCardVariant, string> = {
  initial: 'bg-score-soft',
  after: 'bg-accent-violet',
};

const HEADER_LABEL: Record<ScoreCardVariant, string> = {
  initial: 'INITIAL SCORE',
  after: 'AFTER REVIEWING',
};

const BIG_NUM_COLOR: Record<ScoreCardVariant, string> = {
  initial: 'text-ink-400',
  after: 'text-ink-900',
};

const SLASH_COLOR: Record<ScoreCardVariant, string> = {
  initial: 'text-ink-600/50',
  after: 'text-ink-900/50',
};

const EYEBROW_COLOR: Record<ScoreCardVariant, string> = {
  initial: 'text-ink-400/50',
  after: 'text-ink-900/50',
};

export function ScoreCard({ variant, rubric }: ScoreCardProps) {
  return (
    <article className="w-score-card h-score-card-h overflow-hidden rounded-button border border-line bg-surface">
      <header
        className={`relative h-score-head w-full px-4 pt-1.5 ${HEADER_BG[variant]}`}
      >
        <div className="flex items-baseline gap-1">
          <span
            className={`text-score-big font-extrabold ${BIG_NUM_COLOR[variant]}`}
          >
            {rubric.overall}
          </span>
          <span
            className={`text-score-slash font-semibold ${SLASH_COLOR[variant]}`}
          >
            / {rubric.overallOutOf}
          </span>
        </div>
        <p
          className={`mt-0.5 text-cell-label font-bold ${EYEBROW_COLOR[variant]}`}
        >
          {HEADER_LABEL[variant]}
        </p>
      </header>

      <div className="grid grid-cols-4 grid-rows-2">
        {rubric.cells.map((cell) => (
          <ScoreCardCell key={cell.key} cell={cell} />
        ))}
      </div>
    </article>
  );
}

function ScoreCardCell({ cell }: { cell: RubricCell }) {
  const isFull = cell.numerator >= cell.denominator;
  const numColor = isFull ? 'text-success-bright' : 'text-danger';

  return (
    <div className="w-score-cell h-score-cell-h border border-line bg-surface px-1.5 pt-1.5">
      <p className={`text-cell-num font-extrabold ${numColor}`}>
        {cell.numerator}/{cell.denominator}
      </p>
      <p className="mt-2.5 text-cell-label font-bold text-ink-300">
        {cell.label}
      </p>
    </div>
  );
}
