import { Database } from '@/types/database.types';

export type LocationCity = Database['public']['Tables']['cities']['Row'];

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  provider: string;
  providerPlaceId?: string;
  confidence?: number;
  raw?: unknown;
}

export interface GeocodingProvider {
  geocode(address: string): Promise<GeocodeResult>;
}
