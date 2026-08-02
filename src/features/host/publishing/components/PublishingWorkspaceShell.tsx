'use client';

import React from 'react';
import { ListingPublishingViewModel } from '../view-models/listing-publishing.viewmodel';
import { PublishingWorkspaceHeader } from './PublishingWorkspaceHeader';
import { PublishingWorkspaceSidebar } from './PublishingWorkspaceSidebar';

export const AutosaveContext = React.createContext<{
  status: string;
  lastSavedAt: Date | null;
  lastAttemptAt: Date | null;
  setStatus: (status: string) => void;
  setLastSavedAt: (date: Date | null) => void;
  setLastAttemptAt: (date: Date | null) => void;
}>({
  status: 'idle',
  lastSavedAt: null,
  lastAttemptAt: null,
  setStatus: () => {},
  setLastSavedAt: () => {},
  setLastAttemptAt: () => {},
});

interface PublishingWorkspaceShellProps {
  viewModel: ListingPublishingViewModel;
  children: React.ReactNode;
}

export function PublishingWorkspaceShell({
  viewModel,
  children,
}: PublishingWorkspaceShellProps) {
  const [status, setStatus] = React.useState('idle');
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null);
  const [lastAttemptAt, setLastAttemptAt] = React.useState<Date | null>(null);

  return (
    <AutosaveContext.Provider
      value={{
        status,
        lastSavedAt,
        lastAttemptAt,
        setStatus,
        setLastSavedAt,
        setLastAttemptAt,
      }}
    >
      <div className="flex flex-col min-h-screen bg-white">
        <PublishingWorkspaceHeader viewModel={viewModel} />

        <div className="flex flex-1">
          <aside className="hidden w-72 flex-shrink-0 border-r bg-slate-50/50 md:block p-6 overflow-y-auto">
            <PublishingWorkspaceSidebar viewModel={viewModel} />
          </aside>

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl p-6 md:p-12">{children}</div>
          </main>
        </div>
      </div>
    </AutosaveContext.Provider>
  );
}
