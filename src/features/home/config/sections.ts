export type SectionType =
  | 'featured'
  | 'recent'
  | 'trending'
  | 'topRated'
  | 'budget'
  | 'luxury'
  | 'premium_coliving';

export interface HomeSectionConfig {
  id: string;
  title: string;
  subtitle?: string;
  type: SectionType;
  filter: Record<string, string>;
  limit: number;
}

export const homepageConfig: HomeSectionConfig[] = [
  {
    id: 'trending',
    title: 'Trending This Week',
    subtitle: 'Popular stays high in demand',
    type: 'trending',
    filter: { sort: 'recommended' },
    limit: 8,
  },
  {
    id: 'budget',
    title: 'Budget Stays',
    subtitle: 'Affordable coliving spaces under ₹15,000/month',
    type: 'budget',
    filter: { max_price: '15000' },
    limit: 8,
  },
  {
    id: 'premium_coliving',
    title: 'Premium Coliving',
    subtitle: 'Luxury spaces with modern design and amenities',
    type: 'premium_coliving',
    filter: { accommodation_type_name: 'Coliving' },
    limit: 8,
  },
  {
    id: 'recent',
    title: 'Recently Added',
    subtitle: 'Be the first to secure these fresh listings',
    type: 'recent',
    filter: { sort: 'newest' },
    limit: 8,
  },
];
