'use client';

import { useTutorStore } from '@/modules/essay-tutor/stores/use-tutor-store';
import { buildFirstMessage } from '@/modules/essay-tutor/lib/build-tutor-prompt';
import { VoiceSession } from '@/modules/essay-tutor/components/VoiceSession';

export function TutorPanel() {
  const analysis = useTutorStore((s) => s.analysis);
  const activeIndex = useTutorStore((s) => s.activeIndex);
  const sessionHistory = useTutorStore((s) => s.sessionHistory);

  if (activeIndex === null || !analysis) {
    return (
      <section className="flex min-h-64 items-center justify-center rounded-2xl bg-white p-8 shadow-sm ring-1 ring-pearson-navy/5">
        <p className="max-w-xs text-center font-open-sans text-sm text-text-secondary">
          Pick a sentence on the left to start a voice tutoring session.
        </p>
      </section>
    );
  }

  const sentence = analysis.sentences[activeIndex];
  const corrected = sentence.corrected.trim();
  const showCorrection = corrected && corrected !== sentence.original.trim();

  return (
    <section className="rounded-2xl bg-white shadow-sm ring-1 ring-pearson-navy/5">
      <header className="flex items-center gap-3 rounded-t-2xl bg-pearson-navy px-5 py-4 text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pearson-magenta text-sm font-bold">
          AI
        </div>
        <div>
          <p className="font-open-sans text-xs uppercase tracking-wider text-white/70">
            Voice tutor
          </p>
          <p className="font-open-sans text-sm font-semibold">
            Sentence {activeIndex + 1}
          </p>
        </div>
      </header>

      <div className="space-y-4 p-5">
        <div>
          <p className="mb-1 font-open-sans text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Student wrote
          </p>
          <p className="rounded-xl bg-surface-light p-3 font-open-sans text-sm leading-relaxed text-pearson-navy">
            {sentence.original}
          </p>
        </div>

        {showCorrection && (
          <div>
            <p className="mb-1 font-open-sans text-xs font-semibold uppercase tracking-wider text-feedback-correct">
              Native-sounding version
            </p>
            <p className="rounded-xl bg-feedback-correct-bg p-3 font-open-sans text-sm leading-relaxed text-pearson-navy">
              {sentence.corrected}
            </p>
          </div>
        )}

        {sentence.grammar_edits.length > 0 && (
          <div>
            <p className="mb-1.5 font-open-sans text-xs font-semibold uppercase tracking-wider text-pearson-navy">
              Grammar
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sentence.grammar_edits.map((edit, i) => {
                let label = '';
                if (edit.type === 'replace') label = `${edit.token} → ${edit.correction ?? ''}`;
                else if (edit.type === 'delete') label = `delete "${edit.token}"`;
                else label = `add "${edit.token}"`;
                return (
                  <span
                    key={i}
                    className="rounded-full bg-pearson-yellow/30 px-3 py-1 font-open-sans text-xs font-semibold text-pearson-navy"
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {sentence.phraseology_flags.length > 0 && (
          <div>
            <p className="mb-1.5 font-open-sans text-xs font-semibold uppercase tracking-wider text-pearson-magenta">
              Phraseology
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sentence.phraseology_flags.map((flag, i) => (
                <span
                  key={i}
                  className="rounded-full bg-pearson-magenta/10 px-3 py-1 font-open-sans text-xs font-medium text-pearson-magenta"
                >
                  &quot;{flag.token}&quot; → {flag.suggestions.slice(0, 2).join(', ')}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-pearson-navy/10 bg-pearson-lavender/50 p-3">
          <p className="mb-1 font-open-sans text-[11px] font-semibold uppercase tracking-wider text-pearson-navy/70">
            Tutor will open with
          </p>
          <p className="font-open-sans text-sm italic leading-relaxed text-pearson-navy">
            &ldquo;{buildFirstMessage(sentence)}&rdquo;
          </p>
        </div>

        {sessionHistory.length > 0 && (
          <p className="font-open-sans text-xs text-text-secondary">
            Carrying context from {sessionHistory.length} previous sentence
            {sessionHistory.length === 1 ? '' : 's'}.
          </p>
        )}

        <VoiceSession sentence={sentence} sentenceIndex={activeIndex} />
      </div>
    </section>
  );
}
