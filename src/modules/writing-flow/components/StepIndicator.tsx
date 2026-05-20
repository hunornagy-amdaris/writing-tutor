'use client';

import { FLOW_STEPS } from '@/modules/writing-flow/constants/steps.constants';
import {
  isStepReachable,
  selectMaxStep,
  selectStep,
  useFlowStore,
} from '@/modules/writing-flow/stores/use-flow-store';
import type { FlowStep } from '@/modules/writing-flow/types/flow.types';

export function StepIndicator() {
  const step = useFlowStore(selectStep);
  const maxStep = useFlowStore(selectMaxStep);
  const setStep = useFlowStore((s) => s.setStep);

  return (
    <nav aria-label="Writing flow steps" className="flex items-center gap-1">
      {FLOW_STEPS.map((definition, idx) => {
        const isActive = definition.id === step;
        const isReachable = isStepReachable(maxStep, definition.id);
        const isLast = idx === FLOW_STEPS.length - 1;
        return (
          <div key={definition.id} className="flex items-center gap-1">
            <StepItem
              id={definition.id}
              index={definition.index}
              label={definition.label}
              isActive={isActive}
              isReachable={isReachable}
              onSelect={setStep}
            />
            {!isLast ? (
              <span
                aria-hidden
                className="block h-px w-step-circle bg-white/12"
              />
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

type StepItemProps = {
  id: FlowStep;
  index: number;
  label: string;
  isActive: boolean;
  isReachable: boolean;
  onSelect: (id: FlowStep) => void;
};

function StepItem({ id, index, label, isActive, isReachable, onSelect }: StepItemProps) {
  const handleClick = () => {
    if (isReachable) onSelect(id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isReachable}
      aria-current={isActive ? 'step' : undefined}
      className="flex cursor-pointer items-center gap-2 disabled:cursor-not-allowed"
    >
      <span
        className={
          isActive
            ? 'flex size-step-circle items-center justify-center rounded-full bg-surface text-tiny font-bold text-nav-step-num-on leading-none'
            : 'flex size-step-circle items-center justify-center rounded-full bg-nav-step-inactive text-tiny font-bold text-nav-step-inactive-num leading-none'
        }
      >
        {index}
      </span>
      <span
        className={
          isActive
            ? 'text-xs font-semibold text-white'
            : 'text-xs font-semibold text-nav-step-inactive'
        }
      >
        {label}
      </span>
    </button>
  );
}
