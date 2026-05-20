import type { FlowStep } from '@/modules/writing-flow/types/flow.types';

type PromptCardProps = {
  step: FlowStep;
  prompt: string;
};

const EYEBROW_BY_STEP: Record<FlowStep, string> = {
  brainstorm: 'WRITING TASK 2 · BRAINSTORM',
  write: 'WRITING TASK 2 · 40 MINUTES · 250+ WORDS',
  review: 'WRITING TASK 2 · REVIEW',
  score: 'WRITING TASK 2 · SCORE',
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
