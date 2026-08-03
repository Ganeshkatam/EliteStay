export type SectionType =
  | 'featured'
  | 'recent'
  | 'popular_homes'
  | 'topRated'
  | 'budget'
  | 'pg'
  | 'hostel'
  | 'apartment'
  | 'independent_house'
  | 'villa'
  | 'service_apartment'
  | 'coliving';

export interface HomeSectionConfig {
  id: string;
  title: string;
  subtitle?: string;
  type: SectionType;
  filter: Record<string, string>;
  limit: number;
}

/**
 * Homepage sections grounded directly in the `public.accommodation_types` database table.
 */
export const homepageConfig: HomeSectionConfig[] = [
  {
    id: 'popular_homes',
    title: 'Popular Homes',
    subtitle: 'Highly sought-after living accommodations across top cities',
    type: 'popular_homes',
    filter: { sort: 'recommended' },
    limit: 8,
  },
  {
    id: 'pg',
    title: 'Paying Guest (PG) Accommodations',
    subtitle: 'Managed stays with home-style food & daily housekeeping',
    type: 'pg',
    filter: { accommodation_type_name: 'PG' },
    limit: 8,
  },
  {
    id: 'hostel',
    title: 'Student Hostels',
    subtitle: 'Vibrant student communities near universities & coaching hubs',
    type: 'hostel',
    filter: { accommodation_type_name: 'Hostel' },
    limit: 8,
  },
  {
    id: 'apartment',
    title: 'Independent Apartments',
    subtitle: 'Fully independent private flats ready for move-in',
    type: 'apartment',
    filter: { accommodation_type_name: 'Apartment' },
    limit: 8,
  },
  {
    id: 'coliving',
    title: 'Co-living Hubs',
    subtitle: 'Social hubs for working professionals with modern amenities',
    type: 'coliving',
    filter: { accommodation_type_name: 'Co-living' },
    limit: 8,
  },
  {
    id: 'independent_house',
    title: 'Independent Houses',
    subtitle: 'Spacious independent houses for families and groups',
    type: 'independent_house',
    filter: { accommodation_type_name: 'Independent House' },
    limit: 8,
  },
  {
    id: 'service_apartment',
    title: 'Service Apartments',
    subtitle: 'Fully-serviced corporate stays with premium housekeeping',
    type: 'service_apartment',
    filter: { accommodation_type_name: 'Service Apartment' },
    limit: 8,
  },
  {
    id: 'villa',
    title: 'Luxe Private Villas',
    subtitle: 'Luxe private estate stays with gardens and private amenities',
    type: 'villa',
    filter: { accommodation_type_name: 'Villa' },
    limit: 8,
  },
  {
    id: 'budget',
    title: 'Budget Friendly Stays',
    subtitle: 'Quality verified stays under ₹15,000/month',
    type: 'budget',
    filter: { max_price: '15000' },
    limit: 8,
  },
  {
    id: 'recent',
    title: 'Recently Added Listings',
    subtitle: 'Be the first to explore and reserve newly listed properties',
    type: 'recent',
    filter: { sort: 'newest' },
    limit: 8,
  },
];
