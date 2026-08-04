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

Whenever modifying database schemas, migrations, functions, or reference data, you MUST always update the local SQL files (`supabase/schema/*.sql` and migrations) and execute the corresponding changes against the remote live Supabase database at the same time using Supabase MCP. Never permit local SQL definitions to drift from the active remote database schema.

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

# Host Bounded Context Infrastructure Rules (Permanent Standard)

The Host operational platform (`Dashboard -> Listings -> Calendar -> Publishing -> Bookings -> Stays`) is formally governed by the following immutable standards:

1. **Thin Route Rule**: Next.js route files (`page.tsx`, `layout.tsx`) may only authenticate sessions, authorize access, invoke orchestration services, prepare metadata, and render UI. Never implement business logic, database queries, calculations, or domain decisions inside routes.
2. **Repository Rule**: Repositories must handle pure persistence access and RPC invocations, returning database row models (e.g., `EnrichedBookingRow`). They must never be coupled to specific UI workspaces and never return presentation ViewModels.
3. **Operational Workspace Rule**: Every Host workspace must be driven by a domain-specific ViewModel composed by a single orchestration service. Components must render only from ViewModels and must never derive operational state from raw database entities.
4. **ViewModel Rule**: UI components must receive immutable, presentation-ready ViewModel contracts composed by factory functions or services.
5. **Policy Rule**: Domain business rules, SLA calculations, queue classifications, and state validation must reside strictly inside dedicated Policy classes (e.g., Lifecycle, Operations, and Decision policies).
6. **Service Orchestration Rule**: Domain services must remain thin orchestration layers coordinating `Repositories -> Policies -> ViewModels`. Services should not execute database commands directly nor implement inline classification rules.
7. **No Duplicate Business State**: Domain contracts and shared operational presentations (such as Guest summaries and Listing summaries) must be housed in `src/features/host/shared/` to serve across multiple host modules without duplication.
8. **Connected Workflows Preservation**: Feature additions and operational workspace changes must preserve all connected resident and host workflows without regressions.
9. **Workspace Independence Rule**: Each operational workspace (`Dashboard`, `Listings`, `Calendar`, `Publishing`, `Bookings`, `Stays`) must own its orchestration, policies, repositories, and ViewModels. Shared functionality belongs only in `src/features/host/shared/`. No workspace may directly depend on another workspace's implementation details.
10. **Capability Rule**: Never model mutually exclusive user roles when a user can legitimately perform multiple product capabilities simultaneously. Prefer capability-based design (Guest, Host, Resident, etc.) over role replacement.
11. **Host Specialization Rule**: Every Host Profile has exactly one immutable primary accommodation specialization (`primary_accommodation_type_id`). After activation (`ACTIVE`), all listings, publishing workflows, operational dashboards, validation rules, and policies inherit this specialization automatically. Never allow a host to publish listings outside their specialization, and enforce this boundary across UI, Services, and Database/RPC layers.

# Observability Platform Rule (Mandatory)

The Observability platform in `src/lib/observability/` is frozen infrastructure.
Every new Repository, Service, Server Action, RPC wrapper, scheduled task, or infrastructure component must be instrumented through the Observability Platform. No new execution path may bypass tracing, logging, metrics, or request context.

- Use `instrumentExecution` or `@ObserveService` / `@ObserveRepository` for backend functions.
- Record domain lifecycle milestones via `recordBusinessEvent`.
- Observe cache hits/misses via `observeCache` and React views via `observeServerComponent`.

# Observability Transparency Rule

Observability must remain a cross-cutting infrastructure concern. Business services, repositories, policies, and UI components must never contain telemetry-specific business logic. Instrumentation is applied exclusively through wrappers, middleware, decorators, or infrastructure adapters so domain code remains focused solely on business behavior.

# Final Infrastructure Freeze

The EliteStay core platform foundation is formally **FROZEN**. No further architectural refactors are permitted. Only additive extensions and bug fixes may touch these layers.

The following layers are explicitly frozen:

- Database Layer
- Repository Layer
- Service Layer
- Policy Layer
- ViewModels
- Observability
- Feature Flags
- Audit
- Security
- Hosting
- Host
- Shared Components

All future engineering effort MUST be directed towards **guest-facing product development** (Discovery, Search, Listing Detail, Booking Flow, Messaging, Payments, Reviews).
