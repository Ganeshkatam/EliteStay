import Link from 'next/link';
import * as Icons from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { getAccommodationTypes } from '../api/accommodation-type-cache';

export async function Categories() {
  const types = await getAccommodationTypes();

  return (
    <Container className="py-2">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-4">
        Browse by category
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth">
        {types.map((type) => {
          const iconKey = (type.icon || 'home')
            .split('-')
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join('');
          const IconComponent =
            (Icons as unknown as Record<string, React.ElementType>)[iconKey] ||
            Icons.Home;

          return (
            <div
              key={type.slug}
              className="flex-shrink-0 w-[140px] sm:w-[150px] lg:w-[160px] snap-start"
            >
              <Link
                href={`/s?accommodationType=${type.slug}`}
                className="group flex flex-col items-start justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:border-blue-600 hover:shadow-lg w-full h-full"
              >
                <div className="rounded-full bg-slate-50 p-2.5 group-hover:bg-blue-50 transition-colors">
                  <IconComponent className="h-5 w-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="w-full mt-1">
                  <span className="block text-sm font-bold text-gray-900 leading-tight">
                    {type.name}
                  </span>
                  <span className="block text-[11px] text-gray-400 mt-1 line-clamp-2 leading-snug">
                    {type.description}
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
