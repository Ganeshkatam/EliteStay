// Domain Contracts for Listings
// These interfaces decouple our UI components from the raw Supabase generated types.

export interface ListingCardData {
  publicId: string;
  title: string;
  accommodationType: string;
  furnishing: 'unfurnished' | 'semi_furnished' | 'fully_furnished';
  genderPreference: 'any' | 'male' | 'female';
  occupancyType: 'private' | 'shared' | 'mixed';
  location: {
    locality: string | null;
    city: string | null;
    country: string | null;
    formattedAddress: string | null;
  };
  maxOccupants: number;
  pricing: {
    amount: number;
    currency: string;
    billingPeriod: 'day' | 'week' | 'month' | 'semester' | 'year';
    minimumDuration: number;
  };
  imageUrl: string | null;
}

export interface ListingDetailData {
  id: string;
  publicId: string;
  title: string;
  description: string | null;
  accommodationType: string;
  furnishing: 'unfurnished' | 'semi_furnished' | 'fully_furnished';
  genderPreference: 'any' | 'male' | 'female';
  occupancyType: 'private' | 'shared' | 'mixed';
  status: 'draft' | 'pending_review' | 'published' | 'paused' | 'archived';
  maxOccupants: number;
  location: {
    countryCode: string | null;
    country: string | null;
    state: string | null;
    city: string | null;
    locality: string | null;
    postalCode: string | null;
    latitude: number | null;
    longitude: number | null;
    formattedAddress: string | null;
  };
  host: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    joinedAt: string;
  };
  pricing: {
    amount: number;
    currency: string;
    billingPeriod: 'day' | 'week' | 'month' | 'semester' | 'year';
    securityDeposit: number;
    maintenanceFee: number;
    maintenanceFeePeriod: 'day' | 'week' | 'month' | 'semester' | 'year';
    minimumDuration: number;
    maximumDuration: number | null;
  };
  availability: {
    availableFrom: string;
    availableUnits: number;
    status: 'available' | 'occupied' | 'unavailable';
  };
  images: Array<{
    url: string;
    displayOrder: number;
  }>;
  amenities: Array<{
    name: string;
    icon: string | null;
  }>;
  createdAt: string;
}
