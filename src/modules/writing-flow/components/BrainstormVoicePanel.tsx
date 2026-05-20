'use client';

import { ConversationProvider } from '@elevenlabs/react';
import { useEffect } from 'react';
import { useBrainstormVoice } from '@/modules/writing-flow/hooks/use-brainstorm-voice';
import {
  VOICE_PANEL_HELPER,
  VOICE_PANEL_TITLE,
} from '@/modules/writing-flow/constants/brainstorm.constants';

type BrainstormVoicePanelProps = {
  prompt: string;
  onDone: () => void;
};

function VoicePanelInner({ prompt, onDone }: BrainstormVoicePanelProps) {
  const { callState, start, end } = useBrainstormVoice();

  useEffect(() => {
    if (callState === 'idle') {
      void start({ prompt });
    }
    return () => {
      if (callState === 'listening' || callState === 'speaking') {
        void end();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDone() {
    await end();
    onDone();
  }

  return (
    <div className="flex h-voice-panel w-full flex-col items-center justify-center gap-5 rounded-xl border-2 border-line bg-surface p-12">
      <span aria-hidden className="voice-orb size-20" />
      <h2 className="text-base leading-5 font-bold text-ink-900">
        {VOICE_PANEL_TITLE}
      </h2>
      <p className="w-100 text-center text-input text-ink-300">
        {VOICE_PANEL_HELPER}
      </p>
      <button
        type="button"
        onClick={handleDone}
        className="flex h-voice-cta-h w-voice-cta-w items-center justify-center rounded-pill bg-magenta text-xs font-bold text-surface"
      >
        Done — start writing →
      </button>
    </div>
  );
}

export function BrainstormVoicePanel(props: BrainstormVoicePanelProps) {
  return (
    <ConversationProvider>
      <VoicePanelInner {...props} />
    </ConversationProvider>
  );
}
