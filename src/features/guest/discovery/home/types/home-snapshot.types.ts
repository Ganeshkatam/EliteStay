import { AccommodationTypeMapping } from '../api/accommodation-type-cache';
import { HomeSectionConfig } from '../config/sections';
import { ListingCardData } from '@/features/listings/types';

export interface PopularLocationItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

export interface HomeSectionData {
  config: HomeSectionConfig;
  listings: ListingCardData[];
}

export interface GuestHomeSnapshot {
  title: string;
  categories: AccommodationTypeMapping[];
  sections: HomeSectionData[];
  locations: PopularLocationItem[];
}
