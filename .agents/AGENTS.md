# Discover Module Architectural Freeze

The `src/features/search` Discover module architecture is formally **frozen**. 
All feature modules must strictly adhere to this architecture and may not bypass it.

## The Architectural Flow
Everything must flow downward:
```
DiscoverPage
  ↓
SearchFacade
  ↓
Domain Services (SearchService, DiscoveryService, LocationInsightsService, MapService)
  ↓
Repositories / Queries (e.g., searchListings)
  ↓
Supabase Database
```

## Immutable Rules
Components MUST NEVER:
1. Call Supabase directly from the UI.
2. Construct SQL in React components.
3. Calculate heavy business logic in the UI.
4. Compute or mutate ViewModels directly in the UI.

## Frozen Structure
The following structural elements are frozen and may not be changed:
- Component hierarchy (DiscoverPage > SearchWorkspace)
- Provider structure (Separated Data and UI Contexts)
- ViewModel contract (Nested: summary, results, map, filters, insights, recovery)
- Service boundaries and Repository boundaries
- Search state ownership
- Configuration system (split across layout, spacing, motion, search, market)

## Allowed Additions (After Freeze)
- New filters and chips (via `SEARCH_TOOLBAR_SCHEMA`)
- New map layers (implementing `MapLayer`)
- New services (e.g., CommuteService, AnalyticsService)
- New recommendation algorithms
- UI redesign and Visual Polish
- Performance optimizations
