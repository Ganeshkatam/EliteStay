import { createClient } from '@/lib/supabase/server';
import { LocationCity } from '../types';

export const LocationRepository = {
  async getFeaturedCities(): Promise<LocationCity[]> {
    const supabase = await createClient();

    const { data: cities, error } = await supabase
      .from('cities')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error fetching featured cities:', error);
      return [];
    }

    return cities || [];
  },

  async getCityListingCounts(
    cityIds: number[]
  ): Promise<Record<number, number>> {
    if (cityIds.length === 0) return {};

    const supabase = await createClient();
    const { data: countsData, error: countsError } = await supabase
      .from('listings')
      .select('city_id, id.count()')
      .in('city_id', cityIds)
      .eq('status', 'published');

    if (countsError) {
      console.error('Error fetching listing counts:', countsError);
      return {};
    }

    return countsData.reduce(
      (acc, curr: { city_id: number; count: number }) => {
        acc[curr.city_id] = curr.count;
        return acc;
      },
      {} as Record<number, number>
    );
  },

  async searchCities(query: string): Promise<LocationCity[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.${query}%,search_aliases.cs.{${query}}`)
      .order('name', { ascending: true })
      .limit(5);

    if (error) {
      console.error('Error searching cities:', error);
      return [];
    }

    return data || [];
  },

  async getCityBySlug(slug: string): Promise<LocationCity | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching city by slug:', error);
      return null;
    }

    return data;
  },
};
