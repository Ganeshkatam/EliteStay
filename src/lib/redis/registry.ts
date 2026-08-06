export interface CachePolicy {
  ttl: number; // in seconds
  staleWindow: number; // in seconds (for SWR)
  compression: boolean;
  negativeCache: boolean;
  negativeTtl: number; // in seconds
  jitter: boolean;
  serializer?: 'json' | 'raw'; // default 'json'
  metrics: boolean;
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
  },
  reviews: {
    ttl: 3600,
    staleWindow: 300,
    compression: true,
    negativeCache: true,
    negativeTtl: 60,
    jitter: true,
    metrics: true,
  },
  search: {
    ttl: 600, // 10 mins
    staleWindow: 60, // 1 min
    compression: true,
    negativeCache: true,
    negativeTtl: 60,
    jitter: true,
    metrics: true,
  },
  pricing: {
    ttl: 300, // 5 mins
    staleWindow: 30, // 30s
    compression: false,
    negativeCache: false,
    negativeTtl: 0,
    jitter: false,
    metrics: true,
  },
  availability: {
    ttl: 60, // 1 min
    staleWindow: 0, // no SWR for availability
    compression: false,
    negativeCache: false,
    negativeTtl: 0,
    jitter: false,
    metrics: true,
  },
  homepage: {
    ttl: 3600 * 24, // 24 hours
    staleWindow: 3600, // 1 hour
    compression: true,
    negativeCache: false,
    negativeTtl: 0,
    jitter: true,
    metrics: true,
  },
};
