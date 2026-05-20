'use client';

import {
  selectQuiz,
  useFlowStore,
} from '@/modules/writing-flow/stores/use-flow-store';

export function QuizCompleteContent() {
  const quiz = useFlowStore(selectQuiz);
  const closeQuiz = useFlowStore((s) => s.closeQuiz);

  if (!quiz.questions) return null;

  return (
    <div className="flex flex-col items-center gap-3 px-5 pt-3">
      <p
        aria-hidden
        className="text-quiz-emoji font-normal text-ink-900"
      >
        ✅
      </p>

      <div className="flex h-quiz-rule-h w-quiz-fb-w items-center rounded-button bg-surface px-4 py-3">
        <p className="text-base-13 font-normal text-ink-900">{quiz.questions.rule}</p>
      </div>

      <button
        type="button"
        onClick={closeQuiz}
        className="flex h-quiz-continue-h w-quiz-continue-w items-center justify-center rounded-pill bg-magenta px-3 py-2 text-quiz-body font-bold text-white"
      >
        Continue reviewing →
      </button>
    </div>
  );
}
