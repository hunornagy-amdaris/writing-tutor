'use client';

import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
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

const WRITE_DURATION_SECONDS = 20 * 60;

function formatWritingTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function WriteScreen() {
  const prompt = useFlowStore((s) => s.prompt);
  const essay = useFlowStore((s) => s.essay);
  const setEssay = useFlowStore((s) => s.setEssay);

  const { analyze, isPending: isAnalyzing } = useAnalyzeEssay();
  const tutor = useWriteTutor();

  const [tutorMessages, setTutorMessages] = useState<ChatMessage[]>([]);
  const [hasSubmittedForFeedback, setHasSubmittedForFeedback] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WRITE_DURATION_SECONDS);

  useEffect(() => {
    if (hasSubmittedForFeedback) return;

    const intervalId = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [hasSubmittedForFeedback]);

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
    <>
      <main className="motion-fade-in-up app-content-pad-l flex h-[calc(100vh-var(--spacing-header))] w-full flex-col gap-6 pt-8 pb-12 pr-tutor-panel">
        <div className="flex min-h-0 flex-1 flex-col gap-6 pr-nav-x">
          <PromptCard step="write" prompt={prompt} />
          <div
            className="motion-fade-in-up flex h-10 shrink-0 items-center gap-2 rounded-pill border border-line bg-surface px-3 text-base-13 font-bold text-ink-600"
            aria-label={`Writing time remaining ${formatWritingTime(secondsLeft)}`}
          >
            <Clock className="size-4 text-ink-400" aria-hidden />
            <span>{formatWritingTime(secondsLeft)}</span>
          </div>
          <EssayCard
            value={essay}
            onChange={setEssay}
            onSubmit={() => {
              setHasSubmittedForFeedback(true);
              void analyze(essay);
            }}
            isPending={isAnalyzing}
          />
        </div>
      </main>

      <aside className="fixed top-header right-0 bottom-0 w-tutor-panel">
        <PracticeTutorPanel
          messages={tutorMessages}
          chips={WRITE_TUTOR_CHIPS}
          onSendMessage={handleSendMessage}
          isPending={tutor.isPending}
          emptyState={<ChatBubble role="ai" content={EMPTY_TUTOR_GREETING} />}
        />
      </aside>
    </>
  );
}
