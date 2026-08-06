import { createStaticClient } from '@/lib/supabase/server';
import { observeRepository } from '@/lib/observability/decorators/observe-repository';

export class PropertyRepository {
  /**
   * Validates if a public ID matches its canonical slug.
   * Useful for the 301 redirect logic.
   */
  static async getCanonicalSlug(publicId: string): Promise<string | null> {
    return observeRepository(
      'PropertyRepository',
      'getCanonicalSlug',
      'listings',
      async () => {
        const supabase = createStaticClient();
        const { data, error } = await supabase
          .from('listings')
          .select('title, city')
          .eq('public_id', publicId)
          .single();

        if (error || !data) return null;

        // Generate slug from title and city
        const slugSource = `${data.title} ${data.city}`;
        return slugSource
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }
    );
  }
  static async getBaseDetails(publicId: string) {
    return observeRepository(
      'PropertyRepository',
      'getBaseDetails',
      'listings',
      async () => {
        const supabase = createStaticClient();
        const { data, error } = await supabase
          .from('listings')
          .select(
            `
          id,
          public_id,
          title,
          description,
          max_occupants,
          furnishing,
          gender_preference,
          occupancy_type,
          city,
          locality,
          formatted_address,
          latitude,
          longitude,
          booking_policy,
          accommodation_types!inner(name)
        `
          )
          .eq('public_id', publicId)
          .eq('status', 'published')
          .single();

        if (error || !data) return null;
        return data;
      }
    );
  }
  static async getMedia(publicId: string) {
    return observeRepository(
      'PropertyRepository',
      'getMedia',
      'listing_images',
      async () => {
        const supabase = createStaticClient();
        const { data, error } = await supabase
          .from('listing_images')
          .select(
            `
          id,
          storage_path,
          is_cover,
          display_order,
          listings!inner(public_id)
        `
          )
          .eq('listings.public_id', publicId)
          .order('is_cover', { ascending: false })
          .order('display_order', { ascending: true });

        if (error || !data) return [];
        return data;
      }
    );
  }
  static async getPricing(publicId: string) {
    return observeRepository(
      'PropertyRepository',
      'getPricing',
      'listing_prices',
      async () => {
        const supabase = createStaticClient();
        const { data, error } = await supabase
          .from('listing_prices')
          .select(
            `
          amount,
          currency,
          billing_period,
          security_deposit,
          maintenance_fee,
          maintenance_fee_period,
          minimum_duration,
          maximum_duration,
          listings!inner(public_id)
        `
          )
          .eq('listings.public_id', publicId)
          .single();

        if (error || !data) return null;
        return data;
      }
    );
  }
  static async getHost(publicId: string) {
    return observeRepository(
      'PropertyRepository',
      'getHost',
      'listings',
      async () => {
        const supabase = createStaticClient();
        const { data, error } = await supabase
          .from('listings')
          .select(
            `
          host_id,
          profiles!listings_host_id_fkey(
            display_name,
            avatar_storage_path,
            created_at
          ),
          host_profiles!listings_host_id_fkey(
            identity_verified_at
          )
        `
          )
          .eq('public_id', publicId)
          .single();

        if (error || !data) return null;
        return data;
      }
    );
  }
  static async getAmenities(publicId: string) {
    return observeRepository(
      'PropertyRepository',
      'getAmenities',
      'listing_amenities',
      async () => {
        const supabase = createStaticClient();
        const { data, error } = await supabase
          .from('listing_amenities')
          .select(
            `
          amenities!inner(
            id,
            name,
            icon,
            is_featured,
            category_id
          ),
          listings!inner(public_id)
        `
          )
          .eq('listings.public_id', publicId);

        if (error || !data) return [];
        return data;
      }
    );
  }
  static async getReviews(publicId: string, limit: number = 4) {
    return observeRepository(
      'PropertyRepository',
      'getReviews',
      'reviews',
      async () => {
        const supabase = createStaticClient();

        // First get the listing id for aggregations
        const { data: listingData } = await supabase
          .from('listings')
          .select('id')
          .eq('public_id', publicId)
          .single();

        if (!listingData) return { summary: null, reviews: [] };

        // Fetch the recent reviews
        const { data: reviews } = await supabase
          .from('reviews')
          .select(
            `
          id,
          rating,
          comment,
          created_at,
          profiles!reviews_guest_id_fkey(
            display_name,
            avatar_storage_path
          )
        `
          )
          .eq('listing_id', listingData.id)
          .order('created_at', { ascending: false })
          .limit(limit);

        // Fetch aggregation (simplified)
        const { data: summaryData } = await supabase.rpc(
          'get_listing_review_stats',
          { p_listing_id: listingData.id }
        );

        // Note: If get_listing_review_stats is not defined, we could do a count/avg query here
        // For now we will return what we fetch and compute a simple summary

        return {
          reviews: reviews || [],
          summary: summaryData,
        };
      }
    );
  }
}
