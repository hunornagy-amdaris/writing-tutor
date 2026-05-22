'use client';

import { ArrowRight } from 'lucide-react';
import { countWords, MAX_WORDS, MIN_WORDS } from '@/modules/writing-flow/lib/count-words';

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
  const isUnder = wordCount < MIN_WORDS;
  const isOver = wordCount > MAX_WORDS;
  const canSubmit = !isUnder && !isOver && !isPending;

  const footerMessage =
    wordCount === 0
      ? `Write between ${MIN_WORDS} and ${MAX_WORDS} words to submit.`
      : isUnder
        ? `${MIN_WORDS - wordCount} more words needed.`
        : isOver
          ? `${wordCount - MAX_WORDS} words over the limit.`
          : `Ready to submit.`;

  const handleChange = (next: string): void => {
    if (countWords(next) > MAX_WORDS) return;
    onChange(next);
  };

  return (
    <section className="motion-fade-in-up flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-card border border-line bg-surface">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-line px-card-h-x">
        <span className="text-meta font-bold text-ink-400">YOUR ESSAY</span>
        <span className="text-meta font-normal text-ink-400">
          {wordCount} / {MIN_WORDS}–{MAX_WORDS} words
        </span>
      </div>

      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Write your essay here…"
        className="block w-full flex-1 resize-none border-0 bg-surface p-5 text-base-13 font-normal text-ink-700 outline-none placeholder:text-ink-400"
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
          className="motion-press inline-flex h-card-btn items-center justify-center gap-2 rounded-pill bg-magenta px-3 text-base-13 font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? 'Analyzing…' : 'Submit for feedback'}
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </section>
  );
}
