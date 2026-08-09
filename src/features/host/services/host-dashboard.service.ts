import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { HostDashboardViewModel } from '../view-models/dashboard.viewmodel';
import { HostRepository } from '../repositories/host.repository';

export class HostDashboardService {
  static async getOverview(
    supabase: SupabaseClient<Database>,
    hostId: string
  ): Promise<HostDashboardViewModel> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', hostId)
      .single();

    const firstName = profile?.full_name?.split(' ')[0] || 'Host';

    // 1. Get properties
    const listings = await HostRepository.getListings(supabase, hostId);
    const propertiesCount = listings.length;

    if (propertiesCount === 0) {
      return {
        firstName,
        metrics: {
          propertiesCount: 0,
          applicationsCount: 0,
          occupiedCount: 0,
          availableCount: 0,
        },
        properties: [],
      };
    }

    const propertyIds = listings.map((l) => l.id);

    // 2. Get active applications
    const { count: applicationsCount } = await supabase
      .from('rental_applications')
      .select('id', { count: 'exact', head: true })
      .in('property_id', propertyIds)
      .in('status', ['SUBMITTED', 'UNDER_REVIEW']);

    // 3. Get active leases
    // Since leases map to reservations, and reservations map to properties
    const { data: activeLeases } = await supabase
      .from('leases')
      .select('id, reservations!inner(property_id)')
      .eq('status', 'ACTIVE');

    // Filter to only count leases for the host's properties
    let occupiedCount = 0;
    const occupiedPropertyIds = new Set<string>();

    if (activeLeases) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      activeLeases.forEach((lease: any) => {
        if (propertyIds.includes(lease.reservations.property_id)) {
          occupiedCount++;
          occupiedPropertyIds.add(lease.reservations.property_id);
        }
      });
    }

    // 4. Calculate available count
    // The MVP rule: listings where status = PUBLISHED AND occupancy != OCCUPIED
    let availableCount = 0;
    listings.forEach((listing) => {
      if (
        listing.status === 'published' &&
        !occupiedPropertyIds.has(listing.id)
      ) {
        availableCount++;
      }
    });

    return {
      firstName,
      metrics: {
        propertiesCount,
        applicationsCount: applicationsCount || 0,
        occupiedCount,
        availableCount,
      },
      properties: listings.map((l) => ({
        id: l.id,
        title: l.title,
        rentAmount: l.prices?.[0]?.amount || 0,
        status: occupiedPropertyIds.has(l.id)
          ? 'OCCUPIED'
          : l.status === 'published'
            ? 'PUBLISHED'
            : 'DRAFT',
      })),
    };
  }
}
