'use client';

import { useState } from 'react';
import { analysisResultSchema } from '@/modules/writing-flow/schemas/analysis.schema';
import { useFlowStore } from '@/modules/writing-flow/stores/use-flow-store';

// TODO Wave 3: migrate to TanStack Query mutation
type Status = 'idle' | 'pending' | 'success' | 'error';

type UseAnalyzeEssayReturn = {
  status: Status;
  error: string | null;
  isPending: boolean;
  analyze: (text: string) => Promise<void>;
};

export function useAnalyzeEssay(): UseAnalyzeEssayReturn {
  const setAnalysis = useFlowStore((s) => s.setAnalysis);
  const setStep = useFlowStore((s) => s.setStep);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const analyze = async (text: string): Promise<void> => {
    setStatus('pending');
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
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
      setAnalysis(validated.data);
      setStatus('success');
      setStep('review');
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
    analyze,
  };
}
