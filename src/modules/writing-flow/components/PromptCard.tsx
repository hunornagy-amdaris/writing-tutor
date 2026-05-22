import type { FlowStep } from '@/modules/writing-flow/types/flow.types';

type PromptCardProps = {
  step: FlowStep;
  prompt: string;
};

const EYEBROW_BY_STEP: Record<FlowStep, string> = {
  brainstorm: 'PTE WRITE ESSAY · BRAINSTORM',
  write: 'PTE WRITE ESSAY · 200-300 WORDS',
  review: 'PTE WRITE ESSAY · REVIEW',
  score: 'PTE WRITE ESSAY · SCORE',
};

export function PromptCard({ step, prompt }: PromptCardProps) {
  return (
    <section className="motion-fade-in-up w-full rounded-card bg-surface py-prompt-card-y px-prompt-card-x">
      <p className="text-eyebrow font-bold tracking-normal text-ink-900/35">
        {EYEBROW_BY_STEP[step]}
      </p>
      <p className="mt-1 text-prompt italic font-normal text-ink-900">{prompt}</p>
    </section>
  );
}
