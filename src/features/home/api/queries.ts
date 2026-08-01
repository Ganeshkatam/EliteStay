import { createClient } from '@/lib/supabase/server';
import { ListingCardData } from '@/features/listings/types';
import { HomeSectionConfig } from '../config/sections';

function resolveImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/${path}`;
}

export async function getSectionListings(
  config: HomeSectionConfig
): Promise<ListingCardData[]> {
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
      created_at,
      accommodation_types!inner ( name ),
      listing_prices!inner ( amount, currency, billing_period, minimum_duration ),
      listing_images ( storage_path, display_order )
    `
    )
    .eq('status', 'published');

  // Apply basic sorting based on config
  if (config.filter?.sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (config.filter?.sort === 'price_asc') {
    // Note: sorting by related table columns via postgrest is complex,
    // so we'll fallback to recommended/newest if we can't sort directly.
    // For V1, we'll just sort by created_at for all as a fallback,
    // or rely on RPC if needed.
    query = query.order('created_at', { ascending: false });
  } else {
    // Default 'recommended'
    query = query.order('created_at', { ascending: false });
  }

  const { data: featuredData, error: featuredError } = await query.limit(
    config.limit
  );

  if (featuredError) {
    console.error('Error fetching homepage listings:', featuredError);
    return [];
  }

  // Map to Domain model
  interface RawSectionRow {
    public_id: string;
    title: string;
    accommodation_types: { name: string };
    furnishing: ListingCardData['furnishing'];
    gender_preference: ListingCardData['genderPreference'];
    occupancy_type: ListingCardData['occupancyType'];
    locality: string | null;
    city: string | null;
    formatted_address: string | null;
    latitude: number | null;
    longitude: number | null;
    listing_prices: Array<{
      amount: number;
      currency: string;
      billing_period: ListingCardData['pricing']['billingPeriod'];
      minimum_duration: number;
    }>;
    listing_images: Array<{
      display_order: number;
      storage_path: string;
    }> | null;
  }

  const rawRows = (featuredData || []) as unknown as RawSectionRow[];
  const listings: ListingCardData[] = rawRows.map((row) => ({
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
      (
        row.listing_images as Array<{
          display_order: number;
          storage_path: string;
        }>
      )?.sort((a, b) => a.display_order - b.display_order)?.[0]?.storage_path
    ),
  }));

  // If we had a specific "featured" flag, we would fetch those, then if count < limit,
  // fetch recent listings NOT IN the featured list to backfill.
  // Since we don't have an explicit 'is_featured' column in V1, we just return the 6 most recent.

  return listings;
}

export async function getCategoryCounts(
  typeIds: string[]
): Promise<Record<string, number>> {
  if (!typeIds.length) return {};
  const supabase = await createClient();

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
}

export async function getLocationCounts(
  cities: string[]
): Promise<Record<string, number>> {
  if (!cities.length) return {};
  const supabase = await createClient();

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
}
