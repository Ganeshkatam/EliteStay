import { unstable_cache } from 'next/cache';
import { createStaticClient } from '@/lib/supabase/server';
import { ListingCardData } from '@/features/listings/types';
import { HomeSectionConfig } from '../config/sections';
import { resolveAccommodationTypeId } from './accommodation-type-cache';

function resolveImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/${path}`;
}

const getSectionListingsInternal = async (
  config: HomeSectionConfig
): Promise<ListingCardData[]> => {
  const supabase = createStaticClient();
  const sort = config.filter?.sort || 'recommended';

  const rpcParams: Record<string, unknown> = {
    p_sort: sort,
    p_page: 1,
    p_page_size: config.limit,
  };

  if (config.filter?.locality) {
    rpcParams.p_locality = config.filter.locality;
  }

  if (config.filter?.occupancy_type) {
    rpcParams.p_occupancy_type = config.filter.occupancy_type;
  }

  if (config.filter?.max_price) {
    rpcParams.p_max_price = parseFloat(config.filter.max_price);
  }

  if (config.filter?.accommodation_type_name) {
    const typeId = await resolveAccommodationTypeId(
      config.filter.accommodation_type_name
    );
    if (typeId) {
      rpcParams.p_accommodation_type_id = typeId;
    }
  }

  const { data, error } = await supabase.rpc('search_listings', rpcParams);

  if (error) {
    console.error('Error fetching homepage section listings:', error);
    return [];
  }

  interface RpcListingRow {
    public_id: string;
    title: string;
    accommodation_type_name: string;
    furnishing: ListingCardData['furnishing'];
    gender_preference: ListingCardData['genderPreference'];
    occupancy_type: ListingCardData['occupancyType'];
    locality: string | null;
    city: string | null;
    formatted_address: string | null;
    latitude: number | null;
    longitude: number | null;
    price_amount: number;
    price_currency: string;
    price_billing_period: ListingCardData['pricing']['billingPeriod'];
    price_minimum_duration: number;
    image_url: string | null;
  }

  const rows = (data || []) as unknown as RpcListingRow[];

  return rows.map((row) => ({
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
};

export const getSectionListings = unstable_cache(
  async (config: HomeSectionConfig) => getSectionListingsInternal(config),
  ['home-section-listings'],
  { revalidate: 3600, tags: ['home', 'listings'] }
);

const getCategoryCountsInternal = async (
  typeIds: string[]
): Promise<Record<string, number>> => {
  if (!typeIds.length) return {};
  const supabase = createStaticClient();

  // To avoid N+1 count queries, we can use an RPC, or just do a generic aggregation.
  // Since this is V1 and we have a small dataset, we can do parallel count requests.
  const counts: Record<string, number> = {};

  await Promise.all(
    typeIds.map(async (id) => {
      const { count } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('accommodation_type_id', id)
        .eq('status', 'published');

      counts[id] = count ?? 0;
    })
  );

  return counts;
};

export const getCategoryCounts = unstable_cache(
  async (typeIds: string[]) => getCategoryCountsInternal(typeIds),
  ['home-category-counts'],
  { revalidate: 3600, tags: ['home', 'categories'] }
);

const getLocationCountsInternal = async (
  cities: string[]
): Promise<Record<string, number>> => {
  if (!cities.length) return {};
  const supabase = createStaticClient();

  const counts: Record<string, number> = {};

  await Promise.all(
    cities.map(async (city) => {
      const { count } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .ilike('city', city)
        .eq('status', 'published');

      counts[city] = count || 0;
    })
  );

  return counts;
};

export const getLocationCounts = unstable_cache(
  async (cities: string[]) => getLocationCountsInternal(cities),
  ['home-location-counts'],
  { revalidate: 3600, tags: ['home', 'locations'] }
);
