'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { QuizCompleteContent } from '@/modules/writing-flow/components/QuizCompleteContent';
import { QuizGapContent } from '@/modules/writing-flow/components/QuizGapContent';
import { QuizMcContent } from '@/modules/writing-flow/components/QuizMcContent';
import { useQuizGeneration } from '@/modules/writing-flow/hooks/use-quiz-generation';
import {
  selectQuiz,
  useFlowStore,
} from '@/modules/writing-flow/stores/use-flow-store';

const MODAL_TITLE_PREFIX = 'Sentence';

export function QuizModal() {
  const quiz = useFlowStore(selectQuiz);
  const closeQuiz = useFlowStore((s) => s.closeQuiz);
  const { status, error } = useQuizGeneration();

  useEffect(() => {
    if (!quiz.isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeQuiz();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [quiz.isOpen, closeQuiz]);

  if (!quiz.isOpen || quiz.sentenceIndex === null) {
    return null;
  }

  const sentenceNumber = quiz.sentenceIndex + 1;
  const title = `${MODAL_TITLE_PREFIX} ${sentenceNumber} · Introduction`;
  const isComplete = quiz.stage === 'complete';

  return (
    <div className="motion-fade-in fixed inset-0 z-50 flex items-center justify-center bg-overlay">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-modal-title"
        className="motion-pop-in relative flex max-h-[90vh] w-modal-w flex-col overflow-hidden rounded-panel bg-surface shadow-2xl"
      >
        <ModalHeader title={title} isComplete={isComplete} onClose={closeQuiz} />

        <div className="flex-1 overflow-y-auto">
          {quiz.questions === null ? (
            <QuizLoadingBody status={status} error={error} />
          ) : quiz.stage === 'mc' ? (
            <div key="mc" className="motion-fade-in-up">
              <QuizMcContent />
            </div>
          ) : quiz.stage === 'gap' ? (
            <div key="gap" className="motion-fade-in-up">
              <QuizGapContent />
            </div>
          ) : (
            <div key="complete" className="motion-fade-in-up">
              <QuizCompleteContent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModalHeader({
  title,
  isComplete,
  onClose,
}: {
  title: string;
  isComplete: boolean;
  onClose: () => void;
}) {
  return (
    <div className="relative h-modal-head w-modal-w rounded-t-panel bg-accent-violet-soft">
      {!isComplete ? (
        <>
          <h2
            id="quiz-modal-title"
            className="absolute left-5 top-3.5 text-modal-title font-extrabold text-ink-900"
          >
            {title}
          </h2>
          <p className="absolute left-5 top-9 text-modal-sub font-normal text-ink-900 opacity-45">
            Quick practice &middot; 2 questions
          </p>
        </>
      ) : (
        <h2 id="quiz-modal-title" className="sr-only">
          {title}
        </h2>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close quiz"
        className="motion-press absolute right-3 top-3 flex size-modal-close items-center justify-center rounded-pill bg-ink-900/10 text-ink-900 transition-colors hover:bg-ink-900/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-bg"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function QuizLoadingBody({
  status,
  error,
}: {
  status: 'idle' | 'pending' | 'success' | 'error';
  error: string | null;
}) {
  const message =
    status === 'error' ? (error ?? 'Could not load quiz.') : 'Generating quiz…';
  return (
    <div className="flex min-h-quiz-loading flex-col items-center justify-center gap-3 px-5 py-12">
      <div
        className="size-6 animate-spin rounded-pill border-2 border-line border-t-magenta"
        aria-hidden
      />
      <p role="status" className="text-base-13 font-semibold text-ink-600">
        {message}
      </p>
    </div>
  );
}
