'use client';

import { useCallback, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import { env } from '@/lib/env';
import { useFlowStore } from '@/modules/writing-flow/stores/use-flow-store';
import { buildBrainstormVoiceVariables } from '@/modules/writing-flow/lib/brainstorm-system-prompt';
import type { ChatMessage } from '@/modules/writing-flow/types/flow.types';

export type BrainstormCallState =
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
  message: string;
  role?: string;
  source?: string;
};

function resolveAgentId(): string | null {
  const brainstormId = env.NEXT_PUBLIC_ELEVENLABS_BRAINSTORM_AGENT_ID;
  if (brainstormId) return brainstormId;
  if (typeof console !== 'undefined') {
    console.warn(
      '[brainstorm-voice] NEXT_PUBLIC_ELEVENLABS_BRAINSTORM_AGENT_ID is not set; falling back to the Review agent ID.',
    );
  }
  return env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ?? null;
}

export function useBrainstormVoice() {
  const [callState, setCallState] = useState<BrainstormCallState>('idle');

  const handleMessage = useCallback((payload: IncomingMessage) => {
    const rawRole = payload.role ?? payload.source ?? 'ai';
    const role: ChatMessage['role'] = rawRole === 'user' ? 'user' : 'ai';
    if (!payload.message || payload.message.trim().length === 0) return;
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `msg-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    useFlowStore.getState().addBrainstormMessage({
      id,
      role,
      content: payload.message,
    });
  }, []);

  const conversation = useConversation({
    onConnect: () => setCallState('listening'),
    onDisconnect: () => setCallState('ended'),
    onError: () => setCallState('idle'),
    onModeChange: ({ mode }) =>
      setCallState(mode === 'speaking' ? 'speaking' : 'listening'),
    onMessage: handleMessage,
  });

  const start = useCallback(
    async ({ prompt }: { prompt: string }) => {
      const agentId = resolveAgentId();
      if (!agentId) {
        setCallState('idle');
        return;
      }
      setCallState('connecting');
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const args: StartSessionArgs = {
          agentId,
          connectionType: 'websocket',
          dynamicVariables: buildBrainstormVoiceVariables(prompt),
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
  }, [conversation]);

  return {
    callState,
    isSpeaking: conversation.isSpeaking,
    start,
    end,
  };
}
