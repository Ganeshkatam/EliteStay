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

# Resident Experience Rule & Listings Aggregate Freeze

The `listings` aggregate is formally **frozen** following Phase 3.1. EliteStay is a dedicated living-accommodation platform focused on the resident journey (`Discover -> Compare -> Book -> Move In -> Live -> Move Out`), not a real-estate sales or construction portal.

Every new field or table added to the Listings aggregate must satisfy at least one of the following criteria:

1. Helps residents discover accommodation
2. Helps residents compare accommodation
3. Helps residents decide whether to book
4. Helps hosts manage occupancy
5. Helps residents during their stay

Otherwise, do not add it. Furthermore, boolean column naming across the schema must strictly follow standard convention: `has_...` for possession attributes and `is_...` for state attributes.

# Regression Prevention Rule (Mandatory)

Any implementation, refactor, bug fix, optimization, or feature enhancement must preserve the behavior of all existing functionality unless an intentional breaking change has been explicitly approved.

Before considering a task complete, the agent must:

1. Identify all directly and indirectly affected modules, components, services, hooks, actions, repositories, database objects, and UI flows.
2. Verify that existing functionality continues to work after the change.
3. Update every dependent implementation if contracts, types, schemas, or APIs have changed.
4. Never fix one feature by introducing regressions in another.
5. If a change has unavoidable downstream impacts, document every affected area and implement the required updates as part of the same task.

Mandatory regression checklist:

- Existing features continue functioning.
- Connected workflows continue functioning.
- UI interactions and state transitions remain intact.
- URLs, routing, deep links, and navigation continue working.
- Database schema changes are reflected in repositories, services, actions, RPCs, types, and UI.
- TypeScript compiles without new errors.
- Lint passes without introducing new warnings.
- No existing tests are broken; add or update tests when behavior changes.

A task is not considered complete until all affected functionality has been updated and verified.
