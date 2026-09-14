'use client';

import { SearchWorkspace } from '@/features/search/components/SearchWorkspace';
import { SearchWorkspaceViewModel } from '@/features/search/types';

interface GuestSearchWorkspaceProps {
  viewModel: SearchWorkspaceViewModel;
}

/**
 * Guest-specific wrapper for the frozen SearchWorkspace.
 * This allows us to inject any guest-specific overlays, authentication modals,
 * or analytics tracking without modifying the frozen search domain.
 */
export function GuestSearchWorkspace({ viewModel }: GuestSearchWorkspaceProps) {
  return (
    <div className="w-full flex-1 flex flex-col min-h-0 overflow-hidden">
      <SearchWorkspace viewModel={viewModel} />
    </div>
  );
}
