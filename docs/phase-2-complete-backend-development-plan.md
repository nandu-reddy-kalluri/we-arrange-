# Phase 2 — Complete Backend Development Plan (Backend-First Strategy)

**Project:** YouMarriageWeArrange (`zujjiiljvjwgcxtaqype`, `ap-south-1`, PostgreSQL `17.11.0.003`)  
**Repository:** `we-arrange-` (`chore/phase-1-integration-foundation`)  
**Canonical API Host:** `apps/web` (`apps/web/app/api/*`)  
**Strategy:** Build, document, and test all **20 backend modules** independently (Supabase PostgreSQL + RLS + Next.js Route Handlers + Service Layer + Zod + Vitest) **before** connecting any frontend UI or removing frontend mock data.  
**Status:** **PLANNING ONLY** — No SQL executed, no migrations applied, no frontend or legacy `src/` modified.

---

## 1. Existing Backend Architecture Audit

| Layer / Location | Current State | Gaps & Reuse Assessment |
|---|---|---|
| **`apps/web/app/api/*`** | `api/health/supabase` (Phase 1) + 7 `api/admin/auth/*` routes | No domain API routes exist yet (`venues`, `vendors`, `enquiries`, `quotes`, `favorites`, `bookings`, `reviews`, `payments`, `cms`, `notifications`, `analytics`). |
| **`apps/web/lib/adminAuth.ts`** | Local `.admin_auth.json`, `DEFAULT_PASSWORD` fallback, in-memory OTP `Map`, random `ymwa_admin_session` cookie | Insecure and incompatible with serverless deployments; must be replaced by Supabase Auth + DB `public.admins` verification. |
| **`apps/web/middleware.ts`** | Checks only cookie existence (`ymwa_admin_session`) on `/concierge-portal/*` | Does not call `@supabase/ssr` `getUser()`, does not refresh sessions, does not verify DB roles, and does not protect `/customer/*`. |
| **`apps/web/services/supabase/*` & `packages/auth`** | Browser client (`packages/auth/src/supabaseClient.ts`), server cookie client (`apps/web/services/supabase/server.ts`), env validator (`packages/auth/src/env.ts`) | **Reusable foundation from Phase 1.** Missing server-only `service_role` client factory, `<Database>` generic typing, and unified RBAC guards; `AuthContext` is duplicated in `apps/web/context` and `packages/auth`. |
| **`services/{venue,vendor,booking,customer}`** | Stub functions reading `@we-arrange/database` mocks | **Reuse package structure.** Currently synchronous mock filters (`featuredVenues`, `mockVendors`, `Date.now()` lead stub); must become async Supabase-backed service modules. |
| **`apps/web/services/admin/adminDataService.ts`** | Queries non-existent `quote_leads` & `page_contents` and filters `.eq("id", id)` (PKs are `venue_id`/`vendor_id`), catching errors into `localStorage` | Direct browser DB writes violate `.agents/rules/ARCHITECTURE.md`; replace with admin/concierge Route Handlers + real DB queries. |
| **`packages/validation` & `packages/api-client`** | Zod schemas (`loginSchema`, `registerSchema`, `leadInquirySchema`) + `fetchApi<T>` | **Reuse.** Expand `packages/validation` for all 20 backend modules; standardize response/error envelope across Route Handlers & `api-client`. |
| **`packages/database` & `packages/types`** | Mock TypeScript datasets + frontend camelCase interfaces | Add generated live schema types to `packages/database/src/database.generated.ts`; keep frontend mock exports intact until backend cutover. |
| **Sibling Apps (`customer`, `vendor`, `admin`, `concierge`) & Legacy `src/`** | `admin`/`vendor` are static shells; `customer`/`concierge` duplicate `web` routes with no `/api/` handlers | Leave `src/` untouched. Host canonical backend APIs in `apps/web/app/api/*` and shared logic in `services/*` & `packages/*` so any portal app can consume them cleanly later. |
| **Testing & Env Tooling** | `route.test.ts` uses `node:test`; Vitest is not installed yet; pre-existing `eslint`/`tailwind` `typecheck` errors exist | Add Vitest for backend unit/API integration tests; keep server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, webhook secrets, R2 keys) strictly out of `NEXT_PUBLIC_*`. |

---

## 2. Database Readiness and Blockers

Revalidated live state of `zujjiiljvjwgcxtaqype` (detailed in `docs/phase-2-backend-audit.md` and `docs/phase-2-step-2b-implementation-review.md`):

- **97 public tables, 97/97 RLS enabled:** **80 tables have 0 RLS policies** (default-deny); 17 tables have `SELECT`-only policies (`banners` targets `{public}` instead of `{anon,authenticated}`).
- **Critical Grants Blocker:** `anon`, `authenticated`, and **`service_role`** currently hold **0 `SELECT/INSERT/UPDATE/DELETE` grants** across all 97 tables and **0 `USAGE`** grants across all **93** sequences (while `anon`/`authenticated` hold `TRUNCATE`). **No backend queries can run until Migration 01 restores `service_role` & minimal role grants.**
- **Catalog Schema & Data Blockers:**
  - `venues` (**1,198** rows): `status = NULL` (1,198), `area_id = NULL` (1,198), **missing `slug` column** (with 3 duplicate `venue_name` pairs), and `phone` populated on all 1,198 rows directly on `venues` (`website`/`google_maps` currently 0).
  - `venue_contacts` (**1,198** phones) and `vendor_contacts` (**2,995** phones, **424** emails, **1,340** names) contain private PII requiring Concierge/Admin/Owner restriction.
  - `vendors` (**2,995** rows): `user_id = NULL`, `is_verified = false`, DB category slugs (`bridal-makeup`, `photographers`, `decorators`) differ from mock slugs (`makeup`, `photography`, `decor`).
  - `venue_menus.menu_id` lacks a `nextval(...)` sequence default.
  - `favorites` and `reviews` lack single-target exclusivity `CHECK` and partial unique indexes.
- **Auth & Role Blockers:** `auth.users` has **20** accounts while `public.users`, `public.user_profile`, `public.admins`, and `public.roles` all have **0** rows; `public.update_updated_at_column()` has mutable `search_path`; leaked password protection is disabled.
- **Performance & Staging Blockers:** **111** unindexed foreign keys (`0001_unindexed_foreign_keys`); `photographers_import_v2` (1,086 rows) lacks a PK and sits in exposed `public`.
- **Missing Domain Tables (Required for Modules 10, 12, 16):** Live schema has `enquiries`, `enquiry_messages`, and `enquiry_status_history`, but **`quotes` and `comparison_sheets` do not exist** (per `.agents/rules/DATABASE_SECURITY.md`), nor does `enquiries.assigned_specialist_id`. Also `collections` is not linked to `favorites` (`collection_id`). An additive schema migration (Migration 10) is required before Modules 9–12.

> All 9 foundation migrations are already **prepared (not applied)** in `supabase/migrations/20261112170001_*.sql` through `20261112170009_*.sql`.

---

## 3. Backend Module Breakdown (All 20 Modules)

| # | Module | Scope & Responsibilities |
|---|---|---|
| **1** | **Database Foundation & Generated Types** | Apply prepared Migrations 01–09 + additive Migration 10 (`quotes`, `comparison_sheets`, `enquiries.assigned_specialist_id`, `favorites.collection_id`, `favorites` update support); generate `database.generated.ts`; create server-only `service_role` & typed Supabase helpers; verify RLS & advisors. |
| **2** | **Authentication & Authorization** | Unified `@supabase/ssr` session handling, login/register/logout/reset/refresh/me Route Handlers, DB-backed RBAC guards (`customer`, `vendor`, `concierge`, `admin` via `public.users`/`roles`/`admins`), middleware session refresh, replacement of `adminAuth.ts` `.admin_auth.json`. |
| **3** | **Customer Profile Management** | Read/update customer account (`users.full_name`, `phone`) & extended `user_profile` (address, city/area, about, gender, dob, avatar upload metadata), onboarding completion check. |
| **4** | **Vendor Profile & Service Management** | Admin-vetted vendor onboarding/account linking (`vendors.user_id`), vendor self-service update of non-privileged profile, contacts, team, social links, and services (strictly blocking self-verification). |
| **5** | **Venue Management** | Public read-only venue discovery by slug/ID (omitting `venues.phone` & scraping metadata) + Admin/Concierge venue CRUD, status management, and `venue_contacts` private access. |
| **6** | **Venue Categories, Pricing, Galleries & Availability** | `venue_types` catalog, multi-media `venue_gallery` (with Cloudflare R2/CDN signed upload pipeline for admin), `venue_pricing`, `venue_packages`, `venue_menus`, `venue_amenities`, `venue_features`, `venue_room_details`, `venue_parking`, `venue_videos`, `venue_faq`, and date/slot `venue_availability`. |
| **7** | **Vendor Categories, Pricing, Galleries & Services** | `vendor_categories` (including UI-to-DB slug normalization map), `vendor_pricing`, `vendor_services`, `vendor_packages`, `vendor_gallery` (Cloudflare signed uploads), `vendor_videos`, `vendor_faq`, `vendor_social_links`, `vendor_team`, `vendor_availability`. |
| **8** | **Search, Filtering, Sorting & Pagination** | Unified catalog query engine with strict Zod filters (city, locality/area, guest count range, venue type, vendor category, verified badge, availability), cursor/offset pagination, popular/recent search tracking, and **non-price sorting only** (honoring `ENGINEERING_RULES.md` ban on sort-by-price). |
| **9** | **Enquiries & Lead Management** | Customer wedding requirement / enquiry submission (replacing `alert()` & missing `quote_leads`), enquiry thread messages (`enquiry_messages`), specialist assignment, status workflow (`enquiry_status_history`). |
| **10** | **Quotation Management** | Human-curated partner quotes (`quotes`) created/updated exclusively by Concierge/Admin against an enquiry (never auto-generated instant quotes), package inclusions/exclusions, INR pricing, validity expiry, and customer quote viewing. |
| **11** | **Favorites & Saved Shortlists** | Customer shortlist CRUD (`favorites`) across venues/vendors/inspirations/blogs, custom shortlist folders (`collections`), idempotent toggle endpoints, duplicate/target-exclusivity protection. |
| **12** | **Venue/Vendor Comparison** | Structured side-by-side comparison sheets (`comparison_sheets`) compiled by Concierge/Admin from `quotes`, plus customer comparison matrix view of shortlisted venues/vendors & collected quotes. |
| **13** | **Booking Management** | Convert accepted quote/enquiry into a managed booking (`bookings`), booking status lifecycle (`booking_status`), contract/document metadata (`booking_documents` via Cloudflare storage), customer read & vendor/concierge/admin workflow views. |
| **14** | **Reviews & Ratings** | Customer review submission (`Pending` moderation state), media attachments (`review_images`), helpful voting (`review_votes`), content abuse reporting (`reports`, `report_reasons`), admin moderation (`moderation_logs`), transactional rating/count recalculation on `venues`/`vendors`. |
| **15** | **Admin Management** | Super-admin operations: manage `admins`, assign `roles`/`permissions`/`role_permissions`, vet & verify vendors (`is_verified`), manage `venues`/`vendors`, moderate reviews/reports, configure `app_settings`, audit logs. |
| **16** | **Concierge Management** | Dedicated Concierge workspace APIs: assigned lead queue, venue/vendor contact PII retrieval (`venue_contacts`, `vendor_contacts`), internal specialist notes, quote & comparison sheet compilation, site-visit scheduling status updates. |
| **17** | **CMS & Website Content Management** | Public read & Admin/Concierge CRUD for `pages`, `seo`, `banners`, `home_sections`, `blogs`, `blog_categories`, `blog_tags`, `blog_comments`, `blog_likes`, `inspirations`, `inspiration_categories`, `inspiration_gallery`, `real_weddings`, `wedding_gallery`, `wedding_tags`, `wedding_vendors`, `faqs`, `testimonials`, `themes`, `invites`, `invite_templates`, `invite_guests`, `invite_media`, `invite_rsvp`, and geo lookups (`countries`, `states`, `cities`, `areas`, `localities`). |
| **18** | **Payment Integration Foundation** | Gateway-agnostic payment intent creation (`payments`), idempotency tracking, signed payment webhook verification (`transactions`, `booking_payments`), `invoices` generation/storage URLs, `coupons` validation, and admin-initiated `refunds`. |
| **19** | **Notifications & Webhooks** | In-app notifications (`notifications` read/mark-read), real-time/message threads (`conversations`, `messages`, `message_attachments`, `chat_notifications`), template rendering (`notification_templates`, `email_templates`, `sms_templates`), delivery audit (`notification_logs`), and outbound/inbound webhook handlers (Cloudflare/Email/SMS/WhatsApp). |
| **20** | **Dashboard Analytics & Reporting** | Server-side aggregated metrics (never exposing PII) for Admin, Concierge, Vendor, and Customer dashboards: enquiry pipeline funnel, quote-to-booking conversion, category/city supply counts, revenue/payment totals, popular searches, moderation SLA metrics. |

---

## 4. API Endpoint Inventory (`apps/web/app/api/*`)

All endpoints enforce Zod validation, structured JSON errors, pagination (`page`, `limit`, `total`, `totalPages`) on list routes, and explicit role checks.

| Module | Endpoints (Method & Path) | Auth / Role |
|---|---|---|
| **1** | `GET /api/health/supabase` (exists — extend optionally with non-secret readiness check later) | Public |
| **2** | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/refresh`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `GET /api/auth/me`; Admin-specific auth replaced by `POST /api/auth/login` + `GET /api/admin/me` | Public (auth flows) / Authenticated |
| **3** | `GET /api/customer/profile`, `PATCH /api/customer/profile`, `POST /api/customer/profile/avatar-upload-url` | Customer (self) |
| **4** | `GET /api/vendor/me`, `PATCH /api/vendor/me`, `PUT /api/vendor/me/contacts`, `POST /api/admin/vendors/[id]/link-user`, `PATCH /api/admin/vendors/[id]/verify` | Vendor (own) / Admin |
| **5** | `GET /api/venues`, `GET /api/venues/[slug]`; `POST /api/admin/venues`, `PATCH /api/admin/venues/[id]`, `DELETE /api/admin/venues/[id]` | Public (R) / Concierge-Admin (C/U/D) |
| **6** | `GET /api/venues/types`, `GET /api/venues/[slug]/details` (pricing/gallery/faq/rooms/menus/packages/availability), `POST /api/concierge/venues/[id]/availability`, `POST/DELETE /api/admin/venues/[id]/media` (+ signed upload URL), `PUT /api/admin/venues/[id]/pricing` | Public (R) / Concierge-Admin (W) |
| **7** | `GET /api/vendors`, `GET /api/vendors/categories`, `GET /api/vendors/[slug]`, `POST/PATCH/DELETE /api/vendor/me/{services,pricing,packages,gallery,faq,availability,social-links,team}` | Public (R) / Vendor (own W) / Admin |
| **8** | `GET /api/search` (unified venues/vendors query, facets, non-price sorting, pagination), `GET /api/search/popular`, `GET/POST/DELETE /api/customer/searches/recent`, `GET/POST/DELETE /api/customer/searches/filters` | Public (search/popular) / Customer (recent/saved filters) |
| **9** | `POST /api/enquiries`, `GET /api/enquiries`, `GET /api/enquiries/[id]`, `POST /api/enquiries/[id]/messages`, `PATCH /api/concierge/enquiries/[id]/status`, `PATCH /api/admin/enquiries/[id]/assign` | Customer (own C/R) / Concierge-Admin (all) |
| **10** | `POST /api/concierge/enquiries/[id]/quotes`, `PATCH /api/concierge/quotes/[id]`, `GET /api/quotes/[id]`, `POST /api/quotes/[id]/respond` (customer accept/decline) | Concierge-Admin (C/U) / Customer (own R/respond) |
| **11** | `GET /api/favorites`, `POST /api/favorites`, `DELETE /api/favorites/[id]`, `GET/POST /api/favorites/collections`, `PATCH/DELETE /api/favorites/collections/[id]` | Customer (own) |
| **12** | `GET /api/comparisons`, `POST /api/concierge/enquiries/[id]/comparison-sheet`, `GET /api/comparisons/[id]`, `POST /api/comparisons/preview` (side-by-side shortlisted specs) | Customer (own) / Concierge-Admin (C/U) |
| **13** | `GET /api/bookings`, `GET /api/bookings/[id]`, `POST /api/concierge/bookings`, `PATCH /api/concierge/bookings/[id]/status`, `POST/GET /api/bookings/[id]/documents` | Customer (own R) / Vendor (own R) / Concierge-Admin (C/U) |
| **14** | `GET /api/reviews`, `POST /api/reviews`, `PATCH/DELETE /api/reviews/[id]`, `POST /api/reviews/[id]/vote`, `POST /api/reports`, `PATCH /api/admin/reviews/[id]/moderate`, `PATCH /api/admin/reports/[id]` | Public (published R) / Authenticated (C/vote/report) / Admin (moderate) |
| **15** | `GET/POST/PATCH /api/admin/users`, `GET/POST/PATCH /api/admin/roles`, `GET/POST/PATCH /api/admin/admins`, `GET/PATCH /api/admin/settings`, `GET /api/admin/moderation-logs` | Admin only |
| **16** | `GET /api/concierge/leads`, `GET /api/concierge/venues/[id]/contacts`, `GET /api/concierge/vendors/[id]/contacts`, `GET /api/concierge/workspace/summary` | Concierge / Admin |
| **17** | `GET /api/cms/{pages,blogs,inspirations,real-weddings,faqs,testimonials,banners,home-sections,themes,locations}`, `GET/POST/PATCH/DELETE /api/admin/cms/{...}`, `POST/DELETE /api/blogs/[id]/comments`, `POST /api/blogs/[id]/like`, `GET/POST/PATCH/DELETE /api/invites`, `POST/DELETE /api/invites/[id]/guests`, `GET /api/invites/public/[slug]`, `POST /api/invites/public/[slug]/rsvp` | Public (published R, slug RSVP) / Auth (own invites, blog interactions) / Concierge-Admin (CMS W) |
| **18** | `POST /api/payments/intent`, `POST /api/payments/validate-coupon`, `GET /api/payments`, `GET /api/invoices/[id]`, `POST /api/webhooks/payments` (HMAC-verified), `POST /api/admin/payments/[id]/refund` | Customer (own R/intent) / Webhook (signature) / Admin (refund) |
| **19** | `GET /api/notifications`, `PATCH /api/notifications/read`, `GET/POST /api/conversations`, `GET/POST /api/conversations/[id]/messages`, `POST /api/webhooks/notifications`, `GET/POST/PATCH /api/admin/notification-templates` | Participant / Self / Admin / Verified Webhook |
| **20** | `GET /api/analytics/customer`, `GET /api/analytics/vendor`, `GET /api/analytics/concierge`, `GET /api/analytics/admin` | Scoped per role |

---

## 5. Database Tables Used by Each Module

| Module | Live Supabase Tables (`public` + `auth` + `staging`) & Planned Additions |
|---|---|
| **1. DB Foundation** | All 97 existing tables (`supabase/migrations/01..09`), `staging.photographers_import_v2`, plus **Migration 10 additions:** `public.quotes`, `public.comparison_sheets`, `enquiries.assigned_specialist_id`, `favorites.collection_id` |
| **2. Auth & AuthZ** | `auth.users`, `public.users`, `public.user_profile`, `public.roles`, `public.permissions`, `public.role_permissions`, `public.admins`, `private.is_active_admin()`, `private.is_concierge_or_admin()` |
| **3. Customer Profile** | `users`, `user_profile`, `cities`, `areas` |
| **4. Vendor Profile** | `vendors`, `vendor_contacts`, `vendor_services`, `vendor_social_links`, `vendor_team`, `users` |
| **5. Venue Mgmt** | `venues`, `venue_types`, `venue_contacts`, `areas`, `cities` |
| **6. Venue Details** | `venue_types`, `venue_pricing`, `venue_gallery`, `venue_availability`, `venue_amenities`, `venue_features`, `venue_menus`, `venue_packages`, `venue_parking`, `venue_room_details`, `venue_faq`, `venue_videos` |
| **7. Vendor Details** | `vendor_categories`, `vendor_pricing`, `vendor_gallery`, `vendor_services`, `vendor_packages`, `vendor_faq`, `vendor_videos`, `vendor_social_links`, `vendor_team`, `vendor_availability` |
| **8. Search & Discovery** | `venues`, `venue_types`, `venue_pricing`, `venue_gallery`, `vendors`, `vendor_categories`, `vendor_pricing`, `vendor_gallery`, `cities`, `areas`, `localities`, `popular_searches`, `recent_searches`, `search_filters` |
| **9. Enquiries & Leads** | `enquiries`, `enquiry_messages`, `enquiry_status_history`, `users`, `venues`, `vendors` |
| **10. Quotations** | `quotes` *(new)*, `enquiries`, `enquiry_status_history`, `venues`, `vendors`, `admins` |
| **11. Favorites** | `favorites`, `collections`, `venues`, `vendors`, `inspirations`, `blogs` |
| **12. Comparison** | `comparison_sheets` *(new)*, `quotes` *(new)*, `enquiries`, `favorites`, `venues`, `venue_pricing`, `venue_amenities`, `vendors`, `vendor_pricing` |
| **13. Bookings** | `bookings`, `booking_status`, `booking_documents`, `booking_payments`, `quotes` *(new)*, `enquiries`, `venues`, `vendors` |
| **14. Reviews & Moderation** | `reviews`, `review_images`, `review_votes`, `reports`, `report_reasons`, `moderation_logs`, `venues`, `vendors` |
| **15. Admin** | `admins`, `roles`, `permissions`, `role_permissions`, `users`, `vendors`, `venues`, `reviews`, `reports`, `moderation_logs`, `app_settings`, `currencies`, `languages` |
| **16. Concierge** | `enquiries`, `enquiry_messages`, `enquiry_status_history`, `quotes` *(new)*, `comparison_sheets` *(new)*, `venue_contacts`, `vendor_contacts`, `bookings`, `pages`, `home_sections` |
| **17. CMS, Blog & Invites** | `blogs`, `blog_categories`, `blog_tags`, `blog_comments`, `blog_likes`, `inspirations`, `inspiration_categories`, `inspiration_gallery`, `real_weddings`, `wedding_gallery`, `wedding_tags`, `wedding_vendors`, `banners`, `home_sections`, `pages`, `seo`, `faqs`, `testimonials`, `themes`, `invites`, `invite_templates`, `invite_guests`, `invite_media`, `invite_rsvp`, `countries`, `states`, `cities`, `areas`, `localities` |
| **18. Payments** | `payments`, `booking_payments`, `invoices`, `transactions`, `refunds`, `coupons`, `bookings` |
| **19. Notifications & Chat** | `notifications`, `notification_templates`, `notification_logs`, `email_templates`, `sms_templates`, `conversations`, `messages`, `message_attachments`, `chat_notifications` |
| **20. Analytics** | Read-only aggregations across `enquiries`, `quotes`, `bookings`, `payments`, `venues`, `vendors`, `reviews`, `popular_searches`, `notifications` |

---

## 6. Service Layer Structure

Preserve the existing monorepo layout without introducing redundant wrapper packages (`ENGINEERING_RULES.md`):

- **`packages/database/src/`**:
  - `database.generated.ts` — Supabase CLI / MCP generated `Database` type (server/service-layer only).
  - `serverClient.ts` — Explicit helpers for request-scoped RLS client (wrapping `apps/web/services/supabase/server.ts`) and strictly server-only `createServiceRoleClient()` (never imported by `"use client"` code).
  - Existing mock exports remain untouched until frontend integration phase.
- **`packages/validation/src/`**: Domain Zod schema modules (`auth.ts`, `customer.ts`, `catalog.ts`, `enquiry.ts`, `quote.ts`, `booking.ts`, `review.ts`, `cms.ts`, `payment.ts`, `admin.ts`, `common.ts` for pagination/IDs), re-exported from `index.ts`.
- **`packages/types/src/`**: Shared sanitized API DTO types (never exposing DB PII fields to frontend components).
- **`packages/auth/src/`**: Browser/server auth helpers, typed session/RBAC contract, role constants (`customer`, `vendor`, `concierge`, `admin`).
- **`services/` (Existing 4 Workspace Packages — Domain Core):**
  - `services/venue` -> Venues, venue sub-tables, search/filtering, availability.
  - `services/vendor` -> Vendors, category slug mapping, vendor sub-tables, vendor self-service.
  - `services/customer` -> Customer profile, favorites, collections, comparison, reviews, invites.
  - `services/booking` -> Enquiries, quotes, comparison sheets, bookings, payment intents & booking documents.
- **`apps/web/services/` (Platform & Web Backend Services):**
  - `apps/web/services/auth/` -> Auth actions, DB role resolver, route guard helpers (`requireUser()`, `requireRole()`).
  - `apps/web/services/admin/` -> Admin RBAC, vendor vetting, moderation, `app_settings`.
  - `apps/web/services/concierge/` -> Concierge lead queue, contact PII lookup, quote/comparison workflows (replaces mock-backed `adminDataService.ts`).
  - `apps/web/services/cms/` -> Blogs, inspirations, real weddings, pages, SEO, banners, e-invites.
  - `apps/web/services/notifications/` -> In-app notifications, conversations/messages, template dispatcher & logs.
  - `apps/web/services/storage/` -> Cloudflare R2 / CDN presigned URL & media validation service.
  - `apps/web/services/analytics/` -> Aggregated KPI/reporting queries.
  - `apps/web/services/http/` -> Standardized API response/error helpers (`ok()`, `created()`, `fail()`), safe logger, pagination parser.

**Strict Call Flow:** `Route Handler` -> `Parse & Zod Validate` -> `Auth & DB Role Check` -> `Service Function` -> `Typed Supabase Client (RLS or justified service_role)` -> `Sanitized DTO Response`.

---

## 7. Authentication and Authorization Design

1. **Single Identity Source (Supabase Auth + Postgres RBAC):**
   - Authentication uses Supabase Auth exclusively (`@supabase/ssr` HTTP-only cookies).
   - Remove `.admin_auth.json`, `DEFAULT_PASSWORD` fallback, in-memory OTP map, and unverified `ymwa_admin_session` cookies from `apps/web/lib/adminAuth.ts` and `packages/auth/src/adminAuth.ts`.
2. **Database-Verified Authorization:**
   - Every protected Route Handler calls `supabase.auth.getUser()` (never `getSession()` alone for trust checks) and resolves role from `public.users` + `public.roles` / `public.admins` (`status = 'active'`).
   - **Never** trust `raw_user_meta_data` (`user_metadata`), client headers, or request-body `role` fields.
3. **Middleware (`apps/web/middleware.ts`):**
   - Refresh `@supabase/ssr` session cookies on every request; guard `/customer/*` (authenticated), `/concierge-portal/*` (active `concierge` or `admin`), and `/api/admin/*` / `/api/concierge/*`.
4. **Privilege Separation (Admin vs. Concierge vs. Vendor vs. Customer):**
   - `Customer`: Only own profile, favorites, collections, enquiries, own quotes, own bookings/payments/reviews/invites/notifications.
   - `Vendor`: Only listings where `vendors.user_id = auth.uid()` (cannot change `is_verified`, `status`, or `user_id`); reads bookings/conversations linked to own `vendor_id`.
   - `Concierge`: Reads all enquiries, private `venue_contacts`/`vendor_contacts`, compiles manual `quotes` & `comparison_sheets`, updates enquiry/booking/CMS pages. Cannot alter `admins`, `roles`, `permissions`, `app_settings`, or issue `refunds`.
   - `Admin`: Full management including `admins`, RBAC, vendor vetting (`is_verified`), review/report moderation, financial refunds, and system settings.
5. **RLS vs. `service_role` Boundary:**
   - Customer/Vendor operations use the **request-scoped user Supabase client (enforcing RLS)**.
   - `service_role` is strictly reserved for: (a) auth signup/sync internals, (b) payment/notification webhooks after cryptographic signature verification, (c) public slug-based invite/RSVP reads & submissions with server validation, and (d) audited Concierge/Admin server mutations **after** verifying `getUser()` + `private.is_active_admin()`/`is_concierge_or_admin()` membership.

---

## 8. Validation and Error-Handling Design

- **Input Validation (`packages/validation`):**
  - Every `POST`, `PUT`, `PATCH`, and query-parameterized `GET` parses inputs via `schema.safeParse(...)`. Reject unknown keys where appropriate (`strict()`), normalize pagination (`page >= 1`, `1 <= limit <= 50`), enforce INR numeric bounds, and validate UUID/positive-bigint IDs cleanly.
- **Canonical Response Envelope (`apps/web/services/http/response.ts`):**
  - Success: `{ ok: true, data: T, meta?: { page, limit, total, totalPages } }`
  - Error: `{ ok: false, error: { code: string, message: string, details?: FieldErrors } }`
- **HTTP Status & Safe Error Mapping:**
  - `400` (`VALIDATION_ERROR`), `401` (`UNAUTHENTICATED`), `403` (`FORBIDDEN`), `404` (`NOT_FOUND`), `409` (`CONFLICT` — e.g. duplicate favorite/slug), `422` (`UNPROCESSABLE_ENTITY`), `429` (`RATE_LIMITED`), `500` (`INTERNAL_ERROR`), `503` (`SERVICE_UNAVAILABLE`).
  - Map Postgres error codes (`23505` -> `409`, `23503` -> `400`, `42501` -> `403`, `PGRST116` -> `404`) without ever returning raw SQL errors, stack traces, response bodies, or environment/secret values.
- **Structured Server Logging:** Log `{ requestId, route, method, userId (optional), errorCode, durationMs }` — explicitly redact `authorization`, `cookie`, `phone`, `email`, `password`, and `SUPABASE_SERVICE_ROLE_KEY`.

---

## 9. Testing Strategy (Backend-First Verification)

1. **Tooling Setup (Module 1):** Add `vitest` (`vitest.config.ts`) at root / `apps/web` alongside existing Node `route.test.ts` runner; keep frontend UI untouched.
2. **Unit Tests (Per Module):**
   - Every Zod schema in `packages/validation` (valid inputs, boundary values, rejected fields, anti-pattern guards like rejecting `sortBy=price`).
   - Service business logic, DTO mappers (asserting `phone`/`email`/`external_id` never leak into public venue/vendor DTOs), slug normalization, and error mappers.
3. **Route Handler API Contract Tests (Vitest):**
   - Invoke `GET`/`POST`/`PATCH`/`DELETE` handlers directly with mocked Supabase/auth contexts covering `200/201`, `400`, `401`, `403` (wrong role / cross-customer IDOR), `404`, and `409` idempotency.
4. **Live Database & RLS Impersonation Tests (Per Schema/Auth/Domain Milestone):**
   - Run automated SQL/integration assertions under `SET LOCAL ROLE anon` and `authenticated` (`request.jwt.claims` for Customer A, Customer B, Vendor, Concierge, Admin) verifying:
     - `anon` cannot read `venue_contacts`, `vendor_contacts`, `venues.phone`, `bookings`, `enquiries`, `payments`, `users`, `admins`, or `staging.photographers_import_v2`.
     - Customer A cannot read/write Customer B rows or escalate `users.role_id`.
     - Vendor A cannot set `is_verified = true` or edit Vendor B.
     - Payment/webhook idempotency rejects tampered signatures and duplicate `transaction_reference`.
5. **Security & Performance Advisors Gate:** Confirm `get_advisors` (`security` & `performance`) remains clean after every migration.

---

## 10. Security Requirements

1. **PII Isolation:** Enforce Decision 1 (`venue_contacts`, `vendor_contacts`, `venues.phone`, `invite_guests.phone/email`, `users.email/phone` never exposed publicly or in public API DTOs).
2. **Zero Privilege Escalation:** Never read `user_metadata` or `auth.role()`; lock `users.role_id`, `users.status`, `vendors.is_verified`, `reviews.status`, `bookings.status_id`, and financial columns against client updates.
3. **Public Catalog Read-Only:** `anon` receives `SELECT` only on active/published rows; zero anonymous catalog writes.
4. **Cloudflare Media Security:** Only signed upload URLs issued to authenticated authorized roles (`admin`/`concierge`/verified `vendor`/own avatar), validating MIME allowlist, file size caps, and path ownership server-side before saving URLs in DB.
5. **Webhook Hardening:** Verify HMAC signatures + timestamps + replay/idempotency keys (`transactions.transaction_reference`) before writing `payments`/`transactions`/`refunds`/`notification_logs`.
6. **Abuse & Rate Protection:** Rate-limit auth endpoints, guest invite RSVP submissions, and public enquiry creation; enable Supabase Leaked Password Protection.

---

## 11. Dependency Order

1. **Module 1 (DB Foundation & Types)** -> prerequisite for everything.
2. **Module 2 (Auth & RBAC)** -> prerequisite for all authenticated/role-protected routes.
3. **Modules 3 & 4 (Customer & Vendor Profiles)** -> depends on 1, 2.
4. **Modules 5, 6, 7 (Venue & Vendor Catalog + Media/Pricing)** -> depends on 1, 2 (admin/vendor writes).
5. **Module 8 (Search, Filter, Sort, Pagination)** -> depends on 5, 6, 7.
6. **Module 11 (Favorites & Shortlists)** -> depends on 1, 2, 5, 7.
7. **Modules 9 & 10 (Enquiries & Quotations)** -> depends on 1, 2, 5, 7, 16 (Concierge roles).
8. **Module 12 (Comparison)** -> depends on 10, 11.
9. **Modules 13 & 18 (Bookings & Payments Foundation)** -> depends on 10, 12 (booking from quote -> payment).
10. **Modules 14, 15, 16, 17, 19 (Reviews, Admin, Concierge, CMS/Invites, Notifications)** -> depends on 1, 2, and core catalog/booking entities (`14` also ties to 5/7; `19` hooks into 9/10/13/18).
11. **Module 20 (Analytics & Reporting)** -> depends on all operational modules (`5`–`19`).

---

## 12. Implementation Milestones

| Milestone | Modules Covered | Key Outcome |
|---|---|---|
| **M1: Foundation & Security Baseline** | Modules 1, 2 | Approved Migrations 01–10 applied; advisors clean; `database.generated.ts` built; Vitest configured; Supabase Auth + DB RBAC + `middleware.ts` replacing `adminAuth.ts` tested. |
| **M2: Identity & Public Catalog Engine** | Modules 3, 4, 5, 6, 7, 8 | Customer & vendor profiles, full venue/vendor read+admin/owner CRUD, Cloudflare upload signing service, and paginated non-price-sorted Search API tested. |
| **M3: Concierge Lead-to-Comparison Core** | Modules 9, 10, 11, 12, 16 | Favorites/collections, customer enquiries, concierge contact PII workspace, manual human-curated quotes, and comparison sheets tested end-to-end via APIs. |
| **M4: Transactions, Bookings & Payments** | Modules 13, 18 | Quote-to-booking conversion, booking documents, coupon validation, payment intents, and HMAC-verified payment/refund webhooks tested. |
| **M5: Trust, Editorial & Communications** | Modules 14, 15, 17, 19 | Reviews/reports/moderation, admin RBAC/settings portal APIs, full CMS/blogs/real-weddings/e-invites/RSVP APIs, in-app messaging & notification/webhook dispatcher tested. |
| **M6: Reporting & Backend Sign-Off** | Module 20 | Role-scoped analytics endpoints + complete regression test suite + OpenAPI/markdown API reference verified prior to Frontend Integration Phase. |

---

## 13. Completion Criteria for Every Module

Every module is **not complete** until all 7 criteria pass:
1. Zod request & query schemas live in `packages/validation` with unit tests.
2. Service functions live in `services/*` or `apps/web/services/*` using typed `Database` client (zero DB logic in route files or React components).
3. Next.js Route Handlers live in `apps/web/app/api/*` enforcing `getUser()`, DB role checks, pagination (for lists), and canonical JSON error envelopes.
4. Security check: verifies zero PII leaks (no `phone`/`email`/secrets in public responses) and zero unauthorized cross-user/cross-role mutations.
5. Vitest unit + Route Handler contract tests pass (`2xx`, `400`, `401`, `403`, `404`, edge cases).
6. Live DB / RLS policy verification passes for affected tables where applicable.
7. Endpoint request/response contract documented cleanly before starting the next module.

---

## 14. Risks and Unresolved Decisions

1. **Migration Approval Gate:** Migrations `01`–`09` in `supabase/migrations/` remain unapplied pending approval, and **Migration 10** (`quotes`, `comparison_sheets`, `enquiries.assigned_specialist_id`, `favorites.collection_id`) must also be prepared & approved before Modules 9–12.
2. **Cloudflare Storage / CDN Configuration:** No Cloudflare R2 account credentials, bucket names, or CDN domain exist in `.env.example` or repo yet; Module 6/7/13/17 media upload endpoints depend on provider/bucket details (can implement signed-URL provider interface + local mock adapter in tests until keys are configured).
3. **Payment Gateway Selection:** No gateway SDK/keys exist yet (e.g., Razorpay for INR vs. Stripe); Module 18 will define a provider-agnostic adapter + HMAC webhook verifier until the merchant gateway is chosen.
4. **Notification Channels (Email / SMS / WhatsApp):** No Resend/SendGrid/Twilio/Meta WhatsApp credentials exist yet; Module 19 will store in-app notifications in Postgres and isolate external channel providers behind testable adapters.
5. **Existing 20 `auth.users` Accounts:** Migration 08 assigns all 20 existing accounts `customer` by default; real Admin/Concierge user IDs must be identified and promoted in `public.admins` & `public.users`.
6. **Sibling Portal Apps (`apps/customer`, `apps/vendor`, `apps/admin`, `apps/concierge`):** Confirm whether backend APIs remain centralized in `apps/web/app/api/*` (recommended; other apps call via shared `@we-arrange/api-client` / same-origin or configured base URL when frontend connects) to avoid duplicating Route Handlers across 5 Next.js apps.
7. **Pre-existing Tooling Blockers:** Root `eslint.config.mjs` (`@next/eslint-plugin-next` resolution) and `packages/config/tailwind.config.ts` (`tailwindcss` module resolution) fail `lint`/`typecheck` workspace-wide until fixed separately.
8. **Missing Local Keys:** `apps/web/.env.local` still needs the user's real public Supabase key (and server-only `SUPABASE_SERVICE_ROLE_KEY` for local Route Handler integration runs; unit/mocked Vitest runs will not require live secrets).

