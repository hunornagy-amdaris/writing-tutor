import { UserCircle } from 'lucide-react';
import { AppLogo } from './AppLogo';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between bg-pearson-navy px-[30px]">
      <AppLogo />
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
        <UserCircle className="h-6 w-6 text-white" />
      </div>
    </header>
  );
}
