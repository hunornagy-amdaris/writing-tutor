'use client';

import { useEffect, useRef } from 'react';
import { ChatBubble } from '@/modules/writing-flow/components/ChatBubble';
import type { ChatMessage } from '@/modules/writing-flow/types/flow.types';

type BrainstormChatPanelProps = {
  messages: ChatMessage[];
  isPending: boolean;
};

export function BrainstormChatPanel({
  messages,
  isPending,
}: BrainstormChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages.length, isPending]);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col rounded-xl border-2 border-line bg-surface">
      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3"
      >
        {messages.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {isPending && (
          <div className="motion-fade-in-up flex w-full justify-start">
            <p className="rounded-tl-sm rounded-tr-msg rounded-br-msg rounded-bl-msg bg-msg-ai px-msg-x py-msg-y text-prompt text-ink-400">
              …
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
