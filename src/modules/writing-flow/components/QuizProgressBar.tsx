'use client';

type QuizProgressBarProps = {
  step: 1 | 2;
};

export function QuizProgressBar({ step }: QuizProgressBarProps) {
  return (
    <div className="flex items-center gap-2.5" aria-hidden>
      <span className="block h-quiz-progress-bar-h w-quiz-progress-bar-w rounded-sm bg-nav-bg" />
      <span
        className={
          step === 2
            ? 'block h-quiz-progress-bar-h w-quiz-progress-bar-w rounded-sm bg-nav-bg'
            : 'block h-quiz-progress-bar-h w-quiz-progress-bar-w rounded-sm bg-line-strong'
        }
      />
    </div>
  );
}
