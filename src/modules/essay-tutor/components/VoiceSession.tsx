'use client';

import { useState } from 'react';
import { Mic, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { useVoiceTutor } from '@/modules/essay-tutor/hooks/use-voice-tutor';
import type { AnalyzedSentence } from '@/modules/essay-tutor/types/analysis.types';

type VoiceSessionProps = {
  sentence: AnalyzedSentence;
  sentenceIndex: number;
};

export function VoiceSession({ sentence, sentenceIndex }: VoiceSessionProps) {
  const { callState, isSpeaking, start, end, setOutputMuted, isOutputMuted } =
    useVoiceTutor();
  const [pending, setPending] = useState(false);

  async function handleStart() {
    setPending(true);
    try {
      await start(sentence);
    } finally {
      setPending(false);
    }
  }

  async function handleEnd() {
    setPending(true);
    try {
      await end(sentence, sentenceIndex);
    } finally {
      setPending(false);
    }
  }

  if (callState === 'idle' || callState === 'ended') {
    const completed = callState === 'ended';
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleStart}
          disabled={pending}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-pearson-magenta font-open-sans text-sm font-semibold text-white transition hover:bg-pearson-magenta/90 disabled:opacity-60"
        >
          <Mic className="h-4 w-4" />
          {completed ? 'Restart voice session' : 'Tap to speak with tutor'}
        </button>
        {completed && (
          <p className="text-center font-open-sans text-xs text-feedback-correct">
            ✓ Session saved. Pick another sentence or restart this one.
          </p>
        )}
      </div>
    );
  }

  if (callState === 'connecting' || pending) {
    return (
      <button
        type="button"
        disabled
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-pearson-magenta font-open-sans text-sm font-semibold text-white opacity-80"
      >
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        Connecting…
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleEnd}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-pearson-magenta font-open-sans text-sm font-semibold text-white transition hover:bg-pearson-magenta/90"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
        </span>
        {isSpeaking ? 'Tutor speaking…' : 'Listening — tap to end'}
        <PhoneOff className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => setOutputMuted(!isOutputMuted)}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-pearson-navy/15 bg-white font-open-sans text-xs font-semibold text-pearson-navy transition hover:border-pearson-magenta hover:text-pearson-magenta"
      >
        {isOutputMuted ? (
          <>
            <Volume2 className="h-4 w-4" />
            Resume tutor audio
          </>
        ) : (
          <>
            <VolumeX className="h-4 w-4" />
            Stop tutor speaking
          </>
        )}
      </button>

      <p className="text-center font-open-sans text-xs text-text-secondary">
        You can also just start talking — the tutor will pause and listen.
      </p>
    </div>
  );
}
