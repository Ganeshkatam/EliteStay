import Link from 'next/link';
import { HOME_CATEGORIES } from '../constants';
import * as Icons from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { getCategoryCounts } from '../api/queries';
import { resolveAccommodationTypeId } from '@/features/search/lib/accommodation-types';

export async function Categories() {
  const typeIds = HOME_CATEGORIES.map((c) =>
    resolveAccommodationTypeId(c.slug)
  ).filter(Boolean) as string[];
  const counts = await getCategoryCounts(typeIds);

  return (
    <Container className="py-2">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">
        Browse by category
      </h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {HOME_CATEGORIES.map((category) => {
          // Dynamically resolve icon from Lucide
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const IconComponent =
            (Icons as any)[
              category.icon
                .split('-')
                .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                .join('')
            ] || Icons.Home;

          return (
            <Link
              key={category.slug}
              href={`/s?accommodationType=${category.slug}`}
              className="group flex min-w-[160px] snap-start flex-col items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:border-blue-600 hover:shadow-lg"
            >
              <div className="rounded-full bg-slate-50 p-3 group-hover:bg-blue-50 transition-colors">
                <IconComponent className="h-6 w-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="w-full mt-2">
                <span className="block text-base font-bold text-gray-900">
                  {category.label}
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-medium text-gray-500">
                    {counts[resolveAccommodationTypeId(category.slug) || ''] ||
                      0}{' '}
                    stays
                  </span>
                  <span className="text-blue-600 font-bold opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                    &rarr;
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
