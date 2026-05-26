'use client';

import type {
  ParagraphLabel,
  ParagraphTabStatus,
} from '@/modules/writing-flow/types/review.types';

type ParagraphTabItem = {
  label: ParagraphLabel;
  status: ParagraphTabStatus;
};

type ParagraphTabsProps = {
  tabs: ParagraphTabItem[];
  activeLabel: ParagraphLabel;
  onChange: (label: ParagraphLabel) => void;
};

const formatTabLabel = (label: ParagraphLabel): string =>
  label.startsWith('Body ') ? `Body paragraph ${label.slice(5)}` : label;

export function ParagraphTabs({ tabs, activeLabel, onChange }: ParagraphTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Paragraphs"
      className="motion-fade-in-up flex items-center gap-1"
    >
      {tabs.map((tab) => {
        const isActive = tab.label === activeLabel;
        return (
          <button
            key={tab.label}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.label)}
            className={
              isActive
                ? 'motion-press flex h-paragraph-tab items-center gap-1 rounded-button bg-accent-violet px-3 py-2 text-xs font-semibold text-ink-600 transition-colors'
                : 'motion-press flex h-paragraph-tab items-center gap-1 rounded-button border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-400 transition-colors'
            }
          >
            <span>{formatTabLabel(tab.label)}</span>
            {tab.status === 'errors' ? (
              <span aria-label="has errors" className="text-xs leading-none text-danger">
                ●
              </span>
            ) : tab.status === 'fixed' ? (
              <span aria-label="all fixed" className="text-xs leading-none text-success">
                ●
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
