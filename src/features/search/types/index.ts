import { SearchFilters } from '../lib/search-params';
import { ListingCardData } from '@/features/listings/types';
import { LocationInsights } from '../services/LocationInsightsService';
import { RecoveryViewModel } from '../services/DiscoveryService';

export enum SearchViewMode {
  LIST = 'LIST',
  MAP = 'MAP',
  SPLIT = 'SPLIT',
}

export interface SearchSummary {
  title: string;
  subtitle: string;
  total: number;
  updatedAt: Date;
}

export interface MapViewModel {
  centerLat?: number;
  centerLng?: number;
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  zoom?: number;
}

export interface PaginationViewModel {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ResultsViewModel {
  listings: ListingCardData[];
  pagination: PaginationViewModel;
}

export interface SearchMetadata {
  title: string;
  description: string;
  canonical: string;
  breadcrumbs: Array<{ label: string; href: string }>;
}

export interface SearchPageViewModel {
  metadata: SearchMetadata;
  workspace: SearchWorkspaceViewModel;
}

export interface SearchWorkspaceViewModel {
  summary: SearchSummary;
  results: ResultsViewModel;
  map: MapViewModel;
  filters: SearchFilters;
  insights: LocationInsights;
  recovery: RecoveryViewModel;
}
