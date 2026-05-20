import Image from 'next/image';
import { StepIndicator } from '@/modules/writing-flow/components/StepIndicator';

export function AppHeader() {
  return (
    <header className="w-full bg-nav-bg">
      <div className="app-container flex h-header items-center justify-between">
        <div className="flex items-center gap-12">
          <Image
            src="/pearson-logo.svg"
            alt="Pearson"
            width={119}
            height={24}
            priority
            className="h-logo-h w-auto"
          />
          <StepIndicator />
        </div>
        <Image
          src="/user_icon.png"
          alt="Account"
          width={40}
          height={40}
          className="size-user-avatar rounded-full"
        />
      </div>
    </header>
  );
}
