// TODO Wave 3: migrate to TanStack Query useMutation.
'use client';

import { useCallback, useState } from 'react';
import type {
  BrainstormChatRequest,
  BrainstormChatResponse,
} from '@/modules/writing-flow/schemas/brainstorm-chat.schema';

type UseBrainstormChat = {
  send: (payload: BrainstormChatRequest) => Promise<string | null>;
  isPending: boolean;
  error: string | null;
};

export function useBrainstormChat(): UseBrainstormChat {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (payload: BrainstormChatRequest): Promise<string | null> => {
      setError(null);
      setIsPending(true);
      try {
        const res = await fetch('/api/brainstorm-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(
            body.error ?? `Request failed with status ${res.status}`,
          );
        }
        const data = (await res.json()) as BrainstormChatResponse;
        return data.message;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return { send, isPending, error };
}
