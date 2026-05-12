'use client';

import { useState } from 'react';
import { useTutorStore } from '@/modules/essay-tutor/stores/use-tutor-store';
import { SAMPLES } from '@/modules/essay-tutor/constants/samples';
import type { AnalysisResult } from '@/modules/essay-tutor/types/analysis.types';

export function EssayInput() {
  const setAnalysis = useTutorStore((s) => s.setAnalysis);
  const [text, setText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  async function handleSubmit() {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Request failed with status ${res.status}`);
      }
      const data = (await res.json()) as AnalysisResult;
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-pearson-navy/5 md:p-8">
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="mr-1 self-center font-open-sans text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Try a sample:
        </span>
        <button
          type="button"
          onClick={() => setText(SAMPLES.a1)}
          className="rounded-full border border-pearson-navy/15 bg-pearson-lavender px-4 py-1.5 font-open-sans text-xs font-semibold text-pearson-navy transition hover:border-pearson-magenta hover:text-pearson-magenta"
        >
          A1 Beginner
        </button>
        <button
          type="button"
          onClick={() => setText(SAMPLES.c1)}
          className="rounded-full border border-pearson-navy/15 bg-pearson-lavender px-4 py-1.5 font-open-sans text-xs font-semibold text-pearson-navy transition hover:border-pearson-magenta hover:text-pearson-magenta"
        >
          C1 Advanced
        </button>
      </div>

      <textarea
        rows={10}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste a student's English essay here…"
        className="w-full resize-y rounded-xl border border-pearson-navy/10 bg-surface-light p-4 font-open-sans text-base leading-relaxed text-pearson-navy outline-none transition placeholder:text-text-secondary/60 focus:border-pearson-magenta focus:ring-2 focus:ring-pearson-magenta/20"
      />

      <div className="mt-2 flex items-center justify-between">
        <span className="font-open-sans text-xs text-text-secondary">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>
        {error && (
          <span className="font-open-sans text-xs text-feedback-incorrect">
            {error}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!text.trim() || isLoading}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-pearson-magenta font-open-sans text-sm font-semibold text-white transition hover:bg-pearson-magenta/90 disabled:bg-pearson-navy/15 disabled:text-text-secondary"
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Analyzing essay…
          </>
        ) : (
          'Analyze & start tutoring'
        )}
      </button>
    </div>
  );
}
