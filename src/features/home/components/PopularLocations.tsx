import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { LocationService } from '@/features/location/services/location-service';
import { createClient } from '@/lib/supabase/server';

/** Local city cover images keyed by slug (stored in public/images/cities/) */
const LOCAL_CITY_IMAGES: Record<string, string> = {
  bangalore: '/images/cities/bangalore.png',
  mumbai: '/images/cities/mumbai.png',
  'new-delhi': '/images/cities/new-delhi.png',
  hyderabad: '/images/cities/hyderabad.png',
  pune: '/images/cities/pune.png',
  chennai: '/images/cities/chennai.png',
  kolkata: '/images/cities/kolkata.jpg',
  ahmedabad: '/images/cities/ahmedabad.jpg',
  noida: '/images/cities/noida.jpg',
  gurgaon: '/images/cities/gurgaon.jpg',
  jaipur: '/images/cities/jaipur.jpg',
  lucknow: '/images/cities/lucknow.jpg',
  chandigarh: '/images/cities/chandigarh.jpg',
  kochi: '/images/cities/kochi.jpg',
  indore: '/images/cities/indore.jpg',
};

export async function PopularLocations() {
  const cities = await LocationService.getFeaturedCities();
  const supabase = await createClient();

  if (!cities || cities.length === 0) {
    return null; // or empty state
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
        {cities.map((city) => {
          // Priority: local image > Supabase storage > placeholder
          let imageUrl =
            LOCAL_CITY_IMAGES[city.slug] ?? '/images/placeholder-city.png';
          if (city.cover_image_storage_path) {
            const { data } = supabase.storage
              .from('city-images')
              .getPublicUrl(city.cover_image_storage_path);
            imageUrl = data.publicUrl;
          }

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
                  src={imageUrl}
                  alt={city.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 pr-2">
                  <span className="block text-sm sm:text-base font-bold text-white leading-tight">
                    {city.name}
                  </span>
                  <span className="block text-[10px] sm:text-xs font-medium text-white/80 mt-0.5">
                    {city.listing_count || 0} stays
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </Container>
  );
}
