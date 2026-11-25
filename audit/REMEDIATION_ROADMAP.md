# REMEDIATION ROADMAP: YouMarriageWeArrange
**Target System:** YouMarriageWeArrange Production Platform  
**Auditor Roles:** Principal Software Architect, Application Security Engineer, Performance Specialist, Database Architect, Lead QA & SEO Specialist  
**Date of Audit:** 2026-11-22  
**Status:** **PROPOSED REMEDIATION PLAN & SEQUENCING**

---

## 1. Executive Summary & Remediation Strategy

The remediation plan is sequenced strictly according to **user impact, stability risk, and architectural dependencies**. 

The strategy follows the **Ponytail Engineering Philosophy**: execute the smallest, cleanest change that fully resolves each issue without introducing unnecessary abstractions, breaking changes, or regressions.

---

## 2. Phased Implementation Roadmap

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: IMMEDIATE CRITICAL FIXES (P0) — [COMPLETED & VERIFIED]             │
│ • IMG-001: Convert DynamicGridGallery to Next.js <Image /> [VERIFIED]       │
│ • IMG-002: Window and resize Lightbox thumbnails (prevent mobile crash) [OK]│
│ • SEO-001: Query live Supabase DB in sitemap.ts [VERIFIED]                  │
│ • FUNC-001: Fix split Veg/Non-Veg budget parsing bug [VERIFIED]             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: CORE PERFORMANCE & DATABASE HARDENING (P1) — [COMPLETED & VERIFIED]│
│ • DB-001 & DB-002: Migration 06 (111 FK indexes) & Migration 13 pg_trgm GIN │
│   indexes [APPLIED & ACTIVE ON LIVE DB]                                     │
│ • BE-001: Indexed numeric plate_price columns & single-query DB push [LIVE] │
│ • ARCH-002: Eliminate server/client double-fetch on venue/vendor pages [OK] │
│ • IMG-005: Add priority={index === 0} to top listing cards for LCP [OK]     │
│ • SEO-002 & SEO-003: Add JSON-LD and OpenGraph images to venue/vendor [OK]  │
│ • BE-002: Consolidate homepage N+1 vendor category queries [OK]             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: ARCHITECTURAL REFACTORING & OPERATIONS (P2)                        │
│ • FE-001: Consolidate desktop/mobile duplicate DOM trees on homepage        │
│ • FE-002: Server-side pre-fetch on venue & vendor directory pages           │
│ • IMG-003 & IMG-004: Paginate venue gallery and photographer portfolios     │
│ • ARCH-001: Consolidate portal duplicates (apps/admin vs apps/web/app/admin)│
│ • OPS-001 & OPS-002: Add /api/health endpoint and configure Sentry APM      │
│ • IMG-006: Harmonize next.config.ts images configuration across monorepo    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: REPOSITORY HYGIENE & DESIGN POLISH (P3)                            │
│ • ARCH-005: Remove unused gsap and @gsap/react dependencies                 │
│ • ARCH-004: Extract mock fixtures out of @we-arrange/database               │
│ • UI-001: Refine mobile floating concierge button positioning               │
│ • UI-002: Increase mobile card swipe threshold from 20px to 45px            │
│ • UI-003 & UI-005: Add focus traps in lightboxes and darken muted text token │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Phase Breakdown

### Phase 1: Immediate Critical Fixes (P0) — Estimated Time: 4.5 Hours
*Goal: Stop mobile browser crashes, eliminate multi-megabyte image waste, and restore search engine indexing.*

1. **`IMG-001`**: In `apps/web/components/ui/DynamicGridGallery.tsx`, replace raw `<img>` with Next.js `<Image fill sizes="(max-width: 768px) 100vw, 50vw" priority={priorityFirst && index === 0} />`.
2. **`IMG-002`**: In `apps/web/app/(public)/venues/[slug]/VenueDetailsClient.tsx`, apply list windowing to `lightboxImages.map()` (render active index ± 4 thumbnails) and append thumbnail dimensions.
3. **`SEO-001`**: In `apps/web/app/sitemap.ts`, query Supabase `venues` and `vendors` tables for active slugs, replacing the static mock arrays.
4. **`FUNC-001`**: In `services/venue/src/venueService.ts:32–56`, improve price regex parsing to correctly extract the first numeric plate rate when multi-price strings exist.

---

### Phase 2: Core Performance & Database Hardening (P1) — Estimated Time: 8 Hours
*Goal: Cut page load times by 60%, eliminate database query storms, and achieve sub-2-second LCP.*

1. **`ARCH-002`**: In `venues/[slug]/page.tsx` and `vendors/[slug]/page.tsx`, pass server-fetched `detail` directly into `VenueDetailsClient` and `VendorDetailsClient` as `initialData`. Remove duplicate client-side `fetch()` on initial render.
2. **`DB-001` & `DB-002`**: Push Migration 06 to create covering indexes for 111 foreign keys. Create a new migration enabling `pg_trgm` and adding GIN trigram indexes on venue and vendor search columns.
3. **`BE-001`**: Add numeric column `min_plate_price NUMERIC` to `public.venues`. Replace in-memory 5,000-row chunk scanning with direct PostgreSQL numeric comparison.
4. **`IMG-005`**: In `VenueCard.tsx` and `VendorCard.tsx`, accept `priority?: boolean`. In `PremiumVenueGrid` and `FeaturedVendors`, pass `priority={index === 0}`.
5. **`SEO-002` & `SEO-003`**: Add Schema.org `EventVenue` and `LocalBusiness` JSON-LD scripts and per-entity OpenGraph cover images to detail pages.
6. **`BE-002`**: In `apps/web/app/page.tsx`, consolidate the N+1 vendor category query loop into a single SQL aggregation.

---

### Phase 3: Architectural Refactoring & Operations (P2) — Estimated Time: 12 Hours
*Goal: Eliminate code duplication, improve SEO directory rankings, and establish production observability.*

1. **`FE-001`**: In `apps/web/app/page.tsx`, consolidate `hidden md:block` and `block md:hidden` into unified responsive components, eliminating 1,000+ duplicate DOM nodes.
2. **`FE-002`**: In `/venues` and `/vendors`, fetch initial page 1 on the server to ensure search crawlers receive populated catalog listings in the initial HTML.
3. **`IMG-003` & `IMG-004`**: In venue details and vendor details, add pagination to the complete gallery and photographer portfolio grids.
4. **`ARCH-001`**: Move portal workspace implementations into `@we-arrange/ui/portals` and eliminate duplicated `AdminPortalClient.tsx` files.
5. **`OPS-001` & `OPS-002`**: Implement `/api/health` and configure Sentry error tracking.
6. **`IMG-006`**: Update `next.config.ts` across all 5 applications with matching `remotePatterns`.

---

### Phase 4: Repository Hygiene & Design Polish (P3) — Estimated Time: 4 Hours
*Goal: Reduce bundle weight, improve accessibility, and refine mobile touch interactions.*

1. **`ARCH-005`**: Uninstall `gsap` and `@gsap/react` from `apps/web/package.json`.
2. **`ARCH-004`**: Move mock fixtures out of `@we-arrange/database` into a test fixtures folder.
3. **`UI-001`**: Hide floating concierge button on mobile in favor of the bottom navigation bar.
4. **`UI-002`**: Increase card swiper threshold to 45px to prevent accidental slide changes during vertical scrolling.
5. **`UI-003` & `UI-005`**: Implement focus trap inside fullscreen lightboxes and darken muted text tokens for WCAG AA compliance.

---

## 4. Dependencies Between Fixes & Risk Matrix

| Task | Depends On | Technical Risk | Rollback Plan |
|---|---|---|---|
| **Phase 1: DynamicGridGallery `<Image>`** | None | Low | Revert to previous component git commit. |
| **Phase 1: Lightbox Windowing** | None | Low | Revert to full array map. |
| **Phase 1: Sitemap DB Query** | None | Low | Fall back to static array if Supabase connection fails. |
| **Phase 2: Server Component Pre-fetch** | None | Low | Keep optional client fetch fallback if `initialData` is undefined. |
| **Phase 2: Database FK & Trigram Indexes** | Supabase CLI access | Medium (DB locks) | Execute with `CONCURRENTLY` if table sizes are large. |
| **Phase 2: Numeric Plate Price Column** | Migration script | Medium | Keep text column as fallback during transition. |
| **Phase 3: Portal Code Deduplication** | Thorough testing | Medium | Preserve existing routes until shared package is verified. |

---
*Report certified by Audit Board. All recommendations are prepared for user review and approval prior to implementation.*
