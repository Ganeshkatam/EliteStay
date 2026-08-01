import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { LocationService } from '@/features/location/services/location-service';
import { createClient } from '@/lib/supabase/server';
import { HomepageRail } from './HomepageRail';

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
          Popular Locations
        </h2>
        <Link
          href="/s"
          className="text-xs font-semibold text-blue-600 hover:text-blue-500 whitespace-nowrap"
        >
          View all <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      <HomepageRail>
        {cities.map((city) => {
          // Get public URL for cover image if it exists
          let imageUrl = '/images/placeholder-city.png'; // default placeholder
          if (city.cover_image_storage_path) {
            const { data } = supabase.storage
              .from('city-images')
              .getPublicUrl(city.cover_image_storage_path);
            imageUrl = data.publicUrl;
          }

          return (
            <div
              key={city.id}
              className="flex-shrink-0 w-[170px] sm:w-[210px] snap-start"
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
      </HomepageRail>
    </Container>
  );
}
