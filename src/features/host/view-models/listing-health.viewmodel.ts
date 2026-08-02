export interface RawListingData {
  id: string;
  status: string;
  city?: string | null;
  locality?: string | null;
  title?: string | null;
  description?: string | null;
  images?: { storage_path: string }[] | null;
  prices?: { amount: number; billing_period: string }[] | null;
  amenities?: unknown[] | null;
  listing_build_progress?:
    { percent_complete: number; last_step: string }[] | null;
}

import { MissingItem } from '../policies/publishing.policy';

export interface ContributorScores {
  content: number;
  media: number;
  pricing: number;
  location: number;
}

export interface ListingHealthViewModel {
  score: number;
  status: 'healthy' | 'needs_attention' | 'draft';
  completion: number;
  missingItems: MissingItem[];
  primaryAction: string;
  warnings: string[];
  readyToPublish: boolean;
  contributors: ContributorScores;
}
