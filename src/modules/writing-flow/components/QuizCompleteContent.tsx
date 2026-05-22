'use client';

import { Loader2 } from 'lucide-react';
import { useResubmitEssay } from '@/modules/writing-flow/hooks/use-resubmit-essay';
import {
  selectAnalysis,
  selectQuiz,
  useFlowStore,
} from '@/modules/writing-flow/stores/use-flow-store';

export function QuizCompleteContent() {
  const quiz = useFlowStore(selectQuiz);
  const analysis = useFlowStore(selectAnalysis);
  const closeQuiz = useFlowStore((s) => s.closeQuiz);
  const commitSentenceEdit = useFlowStore((s) => s.commitSentenceEdit);
  const { resubmit, isPending } = useResubmitEssay();

  if (!quiz.questions) return null;

  const handleDone = () => {
    if (quiz.sentenceIndex !== null && analysis) {
      const sentence = analysis.sentences[quiz.sentenceIndex];
      const correctedText = sentence?.corrected?.trim();
      if (correctedText) {
        commitSentenceEdit(quiz.sentenceIndex, correctedText);
      }
    }
    closeQuiz();
    void resubmit();
  };

  return (
    <div className="flex flex-col items-center gap-4 px-6 pt-4 pb-6">
      <p
        aria-hidden
        className="motion-pop-in text-quiz-emoji font-normal text-ink-900"
      >
        ✅
      </p>

      <div className="flex min-h-quiz-rule-h w-full max-w-quiz-fb-w items-center rounded-button bg-surface-muted px-5 py-4">
        <p className="text-base-13 leading-relaxed font-normal text-ink-900">
          {quiz.questions.rule}
        </p>
      </div>

      <button
        type="button"
        onClick={handleDone}
        disabled={isPending}
        className="motion-press mt-2 flex h-quiz-continue-h w-quiz-continue-w items-center justify-center gap-2 rounded-pill bg-magenta px-3 py-2 text-quiz-body font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-bg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {isPending ? 'Re-analyzing…' : 'Apply fix & continue →'}
      </button>
    </div>
  );
}
