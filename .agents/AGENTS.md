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

# Git Commit & Code Quality

1. Commit only after completing a logical, self-contained unit of work that leaves the project in a consistent, buildable state.
2. Before committing, ensure the project passes:
   - `npm run typecheck`
   - `npm run lint`
3. Never use `--no-verify`, `--no-check`, or bypass Husky/pre-commit hooks.
4. Fix all errors introduced by the current changes before committing.
5. Use clear Conventional Commit messages (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`).
6. Do not commit known broken code unless explicitly instructed by the user.

# Database & SQL Synchronization Rule

Whenever modifying database schemas, migrations, functions, or reference data, you MUST always update the local SQL files (`supabase/schema/*.sql` and migrations) and execute the corresponding changes against the remote live Supabase database at the same time. Never permit local SQL definitions to drift from the active remote database schema.
