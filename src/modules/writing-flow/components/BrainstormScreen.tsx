'use client';

import { useEffect, useMemo } from 'react';
import { BrainstormChatPanel } from '@/modules/writing-flow/components/BrainstormChatPanel';
import { BrainstormModeToggle } from '@/modules/writing-flow/components/BrainstormModeToggle';
import { BrainstormVoicePanel } from '@/modules/writing-flow/components/BrainstormVoicePanel';
import { ChatInputBar } from '@/modules/writing-flow/components/ChatInputBar';
import { PromptCard } from '@/modules/writing-flow/components/PromptCard';
import { QuickActionChip } from '@/modules/writing-flow/components/QuickActionChip';
import { StartWritingButton } from '@/modules/writing-flow/components/StartWritingButton';
import {
  BRAINSTORM_CHIPS,
  BRAINSTORM_HELPER_TEXT,
  BRAINSTORM_INPUT_PLACEHOLDER,
  BRAINSTORM_OPENER,
} from '@/modules/writing-flow/constants/brainstorm.constants';
import { DEFAULT_PROMPT } from '@/modules/writing-flow/constants/steps.constants';
import { useBrainstormChat } from '@/modules/writing-flow/hooks/use-brainstorm-chat';
import {
  selectBrainstorm,
  selectPrompt,
  useFlowStore,
} from '@/modules/writing-flow/stores/use-flow-store';
import type { ChatMessage } from '@/modules/writing-flow/types/flow.types';

function createMessageId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function BrainstormScreen() {
  const prompt = useFlowStore(selectPrompt);
  const brainstorm = useFlowStore(selectBrainstorm);
  const setBrainstormMode = useFlowStore((s) => s.setBrainstormMode);
  const addBrainstormMessage = useFlowStore((s) => s.addBrainstormMessage);
  const setStep = useFlowStore((s) => s.setStep);

  const { send, isPending } = useBrainstormChat();

  useEffect(() => {
    if (brainstorm.messages.length === 0 && prompt === DEFAULT_PROMPT) {
      addBrainstormMessage({
        id: createMessageId(),
        role: 'ai',
        content: BRAINSTORM_OPENER,
      });
    }
  }, [brainstorm.messages.length, prompt, addBrainstormMessage]);

  async function handleSubmit(text: string) {
    const userMsg: ChatMessage = {
      id: createMessageId(),
      role: 'user',
      content: text,
    };
    addBrainstormMessage(userMsg);
    const nextMessages = [...brainstorm.messages, userMsg];
    const aiText = await send({ prompt, messages: nextMessages });
    if (aiText) {
      addBrainstormMessage({
        id: createMessageId(),
        role: 'ai',
        content: aiText,
      });
    }
  }

  const handleChip = useMemo(
    () => (chipText: string) => {
      void handleSubmit(chipText);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brainstorm.messages.length, isPending],
  );

  function handleStartWriting() {
    setStep('write');
  }

  const isVoice = brainstorm.mode === 'voice';

  return (
    <main className="motion-fade-in-up app-container flex h-[calc(100vh-var(--spacing-header))] w-full flex-col items-end gap-5.5 overflow-hidden pt-8 pb-start-writing-bottom">
      <PromptCard step="brainstorm" prompt={prompt} />

      <BrainstormModeToggle
        mode={brainstorm.mode}
        onChange={setBrainstormMode}
      />

      {isVoice ? (
        <BrainstormVoicePanel
          prompt={prompt}
          onDone={handleStartWriting}
        />
      ) : (
        <>
          <BrainstormChatPanel
            messages={brainstorm.messages}
            isPending={isPending}
          />
          <div className="flex w-full justify-start gap-3">
            {BRAINSTORM_CHIPS.map((chip) => (
              <QuickActionChip
                key={chip.id}
                emoji={chip.emoji}
                label={chip.label}
                disabled={isPending}
                onClick={() => handleChip(chip.text)}
              />
            ))}
          </div>
          <ChatInputBar
            placeholder={BRAINSTORM_INPUT_PLACEHOLDER}
            disabled={isPending}
            onSubmit={handleSubmit}
          />
          <p className="w-full text-center text-eyebrow text-ink-400">
            {BRAINSTORM_HELPER_TEXT}
          </p>
        </>
      )}

      {!isVoice && <StartWritingButton onClick={handleStartWriting} />}
    </main>
  );
}
