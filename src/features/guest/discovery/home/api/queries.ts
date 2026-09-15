import { createStaticClient } from '@/lib/supabase/server';
import { ListingCardData } from '@/features/listings/types';
import { HomeSectionConfig } from '../config/sections';
import { resolveAccommodationTypeId } from './accommodation-type-cache';
import { Cache, CacheManifest } from '@/lib/redis';

function resolveImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/${path}`;
}

export const fetchSectionListings = async (
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

  if (error && error.message) {
    console.error(
      `Error fetching homepage section listings [${config.id}]:`,
      JSON.stringify({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
    );
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

export async function getSectionListings(
  config: HomeSectionConfig
): Promise<ListingCardData[]> {
  const result = await Cache.fetch<ListingCardData[]>(
    CacheManifest.homeSectionListings(config.id),
    () => fetchSectionListings(config)
  );

  return result || [];
}

export const fetchCategoryCountsInternal = async (
  typeIds: string[]
): Promise<Record<string, number>> => {
  if (!typeIds.length) return {};
  const supabase = createStaticClient();

  const { data, error } = await supabase
    .from('listings')
    .select('accommodation_type_id')
    .in('accommodation_type_id', typeIds)
    .eq('status', 'published');

  const counts: Record<string, number> = {};
  typeIds.forEach((id) => {
    counts[id] = 0;
  });

  if (!error && data) {
    for (const row of data) {
      if (row.accommodation_type_id) {
        counts[row.accommodation_type_id] =
          (counts[row.accommodation_type_id] || 0) + 1;
      }
    }
  }

  return counts;
};

export async function getCategoryCounts(
  typeIds: string[]
): Promise<Record<string, number>> {
  const result = await Cache.fetch<Record<string, number>>(
    CacheManifest.homeCategories(),
    () => fetchCategoryCountsInternal(typeIds)
  );

  return result || {};
}

export const fetchLocationCountsInternal = async (
  cities: string[]
): Promise<Record<string, number>> => {
  if (!cities.length) return {};
  const supabase = createStaticClient();

  const { data, error } = await supabase
    .from('listings')
    .select('city')
    .eq('status', 'published');

  const counts: Record<string, number> = {};
  cities.forEach((city) => {
    counts[city] = 0;
  });

  if (!error && data) {
    for (const row of data) {
      if (row.city) {
        const matchedCity = cities.find(
          (c) => c.toLowerCase() === row.city.toLowerCase()
        );
        if (matchedCity) {
          counts[matchedCity] = (counts[matchedCity] || 0) + 1;
        }
      }
    }
  }

  return counts;
};

export async function getLocationCounts(
  cities: string[]
): Promise<Record<string, number>> {
  const result = await Cache.fetch<Record<string, number>>(
    CacheManifest.homeLocationCounts(cities),
    () => fetchLocationCountsInternal(cities)
  );

  return result || {};
}
