'use client';

import { ConversationProvider } from '@elevenlabs/react';
import { useEffect } from 'react';
import type { AnalyzedSentence } from '@/modules/writing-flow/types/analysis.types';
import { useReviewVoice } from '@/modules/writing-flow/hooks/use-review-voice';

type ReviewVoicePanelProps = {
  selectedSentence: AnalyzedSentence | null;
  prompt: string;
  onDone: () => void;
};

const VOICE_TITLE = 'Tutor is listening…';
const VOICE_HELPER =
  "Discuss this sentence out loud. Tap Done when you're ready to continue.";
const NO_SENTENCE_TITLE = 'Select a sentence first';
const NO_SENTENCE_HELPER =
  'Tap a sentence on the left to start a voice discussion about it.';

function VoicePanelInner({
  selectedSentence,
  prompt,
  onDone,
}: ReviewVoicePanelProps) {
  const { callState, start, end } = useReviewVoice();

  useEffect(() => {
    if (!selectedSentence) return;
    if (callState === 'idle') {
      void start({ sentence: selectedSentence, prompt });
    }
    return () => {
      if (callState === 'listening' || callState === 'speaking') {
        void end();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSentence]);

  async function handleDone() {
    await end();
    onDone();
  }

  if (!selectedSentence) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 pt-4">
        <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-line bg-surface p-8">
          <span aria-hidden className="size-16 rounded-pill bg-accent-violet-soft" />
          <h2 className="text-base leading-5 font-bold text-ink-900">
            {NO_SENTENCE_TITLE}
          </h2>
          <p className="text-center text-input text-ink-300">
            {NO_SENTENCE_HELPER}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 pt-4">
      <div className="flex w-full flex-col items-center justify-center gap-5 rounded-xl border-2 border-line bg-surface p-8">
        <span aria-hidden className="voice-orb size-20" />
        <h2 className="text-base leading-5 font-bold text-ink-900">
          {VOICE_TITLE}
        </h2>
        <p className="w-full text-center text-input text-ink-300">
          {VOICE_HELPER}
        </p>
        <button
          type="button"
          onClick={handleDone}
          className="flex h-voice-cta-h w-voice-cta-w items-center justify-center rounded-pill bg-magenta text-xs font-bold text-surface"
        >
          Done — back to typing
        </button>
      </div>
    </div>
  );
}

export function ReviewVoicePanel(props: ReviewVoicePanelProps) {
  return (
    <ConversationProvider>
      <VoicePanelInner {...props} />
    </ConversationProvider>
  );
}
