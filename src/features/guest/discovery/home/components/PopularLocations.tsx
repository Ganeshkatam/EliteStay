import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { LocationService } from '@/features/location/services/location-service';
import { observeServerComponent } from '@/lib/observability/instrumentation/react-observer';

/** Local city cover images keyed by slug (stored in public/images/cities/) */
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

import { PopularLocationItem } from '../types/home-snapshot.types';

function resolveCityImageUrl(storagePath: string | null, slug: string): string {
  if (storagePath) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/city-images/${storagePath}`;
  }
  return LOCAL_CITY_IMAGES[slug] || '/images/placeholder-city.png';
}

interface PopularLocationsProps {
  locations?: PopularLocationItem[];
}

export async function PopularLocations({
  locations: initialLocations,
}: PopularLocationsProps = {}) {
  return observeServerComponent('PopularLocations', async () => {
    let locations = initialLocations;

    if (!locations) {
      const cities = await LocationService.getFeaturedCities();
      if (!cities || cities.length === 0) {
        return null;
      }
      locations = cities.map((city) => ({
        id: city.id,
        name: city.name,
        slug: city.slug,
        imageUrl: resolveCityImageUrl(city.cover_image_storage_path, city.slug),
      }));
    }

    if (locations.length === 0) {
      return null;
    }

    return (
      <Container className="py-2">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Search by Cities
          </h2>
          <Link
            href="/s"
            className="text-xs font-semibold text-blue-600 hover:text-blue-500 whitespace-nowrap"
          >
            View all <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth">
          {locations.map((city) => {
            return (
              <div
                key={city.id}
                className="flex-shrink-0 w-[160px] sm:w-[200px] snap-start"
              >
                <Link
                  href={`/s?city=${city.slug}`}
                  className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Image
                    src={city.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 pr-2">
                    <span className="block text-sm sm:text-base font-bold text-white leading-tight">
                      {city.name}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </Container>
    );
  });
}
