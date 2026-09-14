export type InvalidationStrategy = 'none' | 'tags' | 'version';

export interface CachePolicy {
  ttl: number; // in seconds
  staleWindow: number; // in seconds (for SWR)
  compression: boolean;
  negativeCache: boolean;
  negativeTtl: number; // in seconds
  jitter: boolean;
  serializer?: 'json' | 'raw'; // default 'json'
  metrics: boolean;
  invalidation: InvalidationStrategy;
}

export const CachePolicyRegistry: Record<string, CachePolicy> = {
  property: {
    ttl: 3600, // 1 hour
    staleWindow: 300, // 5 mins
    compression: true,
    negativeCache: true,
    negativeTtl: 60,
    jitter: true,
    metrics: true,
    invalidation: 'tags',
  },
  reviews: {
    ttl: 3600,
    staleWindow: 300,
    compression: true,
    negativeCache: true,
    negativeTtl: 60,
    jitter: true,
    metrics: true,
    invalidation: 'tags',
  },
  search: {
    ttl: 600, // 10 mins
    staleWindow: 60, // 1 min
    compression: true,
    negativeCache: true,
    negativeTtl: 60,
    jitter: true,
    metrics: true,
    invalidation: 'version',
  },
  pricing: {
    ttl: 300, // 5 mins
    staleWindow: 30, // 30s
    compression: false,
    negativeCache: false,
    negativeTtl: 0,
    jitter: false,
    metrics: true,
    invalidation: 'tags',
  },
  availability: {
    ttl: 60, // 1 min
    staleWindow: 0, // no SWR for availability
    compression: false,
    negativeCache: false,
    negativeTtl: 0,
    jitter: false,
    metrics: true,
    invalidation: 'none',
  },
  homepage: {
    ttl: 3600 * 24, // 24 hours
    staleWindow: 3600, // 1 hour
    compression: true,
    negativeCache: false,
    negativeTtl: 0,
    jitter: true,
    metrics: true,
    invalidation: 'version',
  },
  reference: {
    ttl: 3600 * 24 * 7, // 7 days
    staleWindow: 3600 * 6, // 6 hours
    compression: true,
    negativeCache: true,
    negativeTtl: 300,
    jitter: true,
    metrics: true,
    invalidation: 'tags',
  },
};
