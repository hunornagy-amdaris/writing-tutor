'use client';

import { useCallback, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import { env } from '@/lib/env';
import { buildReviewVoiceDynamicVars } from '@/modules/writing-flow/lib/review-voice-dynamic-vars';
import type { AnalyzedSentence } from '@/modules/writing-flow/types/analysis.types';

export type ReviewCallState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'speaking'
  | 'ended';

type StartSessionArgs = {
  agentId: string;
  connectionType: 'websocket';
  dynamicVariables: Record<string, string>;
};

type IncomingMessage = {
  message?: string;
  role?: string;
  source?: string;
};

function isIncomingMessage(value: unknown): value is IncomingMessage {
  return typeof value === 'object' && value !== null;
}

export function useReviewVoice() {
  const [callState, setCallState] = useState<ReviewCallState>('idle');
  const [isOutputMuted, setIsOutputMuted] = useState(false);

  const handleMessage = useCallback((payload: unknown) => {
    if (!isIncomingMessage(payload)) return;
    if (!payload.message || payload.message.trim().length === 0) return;
    // TODO Wave 3 Agent I: accumulate into store.reviewMessages once
    // `addReviewMessage` is added to use-flow-store.
  }, []);

  const conversation = useConversation({
    onConnect: () => setCallState('listening'),
    onDisconnect: () => setCallState('ended'),
    onError: () => setCallState('idle'),
    onModeChange: ({ mode }: { mode: string }) =>
      setCallState(mode === 'speaking' ? 'speaking' : 'listening'),
    onMessage: handleMessage,
  });

  const start = useCallback(
    async ({
      sentence,
      prompt,
    }: {
      sentence: AnalyzedSentence;
      prompt: string;
    }) => {
      const agentId = env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        setCallState('idle');
        return;
      }
      setCallState('connecting');
      setIsOutputMuted(false);
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const args: StartSessionArgs = {
          agentId,
          connectionType: 'websocket',
          dynamicVariables: buildReviewVoiceDynamicVars(sentence, prompt),
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

  const end = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch {
      // swallow
    }
    setCallState('ended');
    setIsOutputMuted(false);
  }, [conversation]);

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
    setOutputMuted,
    start,
    end,
  };
}
