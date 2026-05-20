'use client';

type QuizFeedbackRowProps = {
  correct: boolean;
};

export function QuizFeedbackRow({ correct }: QuizFeedbackRowProps) {
  return (
    <div
      role="status"
      className={
        correct
          ? 'motion-fade-in-up flex h-quiz-fb-h flex-1 items-center rounded-button bg-success-soft px-3 text-meta font-semibold text-success'
          : 'motion-fade-in-up flex h-quiz-fb-h flex-1 items-center rounded-button bg-danger-soft px-3 text-meta font-semibold text-danger'
      }
    >
      {correct ? '✓ Perfect.' : '✗ Not quite — see below.'}
    </div>
  );
}
