'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ParagraphTabs } from '@/modules/writing-flow/components/ParagraphTabs';
import { QuizModal } from '@/modules/writing-flow/components/QuizModal';
import { ReviewTutorPanel } from '@/modules/writing-flow/components/ReviewTutorPanel';
import { ScoreBar } from '@/modules/writing-flow/components/ScoreBar';
import { SentenceCard } from '@/modules/writing-flow/components/SentenceCard';
import { useDevCheatTrigger } from '@/modules/writing-flow/hooks/useDevCheatTrigger';
import { useResubmitEssay } from '@/modules/writing-flow/hooks/use-resubmit-essay';
import { deriveParagraphTabs } from '@/modules/writing-flow/lib/derive-paragraph-tabs';
import { buildScoreBarData } from '@/modules/writing-flow/lib/score-mapping';
import {
  selectAnalysis,
  selectEditMode,
  selectEditingSentenceIndex,
  selectEdits,
  selectFixedSentenceIndices,
  selectSelectedSentenceIndex,
  useFlowStore,
} from '@/modules/writing-flow/stores/use-flow-store';
import type { ParagraphLabel } from '@/modules/writing-flow/types/review.types';

export function ReviewScreen() {
  const analysis = useFlowStore(selectAnalysis);
  const edits = useFlowStore(selectEdits);
  const selectedIndex = useFlowStore(selectSelectedSentenceIndex);
  const editMode = useFlowStore(selectEditMode);
  const editingSentenceIndex = useFlowStore(selectEditingSentenceIndex);
  const fixedSentenceIndices = useFlowStore(selectFixedSentenceIndices);
  const setSelectedSentenceIndex = useFlowStore((s) => s.setSelectedSentenceIndex);
  const setEditMode = useFlowStore((s) => s.setEditMode);
  const commitSentenceEdit = useFlowStore((s) => s.commitSentenceEdit);
  const setStep = useFlowStore((s) => s.setStep);
  const { resubmit, isPending } = useResubmitEssay();
  const { isOpen: devActive } = useDevCheatTrigger();

  const paragraphTabs = analysis ? deriveParagraphTabs(analysis) : [];
  const defaultLabel: ParagraphLabel = paragraphTabs[0]?.label ?? 'Introduction';
  const [activeLabel, setActiveLabel] = useState<ParagraphLabel>(defaultLabel);

  const hasEdits = Object.keys(edits).length > 0;
  const showResubmit = editMode || hasEdits;
  const ctaLabel = showResubmit ? 'Resubmit for new score →' : 'See my score →';
  const helperText = editMode
    ? 'Edit sentences directly, then resubmit.'
    : 'Click a flagged sentence to discuss or edit it inline.';
  const handleCta = (): void => {
    if (showResubmit) {
      void resubmit().then((ok) => {
        if (ok) setStep('score');
      });
    } else {
      setStep('score');
    }
  };
  const handleReenterEditMode = (): void => {
    setEditMode(true);
  };

  if (!analysis) {
    return (
      <main className="p-8 text-ink-600">
        <p className="text-base-13">No analysis available yet.</p>
      </main>
    );
  }

  const scoreData = buildScoreBarData(analysis.scores);
  const selectedSentence =
    selectedIndex !== null ? (analysis.sentences[selectedIndex] ?? null) : null;

  const activeTab =
    paragraphTabs.find((t) => t.label === activeLabel) ?? paragraphTabs[0];
  const visibleIndices = activeTab?.sentenceIndices ?? [];

  const handleSelect = (index: number) => {
    if (selectedIndex === index) {
      setSelectedSentenceIndex(null);
    } else {
      setSelectedSentenceIndex(index);
    }
  };

  const handleDevAutoFixChunk = (): void => {
    for (const i of visibleIndices) {
      const sentence = analysis.sentences[i];
      if (!sentence || !sentence.has_errors) continue;
      const corrected = sentence.corrected?.trim();
      if (!corrected) continue;
      commitSentenceEdit(i, corrected);
    }
  };

  return (
    <>
      <main className="motion-fade-in-up app-content-pad-l flex h-[calc(100vh-var(--spacing-header))] w-full flex-col gap-4 overflow-hidden pt-8 pr-tutor-panel pb-12">
        <div className="flex min-h-0 flex-1 flex-col gap-4 pr-nav-x">
          <ScoreBar data={scoreData} />
          <ParagraphTabs
            tabs={paragraphTabs.map((t) => ({
              label: t.label,
              hasErrors: t.hasErrors,
            }))}
            activeLabel={activeTab?.label ?? defaultLabel}
            onChange={setActiveLabel}
          />
          <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            {visibleIndices.map((i) => {
              const sentence = analysis.sentences[i];
              if (!sentence) return null;
              const isFixed = fixedSentenceIndices.includes(i);
              const isEditing = editMode && editingSentenceIndex === i;
              const fixedText = edits[i];
              return (
                <li key={i}>
                  <SentenceCard
                    index={i}
                    sentence={sentence}
                    isSelected={selectedIndex === i}
                    isEditing={isEditing}
                    isFixed={isFixed}
                    fixedText={fixedText}
                    initialEditValue={edits[i] ?? sentence.original}
                    onSelect={handleSelect}
                    onCommitEdit={commitSentenceEdit}
                  />
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              {devActive ? (
                <button
                  type="button"
                  onClick={handleDevAutoFixChunk}
                  title="dev cheat — auto-fix this chunk"
                  className="motion-press flex h-9 items-center justify-center rounded-pill border border-line-strong bg-surface-muted px-3 text-base-13 font-bold text-magenta"
                >
                  🛠 Auto-fix this chunk
                </button>
              ) : null}
              {!editMode && fixedSentenceIndices.length > 0 ? (
                <button
                  type="button"
                  onClick={handleReenterEditMode}
                  className="motion-fade-in-up motion-press flex h-9 items-center justify-center rounded-pill border border-line bg-surface px-3 text-base-13 font-bold text-ink-600"
                >
                  ✏️ Edit sentences first
                </button>
              ) : null}
              <p className="text-xs font-normal text-ink-400">{helperText}</p>
            </div>
            <button
              type="button"
              onClick={handleCta}
              disabled={isPending}
              className="motion-press flex h-9 items-center gap-2 rounded-pill bg-magenta px-3 py-2 text-base-13 font-bold text-white transition-opacity duration-200 ease-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {isPending ? 'Re-analyzing…' : ctaLabel}
            </button>
          </div>
        </div>
      </main>

      <aside className="fixed top-header right-0 bottom-0 w-tutor-panel">
        <ReviewTutorPanel selectedSentence={selectedSentence} />
      </aside>

      <QuizModal />
    </>
  );
}
