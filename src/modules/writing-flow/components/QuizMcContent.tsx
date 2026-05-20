'use client';

import { QuizFeedbackRow } from '@/modules/writing-flow/components/QuizFeedbackRow';
import { QuizProgressBar } from '@/modules/writing-flow/components/QuizProgressBar';
import {
  selectQuiz,
  useFlowStore,
} from '@/modules/writing-flow/stores/use-flow-store';

export function QuizMcContent() {
  const quiz = useFlowStore(selectQuiz);
  const setMcChoice = useFlowStore((s) => s.setMcChoice);
  const submitMc = useFlowStore((s) => s.submitMc);
  const nextQuestion = useFlowStore((s) => s.nextQuestion);

  if (!quiz.questions) return null;

  const { mc } = quiz.questions;
  const hasResult = quiz.mcCorrect !== null;

  const handleCheck = () => {
    if (!hasResult) {
      submitMc();
      return;
    }
    nextQuestion();
  };

  return (
    <div className="flex flex-col gap-4 px-6 pt-4 pb-6">
      <QuizProgressBar step={1} />

      <div className="flex flex-col gap-1">
        <p className="text-eyebrow font-bold text-ink-400">
          QUESTION 1 OF 2 &middot; CHOOSE THE CORRECT VERSION
        </p>
        <p className="text-quiz-body font-bold text-nav-bg">
          Which sentence is correct?
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {mc.options.map((opt) => {
          const isSelected = quiz.mcChoice === opt;
          return (
            <li key={opt}>
              <button
                type="button"
                onClick={() => setMcChoice(opt)}
                aria-pressed={isSelected}
                className={
                  isSelected
                    ? 'motion-press flex min-h-11 w-full items-center rounded-button border-2 border-accent-violet bg-accent-violet-soft px-4 py-3 text-left text-base-13 font-semibold text-ink-900 break-words transition-colors hover:bg-accent-violet-soft/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-bg'
                    : 'motion-press flex min-h-11 w-full items-center rounded-button border border-line bg-surface px-4 py-3 text-left text-base-13 font-normal text-ink-900 break-words transition-colors hover:border-line-strong hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-bg'
                }
              >
                <span className="block w-full whitespace-normal">{opt}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {hasResult ? (
          <QuizFeedbackRow correct={quiz.mcCorrect === true} />
        ) : (
          <span aria-hidden />
        )}
        <button
          type="button"
          onClick={handleCheck}
          disabled={quiz.mcChoice === null}
          className="motion-press flex h-quiz-check-h w-quiz-check-w shrink-0 items-center justify-center rounded-pill bg-magenta px-3 py-2 text-meta font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-bg disabled:opacity-50"
        >
          {hasResult ? 'Next →' : 'Check →'}
        </button>
      </div>
    </div>
  );
}
