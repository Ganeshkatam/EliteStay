// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createClient, createStaticClient } from '@/lib/supabase/server';
import { observeRepository } from '@/lib/observability/decorators/observe-repository';
import {
  StayReservation,
  ReservationStatus,
  PricingSnapshot,
  BookingIntent,
  ListingBookingPolicy,
} from '../types/booking.types';
import {
  AvailabilityConflictError,
  ConcurrencyConflictError,
} from '@/lib/domain/errors';

export class BookingRepository {
  /**
   * Fetches the booking policy for a property to determine the orchestrator branch.
   */
  static async getListingBookingPolicy(
    propertyId: string
  ): Promise<ListingBookingPolicy> {
    return observeRepository(
      'BookingRepository',
      'getListingBookingPolicy',
      'listings',
      async () => {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('listings')
          .select('booking_policy')
          .eq('id', propertyId)
          .single();

        if (error || !data) {
          throw new Error(
            `Failed to fetch booking policy: ${error?.message || 'Property not found'}`
          );
        }
        return data.booking_policy as ListingBookingPolicy;
      }
    );
  }

  /**
   * Transactionally checks availability and creates the reservation in DRAFT state.
   */
  static async createReservationSafe(
    guestId: string,
    intent: BookingIntent,
    snapshot: PricingSnapshot,
    monthlyRent: number,
    securityDeposit: number,
    maintenanceFee: number,
    utilities: number,
    brokerageFee: number,
    totalInitialPayment: number
  ): Promise<StayReservation> {
    return observeRepository(
      'BookingRepository',
      'createReservationSafe',
      'reservations',
      async () => {
        const supabase = await createClient();

        const { data, error } = await supabase.rpc('create_reservation_safe', {
          p_property_id: intent.propertyId,
          p_guest_id: guestId,
          p_check_in: intent.moveInDate, // fallback for legacy overlap check
          p_check_out: intent.moveInDate, // fallback
          p_guests_count: intent.guestsCount,
          p_base_price: monthlyRent,
          p_cleaning_fee: 0,
          p_service_fee: 0,
          p_tax_amount: 0,
          p_total_amount: totalInitialPayment,
          p_currency: intent.currency,
          p_snapshot_json: snapshot,
          p_idempotency_key: intent.idempotencyKey,
          p_lease_duration_months: intent.leaseDurationMonths,
          p_move_in_date: intent.moveInDate,
          p_security_deposit_amount: securityDeposit,
          p_maintenance_fee_amount: maintenanceFee,
          p_utilities_amount: utilities,
          p_brokerage_fee_amount: brokerageFee,
        });

        if (error) {
          if (error.code === 'P0001') {
            throw new AvailabilityConflictError();
          }
          // Unique violation on idempotency_key
          if (
            error.code === '23505' &&
            error.message.includes('idempotency_key')
          ) {
            throw new ConcurrencyConflictError(
              'Idempotency key already exists.'
            );
          }
          throw new Error(`Failed to create reservation: ${error.message}`);
        }

        return this.mapToDomain(data);
      }
    );
  }

  /**
   * Retrieves a reservation by idempotency key.
   * Useful for handling retries.
   */
  static async getByIdempotencyKey(
    idempotencyKey: string
  ): Promise<StayReservation | null> {
    return observeRepository(
      'BookingRepository',
      'getByIdempotencyKey',
      'reservations',
      async () => {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .eq('idempotency_key', idempotencyKey)
          .single();

        if (error || !data) return null;
        return this.mapToDomain(data);
      }
    );
  }

  /**
   * Retrieves a reservation by its ID.
   */
  static async getById(id: string): Promise<StayReservation | null> {
    return observeRepository(
      'BookingRepository',
      'getById',
      'reservations',
      async () => {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) return null;
        return this.mapToDomain(data);
      }
    );
  }

  /**
   * Updates reservation state using optimistic concurrency control.
   */
  static async transitionState(
    reservation: StayReservation,
    expectedState: ReservationStatus,
    newState: ReservationStatus,
    additionalUpdates?: { paymentIntentId?: string }
  ): Promise<StayReservation> {
    return observeRepository(
      'BookingRepository',
      'transitionState',
      'reservations',
      async () => {
        const supabase = await createClient();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: any = {
          status: newState,
          version: reservation.version + 1,
          updated_at: new Date().toISOString(),
        };

        if (additionalUpdates?.paymentIntentId !== undefined) {
          updates.payment_intent_id = additionalUpdates.paymentIntentId;
        }

        const { data, error } = await supabase
          .from('reservations')
          .update(updates)
          .eq('id', reservation.id)
          .eq('status', expectedState)
          .eq('version', reservation.version)
          .select()
          .single();

        if (error || !data) {
          throw new ConcurrencyConflictError(
            `State transition failed. Expected state ${expectedState} at version ${reservation.version}.`
          );
        }

        return this.mapToDomain(data);
      }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapToDomain(row: any): StayReservation {
    return {
      id: row.id,
      propertyId: row.property_id,
      guestId: row.guest_id,
      moveInDate: row.move_in_date || row.check_in,
      leaseDurationMonths: row.lease_duration_months || 1,
      guestsCount: row.guests_count,
      status: row.status,
      pricing: {
        monthlyRent: Number(row.base_price),
        securityDeposit: Number(row.security_deposit_amount || 0),
        maintenanceFee: Number(row.maintenance_fee_amount || 0),
        utilities: Number(row.utilities_amount || 0),
        brokerageFee: Number(row.brokerage_fee_amount || 0),
        totalInitialPayment: Number(row.total_amount),
        currency: row.currency,
        snapshotJson: row.snapshot_json as PricingSnapshot,
      },
      paymentIntentId: row.payment_intent_id,
      version: row.version,
      idempotencyKey: row.idempotency_key,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
