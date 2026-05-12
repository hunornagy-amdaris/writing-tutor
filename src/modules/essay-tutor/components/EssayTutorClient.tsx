'use client';

import { useTutorStore } from '@/modules/essay-tutor/stores/use-tutor-store';
import { EssayInput } from '@/modules/essay-tutor/components/EssayInput';
import { ScoresBar } from '@/modules/essay-tutor/components/ScoresBar';
import { SentenceList } from '@/modules/essay-tutor/components/SentenceList';
import { TutorPanel } from '@/modules/essay-tutor/components/TutorPanel';

export function EssayTutorClient() {
  const analysis = useTutorStore((s) => s.analysis);
  const reset = useTutorStore((s) => s.reset);

  if (analysis === null) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-pearson-lavender">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <header className="mb-10">
            <span className="inline-block rounded-full bg-pearson-magenta/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-pearson-magenta">
              Pearson · L2 English
            </span>
            <h1 className="mt-4 font-open-sans text-4xl font-bold tracking-tight text-pearson-navy md:text-5xl">
              Essay Writing Tutor
            </h1>
            <p className="mt-3 max-w-xl font-open-sans text-base text-text-secondary">
              Paste a student&apos;s essay. We score it, flag grammar and phraseology
              issues, then walk through each sentence with a warm voice tutor.
            </p>
          </header>
          <EssayInput />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-pearson-lavender">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-open-sans text-2xl font-bold text-pearson-navy">
            Tutoring session
          </h2>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-pearson-navy/20 bg-white px-4 py-2 text-sm font-semibold text-pearson-navy transition hover:bg-pearson-navy hover:text-white"
          >
            ← New essay
          </button>
        </div>
        <ScoresBar />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <SentenceList />
          <TutorPanel />
        </div>
      </div>
    </main>
  );
}
