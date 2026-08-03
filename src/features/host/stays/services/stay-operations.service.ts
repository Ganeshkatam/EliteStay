/*
==================================================
Domain: Host Stay & Resident Operations - Service Layer
Purpose: Thin orchestration service coordinating StayRepository, domain policies, and ViewModels.
==================================================
*/

import { createClient } from '@/lib/supabase/server';
import { type StayQueueType } from '../types/stay.types';
import { StayRepository } from '../repositories/stay.repository';
import {
  type StayWorkspaceViewModel,
  composeStayWorkspaceViewModel,
} from '../view-models/stay-workspace.viewmodel';

export class StayOperationsService {
  /**
   * Orchestrates database row fetching, policy evaluations, and workspace ViewModel composition per Service Orchestration Rule.
   * Performs zero inline SQL queries or manual KPI math calculations.
   */
  public static async getWorkspaceViewModel(
    hostId: string,
    activeQueue: StayQueueType = 'current-residents'
  ): Promise<StayWorkspaceViewModel> {
    const supabase = await createClient();

    // 1. Retrieve raw database persistence row models from repository
    const rows = await StayRepository.getHostStays(supabase, hostId);

    // 2. Delegate ViewModel building and policy classifications to factory function
    return composeStayWorkspaceViewModel(rows, activeQueue, new Date());
  }
}
