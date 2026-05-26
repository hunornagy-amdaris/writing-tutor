'use client';

import { useState } from 'react';
import { analysisResultSchema } from '@/modules/writing-flow/schemas/analysis.schema';
import { assembleEditedEssay } from '@/modules/writing-flow/lib/assemble-edited-essay';
import {
  essayFingerprint,
  wtLog,
  wtRunId,
} from '@/modules/writing-flow/lib/debug-log';
import { mapToRubric } from '@/modules/writing-flow/lib/score-mapping';
import { useFlowStore } from '@/modules/writing-flow/stores/use-flow-store';
import type { RunScoringSource } from '@/modules/writing-flow/types/flow.types';

// TODO Wave 4 TanStack: migrate to a useMutation hook
type Status = 'idle' | 'pending' | 'success' | 'error';

type UseResubmitEssayReturn = {
  status: Status;
  error: string | null;
  isPending: boolean;
  resubmit: () => Promise<boolean>;
};

export function useResubmitEssay(): UseResubmitEssayReturn {
  const setResubmitAnalysis = useFlowStore((s) => s.setResubmitAnalysis);
  const setAnalysis = useFlowStore((s) => s.setAnalysis);
  const appendRunLog = useFlowStore((s) => s.appendRunLog);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const resubmit = async (): Promise<boolean> => {
    // Read the LATEST store state at call time. Closing over the values
    // captured at render time creates a stale-closure bug when the caller
    // updates the store immediately before calling resubmit() — e.g. the
    // quiz completion handler that commits the corrected sentence and then
    // fires resubmit synchronously in the same event handler.
    const state = useFlowStore.getState();
    const analysis = state.analysis;
    const edits = state.edits;
    const prompt = state.prompt;

    if (!analysis) {
      setError('No analysis to resubmit');
      setStatus('error');
      return false;
    }

    setStatus('pending');
    setError(null);

    const text = assembleEditedEssay(analysis, edits);

    const requestBody: {
      text: string;
      prompt: string;
      kevsun_anchor?: { min: number; max: number };
    } = { text, prompt };
    if (analysis.kevsun_anchor) {
      requestBody.kevsun_anchor = analysis.kevsun_anchor;
    }

    const editCount = Object.keys(edits).length;
    wtLog('resubmit ◀ sending RESUBMIT run', {
      editedSentenceIndices: Object.keys(edits),
      editCount,
      edits,
      assembledText: essayFingerprint(text),
      kevsunAnchorSent: requestBody.kevsun_anchor ?? null,
    });

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
        return false;
      }
      const json: unknown = await res.json();
      const validated = analysisResultSchema.safeParse(json);
      if (!validated.success) {
        setError('Invalid analysis response');
        setStatus('error');
        return false;
      }
      // Carry over the original kevsun_anchor so re-checks keep scoring against
      // the same band. initialAnalysis is left untouched for the side-by-side.
      const resubmitResult = {
        ...validated.data,
        kevsun_anchor: analysis.kevsun_anchor ?? validated.data.kevsun_anchor,
      };
      setResubmitAnalysis(resubmitResult);
      setAnalysis(resubmitResult);
      useFlowStore.setState({ edits: {}, fixedSentenceIndices: [] });

      const debug = (json as { __debug?: Record<string, unknown> }).__debug;
      const scoringSource =
        (debug?.scoringSource as RunScoringSource | undefined) ?? 'unknown';
      const overallPte = mapToRubric(resubmitResult.scores).overall;
      const runId =
        typeof debug?.requestId === 'string' ? debug.requestId : wtRunId();
      appendRunLog({
        runId,
        kind: 'resubmit',
        at: new Date().toISOString(),
        textLength: text.length,
        editCount,
        scoringSource,
        scores: resubmitResult.scores,
        overallPte,
      });

      const initialPte = state.initialAnalysis
        ? mapToRubric(state.initialAnalysis.scores).overall
        : null;
      wtLog('resubmit ▶ COMPARISON initial → after', {
        initialOverall1to5: state.initialAnalysis?.scores.overall ?? null,
        afterOverall1to5: resubmitResult.scores.overall,
        initialPte,
        afterPte: overallPte,
        deltaPte: initialPte !== null ? overallPte - initialPte : null,
        verdict:
          initialPte === null
            ? 'n/a'
            : overallPte > initialPte
              ? 'IMPROVED ✓'
              : overallPte === initialPte
                ? 'NO CHANGE'
                : 'DROPPED ✕',
        afterScoringSource: scoringSource,
        serverDebug: debug ?? null,
      });
      wtLog(
        'resubmit runLog (all runs saved separately)',
        useFlowStore.getState().runLog,
      );

      setStatus('success');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setStatus('error');
      return false;
    }
  };

  return {
    status,
    error,
    isPending: status === 'pending',
    resubmit,
  };
}
