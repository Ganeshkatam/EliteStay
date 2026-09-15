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

    // Check host's booking acceptance preferences
    if (listing.host_id) {
      const { data: hostPrefs } = await supabase
        .from('user_preferences')
        .select('hosting')
        .eq('user_id', listing.host_id)
        .maybeSingle();

      const hosting = hostPrefs?.hosting as {
        accept_booking_requests?: boolean;
      } | null;
      if (hosting?.accept_booking_requests === false) {
        return null;
      }
    }

    return listing;
  }
}
