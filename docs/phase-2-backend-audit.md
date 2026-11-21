# Phase 2, Step 1 — Backend and Live Schema Audit

**Project:** YouMarriageWeArrange (`zujjiiljvjwgcxtaqype`, region `ap-south-1`, PostgreSQL `17.11.0.003`)  
**Canonical App:** `apps/web` (Next.js 15 App Router monorepo)  
**Audit Scope:** Read-only inspection of the live Supabase schema, RLS/grants, advisors, and monorepo codebase (`apps/*`, `packages/*`, `services/*`, `.agents/rules/*`). No schema, data, RLS, auth, dependency, or UI files were modified.

---

## 1. Existing Backend Architecture

| Layer / Location | Current State | Key Findings |
|---|---|---|
| **Web API Routes** (`apps/web/app/api/*`) | 9 route files total (`health/supabase`, 7 `admin/auth/*` routes, 1 Vitest suite) | `api/health/supabase/route.ts` is the only Phase 1 Supabase route. All 7 `api/admin/auth/*` routes use `apps/web/lib/adminAuth.ts` (local `.admin_auth.json` + in-memory OTP `Map` + unsigned cookie) rather than Supabase Auth. Zero domain API routes (`/api/venues`, `/api/vendors`, `/api/enquiries`, `/api/bookings`, `/api/favorites`, `/api/reviews`, `/api/payments`) exist yet. |
| **Middleware** (`apps/web/middleware.ts`) | Presence check on `ymwa_admin_session` only | Protects `/concierge-portal/*` (except `/concierge-portal/login`) solely by checking cookie existence. Does **not** refresh `@supabase/ssr` sessions, verify cookie authenticity, or guard `/customer/*`. |
| **Supabase Clients** | Split browser & server clients (Phase 1) | Browser client in `packages/auth/src/supabaseClient.ts` (re-exported via `apps/web/services/supabase/client.ts`); server cookie client in `apps/web/services/supabase/server.ts`. No generated `Database` types; no `supabase/migrations` folder in the repo (1 remote migration recorded). |
| **Admin Data Service** (`apps/web/services/admin/adminDataService.ts`) | Queries non-existent tables & masks errors | Queries `.from("quote_leads")` and `.from("page_contents")` (neither exists in Postgres) and filters `venues`/`vendors` with `.eq("id", id)` (actual PKs: `venue_id`/`vendor_id`), catching errors and falling back to `localStorage` and mock arrays. |
| **Shared Service Packages** (`services/*`) | Mock-backed stubs | `services/venue`, `services/vendor`, `services/booking`, and `services/customer` read only from `@we-arrange/database` or return static data. |
| **Shared Auth & Types** (`packages/auth`, `packages/types`) | Incomplete / duplicated | Duplicate `AuthContext` (`packages/auth/src/AuthContext.tsx` vs `apps/web/context/AuthContext.tsx`); `packages/auth/src/adminAuth.ts` duplicates admin auth patterns; `packages/types/src/*` defines frontend shapes (`Venue`, `Vendor`, `UserProfile`, `Requirement`, `Quote`), not live DB table types. |
| **Sibling Workspace Apps** | Static shells or un-migrated duplicates | `apps/admin` and `apps/vendor` are single-page shells (`app/page.tsx`). `apps/customer` duplicates `apps/web/app/customer`. `apps/concierge` duplicates `apps/web/app/concierge-portal` and its `adminDataService.ts`, with no `/api/*` handlers. Root `src/` is legacy and outside Phase 2 canonical scope. |
| **Direct Client Auth Calls** | Violates `.agents/rules/ARCHITECTURE.md` | UI components (`LoginClient.tsx`, `SignInForm.tsx`, `CreateAccountForm.tsx`, `Navbar/index.tsx`, `reset-password/page.tsx`) call `supabase.auth.*` directly instead of going through a service layer / Route Handlers. |

---

## 2. Live Database Overview

- **Migrations & Extensions:** 1 Supabase migration (`20261031083047_create_catering_import_staging`), 0 Edge Functions, 0 Storage buckets.
- **Enums (`public` schema, 4):** `status_enum`, `admin_status_enum` (exact values include `'Active'` and `'Published'` seen in policies), plus 2 additional enums in live catalog.
- **Tables & Constraints (`public`):** **97 tables**, **117 foreign keys**, **27 unique constraints**, **2 domain CHECK constraints** (on `reports`), **32 `BEFORE UPDATE` triggers** using **1 function** (`public.update_updated_at_column()`).
- **RLS & Data API Grants:** All 97 tables have `rls_enabled = true` (`rls_forced = false`), **17 tables** have `SELECT` policies only, and **80 tables** have **0 policies**. Crucially, `anon` and `authenticated` have `USAGE` on `public` but **0 `SELECT` / `INSERT` / `UPDATE` / `DELETE` table grants**, meaning all 97 tables currently deny PostgREST access even where RLS policies exist.
- **Auth vs `public` User Sync Gap:** `auth.users` contains **20** accounts; `public.users`, `public.user_profile`, and `public.admins` all contain **0** rows (no signup trigger on `auth.users` exists).

### Populated vs Empty Tables by Domain

| Domain | Populated Tables (Exact Live Row Counts) | Empty Tables (`0` rows — 83 total) |
|---|---|---|
| **Venues (14)** | `venue_types` (**20**), `venues` (**1,198**), `venue_gallery` (**4,760**), `venue_pricing` (**1,190**), `venue_faq` (**5,452**), `venue_contacts` (**1,198**), `venue_room_details` (**424**) | `venue_amenities`, `venue_availability`, `venue_features`, `venue_menus`, `venue_packages`, `venue_parking`, `venue_videos` |
| **Vendors (12)** | `vendor_categories` (**5**: `bridal-makeup`, `photographers`, `catering`, `decorators`, `mehendi`), `vendors` (**2,995**), `vendor_gallery` (**9,750**), `vendor_pricing` (**1,102**), `vendor_services` (**1,074**), `vendor_contacts` (**2,995**) | `vendor_availability`, `vendor_faq`, `vendor_packages`, `vendor_social_links`, `vendor_team`, `vendor_videos` |
| **Staging (1)** | `photographers_import_v2` (**1,086** — all `text` columns, no PK) | — |
| **Users & RBAC (6)** | — | `users`, `user_profile`, `admins`, `roles`, `permissions`, `role_permissions` |
| **Locations (5)** | — | `countries`, `states`, `cities`, `areas`, `localities` |
| **Bookings (4)** | — | `bookings`, `booking_status`, `booking_payments`, `booking_documents` |
| **Enquiries & Chat (7)** | — | `enquiries`, `enquiry_messages`, `enquiry_status_history`, `conversations`, `messages`, `message_attachments`, `chat_notifications` |
| **Payments & Billing (5)** | — | `payments`, `invoices`, `transactions`, `refunds`, `coupons` |
| **Reviews & Moderation (6)** | — | `reviews`, `review_images`, `review_votes`, `reports`, `report_reasons`, `moderation_logs` |
| **Saved & E-Invites (7)** | — | `favorites`, `collections`, `invites`, `invite_templates`, `invite_guests`, `invite_media`, `invite_rsvp` |
| **Editorial, CMS, Search, Notifications & Config (30)** | — | `blogs`, `blog_categories`, `blog_comments`, `blog_likes`, `blog_tags`, `inspirations`, `inspiration_categories`, `inspiration_gallery`, `real_weddings`, `wedding_gallery`, `wedding_tags`, `wedding_vendors`, `banners`, `home_sections`, `pages`, `seo`, `faqs`, `testimonials`, `themes`, `app_settings`, `currencies`, `languages`, `popular_searches`, `recent_searches`, `search_filters`, `email_templates`, `sms_templates`, `notification_templates`, `notifications`, `notification_logs` |

### Advisor Findings Summary

- **Security:**
  - `0008_rls_enabled_no_policy` (`INFO`, **80 findings**): 80 public tables have RLS enabled with zero policies ([remediation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)).
  - `0011_function_search_path_mutable` (`WARN`, **1 finding**): `public.update_updated_at_column` lacks a fixed `search_path` ([remediation](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)).
  - `auth_leaked_password_protection` (`WARN`, **1 finding**): HaveIBeenPwned leaked-password check is disabled in Supabase Auth ([remediation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)).
- **Performance:**
  - `0001_unindexed_foreign_keys` (`INFO`, **111 findings**): 111 foreign keys across core tables lack covering indexes ([remediation](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys)).
  - `0004_no_primary_key` (`INFO`, **1 finding**): `public.photographers_import_v2` has no primary key ([remediation](https://supabase.com/docs/guides/database/database-linter?lint=0004_no_primary_key)).

---

## 3. Table Relationship Analysis

- **Primary Key Convention (`bigint` vs `uuid`):** Unlike `.agents/rules/DATABASE_SECURITY.md` (which assumes UUIDs everywhere), live entity PKs are `bigint` (`venue_id`, `vendor_id`, `booking_id`, `enquiry_id`, `favorite_id`, `review_id`, `payment_id`). Only identity tables use `uuid` (`users.user_id`, `user_profile.user_id`, `admins.user_id`), and `users.user_id` is not yet wired to `auth.users(id)` via an automated trigger.
- **Venues (`venues` -> 13 child tables):** `venues.type_id -> venue_types.type_id`, `venues.area_id -> areas.area_id`. Live data anomalies: **no `slug` column on `venues`**, **1,198 / 1,198 rows have `status = NULL`**, **1,198 / 1,198 have `area_id = NULL`** (locations are stored in `base_city`, `locality_name`, `primary_locality`), `phone`/`website`/`google_maps` are duplicated on both `venues` and `venue_contacts`, and internal scraping columns (`external_id`, `member_id`, `membership_id`, `source_url`) live directly on `venues`.
- **Vendors (`vendors` -> 11 child tables):** `vendors.category_id -> vendor_categories.category_id`, `vendors.user_id -> users.user_id`. All **2,995** live vendors have unique non-null `slug`, `status = 'Active'`, **`is_verified = false`**, and **`user_id = NULL`**. Category slugs in DB (`bridal-makeup`, `photographers`, `decorators`) differ from mock slugs (`makeup`, `photography`, `decor`).
- **Schema vs `DATABASE_SECURITY.md` Drift:**
  - `user_profile` exists instead of `profiles`.
  - `favorites` (columns: `user_id`, `venue_id`, `vendor_id`, `inspiration_id`, `blog_id`) + `collections` (not linked to `favorites`) exist instead of `shortlists`. `favorites` currently lacks a single-target `CHECK` constraint and unique `(user_id, venue_id)` / `(user_id, vendor_id)` constraints.
  - `enquiries` + `enquiry_messages` + `enquiry_status_history` exist instead of `requirements`.
  - **`quotes` and `comparison_sheets` tables do not exist** anywhere in the 97-table schema; nor is there an `assigned_specialist_id` on `enquiries`.
- **Structural Defects:** `venue_menus.menu_id` lacks an auto-increment `nextval(...)` sequence default; `photographers_import_v2` is an un-keyed text staging table; 111 unindexed foreign keys will degrade joins on `venue_*`, `vendor_*`, `bookings`, `enquiries`, `favorites`, and `payments`.

---

## 4. Frontend-to-Database Mapping (All 14 Features)

| # | Feature | Existing Frontend Components / Pages (`apps/web`) | Current Data Source | Target Live DB Tables | Required CRUD | Required Roles | Existing RLS | Missing Backend / Schema Work |
|---|---|---|---|---|---|---|---|---|
| 1 | **Customer registration & profiles** | `app/login/*`, `app/register/page.tsx`, `app/reset-password/page.tsx`, `features/auth/components/*`, `app/customer/settings/*` | Direct `supabase.auth.*` in UI; local React state in `CustomerSettingsClient.tsx` | `auth.users`, `users`, `user_profile`, `roles` | R, U (sync on signup) | Customer (self) | None (0 policies on `users`, `user_profile`) | Signup trigger/sync `auth.users -> public.users` (`customer` role), `/api/customer/profile` route, service wrapper removing `supabase.auth` from components, leaked-password protection |
| 2 | **Vendor registration & profiles** | `apps/vendor/app/page.tsx` (placeholder), no public vendor onboarding (`ENGINEERING_RULES.md`: admin-vetted) | Static shell / none | `vendors`, `vendor_contacts`, `vendor_categories`, `vendor_services`, `vendor_gallery`, `users` | C (admin), R, U (owner/admin) | Admin (vet/approve), Vendor (`user_id = auth.uid()`) | `vendor_categories`: public `SELECT`; `vendors` & sub-tables: **none** | Claim/onboarding flow linking `vendors.user_id` to `users.user_id`, admin approval workflow updating `is_verified`, vendor profile API routes |
| 3 | **Venue listings & details** | `app/(public)/venues/page.tsx`, `features/venues/components/VenueDiscoveryClient.tsx`, `app/(public)/venues/[slug]/VenueDetailsClient.tsx` | `mock-data/venues.ts` (`featuredVenues`) & `@we-arrange/database` | `venues`, `venue_types`, `venue_gallery`, `venue_faq`, `venue_room_details`, `venue_contacts`, `venue_amenities`, `venue_features` | R (public), C/U/D (admin) | Anon/Customer (R), Admin (C/U/D) | `venue_types`: public `SELECT`; `venues` & 13 child tables: **none** | Add `venues.slug`, backfill `venues.status = 'Active'`, hide scraping/PII columns (`venue_contacts`, `external_id`), index FKs, build `services/venue` DB queries + `/api/venues` |
| 4 | **Venue pricing & availability** | `VenueDetailsClient.tsx`, `VenueHeroSearch.tsx` | `mock-data/venues.ts` | `venue_pricing`, `venue_packages`, `venue_menus`, `venue_availability`, `venues` (`availability_start_time`, `availability_end_time`) | R (public pricing), C/U (admin/partner) | Anon/Customer (R), Admin (C/U) | **None** | Populate `venue_availability` & `venue_packages`, add `menu_id` sequence default, preserve `ENGINEERING_RULES.md` (no sort-by-price, "Request Custom Quote" default when unpriced) |
| 5 | **Wedding vendor listings** | `app/(public)/vendors/page.tsx`, `VendorsDirectoryClient.tsx`, `app/(public)/vendors/[slug]/VendorDetailsClient.tsx`, `CategoryGrid.tsx` | `mock-data/vendors.ts` (`mockVendors`) | `vendors`, `vendor_categories`, `vendor_gallery`, `vendor_pricing`, `vendor_services`, `vendor_contacts`, `vendor_faq`, `vendor_team`, `vendor_social_links` | R (public), C/U/D (admin/owner) | Anon/Customer (R), Vendor (U own), Admin (C/U/D) | `vendor_categories`: public `SELECT`; `vendors` & child tables: **none** | Map category slug aliases (`makeup` -> `bridal-makeup`, etc.) or update UI filters, decouple `vendor_contacts` PII, populate `vendor_faq`, replace `mockVendors` in `services/vendor` |
| 6 | **Bookings** | `app/customer/bookings/CustomerBookingsClient.tsx`, `app/customer/overview/CustomerOverviewClient.tsx` | Hardcoded mock bookings array & placeholder KPIs | `bookings`, `booking_status`, `booking_documents`, `booking_payments` | C (admin/concierge or accepted quote), R (owner/admin), U (admin) | Customer (R own), Admin/Concierge (C/R/U), Vendor (R own) | **None** | Seed `booking_status`, create `/api/bookings` + `services/booking` Supabase queries, enforce ownership checks & valid status transitions |
| 7 | **Enquiries & quote requests** | `VenueDetailsClient.tsx` (`Get Custom Quote`, `Schedule Site Visit` -> `alert()`), `VendorDetailsClient.tsx` (`Talk to Your Curator`, `Get Quote` -> `alert()`), `FloatingConciergeButton.tsx`, `concierge-portal/leads/page.tsx` | `window.alert()`, `adminDataService.ts` (`quote_leads` failure -> `localStorage`), mocks | `enquiries`, `enquiry_messages`, `enquiry_status_history` (+ missing `quotes`, `comparison_sheets`) | C (customer), R (owner/concierge), U (concierge/admin) | Customer (C/R own), Admin/Concierge (R/U) | **None** | Replace `alert()` & `quote_leads` with `enquiries` API (`/api/enquiries`), add schema support for specialist assignment & structured **quotes / comparison sheets** (human-assisted only, per `ENGINEERING_RULES.md`) |
| 8 | **Reviews & ratings** | Detail page rating/review display on `VenueDetailsClient.tsx`, `VendorDetailsClient.tsx`, cards | Static `rating` / `reviewsCount` in mock files | `reviews`, `review_images`, `review_votes`, `reports`, `report_reasons`, `moderation_logs` | C (verified customer), R (published), U/D (owner/moderator) | Anon/Customer (R approved), Authenticated (C/vote/report), Admin (moderate) | **None** | Build `/api/reviews` with target exclusivity check (`venue_id` XOR `vendor_id`), moderation status gate (`status = 'Published'` / `'Active'`), aggregate rating sync back to `venues`/`vendors` |
| 9 | **Favorites** | `store/useSavedStore.ts`, `store/useVenueStore.ts`, `app/customer/saved/CustomerSavedClient.tsx`, `app/saved/page.tsx`, `app/(public)/planning/shortlist/page.tsx` | `localStorage` (`youmarriage-saved-items`) matched against mock IDs | `favorites`, `collections` | C, R, D (self) | Customer (self only) | **None** | Add target-exclusivity `CHECK` & unique `(user_id, venue_id)`/`(user_id, vendor_id)` constraints + `collection_id` FK; migrate `useSavedStore` from `localStorage` to `/api/favorites` synced per user |
| 10 | **Payments & transactions** | No live UI yet (`CustomerBookingsClient.tsx` summary text only) | None / static text | `payments`, `booking_payments`, `invoices`, `transactions`, `refunds`, `coupons` | C (server/webhook only), R (owner/admin) | Customer (R own), Admin (R/refund) | **None** | Server-only payment gateway/webhook handlers (`service_role` only for verified webhook writes), idempotency keys on `transaction_reference`, strict PII & financial RLS |
| 11 | **Admin dashboard** | `apps/admin/app/page.tsx` (placeholder shell), `apps/web/app/concierge-portal/*` (currently mixes admin & concierge) | Static shell / `adminDataService.ts` mocks | All domain tables + `admins`, `roles`, `permissions`, `role_permissions`, `app_settings` | Full CRUD via audited server routes | Admin (`admins` table verified) | **None** on `admins`/RBAC | Separate real Admin capabilities from Concierge or formalize RBAC in `roles`/`admins`; replace `.admin_auth.json` + hardcoded password fallback with Supabase Auth + DB role verification |
| 12 | **Concierge dashboard** | `apps/web/app/concierge-portal/{page,leads,venues,vendors,pages,analytics,settings}` (+ duplicate `apps/concierge`) | `adminDataService.ts` (`quote_leads` / `page_contents` + `.eq("id")` bugs -> `localStorage`) | `enquiries`, `enquiry_messages`, `enquiry_status_history`, `bookings`, `venues`, `vendors`, `pages`, `home_sections` (+ missing `quotes`) | R/U/C (leads, quotes, catalog, CMS) | Admin / Concierge specialist | `pages`, `home_sections` have public `SELECT`; others **none** | Fix table/column mismatches (`quote_leads` -> `enquiries`, `id` -> `venue_id`/`vendor_id`), add `/api/concierge/*` routes backed by Supabase Auth + `admins` check, retire/sync `apps/concierge` |
| 13 | **Blog & content management** | `app/(public)/inspiration/*`, `real-weddings/*`, `e-invites/*`, `wedding-studio/*`, `concierge-portal/pages/*`; `(public)/blog/[slug]/.gitkeep` stub | `mock-data/*`, `@we-arrange/database`, `localStorage` (`we-arrange-invites`) | `blogs`, `blog_categories`, `blog_tags`, `inspirations`, `inspiration_categories`, `inspiration_gallery`, `real_weddings`, `wedding_gallery`, `wedding_vendors`, `pages`, `seo`, `faqs`, `testimonials`, `banners`, `home_sections`, `themes`, `invites`, `invite_templates`, `invite_guests`, `invite_rsvp` | R (public published), C/U (admin CMS; authenticated users for `invites`) | Anon/Customer (R published; C/U/D own `invites`), Admin (CMS C/U/D) | Public `SELECT` policies exist on 15 CMS/lookup tables (blocked by missing `GRANT`s); `invites` & `blog_comments`: **none** | Grant `SELECT` to `anon,authenticated` on published CMS tables, seed DB from `packages/database` data, build blog routes & `/api/invites` replacing `localStorage` |
| 14 | **Notifications & messaging** | `app/concierge-portal/leads/page.tsx` notes; `app/customer/overview/*`; `FloatingConciergeButton.tsx` | None / local React state / external WhatsApp links | `conversations`, `messages`, `message_attachments`, `chat_notifications`, `notifications`, `notification_logs`, `notification_templates`, `email_templates`, `sms_templates` | C, R, U (`is_read`) | Participant (`user_id` or assigned concierge) / Admin | **None** | Build `/api/conversations`, `/api/messages`, `/api/notifications`, enforce participant-only RLS, keep templates & `notification_logs` server/admin-only |

---

## 5. Mock-Data Replacement Plan

All active mock consumption lives in `apps/web/mock-data/*` (21 files) and `packages/database/src/*` (20+ files), consumed by `services/*`, `apps/web/features/*`, `apps/web/app/customer/*`, and `apps/web/services/admin/adminDataService.ts`.

1. **Preserve Domain Contracts & UI:** Keep the existing `@we-arrange/types` props expected by `VenueCard`, `VendorCard`, `VenueDetailsClient`, and `VendorDetailsClient` intact while introducing explicit Supabase mappers inside `services/venue` and `services/vendor`. Preserve non-negotiable business rules from `.agents/rules/ENGINEERING_RULES.md` (no price-sorting UI on public discovery, human-assisted quotes rather than automated instant quotes).
2. **Resolve Catalog Data Mismatches Before Cutover:**
   - Generate and backfill `venues.slug` + set `venues.status = 'Active'` for vetted live listings (currently `1,198` rows are `NULL`).
   - Align `vendors` category filters between UI (`makeup`, `photography`, `decor`) and DB `vendor_categories.slug` (`bridal-makeup`, `photographers`, `decorators`).
   - Seed empty reference/CMS tables (`cities`, `areas`, `booking_status`, `pages`, `home_sections`, `testimonials`, `inspirations`, `real_weddings`, `invite_templates`) from the existing `packages/database` datasets where approved.
3. **Replace Client Stores with Authenticated API Backing:**
   - Migrate `useSavedStore` (`localStorage` key `youmarriage-saved-items`) and `we-arrange-invites` (`e-invites/page.tsx`) to server-backed APIs with optional one-time guest-to-user sync after login.
   - Replace `adminDataService.ts` fallback-to-mock silent catches with explicit Supabase Route Handlers returning real errors.
4. **Retire Duplicate Mock Trees Last:** After each feature passes integration tests against live DB data, remove `@we-arrange/database` static exports and `apps/web/mock-data/*` imports domain by domain (Catalog -> Saved/Enquiries -> Bookings -> CMS/Editorial).

---

## 6. API Requirements

Per `.agents/rules/ARCHITECTURE.md`, all mutations and privileged/server reads in `apps/web/app/api/*` must validate input with **Zod**, call `supabase.auth.getUser()`, verify DB roles, delegate to `services/*`, and return consistent JSON error shapes (matching Phase 1's `api/health/supabase` hygiene — never leaking secrets or raw stack traces).

| Route Prefix | Core Endpoints Needed | Auth & Role Rule |
|---|---|---|
| `/api/venues` | `GET /api/venues` (search/filter without price-sort), `GET /api/venues/[slug]` | Public (`anon`), excludes internal scraping fields & private vendor contacts unless permitted |
| `/api/vendors` | `GET /api/vendors` (category/city/rating filters), `GET /api/vendors/[slug]` | Public (`anon`) |
| `/api/customer/profile` | `GET/PATCH /api/customer/profile` | Authenticated `customer` (self only) |
| `/api/favorites` | `GET/POST /api/favorites`, `DELETE /api/favorites/[id]`, `POST /api/favorites/collections` | Authenticated `customer` (self only) |
| `/api/enquiries` & `/api/quotes` | `POST /api/enquiries`, `GET /api/enquiries`, `GET/POST /api/enquiries/[id]/messages`, `GET/POST /api/quotes` | Customer (create & read own); Concierge/Admin (read/assign/create human-assisted quotes) |
| `/api/bookings` | `GET /api/bookings`, `POST /api/bookings`, `PATCH /api/bookings/[id]` | Customer (read own); Admin/Concierge (create & transition status) |
| `/api/reviews` | `GET /api/reviews`, `POST /api/reviews`, `POST /api/reviews/[id]/vote` | Public (published read); Authenticated (create/vote) |
| `/api/invites` | `GET/POST/PATCH/DELETE /api/invites`, `POST /api/invites/[slug]/rsvp` | Owner for invite CRUD; public token/slug check for guest RSVP |
| `/api/notifications` & `/api/messages` | `GET/PATCH /api/notifications`, `GET/POST /api/conversations/[id]/messages` | Participant / self only |
| `/api/payments` | `POST /api/payments/intent`, `POST /api/payments/webhook` | Authenticated customer for intent; verified gateway signature + `service_role` inside webhook only |
| `/api/concierge/*` & `/api/admin/*` | Replace `adminDataService.ts` client calls & `.admin_auth.json` routes with DB-backed admin auth & CRUD (`leads`, `venues`, `vendors`, `pages`, `analytics`) | Verified active `admins` record backed by Supabase Auth |

> Note: `apps/concierge` currently has zero `/api/*` routes. Consolidating portal APIs in `apps/web` or sharing handlers explicitly must be decided before building concierge mutations.

---

## 7. Authentication & Authorization Gaps

1. **Disjointed Auth Users vs App Users:** 20 users exist in `auth.users`, while `public.users`, `public.user_profile`, and `public.admins` all have `0` rows. There is no trigger or post-auth sync creating application user rows and assigning a default `customer` role.
2. **Insecure Legacy Admin Auth (`apps/web/lib/adminAuth.ts`):**
   - Stores credentials on the local filesystem (`.admin_auth.json` — unscalable/ephemeral in serverless hosting) and contains a hardcoded `DEFAULT_PASSWORD = "252U1R9162"` fallback.
   - Tracks password-reset OTPs in an in-memory `Map` (lost across instances/restarts).
   - Sets `ymwa_admin_session` using a non-cryptographic `timestamp + Math.random` token with no server-side session store or HMAC signature verification.
3. **Broken Middleware Protection (`apps/web/middleware.ts`):**
   - Only checks `request.cookies.has("ymwa_admin_session")` for `/concierge-portal/*` without validating signature/session or database admin membership.
   - Does not run `@supabase/ssr` `getUser()` cookie refresh on requests, and does not enforce route protection for `/customer/*`.
4. **Auth Calls Inside React Components:** `LoginClient.tsx`, `SignInForm.tsx`, `CreateAccountForm.tsx`, `Navbar/index.tsx`, and `reset-password/page.tsx` invoke `supabase.auth.*` directly; `AuthContext` is duplicated across `packages/auth` and `apps/web/context`.
5. **Leaked Password Protection Disabled:** Flagged by Supabase Security Advisor (`auth_leaked_password_protection`).

---

## 8. RLS Policy Gap Analysis

- **Critical Blocker — Missing PostgreSQL `GRANT`s:** Every table in `public` currently grants **zero** `SELECT`, `INSERT`, `UPDATE`, or `DELETE` privileges to `anon` or `authenticated`. Even the 17 tables with RLS policies cannot be queried via the Supabase Data API until explicit least-privilege table grants are issued alongside RLS.
- **80 Tables Have RLS Enabled with Zero Policies:** Under PostgreSQL RLS, default-deny blocks all `anon` and `authenticated` access to `venues`, `vendors`, all `venue_*`/`vendor_*` details, `users`, `user_profile`, `admins`, `bookings`, `enquiries`, `favorites`, `collections`, `reviews`, `payments`, `invites`, `conversations`, `messages`, and `notifications`.
- **Audit of the 17 Existing Policies (`SELECT` only):**
  - Broad `USING (true)` for `anon, authenticated`: `areas`, `blog_categories`, `cities`, `countries`, `inspiration_categories`, `inspirations`, `real_weddings`, `states`, `vendor_categories`, `venue_types`.
  - Status-filtered `SELECT` for `anon, authenticated`: `faqs`, `home_sections`, `testimonials`, `themes` (`status = 'Active'`); `blogs`, `pages` (`status = 'Published'`).
  - Role inconsistency: `banners` grants `status = 'active'` on `{public}` instead of `{anon, authenticated}`.
- **Required Policy Architecture (Never Disable RLS):**
  - **Catalog Public Read (`anon, authenticated`):** Policy on `venues` (`status = 'Active'`) and `vendors` (`status = 'Active'`), plus public child tables (`venue_gallery`, `venue_pricing`, `venue_faq`, `venue_room_details`, `vendor_gallery`, `vendor_pricing`, `vendor_services`, etc.). **Exclude or restrict contact PII** (`venue_contacts`, `vendor_contacts`) until product decides whether vendor/venue phone numbers are public or concierge-gated. Keep `photographers_import_v2` completely closed (`0` public grants/policies).
  - **Customer Self-Isolation (`auth.uid() = user_id`):** Strict owner-only `SELECT`/`INSERT`/`UPDATE`/`DELETE` (where appropriate) on `user_profile`, `favorites`, `collections`, `enquiries`, `enquiry_messages`, `bookings`, `invites`, `invite_guests`, `recent_searches`, `notifications`. Customers must **never** update `bookings.status_id`, `bookings.total_amount`, `payments.*`, or `users.role_id`.
  - **Vendor Isolation:** `vendors` and child tables editable only where `vendors.user_id = auth.uid()` (via `EXISTS` check), while `is_verified` and `status` remain admin-only.
  - **Bookings & Payments:** `bookings`, `booking_documents`, `payments`, `booking_payments`, `invoices`, `transactions`, `refunds` readable only by `user_id = auth.uid()` (or linked vendor/admin). Financial writes performed exclusively via verified server/webhook `service_role` handlers — never from browser clients.
  - **Admin / Concierge Authorization:** Check active membership in `public.admins` (`EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid() AND a.status = 'Active')` via a `SECURITY DEFINER` helper with pinned `search_path = ''`), **never** trusting `raw_user_meta_data` or `auth.role()`.

---

## 9. Recommended Implementation Order

| Phase / Step | Focus | Key Deliverables (Reusing Existing Repo Structure) |
|---|---|---|
| **Step 2 — DB Foundation & Security Remediation** | Fix DB blockers, grants, indexes & missing schema pieces via tracked Supabase migrations | 1. Fix `update_updated_at_column` `search_path`; enable leaked-password protection.<br>2. Add missing `quotes`/`comparison_sheets` tables (or extend `enquiries` with `assigned_specialist_id`), `venues.slug`, `venue_menus.menu_id` sequence, `favorites` exclusivity/unique constraints, `reviews` target CHECK.<br>3. Add indexes for the 111 unindexed FKs.<br>4. Add `auth.users -> public.users` + `user_profile` trigger.<br>5. Issue minimal `GRANT`s + complete RLS policies across all domain tables.<br>6. Generate live TypeScript `Database` types into `packages/types` (or `packages/database`). |
| **Step 3 — Catalog Read Cutover (`venues` & `vendors`)** | Replace catalog mock data in `apps/web` without UI regressions | Backfill `venues.status`/`slug`, align category slugs, implement live Supabase queries in `services/venue` and `services/vendor`, expose `/api/venues` & `/api/vendors`, switch `VenueDiscoveryClient`, `VenueDetailsClient`, `VendorsDirectoryClient`, `VendorDetailsClient` off mock files. |
| **Step 4 — Auth, Middleware & Profile Sync** | Unify customer & admin authentication on Supabase Auth | Implement `@supabase/ssr` session refresh in `apps/web/middleware.ts`; move `supabase.auth.*` out of UI components into service helpers; unify `AuthContext`; replace `.admin_auth.json` + hardcoded password fallback with Supabase Auth + `public.admins` verification; wire `CustomerSettingsClient.tsx` to `users`/`user_profile`. |
| **Step 5 — Core Interactive Flows (`favorites`, `enquiries`, `quotes`)** | Turn CTA stubs and `localStorage` into real persistence | Wire `/api/favorites` to `useSavedStore`; replace `alert()` CTAs on venue/vendor detail pages and `FloatingConciergeButton` with `/api/enquiries`; fix `adminDataService.ts` queries (`quote_leads` -> `enquiries`, `venue_id`/`vendor_id`) and connect `concierge-portal/leads` + comparison/quote management. |
| **Step 6 — Bookings, Reviews, CMS & Notifications** | Wire remaining portals and empty editorial/transactional tables | Implement `/api/bookings` (`customer/bookings`, `customer/overview`), `/api/reviews`, `/api/invites` (replacing `we-arrange-invites` `localStorage`), seed/connect CMS tables (`pages`, `home_sections`, `blogs`, `real_weddings`, `inspirations`), add in-app messaging/notifications (`conversations`, `messages`, `notifications`). |
| **Step 7 — Payments & Final Cleanup** | Financial integration, legacy cleanup & hardening | Add server-verified payment gateway & webhook handlers for `payments`/`invoices`/`refunds`; decide disposition of duplicate `apps/concierge` and `apps/customer` or placeholder `apps/admin`/`apps/vendor`; remove unused mock datasets and verify full security advisor clean slate. |

---

## 10. Risks and Dependencies

1. **Live Catalog Data Gaps:** `1,198 / 1,198` `venues` have `status = NULL`, `area_id = NULL`, and no `slug`; `2,995 / 2,995` `vendors` have `is_verified = false` and `user_id = NULL`. Turning on strict `status = 'Active'` RLS before backfilling `venues` will return `0` venues to `apps/web`.
2. **Duplicate Apps & Divergent Schemas:** `apps/concierge` duplicates `apps/web/app/concierge-portal` without API routes, `apps/customer` duplicates `apps/web/app/customer`, and `AuthContext` exists in two places. Updating only `apps/web` without a consolidation decision risks split state and stale code.
3. **Contact PII Exposure Risk:** Phone numbers, emails, and websites exist in both `venues`/`venue_contacts` and `vendor_contacts` (plus raw scraped emails/phones in `photographers_import_v2`). Exposing these via public `SELECT` without review contradicts concierge-mediated lead capture and exposes vendor contact data.
4. **No Local Migration History:** Only 1 migration (`20261031083047_create_catering_import_staging`) is recorded in Supabase and no `supabase/` directory exists in git. Future DDL changes must be captured cleanly in versioned migrations to avoid environment drift.
5. **Pre-existing Repo Tooling & Local Env Blockers:** Root `eslint.config.mjs` (`@next/eslint-plugin-next` resolution) and `packages/config/tailwind.config.ts` (`tailwindcss` module resolution in `typecheck`) currently fail `lint`/`typecheck`/`build` in `apps/web`; additionally, `apps/web/.env.local` still requires the user's real public Supabase key locally before live app testing can succeed.

