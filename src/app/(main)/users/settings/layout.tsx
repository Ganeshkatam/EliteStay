import { ReactNode } from 'react';
import { SubPanel } from '@/features/dashboard/components/SubPanel';
import { ContentPanel } from '@/features/dashboard/components/ContentPanel';
import { PageCanvas } from '@/features/dashboard/components/PageCanvas';
import { SettingsNav } from '@/features/profile/components/SettingsNav';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SubPanel title="Settings">
        <SettingsNav />
      </SubPanel>
      <ContentPanel>
        <PageCanvas className="max-w-[1100px]">{children}</PageCanvas>
      </ContentPanel>
    </>
  );
}
