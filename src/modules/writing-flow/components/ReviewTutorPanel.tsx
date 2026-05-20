'use client';

import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { AnalyzedSentence } from '@/modules/writing-flow/types/analysis.types';
import { ChatBubble } from '@/modules/writing-flow/components/ChatBubble';
import { ComparisonCard } from '@/modules/writing-flow/components/ComparisonCard';
import {
  PracticeTutorPanel,
  type TutorChip,
} from '@/modules/writing-flow/components/PracticeTutorPanel';
import { ReviewVoicePanel } from '@/modules/writing-flow/components/ReviewVoicePanel';
import { useReviewTutor } from '@/modules/writing-flow/hooks/use-review-tutor';
import { getSentenceFixPair } from '@/modules/writing-flow/lib/sentence-fix';
import {
  selectEditMode,
  selectFixProgress,
  selectPrompt,
  selectReviewMessages,
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

const REVIEW_CHIPS: TutorChip[] = [
  { id: 'language', label: '🌐 Explain in my language' },
  { id: 'pattern', label: '🔍 What pattern is this?' },
  { id: 'discuss', label: '💬 Discuss more' },
];

const NO_SELECTION_PLACEHOLDER = 'Select a sentence on the left to chat…';
const SELECTED_PLACEHOLDER = 'Ask anything in your language…';

export function ReviewTutorPanel({ selectedSentence }: ReviewTutorPanelProps) {
  const tutorMode = useFlowStore(selectTutorMode);
  const setTutorMode = useFlowStore((s) => s.setTutorMode);
  const prompt = useFlowStore(selectPrompt);
  const editMode = useFlowStore(selectEditMode);
  const fixProgress = useFlowStore(useShallow(selectFixProgress));
  const selectedSentenceIndex = useFlowStore(selectSelectedSentenceIndex);
  const reviewMessages = useFlowStore(selectReviewMessages);
  const setEditMode = useFlowStore((s) => s.setEditMode);
  const setEditingSentenceIndex = useFlowStore((s) => s.setEditingSentenceIndex);
  const openQuiz = useFlowStore((s) => s.openQuiz);

  const { sendMessage, isPending } = useReviewTutor();

  const [stage, setStage] = useState<TutorPanelStage>('initial');

  const canChat =
    selectedSentenceIndex !== null && selectedSentence !== null;

  const handleSend = (text: string) => {
    if (!canChat) return;
    void sendMessage(text);
  };

  const fixPair: SentenceFixPair = selectedSentence
    ? getSentenceFixPair(selectedSentence)
    : null;

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

  const handleNotSure = () => setStage('explained');

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

  const modeToggle = (
    <ModeToggle mode={tutorMode} onChange={setTutorMode} />
  );

  if (tutorMode === 'voice') {
    return (
      <PracticeTutorPanel
        messages={[]}
        chips={[]}
        onSendMessage={() => undefined}
        topSlot={modeToggle}
        bodySlot={
          <ReviewVoicePanel
            selectedSentence={selectedSentence}
            prompt={prompt}
            onDone={() => setTutorMode('type')}
          />
        }
      />
    );
  }

  const sentenceMessages =
    selectedSentenceIndex !== null
      ? reviewMessages.filter(
          (m) => m.sentenceIndex === selectedSentenceIndex,
        )
      : [];

  const bodySlot = (
    <>
      {editMode ? (
        <div className="motion-fade-in-down flex flex-col gap-3">
          <AiBubble>
            {
              'Great — edit the sentence directly above, then tap Resubmit to see your updated score.'
            }
          </AiBubble>
          <FixProgressStrip progress={fixProgress} />
        </div>
      ) : null}

      {!selectedSentence ? (
        <AiBubble>
          Click any flagged sentence on the left to start a discussion about it.
        </AiBubble>
      ) : null}

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

      {sentenceMessages.map((m) => (
        <ChatBubble key={m.id} role={m.role} content={m.content} />
      ))}

      {isPending ? (
        <div className="motion-fade-in-up flex w-full justify-start">
          <p className="rounded-tl-sm rounded-tr-msg rounded-br-msg rounded-bl-msg bg-msg-ai px-msg-x py-msg-y text-prompt text-ink-400">
            …
          </p>
        </div>
      ) : null}
    </>
  );

  return (
    <PracticeTutorPanel
      messages={[]}
      chips={REVIEW_CHIPS}
      onSendMessage={handleSend}
      isPending={isPending}
      topSlot={modeToggle}
      bodySlot={bodySlot}
      inputPlaceholder={
        canChat ? SELECTED_PLACEHOLDER : NO_SELECTION_PLACEHOLDER
      }
    />
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
        {pair
          ? "Here's the fix I'd suggest — compare your version with the corrected one:"
          : 'This sentence already looks clean — nothing major to fix.'}
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
