'use client';

import { useEffect, useRef, useState } from 'react';
import type { AnalyzedSentence } from '@/modules/writing-flow/types/analysis.types';
import {
  getSentenceBadgeKind,
  hasSentenceIssues,
} from '@/modules/writing-flow/lib/sentence-fix';

type SentenceCardProps = {
  index: number;
  sentence: AnalyzedSentence;
  isSelected: boolean;
  isEditing?: boolean;
  isFixed?: boolean;
  fixedText?: string;
  initialEditValue?: string;
  onSelect: (index: number) => void;
  onCommitEdit?: (index: number, text: string) => void;
};

export function SentenceCard({
  index,
  sentence,
  isSelected,
  isEditing = false,
  isFixed = false,
  fixedText,
  initialEditValue,
  onSelect,
  onCommitEdit,
}: SentenceCardProps) {
  const badge = getSentenceBadgeKind(sentence);
  const hasIssues = hasSentenceIssues(sentence);

  if (isEditing) {
    return (
      <EditingCard
        index={index}
        initialValue={initialEditValue ?? sentence.original}
        onCommit={(text) => onCommitEdit?.(index, text)}
      />
    );
  }

  // Visual variants.
  const baseMotion = 'motion-fade-in-up transition-colors';
  let container =
    `${baseMotion} flex w-full flex-col gap-1 rounded-button border border-line bg-surface px-3 py-2 text-left`;
  let labelColor = 'text-ink-400';
  let textColor = 'text-ink-600';

  if (isFixed) {
    container =
      `${baseMotion} flex w-full flex-col gap-1 rounded-button border border-success bg-success-soft px-3 py-2 text-left`;
    labelColor = 'text-success-ink';
    textColor = 'text-ink-900';
  } else if (hasIssues && isSelected) {
    container =
      `${baseMotion} flex w-full flex-col gap-1 rounded-button border-2 border-danger bg-danger-soft px-3 py-2 text-left`;
    labelColor = 'text-ink-600';
    textColor = 'text-ink-900';
  } else if (hasIssues) {
    container =
      `${baseMotion} flex w-full flex-col gap-1 rounded-button bg-danger-soft px-3 py-2 text-left`;
    labelColor = 'text-ink-600';
    textColor = 'text-ink-900';
  }

  const displayText = isFixed ? (fixedText ?? sentence.corrected ?? sentence.original) : sentence.original;

  return (
    <button
      type="button"
      onClick={() => (hasIssues ? onSelect(index) : undefined)}
      aria-pressed={isSelected}
      disabled={!hasIssues}
      className={container}
    >
      <div className="flex w-full items-center justify-between">
        <span className={`text-eyebrow font-bold ${labelColor}`}>
          Sentence {index + 1}
        </span>
        {isFixed ? (
          <span className="motion-pop-in flex items-center rounded-pill bg-success px-2 py-0.5 text-tiny font-bold text-success-soft">
            ✓ fixed
          </span>
        ) : badge ? (
          <span className="flex items-center rounded-pill bg-danger px-2 py-0.5 text-tiny font-bold text-danger-soft">
            {badge}
          </span>
        ) : null}
      </div>
      <p className={`text-base-13 font-normal ${textColor}`}>{displayText}</p>
    </button>
  );
}

function EditingCard({
  index,
  initialValue,
  onCommit,
}: {
  index: number;
  initialValue: string;
  onCommit: (text: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleCommit = () => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    onCommit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommit();
    }
  };

  return (
    <div className="motion-fade-in-down flex w-full flex-col gap-1 rounded-button border border-line bg-surface-edit px-3 py-2 text-left">
      <span className="text-eyebrow font-bold text-nav-bg">
        Sentence {index + 1} · Editing
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
        aria-label={`Edit sentence ${index + 1}`}
        className="h-tutor-btn w-full rounded-md border border-line bg-surface px-2.5 text-base-13 font-normal text-ink-900 focus:outline-none focus:border-nav-bg"
      />
    </div>
  );
}
