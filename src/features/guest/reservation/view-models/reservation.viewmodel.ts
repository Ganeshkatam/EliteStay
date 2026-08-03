import { Database } from '@/types/database.types';
import {
  ReservationState,
  AvailabilityResult,
  PriceQuote,
  GuestDetails,
} from '../types/reservation.types';

type ListingRow = Database['public']['Tables']['listings']['Row'];
type ListingImageRow = Database['public']['Tables']['listing_images']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface ReservationViewModel {
  listing: {
    id: string;
    publicId: string;
    title: string;
    accommodationType: string;
    roomType: string;
    genderPreference: string | null;
    cancellationPolicy: string;
    coverImageUrl: string | null;
    host: {
      name: string;
      avatarUrl: string | null;
    };
  };
  stay: {
    moveInDate: Date | null;
    duration: number | null;
    moveOutDate: Date | null;
  };
  guest: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    messageToHost: string;
  };
  pricing: PriceQuote | null;
  availability: AvailabilityResult;
  progress: {
    currentState: ReservationState;
    percentage: number;
  };
}

export class ReservationViewModelFactory {
  static create(
    listing: ListingRow & {
      images: ListingImageRow[];
      host: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_storage_path'> | null;
    },
    moveInDate: Date | null,
    duration: number | null,
    availability: AvailabilityResult,
    pricing: PriceQuote | null,
    guestDetails: GuestDetails | null,
    currentState: ReservationState
  ): ReservationViewModel {
    // Calculate move out date if we have in date and duration
    let moveOutDate: Date | null = null;
    if (moveInDate && duration) {
      moveOutDate = new Date(moveInDate);
      moveOutDate.setMonth(moveOutDate.getMonth() + duration);
    }

    // Determine cover image
    let coverImageUrl = null;
    if (listing.images && listing.images.length > 0) {
      const cover =
        listing.images.find((img) => img.is_cover) || listing.images[0];
      coverImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/${cover.storage_path}`;
    }

    // Map XState state to progress percentage
    const progressMap: Record<ReservationState, number> = {
      [ReservationState.DRAFT]: 10,
      [ReservationState.AVAILABILITY_CHECKED]: 40,
      [ReservationState.PRICE_LOCKED]: 60,
      [ReservationState.GUEST_DETAILS_COMPLETED]: 80,
      [ReservationState.AWAITING_AUTH]: 90,
      [ReservationState.READY_FOR_BOOKING]: 100,
    };

    return {
      listing: {
        id: listing.id,
        publicId: listing.public_id,
        title: listing.title,
        accommodationType: listing.accommodation_type_id, // Would map to name in real app
        roomType: listing.occupancy_type || 'Unknown',
        genderPreference: listing.gender_preference,
        cancellationPolicy: 'Moderate', // Stubbed until DB has this
        coverImageUrl,
        host: {
          name: listing.host?.full_name || 'Unknown Host',
          avatarUrl: listing.host?.avatar_storage_path
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${listing.host.avatar_storage_path}`
            : null,
        },
      },
      stay: {
        moveInDate,
        duration,
        moveOutDate,
      },
      guest: {
        firstName: guestDetails?.firstName || '',
        lastName: guestDetails?.lastName || '',
        phone: guestDetails?.phone || '',
        email: guestDetails?.email || '',
        messageToHost: guestDetails?.messageToHost || '',
      },
      pricing,
      availability,
      progress: {
        currentState,
        percentage: progressMap[currentState] || 0,
      },
    };
  }
}
