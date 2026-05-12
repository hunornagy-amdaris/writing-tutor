'use client';

import { ConversationProvider } from '@elevenlabs/react';
import type { ReactNode } from 'react';

export function EssayTutorProvider({ children }: { children: ReactNode }) {
  return <ConversationProvider>{children}</ConversationProvider>;
}
