export type AutosaveStatus =
  'idle' | 'dirty' | 'saving' | 'saved' | 'failed' | 'retrying' | 'offline';

export enum HealthContributorId {
  CONTENT = 'content',
  MEDIA = 'media',
  PRICING = 'pricing',
  LOCATION = 'location',
}

export enum PublishingSectionId {
  ACCOMMODATION = 'accommodation',
  LOCATION = 'location',
  FEATURES = 'features',
  PRICING = 'pricing',
  IMAGES = 'images',
}

export type ListingStatus = 'draft' | 'published' | 'archived';

export interface ContributorScore {
  id: HealthContributorId;
  label: string;
  score: number; // 0-100
  weight: number; // Weight in final score calculation
}

export interface ListingHealth {
  score: number;
  contributors: ContributorScore[];
  evaluatedAt: string;
}

export interface MissingItem {
  category: 'required' | 'recommended' | 'optional';
  sectionId: PublishingSectionId;
  message: string;
}

export interface PublishingDecision {
  ready: boolean;
  required: MissingItem[];
  recommended: MissingItem[];
  optional: MissingItem[];
  blockedReason?: string;
  nextRequiredSection?: PublishingSectionId;
}

export interface SidebarSection {
  id: PublishingSectionId;
  label: string;
  status: 'complete' | 'incomplete' | 'warning';
  href: string;
}

export interface ListingPublishingViewModel {
  listingId: string;
  title: string;
  status: ListingStatus;
  health: ListingHealth;
  publishing: PublishingDecision;
  sidebar: SidebarSection[];
}

export interface RawListingData {
  id: string;
  status: string; // The database type is string technically, but conceptually ListingStatus
  city?: string | null;
  locality?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  formatted_address?: string | null;
  title?: string | null;
  description?: string | null;
  accommodation_type_id?: string | null;
  max_occupants?: number | null;
  listing_locations?: Record<string, unknown>[] | null;
  listing_prices?: { amount: number; billing_period: string }[] | null;
  prices?: { amount: number; billing_period: string }[] | null;
  listing_images?: { storage_path: string }[] | null;
  images?: { storage_path: string }[] | null;
  listing_amenities?: { amenity_id: string }[] | null;
}

export interface PublishingSection {
  save(): Promise<void> | void;
  validate(): Promise<boolean> | boolean;
  reset(): void;
  autosave(): void;
}
