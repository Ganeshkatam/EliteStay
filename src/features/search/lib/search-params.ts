// src/features/search/lib/search-params.ts
//
// Single source of truth for parsing, validating, and serializing search
// filters from URL query parameters. Used by both the server page and any
// future client components.

// ---------------------------------------------------------------------------
// 1. Types
// ---------------------------------------------------------------------------

export interface LocationFilters {
  city: string | null;
  locality: string | null;
  minLat: number | null;
  maxLat: number | null;
  minLng: number | null;
  maxLng: number | null;
  centerLat: number | null;
  centerLng: number | null;
}

export interface PricingFilters {
  minPrice: number | null;
  maxPrice: number | null;
}

export interface AccommodationFilters {
  /** Human-readable slug in the URL (e.g. "pg", "hostel"). */
  accommodationType: string | null;
  furnishing: 'unfurnished' | 'semi_furnished' | 'fully_furnished' | null;
  genderPreference: 'any' | 'male' | 'female' | null;
  occupancyType: 'private' | 'shared' | 'mixed' | null;
  billingPeriod: 'day' | 'week' | 'month' | 'semester' | 'year' | null;
  amenities: string[];
}

export interface AvailabilityFilters {
  /** ISO-8601 date string (YYYY-MM-DD). */
  availableFrom: string | null;
}

export interface SortingFilters {
  sort: 'recommended' | 'price_asc' | 'price_desc' | 'newest' | 'distance';
}

export interface PaginationFilters {
  page: number;
  pageSize: number;
}

export type SearchFilters = LocationFilters &
  PricingFilters &
  AccommodationFilters &
  AvailabilityFilters &
  SortingFilters &
  PaginationFilters;

// ---------------------------------------------------------------------------
// 2. Defaults
// ---------------------------------------------------------------------------

export const SEARCH_DEFAULTS: Readonly<SearchFilters> = {
  city: null,
  locality: null,
  minLat: null,
  maxLat: null,
  minLng: null,
  maxLng: null,
  centerLat: null,
  centerLng: null,
  minPrice: null,
  maxPrice: null,
  accommodationType: null,
  furnishing: null,
  genderPreference: null,
  occupancyType: null,
  billingPeriod: null,
  amenities: [],
  availableFrom: null,
  sort: 'recommended',
  page: 1,
  pageSize: 12,
} as const;

// ---------------------------------------------------------------------------
// 3. Validation helpers
// ---------------------------------------------------------------------------

const FURNISHING_VALUES = new Set([
  'unfurnished',
  'semi_furnished',
  'fully_furnished',
]);
const GENDER_VALUES = new Set(['any', 'male', 'female']);
const OCCUPANCY_VALUES = new Set(['private', 'shared', 'mixed']);
const BILLING_PERIOD_VALUES = new Set([
  'day',
  'week',
  'month',
  'semester',
  'year',
]);
const SORT_VALUES = new Set([
  'recommended',
  'price_asc',
  'price_desc',
  'newest',
  'distance',
]);

const MAX_PAGE_SIZE = 48;
const MIN_PAGE_SIZE = 1;

/** ISO date regex: YYYY-MM-DD */
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function firstString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parsePositiveInt(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

function parsePositiveNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = parseFloat(raw);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

function validateEnum<T extends string>(
  raw: string | undefined,
  allowed: Set<string>
): T | null {
  if (!raw) return null;
  const lower = raw.trim().toLowerCase();
  if (allowed.has(lower)) return lower as T;
  return null;
}

// ---------------------------------------------------------------------------
// 4. Parser
// ---------------------------------------------------------------------------

type RawSearchParams = Record<string, string | string[] | undefined>;

/**
 * Parse raw URL search params into a validated `SearchFilters` object.
 * Invalid or unrecognised values fall back to defaults (no errors thrown).
 */
export function parseSearchParams(raw: RawSearchParams): SearchFilters {
  const cityRaw = firstString(raw.city)?.trim() || null;
  const localityRaw = firstString(raw.locality)?.trim() || null;

  const minLatRaw = parsePositiveNumber(firstString(raw.minLat));
  const maxLatRaw = parsePositiveNumber(firstString(raw.maxLat));
  const minLngRaw = parsePositiveNumber(firstString(raw.minLng));
  const maxLngRaw = parsePositiveNumber(firstString(raw.maxLng));
  const centerLatRaw = parsePositiveNumber(firstString(raw.centerLat));
  const centerLngRaw = parsePositiveNumber(firstString(raw.centerLng));

  const accommodationTypeRaw =
    firstString(raw.accommodationType)?.trim().toLowerCase() || null;

  const minPriceRaw = parsePositiveNumber(firstString(raw.minPrice));
  const maxPriceRaw = parsePositiveNumber(firstString(raw.maxPrice));

  const billingPeriod = validateEnum<
    AccommodationFilters['billingPeriod'] & string
  >(firstString(raw.billingPeriod), BILLING_PERIOD_VALUES);

  const furnishing = validateEnum<AccommodationFilters['furnishing'] & string>(
    firstString(raw.furnishing),
    FURNISHING_VALUES
  );

  const genderPreference = validateEnum<
    AccommodationFilters['genderPreference'] & string
  >(firstString(raw.genderPreference), GENDER_VALUES);

  const occupancyType = validateEnum<
    AccommodationFilters['occupancyType'] & string
  >(firstString(raw.occupancyType), OCCUPANCY_VALUES);

  // Amenities: comma-separated string -> deduplicated lowercase array
  const amenitiesRaw = firstString(raw.amenities) || '';
  const amenities = amenitiesRaw
    ? [
        ...new Set(
          amenitiesRaw
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean)
        ),
      ]
    : [];

  // Available from: ISO date
  const availableFromRaw = firstString(raw.availableFrom)?.trim() || null;
  const availableFrom =
    availableFromRaw && ISO_DATE_RE.test(availableFromRaw)
      ? availableFromRaw
      : null;

  // Sort
  const sort =
    validateEnum<SortingFilters['sort']>(firstString(raw.sort), SORT_VALUES) ??
    SEARCH_DEFAULTS.sort;

  // Pagination
  const pageRaw = parsePositiveInt(firstString(raw.page));
  const page = pageRaw && pageRaw >= 1 ? pageRaw : SEARCH_DEFAULTS.page;

  const pageSizeRaw = parsePositiveInt(firstString(raw.pageSize));
  const pageSize = pageSizeRaw
    ? Math.min(Math.max(pageSizeRaw, MIN_PAGE_SIZE), MAX_PAGE_SIZE)
    : SEARCH_DEFAULTS.pageSize;

  return {
    city: cityRaw,
    locality: localityRaw,
    minLat: minLatRaw,
    maxLat: maxLatRaw,
    minLng: minLngRaw,
    maxLng: maxLngRaw,
    centerLat: centerLatRaw,
    centerLng: centerLngRaw,
    accommodationType: accommodationTypeRaw,
    minPrice: minPriceRaw,
    maxPrice: maxPriceRaw,
    billingPeriod,
    furnishing,
    genderPreference,
    occupancyType,
    amenities,
    availableFrom,
    sort,
    page,
    pageSize,
  };
}

// ---------------------------------------------------------------------------
// 5. Post-parse normalisation
// ---------------------------------------------------------------------------

/**
 * Fixes logical inconsistencies after parsing.
 * - Swaps minPrice/maxPrice if inverted.
 * - Clamps page to >= 1 (total-pages clamping happens after query).
 */
export function normalizeFilters(filters: SearchFilters): SearchFilters {
  const result = { ...filters };

  // Swap inverted price range
  if (
    result.minPrice !== null &&
    result.maxPrice !== null &&
    result.minPrice > result.maxPrice
  ) {
    [result.minPrice, result.maxPrice] = [result.maxPrice, result.minPrice];
  }

  // Ensure page >= 1
  if (result.page < 1) {
    result.page = 1;
  }

  return result;
}

// ---------------------------------------------------------------------------
// 6. URL Builder
// ---------------------------------------------------------------------------

/**
 * Fixed parameter order for canonical URLs.
 * Ensures caching, predictability, and clean diffs.
 */
const PARAM_ORDER: readonly (keyof SearchFilters)[] = [
  'city',
  'locality',
  'minLat',
  'maxLat',
  'minLng',
  'maxLng',
  'centerLat',
  'centerLng',
  'accommodationType',
  'minPrice',
  'maxPrice',
  'billingPeriod',
  'furnishing',
  'genderPreference',
  'occupancyType',
  'amenities',
  'availableFrom',
  'sort',
  'page',
  'pageSize',
] as const;

/**
 * Build a canonical search URL from filters.
 * Omits parameters that match defaults or are null/empty.
 */
export function buildSearchUrl(
  filters: Partial<SearchFilters>,
  basePath = '/s'
): string {
  const params = new URLSearchParams();

  for (const key of PARAM_ORDER) {
    const value = filters[key];
    const defaultValue = SEARCH_DEFAULTS[key];

    // Skip null, undefined, empty arrays, and values matching defaults
    if (value === null || value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (value === defaultValue) continue;

    // Deep-equal check for arrays (amenities)
    if (
      Array.isArray(value) &&
      Array.isArray(defaultValue) &&
      value.length === defaultValue.length &&
      value.every((v, i) => v === defaultValue[i])
    ) {
      continue;
    }

    if (Array.isArray(value)) {
      params.set(key, value.join(','));
    } else {
      params.set(key, String(value));
    }
  }

  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
