'use client';

import { ReflectCard } from '@/modules/writing-flow/components/ReflectCard';
import { ScoreCard } from '@/modules/writing-flow/components/ScoreCard';
import { mapToRubric } from '@/modules/writing-flow/lib/score-mapping';
import {
  selectAnalysis,
  selectScoreAfterEdits,
  useFlowStore,
} from '@/modules/writing-flow/stores/use-flow-store';

// TODO Wave 4+: wire real student name from session/user
const STUDENT_NAME = 'Sofia';

// TODO Wave 4+: generate reflect bodies via AI from session history.
const REFLECT_PATTERN_EYEBROW = 'Pattern across 3 sessions';
const REFLECT_PATTERN_BODY =
  'Uncountable nouns have come up three times. What do you notice about when you make this error — is it specific types of nouns, or specific topics?';
const REFLECT_NEXT_EYEBROW = 'Something to explore next';
const REFLECT_NEXT_BODY =
  'Your sentence structures are consistent — a real strength. But Linguistic Range is still capping you. Try varying your sentence openings in the next session.';

export function ScoreScreen() {
  const analysis = useFlowStore(selectAnalysis);
  const scoreAfterEdits = useFlowStore(selectScoreAfterEdits);
  const reset = useFlowStore((s) => s.reset);

  if (!analysis) {
    return (
      <main className="px-nav-x py-12 text-ink-600">
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
    <main className="mx-auto w-reflect-card pt-10 pb-12">
      <h1 className="text-display-26 font-extrabold text-nav-bg">
        Good work, {STUDENT_NAME} 🎉
      </h1>

      <p className="mt-1 text-base-13 font-normal text-ink-600">
        Session 12 · DST essay · Estimated score based on PTE Academic rubric
      </p>

      <p className="mt-4 text-tiny font-bold text-nav-bg">YOUR SCORE</p>

      <div className="mt-2 flex gap-6">
        <ScoreCard variant="initial" rubric={initialRubric} />
        <ScoreCard variant="after" rubric={afterRubric} />
      </div>

      <p className="mt-10 text-tiny font-bold text-nav-bg">REFLECT &amp; PLAN</p>

      <div className="mt-2 flex flex-col gap-3.5">
        <ReflectCard eyebrow={REFLECT_PATTERN_EYEBROW} body={REFLECT_PATTERN_BODY} />
        <ReflectCard eyebrow={REFLECT_NEXT_EYEBROW} body={REFLECT_NEXT_BODY} />
      </div>

      <div className="mt-7 flex items-center justify-between">
        <button
          type="button"
          onClick={handleDone}
          className="inline-flex w-score-btn-done h-score-btn-h items-center justify-center rounded-pill border-2 border-line bg-surface text-base-13 font-semibold text-ink-600 transition-opacity duration-200 ease-out hover:opacity-90"
        >
          Done for today
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex w-score-btn-next h-score-btn-h items-center justify-center rounded-pill bg-magenta text-base-13 font-bold text-white transition-opacity duration-200 ease-out hover:opacity-90"
        >
          Start next session →
        </button>
      </div>
    </main>
  );
}
