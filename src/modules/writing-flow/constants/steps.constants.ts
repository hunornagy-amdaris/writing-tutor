import type { FlowStep } from '@/modules/writing-flow/types/flow.types';

export type StepDefinition = {
  id: FlowStep;
  index: number;
  label: string;
};

export const FLOW_STEPS: readonly StepDefinition[] = [
  { id: 'brainstorm', index: 1, label: 'Brainstorm' },
  { id: 'write', index: 2, label: 'Write' },
  { id: 'review', index: 3, label: 'Review' },
  { id: 'score', index: 4, label: 'Score' },
] as const;

export const DEFAULT_PROMPT =
  'Some people think daylight saving time should be abolished. Others believe it still serves a useful purpose. Discuss both views and give your own opinion.';
