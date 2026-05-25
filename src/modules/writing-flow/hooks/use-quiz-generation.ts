'use client';

import { useEffect, useState } from 'react';
import {
  quizGenerationResponseSchema,
  type quizGenerationRequestSchema,
} from '@/modules/writing-flow/schemas/quiz.schema';
import {
  selectAnalysis,
  selectPrompt,
  selectQuiz,
  useFlowStore,
} from '@/modules/writing-flow/stores/use-flow-store';
import type { z } from 'zod';

// TODO Wave 3 integration: Agent G2 ships the /api/quiz route.
// While that lands, this hook handles 404/network errors gracefully.

type QuizGenStatus = 'idle' | 'pending' | 'success' | 'error';

type UseQuizGenerationReturn = {
  status: QuizGenStatus;
  error: string | null;
};

type RequestBody = z.infer<typeof quizGenerationRequestSchema>;

export function useQuizGeneration(): UseQuizGenerationReturn {
  const quiz = useFlowStore(selectQuiz);
  const analysis = useFlowStore(selectAnalysis);
  const prompt = useFlowStore(selectPrompt);
  const setQuizQuestions = useFlowStore((s) => s.setQuizQuestions);

  const [status, setStatus] = useState<QuizGenStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const sentenceIndex = quiz.sentenceIndex;
  const isOpen = quiz.isOpen;
  const hasQuestions = quiz.questions !== null;

  useEffect(() => {
    if (!isOpen || sentenceIndex === null || hasQuestions) {
      return;
    }
    if (!analysis) {
      return;
    }
    const sentence = analysis.sentences[sentenceIndex];
    if (!sentence) {
      return;
    }

    const controller = new AbortController();

    const run = async (): Promise<void> => {
      setStatus('pending');
      setError(null);

      const body: RequestBody = {
        sentence: sentence.original,
        grammarEdits: sentence.grammar_edits,
        phraseologyFlags: sentence.phraseology_flags,
        prompt,
      };

      try {
        const res = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }
        const json: unknown = await res.json();
        const parsed = quizGenerationResponseSchema.safeParse(json);
        if (!parsed.success) {
          throw new Error('Invalid quiz response');
        }
        // Force MC to a strict 2-option compare: the student's original
        // (incorrect) sentence vs the corrected version from the analysis.
        // This bypasses any distractors the LLM may have generated.
        const overridden = {
          ...parsed.data,
          mc: {
            stem: 'Which sentence is correct?',
            options: [sentence.original, sentence.corrected],
            correctIndex: 1,
          },
        };
        setQuizQuestions(overridden);
        setStatus('success');
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setStatus('error');
      }
    };

    void run();

    return () => {
      controller.abort();
    };
  }, [isOpen, sentenceIndex, hasQuestions, analysis, prompt, setQuizQuestions]);

  return { status, error };
}
