'use client';

import { ScoreCard } from '@/modules/writing-flow/components/ScoreCard';
import { mapToRubric } from '@/modules/writing-flow/lib/score-mapping';
import {
  selectAnalysis,
  selectScoreAfterEdits,
  useFlowStore,
} from '@/modules/writing-flow/stores/use-flow-store';

// TODO Wave 4+: wire real student name from session/user
const STUDENT_NAME = 'Sofia';

export function ScoreScreen() {
  const analysis = useFlowStore(selectAnalysis);
  const scoreAfterEdits = useFlowStore(selectScoreAfterEdits);
  const reset = useFlowStore((s) => s.reset);

  if (!analysis) {
    return (
      <main className="app-container py-12 text-ink-600">
        <p className="text-base-13">No analysis available yet.</p>
      </main>
    );
  }

  const initialRubric = mapToRubric(analysis.scores);
  const afterRubric = mapToRubric(scoreAfterEdits ?? analysis.scores);

  const handleDone = (): void => {
    reset();
  };

  const handleNext = (): void => {
    reset();
  };

  return (
    <main className="motion-fade-in-up w-full pt-6 pb-12">
      <div className="mx-auto w-reflect-card">
        <h1 className="motion-fade-in-up text-display-26 font-extrabold text-nav-bg">
          Good work, {STUDENT_NAME} 🎉
        </h1>

        <p className="motion-fade-in-up mt-2 text-base-13 font-normal text-ink-600">
          Session 12 · DST essay · Estimated score based on PTE Academic rubric
        </p>

        <p className="mt-4 text-tiny font-bold text-nav-bg">YOUR SCORE</p>

        <div className="mt-2 flex gap-6">
          <ScoreCard variant="initial" rubric={initialRubric} />
          <ScoreCard variant="after" rubric={afterRubric} />
        </div>

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDone}
            className="motion-press inline-flex w-score-btn-done h-score-btn-h items-center justify-center rounded-pill border-2 border-line bg-surface text-base-13 font-semibold text-ink-600 transition-opacity duration-200 ease-out hover:opacity-90"
          >
            Done for today
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="motion-press inline-flex w-score-btn-next h-score-btn-h items-center justify-center rounded-pill bg-magenta text-base-13 font-bold text-white transition-opacity duration-200 ease-out hover:opacity-90"
          >
            Start next session →
          </button>
        </div>
      </div>
    </main>
  );
}
