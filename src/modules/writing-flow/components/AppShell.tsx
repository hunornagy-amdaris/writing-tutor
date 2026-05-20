import { AppHeader } from '@/modules/writing-flow/components/AppHeader';
import { FlowRouter } from '@/modules/writing-flow/components/FlowRouter';

export function AppShell() {
  return (
    <div className="min-h-screen bg-canvas font-sans text-ink-900">
      <AppHeader />
      <FlowRouter />
    </div>
  );
}
