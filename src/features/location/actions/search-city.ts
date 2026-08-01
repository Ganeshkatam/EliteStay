'use server';

import { LocationService } from '../services/location-service';

export async function searchCitiesAction(query: string) {
  return await LocationService.searchCities(query);
}

export async function getPopularCitiesAction() {
  return await LocationService.getFeaturedCities();
}
