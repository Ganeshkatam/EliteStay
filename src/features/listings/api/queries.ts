/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { ListingCardData, ListingDetailData } from '../types';
import { type SearchFilters } from '@/features/search/lib/search-params';
import { resolveAccommodationTypeId } from '@/features/search/lib/accommodation-types';

function resolveImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/${path}`;
}

export async function getFeaturedListings(): Promise<ListingCardData[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('listings')
    .select(
      `
      public_id,
      title,
      locality,
      city,
      formatted_address,
      latitude,
      longitude,
      furnishing,
      gender_preference,
      occupancy_type,
      accommodation_types!inner ( name ),
      listing_prices!inner ( amount, currency, billing_period, minimum_duration ),
      listing_images ( storage_path, display_order )
    `
    )
    .eq('status', 'published')
    .limit(6);

  if (error) {
    console.error('Error fetching featured listings:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    publicId: row.public_id,
    title: row.title,
    accommodationType: row.accommodation_types.name,
    furnishing: row.furnishing,
    genderPreference: row.gender_preference,
    occupancyType: row.occupancy_type,
    location: {
      locality: row.locality,
      city: row.city,
      formattedAddress: row.formatted_address,
      latitude: row.latitude || null,
      longitude: row.longitude || null,
    },
    pricing: {
      amount: row.listing_prices[0].amount,
      currency: row.listing_prices[0].currency,
      billingPeriod: row.listing_prices[0].billing_period,
      minimumDuration: row.listing_prices[0].minimum_duration,
    },
    imageUrl: resolveImageUrl(
      row.listing_images?.sort(
        (a: any, b: any) => a.display_order - b.display_order
      )?.[0]?.storage_path
    ),
  }));
}

export async function getDiscoverListings(
  cursor?: string,
  limit = 12
): Promise<{ data: ListingCardData[]; nextCursor?: string }> {
  const supabase = await createClient();

  let query = supabase
    .from('listings')
    .select(
      `
      id,
      public_id,
      title,
      locality,
      city,
      formatted_address,
      latitude,
      longitude,
      furnishing,
      gender_preference,
      occupancy_type,
      accommodation_types!inner ( name ),
      listing_prices!inner ( amount, currency, billing_period, minimum_duration ),
      listing_images ( storage_path, display_order )
    `
    )
    .eq('status', 'published')
    .order('id', { ascending: true })
    .limit(limit);

  if (cursor) {
    query = query.gt('id', cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching discover listings:', error);
    return { data: [] };
  }

  const mappedData: ListingCardData[] = (data || []).map((row: any) => ({
    publicId: row.public_id,
    title: row.title,
    accommodationType: row.accommodation_types.name,
    furnishing: row.furnishing,
    genderPreference: row.gender_preference,
    occupancyType: row.occupancy_type,
    location: {
      locality: row.locality,
      city: row.city,
      formattedAddress: row.formatted_address,
      latitude: row.latitude || null,
      longitude: row.longitude || null,
    },
    pricing: {
      amount: row.listing_prices[0].amount,
      currency: row.listing_prices[0].currency,
      billingPeriod: row.listing_prices[0].billing_period,
      minimumDuration: row.listing_prices[0].minimum_duration,
    },
    imageUrl: resolveImageUrl(
      row.listing_images?.sort(
        (a: any, b: any) => a.display_order - b.display_order
      )?.[0]?.storage_path
    ),
  }));

  const nextCursor =
    data && data.length === limit ? data[data.length - 1].id : undefined;

  return {
    data: mappedData,
    nextCursor,
  };
}

export async function getListingDetail(
  publicId: string
): Promise<ListingDetailData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_listing_detail', {
    p_public_id: publicId,
  });

  if (error || !data) {
    console.error('Error fetching listing detail:', error);
    return null;
  }

  // Map the RPC JSON response to our Domain Contract
  const raw = data as any;

  return {
    id: raw.id,
    publicId: raw.public_id,
    title: raw.title,
    description: raw.description,
    accommodationType: raw.accommodation_type.name,
    furnishing: raw.furnishing,
    genderPreference: raw.gender_preference,
    occupancyType: raw.occupancy_type,
    status: raw.status,
    location: {
      state: raw.state,
      city: raw.city,
      locality: raw.locality,
      postalCode: raw.postal_code,
      latitude: raw.latitude,
      longitude: raw.longitude,
      formattedAddress: raw.formatted_address,
    },
    host: {
      id: raw.host.id,
      fullName: raw.host.full_name,
      avatarUrl: raw.host.avatar_url,
      joinedAt: raw.host.created_at,
    },
    pricing: {
      amount: raw.pricing.amount,
      currency: raw.pricing.currency,
      billingPeriod: raw.pricing.billing_period,
      securityDeposit: raw.pricing.security_deposit,
      maintenanceFee: raw.pricing.maintenance_fee,
      maintenanceFeePeriod: raw.pricing.maintenance_fee_period,
      minimumDuration: raw.pricing.minimum_duration,
      maximumDuration: raw.pricing.maximum_duration,
    },
    availability: {
      availableFrom: raw.availability.available_from,
      availableUnits: raw.availability.available_units,
      status: raw.availability.status,
    },
    images: (raw.images || []).map((img: any) => ({
      url: resolveImageUrl(img.image_url) || '',
      displayOrder: img.display_order,
    })),
    amenities: (raw.amenities || []).map((am: any) => ({
      name: am.name,
      icon: am.icon,
    })),
    createdAt: raw.created_at,
  };
}

// ---------------------------------------------------------------------------
// Search (URL-driven, /s page)
// ---------------------------------------------------------------------------

export interface SearchResult {
  data: ListingCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Execute a filtered, sorted, paginated search via the `search_listings` RPC.
 * Accepts the validated `SearchFilters` produced by `parseSearchParams()`.
 */
export async function searchListings(
  filters: SearchFilters
): Promise<SearchResult> {
  const supabase = await createClient();

  const accommodationTypeId = resolveAccommodationTypeId(
    filters.accommodationType
  );

  const { data, error } = await supabase.rpc('search_listings', {
    p_city: filters.city,
    p_locality: filters.locality,
    p_accommodation_type_id: accommodationTypeId,
    p_furnishing: filters.furnishing,
    p_gender_preference: filters.genderPreference,
    p_occupancy_type: filters.occupancyType,
    p_billing_period: filters.billingPeriod,
    p_amenities: filters.amenities.length > 0 ? filters.amenities : null,
    p_min_price: filters.minPrice,
    p_max_price: filters.maxPrice,
    p_available_from: filters.availableFrom,
    p_sort: filters.sort,
    p_page: filters.page,
    p_page_size: filters.pageSize,
    p_min_lat: filters.minLat,
    p_max_lat: filters.maxLat,
    p_min_lng: filters.minLng,
    p_max_lng: filters.maxLng,
    p_center_lat: filters.centerLat,
    p_center_lng: filters.centerLng,
  });

  if (error) {
    console.error('Error in searchListings RPC:', error);
    return {
      data: [],
      total: 0,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: 0,
    };
  }

  const rows = (data || []) as any[];
  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
  const totalPages = Math.ceil(total / filters.pageSize);

  const mappedData: ListingCardData[] = rows.map((row: any) => ({
    publicId: row.public_id,
    title: row.title,
    accommodationType: row.accommodation_type_name,
    furnishing: row.furnishing,
    genderPreference: row.gender_preference,
    occupancyType: row.occupancy_type,
    location: {
      locality: row.locality,
      city: row.city,
      formattedAddress: row.formatted_address,
      latitude: row.latitude || null,
      longitude: row.longitude || null,
    },
    pricing: {
      amount: row.price_amount,
      currency: row.price_currency,
      billingPeriod: row.price_billing_period,
      minimumDuration: row.price_minimum_duration,
    },
    imageUrl: resolveImageUrl(row.image_url),
  }));

  return {
    data: mappedData,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages,
  };
}

// ---------------------------------------------------------------------------
// Real Location Insights & Discovery Queries (No Fake Data)
// ---------------------------------------------------------------------------

interface InsightListingRow {
  furnishing: string | null;
  locality: string | null;
  listing_prices?: { amount: number | string }[];
}

export async function getLocationInsightsQuery(city?: string): Promise<{
  listingCount: number;
  averageRent: number;
  medianRent: number;
  furnishedPercentage: number;
  popularAreas: string[];
  updatedAt: Date;
}> {
  const supabase = await createClient();

  let query = supabase
    .from('listings')
    .select(
      `
      furnishing,
      locality,
      listing_prices!inner ( amount )
    `
    )
    .eq('status', 'published');

  if (city) {
    query = query.ilike('city', `%${city}%`);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    return {
      listingCount: 0,
      averageRent: 0,
      medianRent: 0,
      furnishedPercentage: 0,
      popularAreas: [],
      updatedAt: new Date(),
    };
  }

  const rows = data as unknown as InsightListingRow[];
  const listingCount = rows.length;

  const rents: number[] = rows
    .map((r) =>
      r.listing_prices && r.listing_prices[0]?.amount
        ? Number(r.listing_prices[0].amount)
        : 0
    )
    .filter((amount) => amount > 0)
    .sort((a, b) => a - b);

  let averageRent = 0;
  let medianRent = 0;

  if (rents.length > 0) {
    const totalRent = rents.reduce((sum, val) => sum + val, 0);
    averageRent = Math.round(totalRent / rents.length);

    const mid = Math.floor(rents.length / 2);
    if (rents.length % 2 === 0) {
      medianRent = Math.round((rents[mid - 1] + rents[mid]) / 2);
    } else {
      medianRent = rents[mid];
    }
  }

  const furnishedCount = rows.filter(
    (r) =>
      r.furnishing === 'fully_furnished' || r.furnishing === 'semi_furnished'
  ).length;
  const furnishedPercentage = Math.round((furnishedCount / listingCount) * 100);

  const localityCounts = rows.reduce(
    (acc: Record<string, number>, r) => {
      if (
        r.locality &&
        typeof r.locality === 'string' &&
        r.locality.trim() !== ''
      ) {
        const loc = r.locality.trim();
        acc[loc] = (acc[loc] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const popularAreas = Object.entries(localityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([loc]) => loc);

  return {
    listingCount,
    averageRent,
    medianRent,
    furnishedPercentage,
    popularAreas,
    updatedAt: new Date(),
  };
}

interface SuggestionRow {
  city: string | null;
  locality: string | null;
  accommodation_types?: { name?: string } | null;
}

export async function getDiscoverySuggestionsQuery(city?: string): Promise<{
  nearbyLocalities: string[];
  suggestedCities: string[];
  popularSearches: string[];
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('listings')
    .select('city, locality, accommodation_types!inner(name)')
    .eq('status', 'published');

  if (error || !data || data.length === 0) {
    return {
      nearbyLocalities: [],
      suggestedCities: [],
      popularSearches: [],
    };
  }

  const rows = data as unknown as SuggestionRow[];

  const citySet = new Set<string>();
  const localitySet = new Set<string>();
  const accSet = new Set<string>();

  rows.forEach((row) => {
    if (row.city) citySet.add(row.city.trim());
    if (
      city &&
      row.city &&
      row.city.toLowerCase() === city.toLowerCase() &&
      row.locality
    ) {
      localitySet.add(row.locality.trim());
    } else if (!city && row.locality) {
      localitySet.add(row.locality.trim());
    }
    if (row.accommodation_types?.name) {
      accSet.add(row.accommodation_types.name.trim());
    }
  });

  const suggestedCities = Array.from(citySet).slice(0, 5);
  const nearbyLocalities = Array.from(localitySet).slice(0, 5);
  const popularSearches = Array.from(accSet)
    .map((acc) => `${acc} listed in ${suggestedCities[0] || 'catalog'}`)
    .slice(0, 3);

  return {
    nearbyLocalities,
    suggestedCities,
    popularSearches,
  };
}
