'use client';

import { SearchWorkspaceViewModel } from '../types';
import { SearchProvider } from '../context/SearchProvider';
import { ResultsWorkspace } from './results/ResultsWorkspace';

interface SearchWorkspaceProps {
  viewModel: SearchWorkspaceViewModel;
}

export function SearchWorkspace({ viewModel }: SearchWorkspaceProps) {
  return (
    <SearchProvider viewModel={viewModel}>
      <div className="flex flex-col w-full h-[calc(100vh-140px)] overflow-hidden bg-white">
        <ResultsWorkspace />
      </div>
    </SearchProvider>
  );
}
