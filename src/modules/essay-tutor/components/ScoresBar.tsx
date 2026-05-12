'use client';

import { useTutorStore } from '@/modules/essay-tutor/stores/use-tutor-store';
import type { EssayScores } from '@/modules/essay-tutor/types/analysis.types';

function getRingClass(score: number): string {
  if (score >= 4) return 'bg-feedback-correct-bg text-feedback-correct ring-feedback-correct/30';
  if (score >= 3) return 'bg-pearson-yellow/20 text-pearson-navy ring-pearson-yellow/40';
  return 'bg-feedback-incorrect-bg text-feedback-incorrect ring-feedback-incorrect/30';
}

const LABELS: Record<keyof EssayScores, string> = {
  cohesion: 'Cohesion',
  syntax: 'Syntax',
  vocabulary: 'Vocabulary',
  phraseology: 'Phraseology',
  grammar: 'Grammar',
  conventions: 'Conventions',
  overall: 'Overall',
};

export function ScoresBar() {
  const analysis = useTutorStore((state) => state.analysis);

  if (!analysis) return null;

  const entries = Object.entries(analysis.scores) as Array<
    [keyof EssayScores, number]
  >;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-pearson-navy/5">
      <div className="mb-3 font-open-sans text-xs font-semibold uppercase tracking-wider text-text-secondary">
        Essay scores
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {entries.map(([key, score]) => (
          <div
            key={key}
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-3 ring-1 ${getRingClass(score)}`}
          >
            <span className="font-open-sans text-2xl font-bold leading-none">
              {score.toFixed(1)}
            </span>
            <span className="mt-1 font-open-sans text-[10px] font-semibold uppercase tracking-wider opacity-80">
              {LABELS[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
