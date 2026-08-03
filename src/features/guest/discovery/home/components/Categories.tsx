import Link from 'next/link';
import { HOME_CATEGORIES } from '../constants';
import * as Icons from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { createClient } from '@/lib/supabase/server';

export async function Categories() {
  const supabase = await createClient();
  const { data: types } = await supabase
    .from('accommodation_types')
    .select('name, description');

  return (
    <Container className="py-2">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-4">
        Browse by category
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {HOME_CATEGORIES.map((category) => {
          const iconKey = category.icon
            .split('-')
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join('');
          const IconComponent =
            (Icons as unknown as Record<string, React.ElementType>)[iconKey] ||
            Icons.Home;

          // Find description from database if available
          const dbType = types?.find(
            (t) =>
              t.name.toLowerCase().replace('-', '') ===
              category.slug.toLowerCase().replace('-', '')
          );
          const description = dbType?.description || category.description;

          return (
            <div key={category.slug} className="w-full">
              <Link
                href={`/s?accommodationType=${category.slug}`}
                className="group flex flex-col items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:border-blue-600 hover:shadow-lg w-full h-full"
              >
                <div className="rounded-full bg-slate-50 p-3 group-hover:bg-blue-50 transition-colors">
                  <IconComponent className="h-6 w-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="w-full mt-2">
                  <span className="block text-base font-bold text-gray-900 leading-tight">
                    {category.label}
                  </span>
                  <span className="block text-[11px] text-gray-400 mt-0.5 line-clamp-1 leading-snug">
                    {description}
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
