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
      max_occupants,
      locality,
      city,
      country,
      formatted_address,
      accommodation_types ( name ),
      listing_prices ( amount, currency, billing_period, minimum_duration ),
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
      country: row.country,
      formattedAddress: row.formatted_address,
    },
    maxOccupants: row.max_occupants,
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
      max_occupants,
      locality,
      city,
      country,
      formatted_address,
      accommodation_types ( name ),
      listing_prices ( amount, currency, billing_period, minimum_duration ),
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
      country: row.country,
      formattedAddress: row.formatted_address,
    },
    maxOccupants: row.max_occupants,
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
    publicId: raw.public_id,
    title: raw.title,
    description: raw.description,
    accommodationType: raw.accommodation_type.name,
    furnishing: raw.furnishing,
    genderPreference: raw.gender_preference,
    occupancyType: raw.occupancy_type,
    status: raw.status,
    maxOccupants: raw.max_occupants,
    location: {
      countryCode: raw.country_code,
      country: raw.country,
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
      country: row.country,
      formattedAddress: row.formatted_address,
    },
    maxOccupants: row.max_occupants,
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
