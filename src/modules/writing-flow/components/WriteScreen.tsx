'use client';

import { useState } from 'react';
import { ChatBubble } from '@/modules/writing-flow/components/ChatBubble';
import { EssayCard } from '@/modules/writing-flow/components/EssayCard';
import {
  PracticeTutorPanel,
  type TutorChip,
} from '@/modules/writing-flow/components/PracticeTutorPanel';
import { PromptCard } from '@/modules/writing-flow/components/PromptCard';
import { useAnalyzeEssay } from '@/modules/writing-flow/hooks/use-analyze-essay';
import { useWriteTutor } from '@/modules/writing-flow/hooks/use-write-tutor';
import { useFlowStore } from '@/modules/writing-flow/stores/use-flow-store';
import type { ChatMessage } from '@/modules/writing-flow/types/flow.types';

const WRITE_TUTOR_CHIPS: TutorChip[] = [
  { id: 'argument', label: '🤔 What do you think of my argument?' },
  { id: 'natural', label: '🔍 Does this sentence sound natural?' },
  { id: 'structure', label: "📋 What's missing from my structure?" },
  { id: 'stuck', label: "💬 I'm stuck — talk me through it" },
];

const EMPTY_TUTOR_GREETING =
  'Your brainstorm looked solid. Write your essay now — tap below if you get stuck, or ask me anything.';

export function WriteScreen() {
  const prompt = useFlowStore((s) => s.prompt);
  const essay = useFlowStore((s) => s.essay);
  const setEssay = useFlowStore((s) => s.setEssay);

  const { analyze, isPending: isAnalyzing } = useAnalyzeEssay();
  const tutor = useWriteTutor();

  const [tutorMessages, setTutorMessages] = useState<ChatMessage[]>([]);

  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length === 0 || tutor.isPending) return;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    };
    const nextMessages = [...tutorMessages, userMessage];
    setTutorMessages(nextMessages);
    const reply = await tutor.send({
      prompt,
      essay,
      messages: nextMessages,
    });
    if (reply !== null) {
      setTutorMessages((curr) => [
        ...curr,
        { id: crypto.randomUUID(), role: 'ai', content: reply },
      ]);
    }
  };

  return (
    <main className="app-container flex w-full gap-8 pt-8 pb-12">
      <div className="flex flex-1 flex-col gap-6">
        <PromptCard step="write" prompt={prompt} />
        <EssayCard
          value={essay}
          onChange={setEssay}
          onSubmit={() => analyze(essay)}
          isPending={isAnalyzing}
        />
      </div>

      <PracticeTutorPanel
        messages={tutorMessages}
        chips={WRITE_TUTOR_CHIPS}
        onSendMessage={handleSendMessage}
        isPending={tutor.isPending}
        emptyState={
          <ChatBubble role="ai" content={EMPTY_TUTOR_GREETING} />
        }
      />
    </main>
  );
}
