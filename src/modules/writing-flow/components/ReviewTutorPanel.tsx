'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import type { AnalyzedSentence } from '@/modules/writing-flow/types/analysis.types';
import { ComparisonCard } from '@/modules/writing-flow/components/ComparisonCard';
import { ReviewVoicePanel } from '@/modules/writing-flow/components/ReviewVoicePanel';
import { useReviewTutor } from '@/modules/writing-flow/hooks/use-review-tutor';
import { getSentenceFixPair } from '@/modules/writing-flow/lib/sentence-fix';
import {
  selectEditMode,
  selectFixProgress,
  selectPrompt,
  selectSelectedSentenceIndex,
  selectTutorMode,
  useFlowStore,
  type FixProgress,
} from '@/modules/writing-flow/stores/use-flow-store';
import type {
  SentenceFixPair,
  TutorPanelStage,
} from '@/modules/writing-flow/types/review.types';
import type { TutorMode } from '@/modules/writing-flow/types/flow.types';

type ReviewTutorPanelProps = {
  selectedSentence: AnalyzedSentence | null;
};

const CHIPS = [
  { id: 'language', label: '🌐 Explain in my language' },
  { id: 'pattern', label: '🔍 What pattern is this?' },
  { id: 'discuss', label: '💬 Discuss more' },
] as const;

type SendHandler = (text: string) => void;

export function ReviewTutorPanel({ selectedSentence }: ReviewTutorPanelProps) {
  const tutorMode = useFlowStore(selectTutorMode);
  const setTutorMode = useFlowStore((s) => s.setTutorMode);
  const prompt = useFlowStore(selectPrompt);
  const editMode = useFlowStore(selectEditMode);
  const fixProgress = useFlowStore(selectFixProgress);
  const selectedSentenceIndex = useFlowStore(selectSelectedSentenceIndex);
  const setEditMode = useFlowStore((s) => s.setEditMode);
  const setEditingSentenceIndex = useFlowStore((s) => s.setEditingSentenceIndex);
  const openQuiz = useFlowStore((s) => s.openQuiz);

  const { sendMessage, isPending } = useReviewTutor();

  const [stage, setStage] = useState<TutorPanelStage>('initial');

  const canChat =
    selectedSentenceIndex !== null && selectedSentence !== null;

  const handleSend: SendHandler = (text) => {
    if (!canChat) return;
    void sendMessage(text);
  };

  const fixPair: SentenceFixPair = selectedSentence
    ? getSentenceFixPair(selectedSentence)
    : null;

  // When a sentence becomes selected, advance to socratic stage.
  // When deselected, reset to initial.
  const effectiveStage: TutorPanelStage = (() => {
    if (!selectedSentence) return 'initial';
    if (stage === 'initial') return 'socratic';
    return stage;
  })();

  const handleYesSpotted = () => {
    setEditMode(true);
    if (selectedSentenceIndex !== null) {
      setEditingSentenceIndex(selectedSentenceIndex);
    }
  };

  const handleNotSure = () => {
    setStage('explained');
  };

  const handleEditMyself = () => {
    setEditMode(true);
    if (selectedSentenceIndex !== null) {
      setEditingSentenceIndex(selectedSentenceIndex);
    }
  };

  const handlePractise = () => {
    if (selectedSentenceIndex !== null) {
      openQuiz(selectedSentenceIndex);
    }
  };

  return (
    <aside className="motion-fade-in-right flex h-full w-tutor-panel flex-col border-l border-line bg-surface">
      <PanelHeader mode={tutorMode} onChangeMode={setTutorMode} />

      {tutorMode === 'voice' ? (
        <ReviewVoicePanel
          selectedSentence={selectedSentence}
          prompt={prompt}
          onDone={() => setTutorMode('type')}
        />
      ) : (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pt-4">
          {editMode ? (
            <div className="motion-fade-in-down flex flex-col gap-3">
              <AiBubble>
                {
                  'Great — "energy" is correct. Edit the sentence directly above, then tap Resubmit to see your updated score.'
                }
              </AiBubble>
              <FixProgressStrip progress={fixProgress} />
            </div>
          ) : null}

          <AiBubble>
            First, something you did well. You anchored the intro with a specific date —
            that kind of concrete detail scores well on Content.
          </AiBubble>

          {effectiveStage === 'socratic' || effectiveStage === 'explained' ? (
            <AiBubble>
              Read that sentence aloud. Does one word sound a bit off to you?
            </AiBubble>
          ) : null}

          {effectiveStage === 'socratic' ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleYesSpotted}
                className="motion-press w-full rounded-button border border-accent-violet-border bg-accent-violet-soft px-3 py-2 text-left text-xs font-bold text-quiz-violet-ink"
              >
                {"✏️ Yes — I think I know what's off"}
              </button>
              <button
                type="button"
                onClick={handleNotSure}
                className="motion-press w-full rounded-button border border-line bg-surface-soft px-3 py-2 text-left text-xs font-bold text-ink-600"
              >
                🤷 Not sure — can you help me?
              </button>
            </div>
          ) : null}

          {effectiveStage === 'explained' ? (
            <ExplainedBlock
              pair={fixPair}
              onEditMyself={handleEditMyself}
              onPractise={handlePractise}
            />
          ) : null}

        </div>
      )}

      <PanelFooter
        onSend={handleSend}
        disabled={!canChat}
        isPending={isPending}
      />
    </aside>
  );
}

function PanelHeader({
  mode,
  onChangeMode,
}: {
  mode: TutorMode;
  onChangeMode: (m: TutorMode) => void;
}) {
  return (
    <div className="flex h-12 items-center justify-between border-b border-line px-4">
      <span className="text-xs font-semibold text-ink-600">Practice Tutor</span>
      <ModeToggle mode={mode} onChange={onChangeMode} />
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: TutorMode;
  onChange: (m: TutorMode) => void;
}) {
  const baseBtn =
    'motion-press flex h-6 w-16 items-center justify-center rounded-msg text-meta font-bold transition-colors';
  const activeBtn = `${baseBtn} bg-surface text-ink-600 shadow-sm`;
  const inactiveBtn = `${baseBtn} text-ink-400`;
  return (
    <div className="flex h-mode-toggle items-center gap-0.5 rounded-pill border border-line bg-mode-toggle-bg p-0.5">
      <button
        type="button"
        onClick={() => onChange('type')}
        aria-pressed={mode === 'type'}
        className={mode === 'type' ? activeBtn : inactiveBtn}
      >
        Type
      </button>
      <button
        type="button"
        onClick={() => onChange('voice')}
        aria-pressed={mode === 'voice'}
        className={mode === 'voice' ? activeBtn : inactiveBtn}
      >
        Voice
      </button>
    </div>
  );
}

function AiBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-msg bg-msg-ai px-msg-x py-msg-y">
      <p className="text-base-13 font-normal text-ink-900">{children}</p>
    </div>
  );
}

function FixProgressStrip({ progress }: { progress: FixProgress }) {
  const { fixed, total, remaining } = progress;
  return (
    <div className="flex h-8 w-full items-center rounded-sm-plus border border-success-border-soft bg-success-soft px-3">
      <p className="text-meta font-bold text-success-bright">
        ✓ {fixed} of {total} errors fixed — {remaining} remaining
      </p>
    </div>
  );
}

function ExplainedBlock({
  pair,
  onEditMyself,
  onPractise,
}: {
  pair: SentenceFixPair;
  onEditMyself: () => void;
  onPractise: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <AiBubble>
        {
          'Good instinct. In Spanish, "energías" is naturally plural — in English "energy" is uncountable. Here\'s the fix:'
        }
      </AiBubble>
      {pair ? <ComparisonCard pair={pair} /> : null}
      <button
        type="button"
        onClick={onEditMyself}
        className="motion-press w-full rounded-button border border-edit-green-border bg-edit-green-bg px-3 py-2 text-xs font-bold text-success"
      >
        ✏️ Edit it myself
      </button>
      <button
        type="button"
        onClick={onPractise}
        className="motion-press w-full rounded-button border border-magenta-soft-border bg-magenta-soft-bg px-3 py-2 text-xs font-bold text-magenta"
      >
        ⚡ Practise it — 2 quick questions
      </button>
    </div>
  );
}

function PanelFooter({
  onSend,
  disabled,
  isPending,
}: {
  onSend: SendHandler;
  disabled: boolean;
  isPending: boolean;
}) {
  const [value, setValue] = useState<string>('');
  const isDisabled = disabled || isPending;

  const handleChipClick = (label: string) => {
    if (isDisabled) return;
    onSend(label);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isDisabled) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <div className="flex flex-col gap-2 border-t border-line px-4 py-3">
      {CHIPS.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => handleChipClick(chip.label)}
          disabled={isDisabled}
          className="flex h-7 w-full items-center rounded-pill border border-line bg-surface-soft px-3 text-left text-meta font-semibold text-ink-600 disabled:opacity-50"
        >
          {chip.label}
        </button>
      ))}
      <form
        onSubmit={handleSubmit}
        className="mt-1 flex h-tutor-input w-full items-center rounded-pill border border-line bg-surface-muted px-3"
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isDisabled}
          placeholder="Ask anything in your language…"
          className="flex-1 bg-transparent text-input font-normal text-ink-900 placeholder:text-ink-400 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isDisabled || value.trim().length === 0}
          className="flex size-7 items-center justify-center rounded-pill bg-nav-bg text-xs font-bold text-white disabled:opacity-50"
          aria-label="Send"
        >
          →
        </button>
      </form>
      <p className="text-center text-eyebrow font-normal text-ink-400">
        English, Spanish, Portuguese, Hindi, or any language
      </p>
    </div>
  );
}
