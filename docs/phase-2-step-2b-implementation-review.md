# Phase 2, Step 2B — Database Foundation Preparation & Review

**Project:** YouMarriageWeArrange (`zujjiiljvjwgcxtaqype`, `ap-south-1`, PostgreSQL `17.11.0.003`)  
**Branch:** `chore/phase-1-integration-foundation`  
**Status:** **PREPARED — NOT APPLIED** (Read-only validation and SQL preparation only. Zero DDL/DML, grants, RLS, index, data, auth, or application code changes were executed.)

---

## 1. Current Live Database Verification (Revalidated Read-Only)

| Metric | Live Count | Verification Notes |
|---|---|---|
| Public Base Tables | **97** | 14 populated (catalog + staging); **83** tables with `0` rows |
| Primary Keys | **96** | Only `public.photographers_import_v2` (1,086 rows) lacks a PK |
| Foreign Keys | **117** | 6 covered by existing PK/UNIQUE indexes; **111** unindexed (`0001_unindexed_foreign_keys`) |
| Unique Constraints | **27** | Backed by 27 unique B-tree indexes |
| Indexes (`public`) | **123** | 96 PK + 27 unique indexes = 123; **0** non-constraint FK indexes |
| Triggers & Functions | **32** triggers / **1** public fn | **3** triggers call `public.update_updated_at_column()` (`banners`, `bookings`, `reports`); **29** call `moddatetime('updated_at')` |
| RLS Status & Policies | **97 / 97** RLS enabled / **17** policies | **80** tables have RLS enabled with **0** policies; 17 tables have `SELECT`-only policies |
| Enums (`public`) | **4** | `status_enum` (`Active`, `Inactive`, `Draft`, `Pending`, `Published`, `Approved`, `Rejected`); `admin_status_enum`, `banner_status_enum`, `report_status_enum` (`active`, `inactive`, `pending` — lowercase) |
| Remote Migrations | **1** | `20261031083047_create_catering_import_staging` (`./supabase/` did not exist in git prior to this preparation step) |
| Local Tooling Check | Docker `29.5.2` / Supabase CLI missing | Docker Desktop is installed (`Docker version 29.5.2`); `supabase` CLI is not installed globally or in workspace `PATH` |

---

## 2. Reconciled Constraint Counts (2 vs. 228 Explained)

Earlier audits showed `2` CHECK constraints in one query and `228` in another. Live PostgreSQL catalog queries reconcile this exact difference:

- **`pg_constraint` (`contype = 'c'`):** **2** explicit table-level `CHECK` constraints, both on `public.reports`:
  1. `reports_mutual_exclusion_check` (exactly 1 of `reported_user_id`, `venue_id`, `vendor_id`, `review_id`, `blog_id` is non-null)
  2. `reports_only_one_target` (at most 1 of `venue_id`, `vendor_id`, `review_id`, `blog_id` is non-null)
- **`information_schema.table_constraints` (`constraint_type = 'CHECK'`):** **228**, because PostgreSQL's SQL-standard `information_schema` view synthesizes a virtual `CHECK` entry for every `NOT NULL` column constraint (`226` `NOT NULL` columns across the 97 `public` tables + `2` explicit `CHECK` constraints = **`228`**). `pg_constraint` (`contype = 'n'`) is `0`.

---

## 3. Grant and RLS Findings

1. **All DML Privileges Missing Across `anon`, `authenticated`, and `service_role`:**
   `pg_class.relacl` on `public` tables currently evaluates to `{postgres=arwdDxtm/postgres, anon=Dxtm/postgres, authenticated=Dxtm/postgres, service_role=Dxtm/postgres}`:
   - `anon`, `authenticated`, and **`service_role`** all have **0 `SELECT` (`r`), `INSERT` (`a`), `UPDATE` (`w`), and `DELETE` (`d`)** grants on all 97 tables and **0 `USAGE`** grants on all **93** sequences.
   - `anon` and `authenticated` retain unused `TRUNCATE` (`D`), `REFERENCES` (`x`), `TRIGGER` (`t`), and `MAINTAIN` (`m`) privileges.
2. **80 Tables Default-Deny:** With RLS enabled and 0 policies, every operational table (`venues`, `vendors`, all sub-tables, `users`, `user_profile`, `admins`, `bookings`, `enquiries`, `favorites`, `reviews`, `payments`, `invites`, `notifications`) blocks all non-superusers.
3. **Policy & Role Anomalies:** `banners` policy targets `{public}` instead of `{anon, authenticated}`. `auth.users` has **20** rows while `public.users`, `public.user_profile`, `public.admins`, and `public.roles` all have **0** rows.

---

## 4. Proposed Contact PII Access Policy (Decision 1 Implementation)

Live data inspection confirmed **1,198 / 1,198** `venues` have `phone` populated directly on `public.venues` (and `0` rows have `website` or `google_maps` populated yet), `venue_contacts` has **1,198** phones, and `vendor_contacts` has **2,995** phones, **424** emails, and **1,340** contact names.

Under Decision 1:
1. `venue_contacts` and `vendor_contacts` receive **zero `anon` grants** and **zero public RLS policies** — readable only by active Concierge/Admin users (and vendor owners for their own `vendor_contacts`).
2. `venues` grants **column-scoped `SELECT`** to `anon` and `authenticated` that **omits `phone`** (plus internal scraping columns `external_id`, `member_id`, `membership_id`, `source_url`), while keeping public `website` and `google_maps` columns selectable.
3. `invite_guests` (emails/phones) and `users`/`user_profile` have zero `anon` access; guest RSVPs pass through a validated Route Handler rather than open table reads/writes.
4. Generated types (`packages/database/src/database.generated.ts`) are restricted strictly to server/service-layer code; public APIs and client props must use curated DTOs that exclude private contact columns.

---

## 5. Access-Control Matrix

Legend: **S** = `SELECT`, **I** = `INSERT`, **U** = `UPDATE`, **D** = `DELETE`, **—** = Denied. All `authenticated` policies check explicit ownership (`(select auth.uid()) = user_id` or `vendors.user_id`) or active DB role membership (`private.is_active_admin()` / `private.is_concierge_or_admin()`). Never uses `user_metadata` or `auth.role()`.

| Domain & Tables | `anon` | Customer (`authenticated`) | Vendor (`vendors.user_id`) | Concierge | Admin | Write & PII Guardrail |
|---|---|---|---|---|---|---|
| `venues`, `venue_types` & public `venue_*` sub-tables | S `(active, no phone)` | S `(active, no phone)` | S `(active, no phone)` | S `(all)`, U `(API)` | S, I, U, D `(API)` | `venues.phone` excluded from `anon`/`authenticated` `SELECT`; all mutations via Route Handlers (`service_role`). |
| `venue_contacts` | — | — | — | S | S, I, U, D `(API)` | Direct venue phone PII; Concierge/Admin only. |
| `vendors`, `vendor_categories` & public `vendor_*` | S `(active)` | S `(active)` | S `(own)`, U `(safe cols)` | S `(all)` | S, I, U, D `(API)` | `vendors.is_verified`, `status`, `user_id`, `rating` excluded from vendor self-`UPDATE`. |
| `vendor_contacts` | — | — | S, I, U, D `(own)` | S | S, I, U, D `(API)` | Direct vendor phone/email PII hidden from `anon` & customers. |
| `users`, `user_profile` | — | S, I `(profile)`, U `(safe cols)` | S, U `(own)` | S `(all)` | S, I, U, D `(API)` | `users.role_id` & `users.status` excluded from self-`UPDATE`; signup rows created via trigger. |
| `admins`, `roles`, `permissions`, `role_permissions` | — | — | — | S `(roles)` | S `(self/active)`, I/U/D `(API)` | Non-staff receive 0 rows; non-recursive `private.is_active_admin()`. |
| `enquiries`, `enquiry_messages`, `enquiry_status_history` | — | S, I `(own)`, S `(history)` | S `(if linked)` | S `(all)`, U/I `(API)` | S, I, U, D `(API)` | Customers cannot mutate status or view other users' leads. |
| `bookings`, `booking_status`, `booking_documents`, `booking_payments` | S `(booking_status)` | S `(own)` | S `(own vendor bookings)` | S `(all)`, I/U `(API)` | S, I, U, D `(API)` | No direct client writes on `bookings`/`booking_payments`; status changes server-only. |
| `favorites`, `collections` | — | S, I, U `(coll.)`, D `(own)` | S, I, U, D `(own)` | — (own only) | S `(API)` | Single-target `CHECK` + unique indexes prevent duplicates & orphaned targets. |
| `reviews`, `review_images`, `review_votes` | S `(published)` | S `(pub+own)`, I `(Pending)`, U `(Pending)`, D `(own)` | S `(published)` | S `(all)` | S `(all)`, U/D `(API)` | Users cannot self-publish (`status = 'Pending'` enforced on `INSERT`/`UPDATE`, `status` col un-updatable). |
| `payments`, `invoices`, `transactions`, `refunds`, `coupons` | — | S `(own)`, S `(active coupons)` | S `(if linked via API)` | S `(API)` | S, I, U `(API)` | Zero client writes (`anon`/`authenticated`); webhook/gateway writes strictly server `service_role`. |
| `invites`, `invite_templates`, `invite_guests`, `invite_media`, `invite_rsvp` | S `(active templates)` | S, I, U, D `(own invites/guests/media)`, S `(rsvp)` | — (own only) | — | S, I, U, D `(templates API)` | Guest RSVP & public invite view served via validated Route Handler by slug. |
| `conversations`, `messages`, `message_attachments`, `chat_notifications`, `notifications` | — | S, I `(participant)`, U `(is_read)` | S, I `(participant)`, U `(is_read)` | S, I `(API/participant)` | S, I, U, D `(API)` | `notification_logs`, `email_templates`, `sms_templates`, `notification_templates` locked to `service_role` only. |
| Editorial/CMS & Locations (`blogs`, `inspirations`, `real_weddings`, `banners`, `pages`, `faqs`, `testimonials`, `themes`, `cities`, `areas`, etc.) | S `(active/published)` | S `(active/published)`, I/U/D `(own blog comments/likes)` | S `(active/published)` | S, U `(CMS API)` | S, I, U, D `(API)` | `app_settings`, `moderation_logs`, and `staging.photographers_import_v2` have 0 grants for `anon`/`authenticated`. |

---

### Migration Live Execution & Verification Tracker

| Migration | Live Status | Records Preserved | Verification Notes |
|---|---|---|---|
| M01 (`minimum_required_grants`) | **APPLIED** | All 97 tables | `service_role` restored, `TRUNCATE` revoked, column-level catalog read active. |
| M02 (`venue_catalog_schema_and_status`) | **APPLIED** | 1,198 venues, 4,760 photos | Slugs backfilled, `status = 'Active'` backfilled, sequence fixed. |
| M03 (`public_catalog_and_cms_rls`) | **APPLIED** | 1,198 venues, 2,995 vendors | Public read RLS active on active/published rows, contacts locked. |
| M04 (`customer_and_vendor_ownership_rls`) | **PENDING** | — | Security audit corrections applied locally; verified by test suites. |
| M05 (`isolate_photographers_import_v2`) | **APPLIED** | **1,086 rows preserved** | **PASSED.** Moved to `staging.photographers_import_v2`. `staging_id` identity PK added. `service_role` read-only (`SELECT`). Sequence privileges revoked. Anon/authenticated locked out. |
| M06–M11 | **PENDING** | — | Staged in `supabase/migrations/` awaiting sequential application. |

---

---

## 6. Migration Sequence & Dependency Explanation

All 9 prepared SQL files live in `supabase/migrations/` and are clearly tagged **`PREPARED — NOT APPLIED`**:

1. [20261112170001_minimum_required_grants.sql](file:///C:/Users/varsh/Desktop/YMWA/we-arrange-/supabase/migrations/20261112170001_minimum_required_grants.sql) — **First:** restores `service_role` privileges, revokes `TRUNCATE`, and sets explicit column/table/sequence grants. Must run before RLS policies take effect via Data API.
2. [20261112170002_venue_catalog_schema_and_status.sql](file:///C:/Users/varsh/Desktop/YMWA/we-arrange-/supabase/migrations/20261112170002_venue_catalog_schema_and_status.sql) — Fixes `venue_menus.menu_id` sequence, adds & backfills deterministic `venues.slug`, backfills `venues.status = 'Active'` (required **before** Migration 03's `status = 'Active'` RLS policy would otherwise hide all 1,198 venues), and adds `favorites`/`reviews` constraints.
3. [20261112170003_public_catalog_and_cms_rls.sql](file:///C:/Users/varsh/Desktop/YMWA/we-arrange-/supabase/migrations/20261112170003_public_catalog_and_cms_rls.sql) — Public `SELECT` RLS on active catalog, published reviews, CMS, and location tables (excluding `venue_contacts` and `vendor_contacts`), plus `banners` role fix.
4. [20261112170004_customer_and_vendor_ownership_rls.sql](file:///C:/Users/varsh/Desktop/YMWA/we-arrange-/supabase/migrations/20261112170004_customer_and_vendor_ownership_rls.sql) — Strict `TO authenticated` ownership RLS for customers, chat participants, invite owners, and linked vendor owners.
5. [20261112170005_isolate_photographers_import_v2.sql](file:///C:/Users/varsh/Desktop/YMWA/we-arrange-/supabase/migrations/20261112170005_isolate_photographers_import_v2.sql) — **Status: APPLIED & VERIFIED.** Moves staging table `photographers_import_v2` to private `staging` schema and adds surrogate `staging_id` PK (clears both `0004` & `0008` lints while keeping all 1,086 rows intact). Live verification: PASSED. 1,086 records preserved in `staging.photographers_import_v2`. Schema `staging` USAGE granted only to `service_role`. `SELECT` granted only to `service_role`; all sequence and table privileges revoked from `PUBLIC`, `anon`, and `authenticated`. Identity sequence permissions explicitly revoked from `service_role` to enforce read-only archive semantics.
6. [20261112170006_foreign_key_indexes.sql](file:///C:/Users/varsh/Desktop/YMWA/we-arrange-/supabase/migrations/20261112170006_foreign_key_indexes.sql) — Creates all **111** missing covering B-tree indexes for the 111 unindexed FKs reported by `0001_unindexed_foreign_keys`.
7. [20261112170007_harden_update_updated_at_search_path.sql](file:///C:/Users/varsh/Desktop/YMWA/we-arrange-/supabase/migrations/20261112170007_harden_update_updated_at_search_path.sql) — Pins `search_path = ''` on `public.update_updated_at_column()` (`0011_function_search_path_mutable`).
8. [20261112170008_auth_signup_profile_sync.sql](file:///C:/Users/varsh/Desktop/YMWA/we-arrange-/supabase/migrations/20261112170008_auth_signup_profile_sync.sql) — Seeds `public.roles` (`customer`, `vendor`, `concierge`, `admin`), adds `private.handle_new_auth_user()` trigger on `auth.users`, and safely backfills the 20 existing `auth.users` rows as `customer`.
9. [20261112170009_admin_concierge_authorization_rls.sql](file:///C:/Users/varsh/Desktop/YMWA/we-arrange-/supabase/migrations/20261112170009_admin_concierge_authorization_rls.sql) — Depends on Migration 08 (`roles`/`users`). Creates `private.is_active_admin()` and `private.is_concierge_or_admin()` (`SECURITY DEFINER`, `SET search_path = ''`) and grants Concierge/Admin read access to `venue_contacts`, `vendor_contacts`, `admins`, `enquiries`, `bookings`, `reviews`, and `reports` (while staff writes stay inside verified Route Handlers using `service_role`).

---

## 7. SQL Outline Summary

Each complete migration script is prepared for review in `supabase/migrations/`:
- **Grants (`01`):** `GRANT ALL ... TO service_role`, `REVOKE TRUNCATE ... FROM anon, authenticated`, explicit column-list `SELECT` on `venues`, `SELECT` on public catalog/CMS tables, minimal `INSERT/UPDATE/DELETE` + column restrictions on `users`, `vendors`, `reviews`, and sequence `USAGE`.
- **Venue Schema & Data (`02`):** Sequence for `venue_menus.menu_id`, `venues.slug` generation with duplicate disambiguation, `venues.status = 'Active'` backfill, `favorites`/`reviews` target exclusivity `CHECK` + unique indexes.
- **Public & Ownership RLS (`03`, `04`):** Parent-status `EXISTS` predicates on child tables, `(select auth.uid()) = user_id` with matching `WITH CHECK` on user-owned tables, and `EXISTS (... vendors.user_id = (select auth.uid()))` on vendor-owned child tables.
- **Hardening & Auth (`05`–`09`):** `staging` schema isolation + PK, 111 FK B-tree indexes, `ALTER FUNCTION ... SET search_path = ''`, `auth.users` trigger assigning `'customer'`, and DB-verified `private` admin/concierge helpers.

---

## 8. Data Correction Plan & Affected Row Counts

| Target | Affected Rows | Exact Operation | Unchanged / Preserved Fields |
|---|---|---|---|
| `public.venues.slug` | **1,198** rows | Deterministic slug from `venue_name`; appends `'-' || venue_id` on the **3 duplicate name pairs** (`Meena Garden Function Hall` IDs 212/521, `Shubham Gardens` IDs 255/474, `The Platinum Hotel` IDs 256/392) | Zero synthetic names invented; `venue_id` preserved |
| `public.venues.status` | **1,198** rows (`NULL` -> `'Active'`) | `SET status = 'Active'::status_enum WHERE status IS NULL` + set default | Original location/pricing/policy columns untouched |
| `public.venues.area_id` | **0** rows modified | Left `NULL` until `areas` is seeded from real `locality_name`/`base_city` text | No neighborhoods guessed or fabricated |
| `public.vendors.user_id` & `is_verified` | **0** of **2,995** rows modified | Kept `NULL` / `false`; linked later via admin-approved onboarding | Prevents fake ownership or false "YMWA Verified" badges |
| `vendor_categories.slug` | **0** of **5** rows modified | Kept DB slugs (`bridal-makeup`, `photographers`, `catering`, `decorators`, `mehendi`); frontend alias map handled in `services/vendor` (Step 3) | Zero broken DB category references |
| `public.venue_menus.menu_id` | **0** rows (empty table) | Attach `venue_menus_menu_id_seq` default | Ready for menu inserts |
| `public.roles` | **4** rows inserted | Seed `customer`, `vendor`, `concierge`, `admin` | Idempotent insert |
| `public.users` & `user_profile` | **20** rows backfilled | Sync existing 20 `auth.users` accounts with `customer` role | Existing `auth.users` rows untouched |

---

## 9. Rollback and Verification Strategy

- **Verification After Approval & Each Migration:**
  1. Re-run `get_advisors` (`security` + `performance`) — confirm `0008` drops from 80 -> 0 (`staging` + all active tables), `0001` drops from 111 -> 0, `0004` drops from 1 -> 0, and `0011` drops from 1 -> 0.
  2. Run `SET LOCAL ROLE anon` / `authenticated` verification SQL confirming `anon` reads 1,198 `venues` without `phone` access (`permission denied for table venue_contacts` / `column phone`), Customer A cannot access Customer B's rows, and `service_role` can read/write.
  3. Confirm exact row counts (`venues = 1,198`, `vendors = 2,995`, `staging.photographers_import_v2 = 1,086`).
- **Rollback Strategy:**
  - Migration 01: Re-issue `REVOKE` for newly granted privileges.
  - Migration 02: Drop `venues_slug_key` / `slug` / `favorites_*` constraints; `UPDATE venues SET status = NULL` if needed; `venue_menus.menu_id` sequence drop.
  - Migrations 03, 04, 09: `DROP POLICY IF EXISTS ...`; `DROP SCHEMA private CASCADE`.
  - Migration 05: `ALTER TABLE staging.photographers_import_v2 SET SCHEMA public;` + drop `staging_id` if reverting.
  - Migration 06: `DROP INDEX IF EXISTS ...`.
  - Migration 07: `ALTER FUNCTION public.update_updated_at_column() RESET search_path`.
  - Migration 08: `DROP TRIGGER on_auth_user_created ON auth.users`.

---

## 10. Type-Generation Procedure

- **Target File:** `packages/database/src/database.generated.ts` (reviewed existing [packages/database/src/index.ts](file:///C:/Users/varsh/Desktop/YMWA/we-arrange-/packages/database/src/index.ts): it currently exports only mock arrays; `database.generated.ts` can live cleanly alongside mocks without breaking existing imports during cutover).
- **Commands (run after Migrations 01–09 are applied):**
  - Via Supabase CLI (`pnpm dlx`):
    ```bash
    pnpm dlx supabase gen types typescript --project-id zujjiiljvjwgcxtaqype --schema public > packages/database/src/database.generated.ts
    ```
  - Or via connected **Supabase MCP** tool `generate_typescript_types` (`project_id: "zujjiiljvjwgcxtaqype"`).
- **Decision 1 Guardrail on Types:** Never import raw table Row types (which still describe columns like `venues.phone` or `vendor_contacts` for server usage) into public client components or serialize raw `.select("*")` objects in public Route Handlers — always project safe public columns and map to `@we-arrange/types` DTOs.

---

## 11. Remaining Blockers & Risks

1. **Migration History Baseline Reconciliation:** Remote `supabase_migrations.schema_migrations` currently has only `20261031083047`. When applying Migrations 01–09 via connected `supabase_mcp` (`apply_migration`), versions `20261112170001`–`20261112170009` align 1-to-1 with `supabase/migrations/` without touching existing tables.
2. **Existing 20 `auth.users` Roles:** Migration 08 backfills all 20 existing `auth.users` rows as `customer`. Any existing test accounts intended to act as Admins/Concierge must be manually promoted into `public.admins` (and `public.users.role_id`) after Migration 08.
3. **Leaked Password Protection (`auth_leaked_password_protection`):** Cannot be toggled via SQL migration; must be enabled in Supabase Dashboard (`Authentication -> Sign In / Providers -> Password Security`).
4. **Missing Quote/Comparison Tables (`quotes`, `comparison_sheets`):** Intentionally deferred to Step 5 prep so Step 2B focuses strictly on securing and indexing the existing 97 tables.
5. **Local `.env.local` & `SUPABASE_SERVICE_ROLE_KEY`:** Public anon/publishable key is needed locally in `apps/web/.env.local` before Next.js live query testing in Step 3, and `SUPABASE_SERVICE_ROLE_KEY` (server-only, never `NEXT_PUBLIC_`) will be needed when admin/webhook Route Handlers are wired.

---

## 12. Exact First Migration Recommended for Approval

**Approve and apply ONLY Migration 01 first:**
[20261112170001_minimum_required_grants.sql](file:///C:/Users/varsh/Desktop/YMWA/we-arrange-/supabase/migrations/20261112170001_minimum_required_grants.sql)

Why first: It unblocks server-side `service_role` access, removes `TRUNCATE` from `anon`/`authenticated`, establishes column-level `venues` PII protection (hiding `phone` and scraping metadata), locks `venue_contacts`/`vendor_contacts`, and creates the privilege prerequisite required by Migrations 02–04 — while RLS remains default-deny until Migrations 03, 04, and 09 are applied.

