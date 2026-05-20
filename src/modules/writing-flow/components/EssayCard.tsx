'use client';

import { ArrowRight } from 'lucide-react';
import { countWords, MIN_WORDS } from '@/modules/writing-flow/lib/count-words';

type EssayCardProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
};

export function EssayCard({
  value,
  onChange,
  onSubmit,
  isPending,
}: EssayCardProps) {
  const wordCount = countWords(value);
  const remaining = Math.max(0, MIN_WORDS - wordCount);
  const canSubmit = wordCount >= MIN_WORDS && !isPending;

  const footerMessage =
    wordCount === 0
      ? `You need at least ${MIN_WORDS} words to submit.`
      : remaining > 0
        ? `${remaining} more words needed.`
        : `Ready to submit.`;

  return (
    <section className="mt-4 w-full overflow-hidden rounded-card border border-line bg-surface">
      <div className="flex h-10 items-center justify-between border-b border-line px-card-h-x">
        <span className="text-meta font-bold text-ink-400">YOUR ESSAY</span>
        <span className="text-meta font-normal text-ink-400">
          {wordCount} / {MIN_WORDS} words
        </span>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your essay here…"
        className="block min-h-essay-min w-full resize-none border-0 bg-surface p-5 text-base-13 font-normal text-ink-700 outline-none placeholder:text-ink-400"
        aria-label="Your essay"
      />

      <div className="flex h-11 items-center justify-between border-t border-line bg-surface-soft px-card-h-x">
        <span className="text-meta font-normal text-ink-400">
          {footerMessage}
        </span>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="inline-flex h-card-btn items-center justify-center gap-2 rounded-pill bg-magenta px-3 text-base-13 font-bold text-white transition-opacity duration-200 ease-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? 'Analyzing…' : 'Submit for feedback'}
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </section>
  );
}
