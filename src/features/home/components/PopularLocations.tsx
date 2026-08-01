import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { LocationService } from '@/features/location/services/location-service';
import { createClient } from '@/lib/supabase/server';

export async function PopularLocations() {
  const cities = await LocationService.getFeaturedCities();
  const supabase = await createClient();
  
  if (!cities || cities.length === 0) {
    return null; // or empty state
  }

  return (
    <Container className="py-2">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">
        Popular Locations
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
            <Link
              key={city.id}
              href={`/s?city=${city.slug}`}
              className="group relative h-[240px] w-full overflow-hidden rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <Image
                src={imageUrl}
                alt={city.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <span className="block text-xl font-bold text-white">{city.name}</span>
                <span className="block text-sm font-medium text-white/80 mt-1">
                  {city.listing_count || 0} stays
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
