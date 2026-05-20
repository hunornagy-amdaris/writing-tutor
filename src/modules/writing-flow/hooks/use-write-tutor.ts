'use client';

import { useState } from 'react';
import { writeTutorResponseSchema } from '@/modules/writing-flow/schemas/write-tutor.schema';
import type { ChatMessage } from '@/modules/writing-flow/types/flow.types';

// TODO Wave 3: migrate to TanStack Query mutation
type Status = 'idle' | 'pending' | 'success' | 'error';

type SendArgs = {
  prompt: string;
  essay: string;
  messages: ChatMessage[];
};

type UseWriteTutorReturn = {
  status: Status;
  error: string | null;
  isPending: boolean;
  send: (args: SendArgs) => Promise<string | null>;
};

export function useWriteTutor(): UseWriteTutorReturn {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const send = async ({
    prompt,
    essay,
    messages,
  }: SendArgs): Promise<string | null> => {
    setStatus('pending');
    setError(null);
    try {
      const res = await fetch('/api/write-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          essay,
          messages: messages.map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => ({}));
        const message =
          typeof data === 'object' && data !== null && 'error' in data
            ? String((data as { error: unknown }).error)
            : `Request failed (${res.status})`;
        setError(message);
        setStatus('error');
        return null;
      }
      const json: unknown = await res.json();
      const validated = writeTutorResponseSchema.safeParse(json);
      if (!validated.success) {
        setError('Invalid tutor response');
        setStatus('error');
        return null;
      }
      setStatus('success');
      return validated.data.reply;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setStatus('error');
      return null;
    }
  };

  return {
    status,
    error,
    isPending: status === 'pending',
    send,
  };
}
