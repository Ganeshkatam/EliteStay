import { GeocodeResult, GeocodingProvider } from '../types';

export class NominatimProvider implements GeocodingProvider {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org/search';
  
  // Rate limiting helper
  private static lastRequestTime = 0;
  private readonly minDelayMs = 1100; // 1 request per second max

  private async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - NominatimProvider.lastRequestTime;
    
    if (timeSinceLastRequest < this.minDelayMs) {
      const waitTime = this.minDelayMs - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    NominatimProvider.lastRequestTime = Date.now();
  }

  async geocode(address: string): Promise<GeocodeResult> {
    await this.enforceRateLimit();

    const params = new URLSearchParams({
      q: address,
      format: 'jsonv2',
      countrycodes: 'in', // Limit to India
      limit: '1',
    });

    const url = `${this.baseUrl}?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EliteStay/1.0 (Student Project for B.Tech)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error('Address not found');
    }

    const result = data[0];

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formattedAddress: result.display_name,
      provider: 'nominatim',
      providerPlaceId: result.place_id ? String(result.place_id) : undefined,
      confidence: result.importance ? parseFloat(result.importance) : undefined,
      raw: result,
    };
  }
}
