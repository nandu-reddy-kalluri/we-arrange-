# COMPLETE APPLICATION ARCHITECTURE AUDIT: YouMarriageWeArrange
**Target System:** YouMarriageWeArrange Monorepo  
**Auditor Role:** Principal Software Architect & Senior Full-Stack Engineer  
**Date of Audit:** 2026-11-22  
**Status:** **CONFIRMED ARCHITECTURAL DEFECTS & STRUCTURAL AUDIT**

---

## 1. Executive Summary

An architectural audit of the entire YouMarriageWeArrange repository was conducted across all 5 applications (`apps/web`, `apps/admin`, `apps/concierge`, `apps/customer`, `apps/vendor`), 11 shared packages (`packages/*`), 4 shared domain services (`services/*`), Turborepo configuration (`turbo.json`), and pnpm workspace topology (`pnpm-workspace.yaml`).

### Overall Architecture Assessment: **STRUCTURAL DUPLICATION & DUAL-MODEL CONFUSION**

The repository contains high-quality domain designs, comprehensive schema validation, and elegant UI components. However, it currently suffers from severe architectural fragmentation and dual-monolith divergence:

1. **Dual Monolith & Micro-Frontend Duplication**:
   - The platform defines 4 separate standalone Next.js applications under `apps/` running on individual ports: `apps/admin` (3003), `apps/concierge` (3004), `apps/customer` (3001), and `apps/vendor` (3002).
   - Simultaneously, the main application `apps/web` (port 3000) hosts the **exact same application pages** under route groups: `apps/web/app/admin`, `apps/web/app/concierge-portal`, `apps/web/app/customer`, and `apps/web/app/vendor`.
   - Massive single-file client components (e.g., `AdminPortalClient.tsx`, 105KB / 2,500+ lines; `VendorPortalClient.tsx`, 57KB / 1,300+ lines) are copied verbatim in both locations. Bug fixes or feature additions in one location do not propagate to the other.
2. **Server/Client Boundary Anti-Pattern (Double Data Fetching)**:
   - Detail pages (`apps/web/app/(public)/venues/[slug]/page.tsx` and `vendors/[slug]/page.tsx`) query the database on the server inside `generateMetadata()`, discard the retrieved data, and render an empty client component (`<VenueDetailsClient slug={slug} />`).
   - The client component hydrates, mounts, and executes a second client-side `fetch()` to `/api/venues/[slug]`, which triggers the identical 12-query database execution a second time.
3. **Hardcoded Mock Data in Production Database Packages**:
   - `@we-arrange/database` (which should strictly contain database clients, migrations, types, and query repositories) contains over 1,500 lines of hardcoded static mock arrays across `venues.ts`, `vendors.ts`, `real-weddings.ts`, and 10 subsection files.
   - `apps/web` maintains a duplicate copy of these mock data files under `apps/web/mock-data/`.
4. **Dead / Unused Dependencies**:
   - `gsap` (3.15.0) and `@gsap/react` (2.1.2) are installed in `apps/web/package.json` (~70KB bundle footprint) but have **zero imports or usage** anywhere in the monorepo.
   - Dual animation stacks (`framer-motion` alongside CSS keyframes) inflate client bundle sizes.
5. **Security Through Obscurity (Secret Admin Login Route)**:
   - An unlisted admin login route exists at `apps/admin/app/login143/page.tsx` and `apps/web/app/admin/login143/page.tsx` rendering `AdminPortalClient` in "login" view.

---

## 2. Monorepo Organization & Workspace Breakdown

```
c:/project  2/we arrange/
├── apps/
│   ├── web/ (Port 3000 - Main consumer website + internal portal mirrors)
│   ├── admin/ (Port 3003 - Dedicated Admin Dashboard)
│   ├── concierge/ (Port 3004 - Dedicated Concierge Specialist Portal)
│   ├── customer/ (Port 3001 - Dedicated Customer Portal)
│   └── vendor/ (Port 3002 - Dedicated Vendor Portal)
├── packages/
│   ├── api-client/ (Typed HTTP API client)
│   ├── auth/ (Supabase Auth helpers & RBAC)
│   ├── config/ (Tailwind & global configs)
│   ├── database/ (Supabase clients, types, errors, repository)
│   ├── design-system/ (Design tokens & typography)
│   ├── eslint-config/ (Shared ESLint rules)
│   ├── tsconfig/ (Shared TypeScript compiler configs)
│   ├── types/ (Shared entity interfaces)
│   ├── ui/ (Shared UI components & portal workspaces)
│   ├── utils/ (Sanitizers, rate limiters, formatters)
│   └── validation/ (Zod schemas for queries & mutations)
├── services/
│   ├── booking/ (Booking, payments, quotes domain service)
│   ├── customer/ (Customer profiles & requirements service)
│   ├── vendor/ (Vendor catalog & management service)
│   └── venue/ (Venue catalog & management service)
└── supabase/
    └── migrations/ (12 SQL migration scripts)
```

---

## 3. Confirmed Architectural Defect Inventory

### ARCH-001: Monolith vs Micro-Frontend Code Duplication
- **Severity:** P1 — High
- **Files Affected:**
  - `apps/admin/app/AdminPortalClient.tsx` (105,387 bytes) vs `apps/web/app/admin/AdminPortalClient.tsx` (105,409 bytes)
  - `apps/vendor/app/VendorPortalClient.tsx` (57,084 bytes) vs `apps/web/app/vendor/VendorPortalClient.tsx` (57,346 bytes)
  - `apps/concierge/app/` vs `apps/web/app/concierge-portal/`
  - `apps/customer/app/` vs `apps/web/app/customer/`
- **Root Cause:** Incomplete architectural transition between a unified Next.js multi-zone deployment and a single Next.js monolith. The code was copied into `apps/web` while leaving the standalone `apps/*` intact.
- **Technical Impact:**
  - Double maintenance overhead.
  - Inevitable code drift: Bug fixes applied to `apps/web/app/admin` do not exist in `apps/admin/app`.
  - Next.js edge middleware routing conflicts: Edge middleware in `apps/web` attempts to rewrite `/admin` while `apps/admin` has rewrites back to `http://localhost:3000/api/*`.
- **Recommended Architecture:** Either:
  - *Option A (Recommended for simplicity & performance):* Consolidate into `apps/web` as route groups (`app/(public)`, `app/(portals)/admin`, etc.), and retire the 4 standalone apps, eliminating 4 extra Next.js build processes.
  - *Option B:* Move the portal client logic into shared packages (`packages/ui/src/portals/`) and import them into both places without duplication.

---

### ARCH-002: Server/Client Boundary Anti-Pattern (Double-Fetch Waterfall)
- **Severity:** P1 — High
- **Files Affected:**
  - `apps/web/app/(public)/venues/[slug]/page.tsx:44–66` & `VenueDetailsClient.tsx:120–160`
  - `apps/web/app/(public)/vendors/[slug]/page.tsx:60–79` & `VendorDetailsClient.tsx:110–140`
- **Root Cause:**
  1. The server component `generateMetadata()` executes `getPublicVenueBySlugOrId(supabase, slug)` to extract page title and description.
  2. The server component `Page()` then simply renders `<VenueDetailsClient slug={slug} />` without passing the pre-fetched data as initial props.
  3. `VenueDetailsClient` mounts in the browser, displays a blank shimmer skeleton, and issues a client-side `fetch('/api/venues/[slug]')`.
  4. The API route executes `getPublicVenueBySlugOrId(supabase, slug)` a second time!
- **Technical Impact:**
  - 24 database queries fired to Supabase for a single venue page view.
  - User experiences an unnecessary 1–2 second layout shift and loading spinner instead of receiving fully rendered server HTML.
  - Search engine crawlers (which often don't execute client JS fetches) see empty page content.
- **Recommended Architecture:**
  Fetch venue data once in `Page()` server component, pass it directly to `VenueDetailsClient` as `initialData`, and eliminate the duplicate client-side API call on initial load:
  ```tsx
  export default async function Page({ params }: VenuePageProps) {
    const { slug } = await params;
    const initialData = await getPublicVenueBySlugOrId(supabase, slug);
    return <VenueDetailsClient slug={slug} initialData={initialData} />;
  }
  ```

---

### ARCH-003: Massive "God" Client Components
- **Severity:** P1 — High
- **Files Affected:**
  - `apps/admin/app/AdminPortalClient.tsx`: 2,540 lines in a single file
  - `apps/web/app/(public)/venues/[slug]/VenueDetailsClient.tsx`: 1,365 lines in a single file
  - `apps/web/app/(public)/vendors/[slug]/VendorDetailsClient.tsx`: 1,170 lines in a single file
  - `apps/vendor/app/VendorPortalClient.tsx`: 1,320 lines in a single file
- **Root Cause:** Lack of modular component decomposition. State for tabs, lightboxes, lead management, pricing calculators, enquiry forms, and reviews is combined into monolithic files.
- **Technical Impact:**
  - Poor code maintainability.
  - High risk of regression during modifications.
  - Large JavaScript execution and parsing overhead on the main thread during hydration.
- **Recommended Architecture:** Refactor each into focused subcomponents:
  - `VenueDetailsClient`: Extract `VenueHeroGallery`, `VenuePricingSection`, `VenueAmenitiesGrid`, `VenueLightboxModal`.
  - `AdminPortalClient`: Decompose into modular tab views (`UsersTab`, `VenuesTab`, `VendorsTab`, `RolesTab`).

---

### ARCH-004: Hardcoded Mock Data Embedded in Database Package
- **Severity:** P2 — Medium
- **Files Affected:**
  - `packages/database/src/venues.ts`: 544 lines (450 lines of static mock objects)
  - `packages/database/src/vendors.ts`: 380 lines
  - `packages/database/src/real-weddings.ts`: 29,553 bytes of mock wedding data
  - `packages/database/src/{bridal-wear, decor, hairstyles, jewellery, makeup, mehendi, photography}.ts`
- **Root Cause:** Mock fixtures from early prototyping were placed directly inside `@we-arrange/database`.
- **Technical Impact:**
  - Any application importing types from `@we-arrange/database` risks bundling hundreds of kilobytes of unused mock data into production client bundles.
  - Confusion over whether data comes from Supabase or static mock arrays.
- **Recommended Architecture:** Move mock fixtures into a dedicated `fixtures` folder or test mocks directory, keeping `@we-arrange/database` purely focused on schemas, clients, and repositories.

---

### ARCH-005: Unused Heavy Dependencies in Web Application
- **Severity:** P2 — Medium
- **Files Affected:**
  - `apps/web/package.json`: Lines 13, 31 (`gsap: ^3.15.0`, `@gsap/react: ^2.1.2`)
- **Root Cause:** GSAP was installed for exploratory animations but never implemented; `framer-motion` was used instead.
- **Technical Impact:**
  - Bloats node_modules and increases dependency supply-chain attack surface.
  - Risk of developer confusion on which animation engine to use.
- **Recommended Architecture:** Remove `gsap` and `@gsap/react` from `apps/web/package.json`.

---

### ARCH-006: Hardcoded Secret Login Route
- **Severity:** P2 — Medium
- **Files Affected:**
  - `apps/admin/app/login143/page.tsx`
  - `apps/web/app/admin/login143/page.tsx`
- **Root Cause:** Implementation of "security through obscurity" by creating an unlisted route with a hardcoded suffix (`login143`).
- **Technical Impact:**
  - Confuses administrative authentication flows.
  - Does not provide real security (the route is publicly visible in git history, sitemaps, and client bundle route manifests).
- **Recommended Architecture:** Remove `login143` and standardize on `/admin/login` protected by IP allowlisting, rate limiting, and Supabase Auth with MFA.

---
*Report certified by Principal Software Architect & Senior Full-Stack Engineer.*
