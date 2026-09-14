import { Cache, CacheManifest } from '@/lib/redis';
import { getAccommodationTypes } from '../api/accommodation-type-cache';
import { fetchSectionListings } from '../api/queries';
import { homepageConfig } from '../config/sections';
import { LocationService } from '@/features/location/services/location-service';
import {
  GuestHomeSnapshot,
  PopularLocationItem,
} from '../types/home-snapshot.types';

const LOCAL_CITY_IMAGES: Record<string, string> = {
  bangalore: '/images/cities/bangalore.jpg',
  mumbai: '/images/cities/mumbai.jpg',
  'new-delhi': '/images/cities/new-delhi.jpg',
  hyderabad: '/images/cities/hyderabad.jpg',
  pune: '/images/cities/pune.jpg',
  chennai: '/images/cities/chennai.jpg',
  kolkata: '/images/cities/kolkata.jpg',
  ahmedabad: '/images/cities/ahmedabad.jpg',
  noida: '/images/cities/noida.jpg',
  gurgaon: '/images/cities/gurgaon.jpg',
  jaipur: '/images/cities/jaipur.jpg',
  lucknow: '/images/cities/lucknow.jpg',
  chandigarh: '/images/cities/chandigarh.jpg',
  kochi: '/images/cities/kochi.jpg',
  indore: '/images/cities/indore.jpg',
  visakhapatnam: '/images/cities/visakhapatnam.jpg',
  vijayawada: '/images/cities/vijayawada.jpg',
  guntur: '/images/cities/guntur.jpg',
  warangal: '/images/cities/warangal.jpg',
  tirupati: '/images/cities/tirupati.jpg',
  nellore: '/images/cities/nellore.jpg',
  rajahmundry: '/images/cities/rajahmundry.jpg',
  kakinada: '/images/cities/kakinada.jpg',
};

function resolveCityImageUrl(storagePath: string | null, slug: string): string {
  if (storagePath) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/city-images/${storagePath}`;
  }
  return LOCAL_CITY_IMAGES[slug] || '/images/placeholder-city.png';
}

/**
 * HomeService
 *
 * Authoritative population and retrieval service for the Guest Home Read Model.
 * Consolidates categories, all homepage sections, and featured locations into a single
 * composite snapshot cached in Redis. Hot requests require exactly 1 Redis GET.
 */
export class HomeService {
  static async getHomeSnapshot(): Promise<GuestHomeSnapshot> {
    const version = 1;

    const result = await Cache.fetch<GuestHomeSnapshot>(
      CacheManifest.homeSnapshot(version),
      async () => {
        // Cold path population: execute aggregations and section queries concurrently
        const [categories, sections, rawCities] = await Promise.all([
          getAccommodationTypes(),
          Promise.all(
            homepageConfig.map(async (config) => ({
              config,
              listings: await fetchSectionListings(config),
            }))
          ),
          LocationService.getFeaturedCities(),
        ]);

        const locations: PopularLocationItem[] = (rawCities || []).map(
          (city) => ({
            id: city.id,
            name: city.name,
            slug: city.slug,
            imageUrl: resolveCityImageUrl(
              city.cover_image_storage_path,
              city.slug
            ),
          })
        );

        return {
          title: 'Find your next place to live',
          categories: categories || [],
          sections,
          locations,
        };
      }
    );

    return (
      result || {
        title: 'Find your next place to live',
        categories: [],
        sections: [],
        locations: [],
      }
    );
  }
}
