'use client';

import { DEV_SAMPLE_ESSAYS } from '@/modules/writing-flow/constants/dev.constants';
import { useDevCheatTrigger } from '@/modules/writing-flow/hooks/useDevCheatTrigger';
import { useFlowStore } from '@/modules/writing-flow/stores/use-flow-store';

export function DevCheatMenu() {
  const { isOpen, close } = useDevCheatTrigger();
  const setEssay = useFlowStore((s) => s.setEssay);
  const setStep = useFlowStore((s) => s.setStep);

  if (!isOpen) return null;

  const handlePick = (text: string) => {
    setEssay(text);
    setStep('write');
    close();
  };

  return (
    <div className="motion-fade-in-up fixed right-4 bottom-4 z-50 flex w-72 flex-col gap-2 rounded-xl border border-line-strong bg-surface p-3 shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-eyebrow font-bold text-ink-600">dev cheat — sample essays</p>
        <button
          type="button"
          onClick={close}
          className="text-xs font-medium text-ink-500 hover:text-ink-700"
        >
          ✕
        </button>
      </div>
      {DEV_SAMPLE_ESSAYS.map((essay) => (
        <button
          key={essay.id}
          type="button"
          onClick={() => handlePick(essay.text)}
          className="motion-press flex flex-col items-start gap-1 rounded-lg border border-line bg-surface-muted px-3 py-2 text-left hover:border-line-strong"
        >
          <span className="text-eyebrow font-bold text-magenta">{essay.level}</span>
          <span className="text-xs text-ink-700">{essay.label}</span>
        </button>
      ))}
    </div>
  );
}
