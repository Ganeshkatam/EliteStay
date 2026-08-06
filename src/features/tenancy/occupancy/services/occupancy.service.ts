import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/observability/logging/logger';

const _logger = logger.category('BUSINESS');

/**
 * OccupancyService
 *
 * Occupancy is a DERIVED PROJECTION. It is never edited directly.
 * It is updated purely by domain events:
 *   MOVE_IN_COMPLETED  -> occupancy_status = 'OCCUPIED'
 *   LEASE_EXPIRED      -> occupancy_status = 'VACATED'
 *   LEASE_TERMINATED   -> occupancy_status = 'VACATED'
 */
export class OccupancyService {
  /**
   * Transitions the lease occupancy status to OCCUPIED.
   * Called when MOVE_IN_COMPLETED is received.
   */
  static async markOccupied(leaseId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('leases')
      .update({ occupancy_status: 'OCCUPIED' })
      .eq('id', leaseId);

    if (error) {
      _logger.error('Failed to mark lease as OCCUPIED', {
        leaseId,
        error: error.message,
      });
      throw error;
    }

    _logger.info('Lease occupancy transitioned to OCCUPIED', { leaseId });
  }

  /**
   * Transitions the lease occupancy status to VACATED.
   * Called when LEASE_EXPIRED or LEASE_TERMINATED is received.
   */
  static async markVacated(leaseId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('leases')
      .update({ occupancy_status: 'VACATED' })
      .eq('id', leaseId);

    if (error) {
      _logger.error('Failed to mark lease as VACATED', {
        leaseId,
        error: error.message,
      });
      throw error;
    }

    _logger.info('Lease occupancy transitioned to VACATED', { leaseId });
  }
}
