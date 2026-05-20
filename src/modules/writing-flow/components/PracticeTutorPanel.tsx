'use client';

import type { ReactNode } from 'react';
import { ChatBubble } from '@/modules/writing-flow/components/ChatBubble';
import { ChatInputBar } from '@/modules/writing-flow/components/ChatInputBar';
import type { ChatMessage } from '@/modules/writing-flow/types/flow.types';

export type TutorChip = {
  id: string;
  label: string;
};

type PracticeTutorPanelProps = {
  messages: ChatMessage[];
  chips: TutorChip[];
  onSendMessage: (text: string) => void;
  isPending?: boolean;
  topSlot?: ReactNode;
  emptyState?: ReactNode;
  // Wave 3L additive slots — enable Wave 4 to fold ReviewTutorPanel into this shell.
  bodySlot?: ReactNode;
  belowChatSlot?: ReactNode;
  inputPlaceholder?: string;
  helperText?: string;
  headerLabel?: string;
};

const DEFAULT_INPUT_PLACEHOLDER = 'Ask anything in your language…';
const DEFAULT_HELPER_TEXT = 'English, Spanish, Portuguese, Hindi, or any language';
const DEFAULT_HEADER_LABEL = 'Practice Tutor';

export function PracticeTutorPanel({
  messages,
  chips,
  onSendMessage,
  isPending,
  topSlot,
  emptyState,
  bodySlot,
  belowChatSlot,
  inputPlaceholder,
  helperText,
  headerLabel,
}: PracticeTutorPanelProps) {
  return (
    <aside className="flex h-full w-tutor-panel flex-col border-l border-line bg-surface">
      <header className="relative flex h-12 items-center border-b border-line px-card-h-x">
        <span className="text-xs font-semibold text-ink-600">
          {headerLabel ?? DEFAULT_HEADER_LABEL}
        </span>
        {topSlot ? (
          <div className="ml-auto flex items-center">{topSlot}</div>
        ) : null}
      </header>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pt-prompt-card-y">
        {bodySlot ?? (
          <>
            {messages.length === 0 && emptyState ? emptyState : null}
            {messages.map((m) => (
              <ChatBubble key={m.id} role={m.role} content={m.content} />
            ))}
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4 pt-2">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => onSendMessage(chip.label)}
            className="flex h-7 w-full items-center rounded-pill border border-line bg-surface-muted px-3 text-left text-meta font-semibold text-ink-600 transition-opacity duration-200 ease-out hover:opacity-80"
          >
            {chip.label}
          </button>
        ))}

        <div className="pt-2">
          <ChatInputBar
            onSubmit={onSendMessage}
            isPending={isPending}
            placeholder={inputPlaceholder ?? DEFAULT_INPUT_PLACEHOLDER}
          />
        </div>
        <p className="text-tiny font-normal text-center text-ink-400">
          {helperText ?? DEFAULT_HELPER_TEXT}
        </p>
        {belowChatSlot ?? null}
      </div>
    </aside>
  );
}
