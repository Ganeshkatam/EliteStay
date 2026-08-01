'use client';

import { SearchWorkspaceViewModel } from '../types';
import { SearchProvider } from '../context/SearchProvider';
import { SearchToolbar } from './toolbar/SearchToolbar';
import { LocationContextBar } from './LocationContextBar';
import { ResultsWorkspace } from './results/ResultsWorkspace';

interface SearchWorkspaceProps {
  viewModel: SearchWorkspaceViewModel;
}

export function SearchWorkspace({ viewModel }: SearchWorkspaceProps) {
  return (
    <SearchProvider viewModel={viewModel}>
      <div className="flex flex-col w-full min-h-screen bg-white">
        <SearchToolbar />
        <LocationContextBar />
        <ResultsWorkspace />
      </div>
    </SearchProvider>
  );
}
