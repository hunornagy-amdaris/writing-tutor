'use client';

import { BrainstormScreen } from '@/modules/writing-flow/components/BrainstormScreen';
import { ReviewScreen } from '@/modules/writing-flow/components/ReviewScreen';
import { ScoreScreen } from '@/modules/writing-flow/components/ScoreScreen';
import { WriteScreen } from '@/modules/writing-flow/components/WriteScreen';
import { selectStep, useFlowStore } from '@/modules/writing-flow/stores/use-flow-store';

export function FlowRouter() {
  const step = useFlowStore(selectStep);

  switch (step) {
    case 'brainstorm':
      return <BrainstormScreen />;
    case 'write':
      return <WriteScreen />;
    case 'review':
      return <ReviewScreen />;
    case 'score':
      return <ScoreScreen />;
  }
}
