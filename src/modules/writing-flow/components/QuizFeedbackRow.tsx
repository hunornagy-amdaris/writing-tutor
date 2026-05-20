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
          ? 'motion-fade-in-up flex min-h-quiz-fb-h flex-1 items-center rounded-button bg-success-soft px-4 py-2 text-meta font-semibold text-success'
          : 'motion-fade-in-up flex min-h-quiz-fb-h flex-1 items-center rounded-button bg-danger-soft px-4 py-2 text-meta font-semibold text-danger'
      }
    >
      <span className="break-words">
        {correct ? '✓ Perfect.' : '✗ Not quite — see below.'}
      </span>
    </div>
  );
}
