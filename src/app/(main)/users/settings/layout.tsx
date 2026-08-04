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
        <PageCanvas>
          <div className="max-w-[1100px] w-full mx-auto p-4 md:p-8 pt-8 md:pt-12">
            {children}
          </div>
        </PageCanvas>
      </ContentPanel>
    </>
  );
}
