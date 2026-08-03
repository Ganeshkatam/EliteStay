import { ListingDetailData } from '@/features/listings/types';

export interface ListingDetailsViewModel {
  listing: ListingDetailData;
  metadata: {
    title: string;
    description: string;
    canonical: string;
  };
}
