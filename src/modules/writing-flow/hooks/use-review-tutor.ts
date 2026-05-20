'use client';

import { useCallback, useState } from 'react';
import { reviewTutorResponseSchema } from '@/modules/writing-flow/schemas/review-tutor.schema';
import {
  selectAnalysis,
  selectPrompt,
  selectReviewMessages,
  selectSelectedSentenceIndex,
  useFlowStore,
} from '@/modules/writing-flow/stores/use-flow-store';
import type { ReviewChatMessage } from '@/modules/writing-flow/types/flow.types';

type Status = 'idle' | 'pending' | 'success' | 'error';

type UseReviewTutorReturn = {
  status: Status;
  error: string | null;
  isPending: boolean;
  sendMessage: (text: string) => Promise<void>;
};

function createMessageId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `review-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function useReviewTutor(): UseReviewTutorReturn {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const prompt = useFlowStore(selectPrompt);
  const analysis = useFlowStore(selectAnalysis);
  const selectedSentenceIndex = useFlowStore(selectSelectedSentenceIndex);
  const reviewMessages = useFlowStore(selectReviewMessages);
  const addReviewMessage = useFlowStore((s) => s.addReviewMessage);

  const sendMessage = useCallback(
    async (text: string): Promise<void> => {
      const trimmed = text.trim();
      if (trimmed.length === 0) return;
      if (selectedSentenceIndex === null) return;
      if (!analysis) return;
      const sentence = analysis.sentences[selectedSentenceIndex];
      if (!sentence) return;

      const userMessage: ReviewChatMessage = {
        id: createMessageId(),
        role: 'user',
        content: trimmed,
        sentenceIndex: selectedSentenceIndex,
      };
      addReviewMessage(userMessage);

      const conversation = [
        ...reviewMessages.filter(
          (m) => m.sentenceIndex === selectedSentenceIndex,
        ),
        userMessage,
      ].map(({ role, content }) => ({ role, content }));

      setStatus('pending');
      setError(null);
      try {
        const res = await fetch('/api/review-tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            sentence: {
              original: sentence.original,
              corrected: sentence.corrected,
              grammarEdits: sentence.grammar_edits,
              phraseologyFlags: sentence.phraseology_flags,
              index: selectedSentenceIndex,
            },
            messages: conversation,
          }),
        });

        if (!res.ok) {
          const data: unknown = await res.json().catch(() => ({}));
          const message =
            typeof data === 'object' && data !== null && 'error' in data
              ? String((data as { error: unknown }).error)
              : `Request failed (${res.status})`;
          setError(message);
          setStatus('error');
          return;
        }

        const json: unknown = await res.json();
        const validated = reviewTutorResponseSchema.safeParse(json);
        if (!validated.success) {
          setError('Invalid tutor response');
          setStatus('error');
          return;
        }

        addReviewMessage({
          id: createMessageId(),
          role: 'ai',
          content: validated.data.message,
          sentenceIndex: selectedSentenceIndex,
        });
        setStatus('success');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setStatus('error');
      }
    },
    [
      addReviewMessage,
      analysis,
      prompt,
      reviewMessages,
      selectedSentenceIndex,
    ],
  );

  return {
    status,
    error,
    isPending: status === 'pending',
    sendMessage,
  };
}
