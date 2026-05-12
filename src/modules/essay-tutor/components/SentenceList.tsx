'use client';

import { useTutorStore } from '@/modules/essay-tutor/stores/use-tutor-store';

export function SentenceList() {
  const analysis = useTutorStore((s) => s.analysis);
  const activeIndex = useTutorStore((s) => s.activeIndex);
  const completedIndices = useTutorStore((s) => s.completedIndices);
  const setActiveIndex = useTutorStore((s) => s.setActiveIndex);

  if (!analysis) return null;

  const sentences = analysis.sentences;
  const errorCount = sentences.filter(
    (s) => s.has_errors || s.phraseology_flags.length > 0,
  ).length;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-pearson-navy/5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-open-sans text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Sentences
        </h3>
        <span className="font-open-sans text-xs text-text-secondary">
          {completedIndices.size}/{sentences.length} reviewed · {errorCount} with issues
        </span>
      </div>

      <ul className="space-y-2">
        {sentences.map((sentence, index) => {
          const isActive = activeIndex === index;
          const isCompleted = completedIndices.has(index);
          const hasGrammar = sentence.grammar_edits.length > 0;
          const hasPhrasing = sentence.phraseology_flags.length > 0;
          const isClean = !hasGrammar && !hasPhrasing;

          const card = [
            'w-full rounded-xl border px-4 py-3 text-left transition',
            isActive
              ? 'border-pearson-magenta bg-pearson-magenta/5 shadow-sm'
              : isCompleted
                ? 'border-feedback-correct/30 bg-feedback-correct-bg/40 hover:border-feedback-correct/50'
                : 'border-pearson-navy/10 bg-surface-light hover:border-pearson-navy/30',
          ].join(' ');

          return (
            <li key={index}>
              <button type="button" onClick={() => setActiveIndex(index)} className={card}>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-open-sans text-xs font-semibold uppercase tracking-wider text-pearson-navy">
                    {isCompleted && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-feedback-correct text-[10px] font-bold text-white">
                        ✓
                      </span>
                    )}
                    Sentence {index + 1}
                  </span>
                  <span className="flex flex-wrap items-center gap-1">
                    {hasGrammar && (
                      <span className="rounded-full bg-pearson-yellow/30 px-2 py-0.5 font-open-sans text-[10px] font-semibold text-pearson-navy">
                        grammar
                      </span>
                    )}
                    {hasPhrasing && (
                      <span className="rounded-full bg-pearson-magenta/10 px-2 py-0.5 font-open-sans text-[10px] font-semibold text-pearson-magenta">
                        phrasing
                      </span>
                    )}
                    {isClean && (
                      <span className="rounded-full bg-feedback-correct-bg px-2 py-0.5 font-open-sans text-[10px] font-semibold text-feedback-correct">
                        clean
                      </span>
                    )}
                  </span>
                </div>
                <p className="font-open-sans text-sm leading-relaxed text-pearson-navy/90">
                  {sentence.original}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
