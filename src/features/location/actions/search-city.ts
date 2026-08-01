'use server';

import { LocationService } from '../services/location-service';

export async function searchCitiesAction(query: string) {
  return await LocationService.searchCities(query);
}
