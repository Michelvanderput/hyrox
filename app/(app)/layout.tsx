import { AppShell } from "@/components/layout/AppShell";
import { AppProviders } from "@/components/providers/AppProviders";
import { TrainingCloudBridge } from "@/components/sync/TrainingCloudBridge";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <TrainingCloudBridge>
        <AppShell>{children}</AppShell>
      </TrainingCloudBridge>
    </AppProviders>
  );
}
