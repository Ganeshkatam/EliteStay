import { createClient } from '@/lib/supabase/server';

export class ReservationRepository {
  /**
   * Fetches the complete listing domain entity required for the reservation context.
   * This includes base details, pricing, availability, and host profile.
   */
  static async getListingForReservation(publicId: string) {
    const supabase = await createClient();

    const { data: listing, error } = await supabase
      .from('listings')
      .select(
        `
        *,
        images:listing_images(*),
        pricing:listing_prices(*),
        availability:listing_availability(*),
        host:profiles(id, full_name, avatar_storage_path)
      `
      )
      .eq('public_id', publicId)
      .eq('status', 'PUBLISHED')
      .single();

    if (error || !listing) {
      return null;
    }

    return listing;
  }
}
