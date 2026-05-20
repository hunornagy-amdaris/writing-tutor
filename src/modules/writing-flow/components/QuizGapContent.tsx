'use client';

import { QuizFeedbackRow } from '@/modules/writing-flow/components/QuizFeedbackRow';
import { QuizProgressBar } from '@/modules/writing-flow/components/QuizProgressBar';
import {
  selectQuiz,
  useFlowStore,
} from '@/modules/writing-flow/stores/use-flow-store';

export function QuizGapContent() {
  const quiz = useFlowStore(selectQuiz);
  const setGapAnswer = useFlowStore((s) => s.setGapAnswer);
  const submitGap = useFlowStore((s) => s.submitGap);
  const nextQuestion = useFlowStore((s) => s.nextQuestion);

  if (!quiz.questions) return null;

  const { gap } = quiz.questions;
  const hasResult = quiz.gapCorrect !== null;

  const handleCheck = () => {
    if (!hasResult) {
      submitGap();
      return;
    }
    nextQuestion();
  };

  return (
    <div className="flex flex-col gap-4 px-6 pt-4 pb-6">
      <QuizProgressBar step={2} />

      <div className="flex flex-col gap-1">
        <p className="text-eyebrow font-bold text-ink-400">
          QUESTION 2 OF 2 &middot; FILL IN THE MISSING WORD
        </p>
        <p className="text-quiz-body font-bold text-nav-bg">Complete the sentence:</p>
      </div>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-3 text-quiz-body font-normal leading-relaxed text-ink-900">
        <span className="break-words">{gap.before}</span>
        <input
          type="text"
          value={quiz.gapAnswer}
          onChange={(e) => setGapAnswer(e.target.value)}
          aria-label="Fill in the missing word"
          className="inline-block h-quiz-gap-h min-w-quiz-gap-w rounded-md border-2 border-line-strong bg-surface-muted px-3 py-1.5 text-modal-title font-bold text-nav-bg transition-colors focus:border-magenta focus:bg-surface focus:outline-none"
        />
        <span className="break-words">{gap.after}</span>
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {hasResult ? (
          <QuizFeedbackRow correct={quiz.gapCorrect === true} />
        ) : (
          <span aria-hidden />
        )}
        <button
          type="button"
          onClick={handleCheck}
          disabled={quiz.gapAnswer.trim().length === 0}
          className="motion-press flex h-quiz-check-h w-quiz-check-w shrink-0 items-center justify-center rounded-pill bg-magenta px-3 py-2 text-meta font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-bg disabled:opacity-50"
        >
          {hasResult ? 'Next →' : 'Check →'}
        </button>
      </div>
    </div>
  );
}
