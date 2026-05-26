'use client';

import { useState } from 'react';
import { analysisResultSchema } from '@/modules/writing-flow/schemas/analysis.schema';
import {
  essayFingerprint,
  wtJson,
  wtLog,
  wtRunId,
} from '@/modules/writing-flow/lib/debug-log';
import { mapToRubric } from '@/modules/writing-flow/lib/score-mapping';
import {
  selectPrompt,
  useFlowStore,
} from '@/modules/writing-flow/stores/use-flow-store';
import type { RunScoringSource } from '@/modules/writing-flow/types/flow.types';

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
  const setInitialAnalysis = useFlowStore((s) => s.setInitialAnalysis);
  const setResubmitAnalysis = useFlowStore((s) => s.setResubmitAnalysis);
  const appendRunLog = useFlowStore((s) => s.appendRunLog);
  const setStep = useFlowStore((s) => s.setStep);
  const prompt = useFlowStore(selectPrompt);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const analyze = async (text: string): Promise<void> => {
    setStatus('pending');
    setError(null);
    wtLog('analyze-client ◀ sending INITIAL run', {
      ...essayFingerprint(text),
      promptLength: prompt.length,
    });
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, prompt }),
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
      const debug = (json as { __debug?: Record<string, unknown> }).__debug;
      const validated = analysisResultSchema.safeParse(json);
      if (!validated.success) {
        wtLog('analyze-client ✕ invalid analysis response', json);
        setError('Invalid analysis response');
        setStatus('error');
        return;
      }
      setInitialAnalysis(validated.data);
      setResubmitAnalysis(null);
      setAnalysis(validated.data);

      const scoringSource =
        (debug?.scoringSource as RunScoringSource | undefined) ?? 'unknown';
      const overallPte = mapToRubric(validated.data.scores).overall;
      const runId =
        typeof debug?.requestId === 'string' ? debug.requestId : wtRunId();
      appendRunLog({
        runId,
        kind: 'initial',
        at: new Date().toISOString(),
        textLength: text.length,
        editCount: 0,
        scoringSource,
        scores: validated.data.scores,
        overallPte,
      });
      wtJson('analyze-client ▶ INITIAL run stored', {
        runId,
        scoringSource,
        overall1to5: validated.data.scores.overall,
        overallPte,
        serverDebug: debug ?? null,
      });
      wtJson(
        'analyze-client runLog (all runs saved separately)',
        useFlowStore.getState().runLog,
      );

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
