import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { HostDashboardViewModel } from '../view-models/dashboard.viewmodel';
import { HostTimelineViewModel } from '../view-models/timeline.viewmodel';
import { HostRepository } from '../repositories/host.repository';
import { DashboardRepository } from '../repositories/dashboard.repository';
import { TimelineRepository } from '../repositories/timeline.repository';
import { RawListingData } from '../view-models/listing-health.viewmodel';
import { DashboardService } from './dashboard.service';
import { TimelineService } from './timeline.service';

export class HostOperationsService {
  static async getDashboardOverview(
    supabase: SupabaseClient<Database>,
    hostId: string
  ): Promise<HostDashboardViewModel> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', hostId)
      .single();

    const firstName = profile?.full_name?.split(' ')[0] || 'Host';

    const [listings, pendingBookingsCount] = await Promise.all([
      HostRepository.getListings(supabase, hostId),
      DashboardRepository.getPendingBookingsCount(supabase, hostId),
    ]);

    const hasListings = listings.length > 0;
    const rawListings = listings as unknown as RawListingData[];

    const kpis = DashboardService.getKPIs(rawListings, pendingBookingsCount);
    const attentionItems = DashboardService.getAttentionItems(
      rawListings,
      pendingBookingsCount
    );
    const quickActions = DashboardService.getQuickActions(
      rawListings,
      pendingBookingsCount
    );

    return {
      firstName,
      kpis,
      attentionItems,
      quickActions,
      hasListings,
    };
  }

  static async getOperationsTimeline(
    supabase: SupabaseClient<Database>,
    hostId: string
  ): Promise<HostTimelineViewModel> {
    const listings = await HostRepository.getListings(supabase, hostId);
    const listingIds = listings.map((l) => l.id);

    if (listingIds.length === 0) {
      return {
        today: [],
        tomorrow: [],
        thisWeek: [],
        upcoming: [],
      };
    }

    const [stays, bookings, availability] = await Promise.all([
      TimelineRepository.getStays(supabase, listingIds),
      TimelineRepository.getBookings(supabase, listingIds),
      TimelineRepository.getAvailabilityBlocks(supabase, listingIds),
    ]);

    const timelineListingData = listings.map((l) => ({
      id: l.id,
      title: l.title,
    }));
    return TimelineService.getTimelineEvents(
      timelineListingData,
      stays,
      bookings,
      availability
    );
  }
}
