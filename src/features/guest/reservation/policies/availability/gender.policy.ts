import { Database } from '@/types/database.types';

type ListingRow = Database['public']['Tables']['listings']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export class GenderPolicy {
  /**
   * Evaluates gender compatibility based on the listing's gender preference and the guest's profile.
   * Returns isValid: false for hard blocks.
   * Returns warning: string for soft warnings (where isValid is still true).
   */
  static isValid(
    listing: ListingRow | null,
    guestProfile: Pick<ProfileRow, 'gender'> | null
  ): { isValid: boolean; reason?: string; warning?: string } {
    if (!listing) return { isValid: false, reason: 'Listing data missing.' };

    const preference = listing.gender_preference?.toLowerCase();

    // If no preference or ANY, it's always valid
    if (!preference || preference === 'any') {
      return { isValid: true };
    }

    // If guest isn't logged in yet, we can't do a hard block here.
    // The state machine will enforce auth before booking anyway.
    // We can emit a soft warning for the UI.
    if (!guestProfile || !guestProfile.gender) {
      return {
        isValid: true,
        warning: `Note: This listing prefers ${preference} guests.`,
      };
    }

    const guestGender = guestProfile.gender.toLowerCase();

    // Hard blocks for strict mismatches
    if (preference === 'male' && guestGender !== 'male') {
      return {
        isValid: false,
        reason: 'This listing is restricted to male guests only.',
      };
    }

    if (preference === 'female' && guestGender !== 'female') {
      return {
        isValid: false,
        reason: 'This listing is restricted to female guests only.',
      };
    }

    return { isValid: true };
  }
}
