export type SectionType = 'featured' | 'recent' | 'trending' | 'topRated' | 'budget' | 'luxury';

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
    id: 'featured',
    title: 'Featured Accommodations',
    type: 'featured',
    filter: { sort: 'recommended' },
    limit: 6,
  },
  {
    id: 'recent',
    title: 'Recently Added',
    type: 'recent',
    filter: { sort: 'newest' },
    limit: 6,
  },
  {
    id: 'trending',
    title: 'Trending Now',
    type: 'trending',
    filter: { sort: 'recommended' },
    limit: 6,
  }
];
