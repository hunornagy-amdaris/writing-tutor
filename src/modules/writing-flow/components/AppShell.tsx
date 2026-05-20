import { AppHeader } from '@/modules/writing-flow/components/AppHeader';
import { DevCheatMenu } from '@/modules/writing-flow/components/DevCheatMenu';
import { FlowRouter } from '@/modules/writing-flow/components/FlowRouter';

export function AppShell() {
  return (
    <div className="min-h-screen bg-canvas font-sans text-ink-900">
      <AppHeader />
      <div className="pt-header">
        <FlowRouter />
      </div>
      <DevCheatMenu />
    </div>
  );
}
