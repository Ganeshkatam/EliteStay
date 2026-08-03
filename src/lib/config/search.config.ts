export const SearchConfig = {
  provider: process.env.SEARCH_PROVIDER || 'supabase', // 'algolia' | 'elasticsearch' | 'supabase'
  indexPrefix: process.env.NODE_ENV === 'production' ? 'prod_' : 'dev_',
  maxResultsPerPage: 50,
  defaultRadiusKm: 50,
};
