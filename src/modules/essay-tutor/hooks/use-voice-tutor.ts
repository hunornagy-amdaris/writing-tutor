'use client';

import { useState, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';
import { env } from '@/lib/env';
import { useTutorStore } from '@/modules/essay-tutor/stores/use-tutor-store';
import {
  buildDynamicVariables,
  buildFirstMessage,
  buildSentenceSummary,
} from '@/modules/essay-tutor/lib/build-tutor-prompt';
import type { AnalyzedSentence } from '@/modules/essay-tutor/types/analysis.types';

export type CallState = 'idle' | 'connecting' | 'active' | 'ended';

type StartSessionArgs = {
  agentId: string;
  connectionType: 'websocket';
  dynamicVariables: Record<string, string>;
  overrides?: {
    agent?: {
      firstMessage?: string;
    };
  };
};

export function useVoiceTutor() {
  const [callState, setCallState] = useState<CallState>('idle');
  const [isOutputMuted, setIsOutputMuted] = useState(false);

  const conversation = useConversation({
    onConnect: () => setCallState('active'),
    onDisconnect: () => setCallState('ended'),
    onError: () => setCallState('idle'),
  });

  const start = useCallback(
    async (sentence: AnalyzedSentence) => {
      setCallState('connecting');
      setIsOutputMuted(false);
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });

        const { sessionHistory } = useTutorStore.getState();
        const dynamicVariables = buildDynamicVariables(sentence, sessionHistory);
        const firstMessage = buildFirstMessage(sentence);

        const args: StartSessionArgs = {
          agentId: env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
          connectionType: 'websocket',
          dynamicVariables,
          overrides: { agent: { firstMessage } },
        };

        await conversation.startSession(
          args as unknown as Parameters<typeof conversation.startSession>[0],
        );
      } catch {
        setCallState('idle');
      }
    },
    [conversation],
  );

  const end = useCallback(
    async (sentence: AnalyzedSentence, sentenceIndex: number) => {
      try {
        await conversation.endSession();
      } catch {
        // swallow; UI still progresses
      }

      const { addToHistory, markCompleted } = useTutorStore.getState();
      addToHistory(buildSentenceSummary(sentence, sentenceIndex));
      markCompleted(sentenceIndex);
      setCallState('ended');
      setIsOutputMuted(false);
    },
    [conversation],
  );

  const setOutputMuted = useCallback(
    (muted: boolean) => {
      setIsOutputMuted(muted);
      try {
        conversation.setVolume({ volume: muted ? 0 : 1 });
      } catch {
        // ignore — SDK may not be ready
      }
    },
    [conversation],
  );

  return {
    callState,
    isSpeaking: conversation.isSpeaking,
    isOutputMuted,
    start,
    end,
    setOutputMuted,
  };
}
