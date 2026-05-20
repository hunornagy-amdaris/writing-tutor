import { UserRound } from 'lucide-react';
import { StepIndicator } from '@/modules/writing-flow/components/StepIndicator';

export function AppHeader() {
  return (
    <header className="flex h-14 w-full items-center justify-between bg-nav-bg px-nav-x">
      <div className="flex items-center gap-6">
        <span className="text-base font-extrabold tracking-tight text-white">PEARSON</span>
        <StepIndicator />
      </div>
      <div className="flex size-8 items-center justify-center rounded-full bg-white/20">
        <UserRound className="size-6 text-white" aria-hidden />
        <span className="sr-only">Account</span>
      </div>
    </header>
  );
}
