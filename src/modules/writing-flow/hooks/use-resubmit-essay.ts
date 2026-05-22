'use client';

import { useState } from 'react';
import { analysisResultSchema } from '@/modules/writing-flow/schemas/analysis.schema';
import { assembleEditedEssay } from '@/modules/writing-flow/lib/assemble-edited-essay';
import {
  selectAnalysis,
  selectEdits,
  selectPrompt,
  useFlowStore,
} from '@/modules/writing-flow/stores/use-flow-store';

// TODO Wave 4 TanStack: migrate to a useMutation hook
type Status = 'idle' | 'pending' | 'success' | 'error';

type UseResubmitEssayReturn = {
  status: Status;
  error: string | null;
  isPending: boolean;
  resubmit: () => Promise<void>;
};

export function useResubmitEssay(): UseResubmitEssayReturn {
  const analysis = useFlowStore(selectAnalysis);
  const edits = useFlowStore(selectEdits);
  const prompt = useFlowStore(selectPrompt);
  const setScoreAfterEdits = useFlowStore((s) => s.setScoreAfterEdits);
  const setStep = useFlowStore((s) => s.setStep);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const resubmit = async (): Promise<void> => {
    if (!analysis) {
      setError('No analysis to resubmit');
      setStatus('error');
      return;
    }

    setStatus('pending');
    setError(null);

    const text = assembleEditedEssay(analysis, edits);

    const requestBody = {
      text,
      prompt,
    };

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
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
      const validated = analysisResultSchema.safeParse(json);
      if (!validated.success) {
        setError('Invalid analysis response');
        setStatus('error');
        return;
      }
      setScoreAfterEdits(validated.data.scores);
      setStatus('success');
      setStep('score');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setStatus('error');
    }
  };

  return {
    status,
    error,
    isPending: status === 'pending',
    resubmit,
  };
}
