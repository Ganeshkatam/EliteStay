'use client';

import { useSearchUI } from '../../context/SearchProvider';
import { SearchLayout } from '../layout/SearchLayout';
import { ResultsPane } from './ResultsPane';
import { MapPane } from '../map/MapPane';

export function ResultsWorkspace() {
  const { viewMode } = useSearchUI();

  return (
    <SearchLayout viewMode={viewMode}>
      <ResultsPane />
      <MapPane />
    </SearchLayout>
  );
}
