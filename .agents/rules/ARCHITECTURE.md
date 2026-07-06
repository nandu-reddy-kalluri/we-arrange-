max 250 lines

# ARCHITECTURE

## Folder Structure
```text
src/
├── app/              ← Next.js App Router pages (route entry points only)
│   ├── (auth)/       ← Auth route group
│   ├── (dashboard)/  ← Customer dashboard route group
│   └── (public)/     ← Public marketing pages
├── components/       ← Shared generic UI (Design system primitives, layout, feedback, form, motion, cards)
├── design-system/    ← Theme tokens (colors.ts, typography.ts, etc.)
├── seo/              ← Shared SEO helpers & schemas
├── middleware/       ← Endpoint route handlers / checks (Auth, Roles, Logs)
├── features/         ← Domain feature modules (home, shortlist, comparison, etc.)
│   └── */components/ ← Feature-specific components
│   └── */services/   ← Feature fetchers (e.g., getVendorById)
├── services/         ← Data access layer (Supabase clients, external API abstractions)
├── hooks/            ← Global UI hooks
├── types/            ← Global TypeScript definitions
├── constants/        ← Constant variables & configurations
├── utils/            ← Pure helper functions
├── styles/           ← Tailwind globals.css, theme configuration
└── mock-data/        ← Static mock JSON db (replaced by Supabase in Phase 2)
```

## Architecture & Component Patterns
- **Feature-Driven Architecture**: Each route, component, and utility is isolated in `src/features/` to prevent cross-feature pollution.
- **Lean Routes**: Keep `src/app/` route files minimal. A `page.tsx` should import components from the corresponding folder in `src/features/` rather than defining complex components inline.
- **Service Layer Pattern**: All database access must go through the service layer (`src/services/` or `features/*/services/`). Direct Supabase client calls are **never permitted inside React components**.
- **Cards Reusability**: Reused cards live in `src/components/cards/` (e.g., `VenueCard.tsx`, `VendorCard.tsx`).
- **DOM Integrity**: Return clean fragment wrappers in nested layouts; do not repeat `<html>` or `<body>` nodes. Never embed block elements inside inline phasing parents (e.g., `<button>`).
- **Hydration Safety**: Add `suppressHydrationWarning={true}` to inputs vulnerable to autofill. Replace locale/timezone sensitive code (`new Date()`) with deterministic parse functions.

## API Patterns & Data Flow
All Route Handlers at `src/app/api/*/route.ts` follow this structure:
1. Parse and validate request body (Zod)
2. Verify authentication (`supabase.auth.getUser`)
3. Verify role authorization if needed
4. Call service function (never direct DB call in route handler)
5. Return JSON response with correct HTTP status code

### Endpoint Targets (Phase 1.5)
- `/api/requirements/submit` — Submit user event location, size, and budget settings.
- `/api/shortlist/manage` — Add or remove partners inside curation buckets.
- `/api/quotes/compare` — Fetch collection comparisons matrices details.

## Naming Conventions
- **Table names**: `snake_case`, plural
- **Column names**: `snake_case`
- **Boolean columns**: Prefixed with `is_`
- **Timestamp columns**: Suffixed with `_at`
- **Foreign keys**: `referenced_table_singular_id`
- **Enum values**: `snake_case`, lowercase
- **Price columns**: Suffixed with `_lakhs` (e.g., `base_cost_lakhs`)
