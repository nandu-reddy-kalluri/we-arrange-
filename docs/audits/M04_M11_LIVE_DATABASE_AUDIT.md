# YMWA — Database Migration Audit (M04–M11)

- **Project:** YouMarriageWeArrange (YMWA)
- **Supabase Project Reference:** `zujjiiljvjwgcxtaqype` (`ap-south-1`, PostgreSQL 17)
- **Repository:** `C:\Users\varsh\Desktop\YMWA\we-arrange-`
- **Audit Mode:** Strictly read-only (zero DDL/DML executed, zero source/SQL/Git modifications outside this report)
- **Live Verification Status:** **PARTIALLY BLOCKED** — `supabase_mcp` lost authentication in the current session (`not signed in to MCP server supabase_mcp with the current account`), preventing live post-M05 queries and live `get_advisors` re-runs. All claims below strictly distinguish:
  1. **Verified Live Snapshot (Captured Pre-Audit / M01–M05 Window)**
  2. **Verified Canonical SQL & Backend Code Analysis (Current Repository)**
  3. **Pending Live DB Verification (Blocked by `supabase_mcp` Auth)**

---

## A. Executive Summary

Across canonical migrations **M01–M11** (`supabase/migrations/20261112170001` through `20261112180011`), the core RLS isolation, staging table isolation (`staging.photographers_import_v2`), FK index coverage (**111/111** baseline unindexed FKs), `update_updated_at_column()` `search_path` hardening, auth signup profile sync, and quote/comparison/booking schema extensions are structurally sound in the canonical SQL and backend service layer.

However, this audit identified **4 actionable security, redundancy, integrity, and operational findings** plus **1 critical live-verification block**:

| ID | Severity | Area | Summary | Future Migration? | Verification Basis |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **F-01** | **HIGH** | RBAC / Auth / M09 | **Inactive-admin authorization bypass:** Deactivating a user in `public.admins` (`status = 'inactive'`) without clearing `public.users.role_id` leaves `role = 'admin'` and `isConciergeOrAdmin = true`, bypassing all **37** staff/admin/concierge API route files (including all **16** `requireActiveAdmin` route files), `middleware.ts`, specialist assignment, and **13** M09/M10 RLS policies via `private.is_concierge_or_admin()`. | Optional (SQL tightening in `private.is_concierge_or_admin()`) + **Required app fix** | Canonical SQL + Backend code |
| **F-02** | **MEDIUM** | M11 Index | **Redundant unique index on `public.transactions`:** M11 creates `idx_transactions_reference_unique` on `(transaction_reference) WHERE transaction_reference IS NOT NULL`, duplicating the pre-existing full unique constraint/index `transactions_transaction_reference_unique` (`NULLS DISTINCT`). | **Yes** (`DROP INDEX IF EXISTS`) | Baseline live `pg_indexes`/`table_constraints` + M11 SQL |
| **F-03** | **MEDIUM** | M08 / M09 Ops | **Operational admin bootstrap & service-role blast radius:** Baseline `public.admins` had `0` rows and M08 backfills existing `auth.users` as `'customer'`. Because all admin/concierge Next.js routes query Supabase using `createServiceRoleClient()` (bypassing RLS), **F-01** cannot be mitigated by RLS alone on `reviews`/`reports`/`admins`. | No (Ops/Seed + fix F-01) | Baseline state + Canonical M08/M09 SQL + Backend code |
| **F-04** | **LOW** | M10 Integrity | **`comparison_sheets.quote_ids` array lacks DB-level FK enforcement:** Stored as `bigint[] NOT NULL DEFAULT '{}'`. Application validation checks quote ownership on creation and tolerates missing rows on read (`.in("quote_id", ...)`), but PostgreSQL cannot enforce referential integrity or cascade deletes on array elements. | Optional (`comparison_sheet_items` join table post-MVP) | M10 SQL + `quoteComparisonService.ts` |
| **F-05** | **LOW / INFO** | M04 History | **Duplicate M04 migration history timestamps (`20261113150348`, `20261113150428`):** M04 itself is fully idempotent (`CREATE OR REPLACE`, `DROP POLICY IF EXISTS`), so re-running M04 creates zero duplicate objects. **Critical check pending live DB:** if the second M04 run executed *after* M10 (unlikely given `150348`/`150428` timestamps vs M10, but unverified live), it would revert 2 M10 policies (`"Customers create own enquiries"`, `"Customers manage own favorites"`). | Unlikely (Verify live timestamps/policies) | M04/M10 SQL (`pg_policies` live check blocked) |
| **F-06** | **LOW** | Auth Advisor | **`auth_leaked_password_protection` WARN:** Captured baseline advisor reported HaveIBeenPwned leaked password protection disabled in Supabase Auth settings. Not controllable via SQL migrations. | No (Dashboard Auth setting) | Baseline Security Advisor (`steps/399`) |
| **F-07** | **INFO** | Security Advisor | **Remaining `rls_enabled_no_policy` tables:** Reconciles cleanly from **80** baseline tables down to **9** intentionally server-only RLS tables (`app_settings`, `coupons`, `email_templates`, `moderation_logs`, `notification_logs`, `notification_templates`, `permissions`, `role_permissions`, `sms_templates`). | No (Intentional private tables) | Baseline Security Advisor + M03–M10 SQL |

**Live Verification Blocker (`supabase_mcp`):** Live checks against `supabase_migrations.schema_migrations`, live `pg_policies`, live `pg_indexes`, `pg_proc`, `pg_trigger`, `public.admins` row count, and post-M11 `get_advisors` could not be executed in this session because `supabase_mcp` rejected tool calls with:
`not signed in to MCP server supabase_mcp with the current account`.

---

## B. Migration Matrix (M04–M11)

Baseline canonical checksums verified locally in `supabase/migrations/`:

| Migration | Canonical File (`supabase/migrations/`) | Lines | Verified SHA-256 | Canonical Scope Summary | Live Status (`zujjiiljvjwgcxtaqype`) |
| :--- | :--- | ---: | :--- | :--- | :--- |
| **M01** *(ref)* | `20261112170001_minimum_required_grants.sql` | 545 | `83e5f5776650c3a67f4d7291c6d49f1c09e4bd994021051200f884aa66e6803c` | Least-privilege `service_role` & `anon`/`authenticated` column/table grants | Applied in earlier session |
| **M02** *(ref)* | `20261112170002_venue_catalog_schema_and_status.sql` | 143 | `119cd6159851bfb834fa80e5cba69016f75d4282edfa9b9676f942f54f291a23` | `venues.slug`, status backfill, `favorites`/`reviews` single-target checks, 4 partial UIDXs | Applied in earlier session |
| **M03** *(ref)* | `20261112170003_public_catalog_and_cms_rls.sql` | 291 | `17073c211eeb61f72a7f3da623e7e457e5c6ae1013b50abcbb6a211dfb0a9f33` | 51 public read-only `SELECT` policies on 51 catalog/CMS tables (`57` total live policies verified in `steps/2403`) | Verified live in earlier session (`steps/2403`) |
| **M04** | `20261112170004_customer_and_vendor_ownership_rls.sql` | 622 | `d190f6e185b77fd33ab3eb7bd37b65523e14c245e4ccd8712ee597b381b917e6` | `private` schema; 3 `SECURITY DEFINER` ownership helpers; column-scoped `users` SELECT; `REVOKE UPDATE (status)` on `reviews`; `75` `DROP POLICY IF EXISTS` + `68` `CREATE POLICY` across **42** unique tables | Reportedly applied twice (`20261113150348`, `20261113150428`) — **live re-check blocked by MCP auth** |
| **M05** | `20261112170005_isolate_photographers_import_v2.sql` | 45 | `9a13f7644ac8199f28e3434a93ef4ca8c93c049e6b604812770e21f55e8e25f1` | Creates `staging` schema (`USAGE` to `service_role` only); moves `photographers_import_v2` out of `public`; adds identity PK `photographers_import_v2_pkey`; restricts grants to `service_role` `SELECT` | Applied in earlier session — **live re-check blocked by MCP auth** |
| **M06** | `20261112170006_foreign_key_indexes.sql` | 140 | `150530b354b79730a2fbffe69080e270b252a77a990cddb3187caab69e8f7abc` | `111` `CREATE INDEX IF NOT EXISTS` B-tree indexes covering **111/111** baseline unindexed FKs | Canonical SQL verified against baseline live schema — **live `pg_indexes` blocked** |
| **M07** | `20261112170007_harden_update_updated_at_search_path.sql` | 16 | `f098e5013a1c0cce2f2d2f815682b9ad8325c65071cc14b4ff3a1775ce8e9f41` | `ALTER FUNCTION public.update_updated_at_column() SET search_path = '';` | Canonical SQL verified — **live `pg_proc` blocked** |
| **M08** | `20261112170008_auth_signup_profile_sync.sql` | 107 | `c3269d9a23d5d726fc48e576f3ff0586065a5b7c6824f586b0f0bb2601ce8775` | Seeds 4 roles (`customer`, `vendor`, `concierge`, `admin`); creates `private.handle_new_auth_user()` + `on_auth_user_created` trigger on `auth.users`; backfills `public.users` + `public.user_profile` | Canonical SQL verified — **live trigger/rows blocked** |
| **M09** | `20261112170009_admin_concierge_authorization_rls.sql` | 147 | `70999dcd6ab0ca873092a2cdb0b50caf30a385d2aff5a4232648aacc6b23a40d` | Creates `private.is_active_admin()` and `private.is_concierge_or_admin()`; drops/creates `15` RLS policies across **14** tables | Canonical SQL verified (**F-01**, **F-03**) — **live check blocked** |
| **M10** | `20261112170010_quotes_comparison_sheets_and_links.sql` | 172 | `12311bcdc7b14ed858101ef9a4cafd7dfd5bdc4690817379404bd946dffba3e6` | Adds `enquiries.assigned_specialist_id` & `favorites.collection_id`; creates `public.quotes` & `public.comparison_sheets` (`set_updated_at` triggers, 6 new FK indexes + 2 column indexes); `6` policies across `4` tables (replaces `2` M04 policies) | Canonical SQL verified (**F-04**, **F-05**) — **live check blocked** |
| **M11** | `20261112180011_booking_links_site_visits_and_preferences.sql` | 74 | `a696d8d5bb6e6393f90d30a78cf155febfdbd317fee014fb0bdcf37682d45c5d` | Adds `user_profile.preferences`, `enquiries.site_visit_*` + `enquiries_site_visit_status_check`, `bookings.enquiry_id`/`quote_id` + 3 indexes, `payments.idempotency_key` + unique index, `idx_transactions_reference_unique`, seeds 6 `booking_status` rows | Canonical SQL verified (**F-02**) — **live check blocked** |

---

## C. Detailed Findings

### F-01 `[HIGH]` — Inactive-Admin Authorization Bypass Across RBAC, Middleware, Services, Routes & M09/M10 RLS

- **Migrations & Files Affected:**
  - `supabase/migrations/20261112170009_admin_concierge_authorization_rls.sql` (`private.is_concierge_or_admin()`)
  - `supabase/migrations/20261112170010_quotes_comparison_sheets_and_links.sql` (uses `private.is_concierge_or_admin()` on `quotes` and `comparison_sheets`)
  - `apps/web/services/auth/rbac.ts` (lines 56–157)
  - `apps/web/middleware.ts` (lines 90–119)
  - `apps/web/services/admin/adminPortalService.ts` (`assignOrUpdateAdmin()`, lines 190–206)
  - `services/booking/src/enquiryService.ts` (`assignEnquirySpecialist()`, lines 190–214)
  - `apps/web/services/auth/authService.ts` (staff auth helpers)
  - All **37** staff/admin/concierge API route files (enumerated in Section E)

- **Expected Behavior:**
  Deactivating an administrator in `public.admins` (`status = 'inactive'` or `'suspended'`) must immediately revoke **both** Admin and Concierge/Staff portal, API, and RLS privileges unless that user is explicitly re-assigned to an active non-admin role.

- **Actual Behavior (Proven in Code & Canonical SQL):**
  1. **Admin deactivation leaves `public.users.role_id` untouched:**
     `assignOrUpdateAdmin()` (`apps/web/services/admin/adminPortalService.ts:190-206`) updates `public.admins` (`status: input.status`) without updating `public.users.role_id`. If the user originally held the `'admin'` role in `public.users`, their `role_id` remains `'admin'` after `admins.status` becomes `'inactive'`.
  2. **App RBAC falls back to `public.users.role_id` for both `role` and `isConciergeOrAdmin`:**
     In `apps/web/services/auth/rbac.ts`:
     ```ts
     let resolvedRole: UserRole = "customer";
     if (dbUser?.role_id) {
       ...
       if (roleRow && roleRow.status !== "Inactive") {
         resolvedRole = normalizeUserRole(roleRow.role_name);
       }
     }
     ...
     const isActiveAdmin = Boolean(adminRow && adminRow.status === "active");
     if (isActiveAdmin) {
       resolvedRole = "admin";
     }
     ...
     isActiveAdmin,
     isConciergeOrAdmin: isActiveAdmin || resolvedRole === "admin" || resolvedRole === "concierge",
     ```
     And `requireActiveAdmin()` checks:
     ```ts
     if (!ctx.isActiveAdmin && ctx.role !== "admin") {
       throw new AppError("FORBIDDEN", 403, "Active Administrator privileges are required.");
     }
     ```
     Because `resolvedRole` evaluates to `"admin"`, **both** `!ctx.isActiveAdmin && ctx.role !== "admin"` (`false`) **and** `ctx.isConciergeOrAdmin` (`true`) fail open! An inactive admin retains full access to every `requireActiveAdmin` endpoint (**16** route files) and every `requireConciergeOrAdmin` / staff-auth endpoint (**22** route handlers / **21** additional route files; **37 unique route files total**).
  3. **Edge Middleware has the identical fallback:**
     `apps/web/middleware.ts:90-119` checks `admins` with `.eq("status", "active")`; when no active row is returned, lines 101–119 fall back to querying `users` (`.eq("status", "Active")`) joined with `roles` and allow entry into `/concierge-portal/*` whenever `roleName === "admin" || roleName === "concierge"`.
  4. **Specialist assignment allows targeting inactive admins:**
     `assignEnquirySpecialist()` (`services/booking/src/enquiryService.ts:190-214`) validates assignee eligibility via `users.role_id` (`admin`/`concierge`), permitting assignment to an inactive admin whose `users.role_id` is still `'admin'`.
  5. **Database RLS `private.is_concierge_or_admin()` also has an `'admin'` role fallback:**
     In M09 (`20261112170009_admin_concierge_authorization_rls.sql:47-55`):
     ```sql
     private.is_active_admin()
     OR EXISTS (
       SELECT 1
       FROM public.users u
       JOIN public.roles r ON r.role_id = u.role_id
       WHERE u.user_id = (select auth.uid())
         AND u.status = 'Active'::public.status_enum
         AND lower(r.role_name) IN ('admin', 'concierge')
     )
     ```
     While `private.is_active_admin()` strictly checks `a.status = 'active'` on `public.admins` (protecting `admins`, `reviews`, `reports`), `private.is_concierge_or_admin()` admits any active `public.users` row with `r.role_name = 'admin'` even if their `public.admins` record is `inactive` or `suspended` (covering **13 tables**: `roles`, `venue_contacts`, `vendor_contacts`, `enquiries`, `enquiry_messages`, `enquiry_status_history`, `bookings`, `booking_documents`, `booking_payments`, `users`, `user_profile` in M09, plus `quotes` and `comparison_sheets` in M10). Note also that `public.admins` policy `"Admins can view own admin record"` lets any authenticated user view their own `admins` row (by design), while `is_concierge_or_admin()` on `users` and `user_profile` lets an inactive admin view all user accounts/profiles.

- **Remediation:**
  1. **App/RBAC (Critical):**
     - In `rbac.ts`: remove `|| ctx.role !== "admin"` from `requireActiveAdmin()` (`if (!ctx.isActiveAdmin)`) and ensure a user with an `admins` row whose `status !== "active"` cannot inherit `admin` or `concierge` privilege from `users.role_id` (unless explicitly handled, treat `admins` non-active record as revoking admin, and remove `"admin"` from the non-`admins` fallback or check `!(adminRow && adminRow.status !== "active")` consistently in `rbac.ts`, `middleware.ts`, `authService.ts`, and `assignEnquirySpecialist()`).
     - In `adminPortalService.ts`: when `assignOrUpdateAdmin()` sets `status` to inactive/suspended, also demote `public.users.role_id` to `customer` (or sync role transitions atomically).
  2. **Database (M12 hardening):**
     - Tighten `private.is_concierge_or_admin()` so the `roles` fallback either only checks `'concierge'` (excluding `'admin'`, forcing admins through `private.is_active_admin()`) or explicitly excludes users who have a non-active row in `public.admins` (`AND NOT EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = u.user_id AND a.status <> 'active'::public.admin_status_enum)`).
- **Future Migration Required?** **Optional/Recommended (SQL tightening)** + **Mandatory Application Fix**.

---

### F-02 `[MEDIUM]` — Redundant Unique Index in M11 (`idx_transactions_reference_unique`)

- **Migration & Object:** `20261112180011_booking_links_site_visits_and_preferences.sql` (lines 54–56) on `public.transactions(transaction_reference)`
- **Expected Behavior:** Only non-redundant indexes should exist on `public.transactions`.
- **Actual Behavior (Verified Against Baseline Live Schema Snapshot):**
  - Baseline `table_constraints` (`steps/426`) and `pg_indexes` (`steps/425`) already contain constraint/index **`transactions_transaction_reference_unique`**:
    - Constraint: `transactions_transaction_reference_unique` (`UNIQUE`, column `transaction_reference`)
    - Index: `CREATE UNIQUE INDEX transactions_transaction_reference_unique ON public.transactions USING btree (transaction_reference)`
  - Note: There is no column named `reference` on `public.transactions` (`steps/884` confirmed `transaction_reference: text`, nullable).
  - M11 executes:
    ```sql
    CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_reference_unique
      ON public.transactions (transaction_reference)
      WHERE transaction_reference IS NOT NULL;
    ```
  - Because PostgreSQL standard `UNIQUE` constraints treat `NULL` values as distinct (`NULLS DISTINCT`), `transactions_transaction_reference_unique` already enforces the exact same uniqueness on non-null `transaction_reference` values. `idx_transactions_reference_unique` adds extra write/VACUUM overhead with zero additional uniqueness guarantee.
- **Backend Compatibility:** `processVerifiedPaymentWebhook()` (`services/booking/src/bookingPaymentService.ts:371-424`) queries `.eq("transaction_reference", event.transactionReference)` and does not reference the index name directly; dropping `idx_transactions_reference_unique` has zero application impact.
- **Remediation:** Schedule a cleanup migration dropping the redundant index:
  ```sql
  DROP INDEX IF EXISTS public.idx_transactions_reference_unique;
  ```
- **Future Migration Required?** **Yes**.

---

### F-03 `[MEDIUM]` — Operational Admin Bootstrap & Service-Role RLS Bypass Surface

- **Migrations & Code Affected:** M08 (`20261112170008`), M09 (`20261112170009`), Next.js API routes (`apps/web/app/api/**`)
- **Expected Behavior:** Active production admins exist in `public.admins` (`status = 'active'`), and defense-in-depth protections hold at both API and database layers.
- **Actual Behavior:**
  - M08 seeds the 4 canonical roles (`customer`, `vendor`, `concierge`, `admin`) and backfills existing `auth.users` into `public.users` with role `'customer'`, leaving `public.admins` untouched (`0` rows at baseline; current live count **unverified** due to `supabase_mcp` auth block).
  - M09's `private.is_active_admin()` protects `public.admins`, `public.reviews`, and `public.reports` strictly in RLS. However, Next.js API route services execute with `createServiceRoleClient()` (which bypasses PostgreSQL RLS entirely). Consequently, while RLS is strict on `reviews`/`reports`/`admins`, **API routes such as `admin/reviews/[id]/moderate`, `admin/reports/[id]`, and `admin/admins` remain reachable by inactive admins due to F-01**.
- **Remediation:**
  1. Verify live `public.admins` active records (`SELECT admin_id, user_id, role_level, status FROM public.admins;`) once MCP reconnects and seed authorized active admin accounts if `0` exist.
  2. Fix **F-01** in application RBAC before go-live because service-role API calls bypass RLS.
- **Future Migration Required?** No (operational seed + code fix in **F-01**).

---

### F-04 `[LOW]` — `comparison_sheets.quote_ids` Array Referential Integrity Limitation

- **Migration & File Affected:** `20261112170010_quotes_comparison_sheets_and_links.sql`, `services/booking/src/quoteComparisonService.ts` (lines 192–209, 300–306)
- **Expected Behavior:** Comparison sheets reference valid quotes belonging to the same enquiry, without crashing reads if a quote is removed.
- **Actual Behavior:**
  - `comparison_sheets.quote_ids` is typed as `bigint[] NOT NULL DEFAULT '{}'` because PostgreSQL does not support per-element foreign keys on arrays.
  - `createComparisonSheet()` (`quoteComparisonService.ts:192-209`) validates that provided `quoteIds` exist in `public.quotes` and match `enquiryId` before writing.
  - `getComparisonSheetDetail()` (`quoteComparisonService.ts:300-306`) fetches quotes using `.in("quote_id", sheet.quote_ids)` rather than strict 1:1 count assertions on read, so deleting a quote leaves a stale ID in `quote_ids` rather than crashing the endpoint.
- **Remediation:** Acceptable for MVP; if quote deletion/archival workflows expand post-MVP, normalize into a `comparison_sheet_quotes (sheet_id, quote_id, sort_order)` join table with cascading foreign keys.
- **Future Migration Required?** Not required for MVP.

---

### F-05 `[LOW / INFO]` — Duplicate M04 Migration History Entries (`20261113150348`, `20261113150428`)

- **Migration:** `20261112170004_customer_and_vendor_ownership_rls.sql`
- **Canonical Verification:**
  - Every DDL statement in M04 is idempotent:
    - `CREATE SCHEMA IF NOT EXISTS private;`
    - `CREATE OR REPLACE FUNCTION private.is_vendor_owner(...)`, `private.is_review_owner(...)`, `private.is_pending_review_owner(...)`
    - Idempotent `REVOKE`/`GRANT` statements
    - `75` `DROP POLICY IF EXISTS` statements covering all `7` legacy draft policy names and all `68` canonical `CREATE POLICY` rules across `42` unique tables
  - Re-executing M04 twice cannot produce duplicate policies, functions, or triggers.
- **Ordering Overlap with M10 Requiring Live Confirmation:**
  - M10 explicitly replaces **2** M04 policies using the exact same policy names (`DROP POLICY IF EXISTS` + `CREATE POLICY`):
    1. `"Customers create own enquiries"` on `public.enquiries`
    2. `"Customers manage own favorites"` on `public.favorites`
  - If both M04 executions occurred *before* M10 (expected given earlier `150348`/`150428` timestamps vs later M10), M10 definitions won cleanly. Live `supabase_migrations.schema_migrations` order and `pg_policies` definitions on `enquiries` and `favorites` remain **unverified** until `supabase_mcp` is signed back in.
- **Remediation:** Verify exact `schema_migrations` version ordering and `pg_policies` definitions for `enquiries` and `favorites` using the SQL in Section G.
- **Future Migration Required?** Only if live check reveals M04 ran *after* M10 (in which case re-apply M10's 2 policy replacements) — no change needed solely for M04 idempotency.

---

### F-06 `[LOW]` & F-07 `[INFO]` — Security & Performance Advisors Verification

Baseline advisor snapshots (`steps/399` and `steps/400`, observed `2026-11-12T10:32:21Z`):
- **Security baseline (`steps/399`):**
  - `INFO: rls_enabled_no_policy` = **80**
  - `WARN: function_search_path_mutable` = **1** (`public.update_updated_at_column`)
  - `WARN: auth_leaked_password_protection` = **1** (`Auth`)
- **Performance baseline (`steps/400`):**
  - `INFO: unindexed_foreign_keys` = **111**
  - `INFO: no_primary_key` = **1** (`public.photographers_import_v2`)

Mathematical progression from canonical SQL (post-M11 `get_advisors` live re-run blocked by `supabase_mcp` auth):
- **`no_primary_key` (`1 -> 0`):** Resolved by M05 adding `staging_id` identity PK `photographers_import_v2_pkey` and moving the table to `staging`.
- **`unindexed_foreign_keys` (`111 -> 0` statically):** Resolved by M06 creating **111** B-tree indexes covering **111/111** baseline unindexed FKs (`6` pre-covered FKs excluded; **0** redundant M06 indexes against `123` baseline `pg_indexes` rows). New FKs in M10 (`assigned_specialist_id`, `collection_id`, `quotes.*`, `comparison_sheets.*`) and M11 (`bookings.enquiry_id`, `bookings.quote_id`) all include explicit `CREATE INDEX` statements.
- **`function_search_path_mutable` (`1 -> 0` statically):** Resolved by M07 (`ALTER FUNCTION public.update_updated_at_column() SET search_path = '';`). New functions in M04 (`3`), M08 (`1`), and M09 (`2`) all define `SECURITY DEFINER SET search_path = ''`.
- **`rls_enabled_no_policy` (`80 -> 9` statically):**
  - Baseline: **80** policy-less RLS tables in `public`
  - Minus **M03** (`51` unique tables in M03; **40** newly covered from the 80) = **40** remaining
  - Minus **M05** (`public.photographers_import_v2` moved to `staging`) = **39** remaining in `public`
  - Minus **M04** (`42` unique tables receive `68` policies; **27** newly covered, `15` already had M03 policies) = **12** remaining
  - Minus **M09** (`14` unique tables receive `15` policies; **3** newly covered: `admins`, `roles`, `venue_contacts`; `11` already had M03/M04 policies) = **9** remaining
  - Plus **M10** (`quotes`, `comparison_sheets` — both immediately receive `2` policies each) = **9** remaining:
    1. `public.app_settings`
    2. `public.coupons`
    3. `public.email_templates`
    4. `public.moderation_logs`
    5. `public.notification_logs`
    6. `public.notification_templates`
    7. `public.permissions`
    8. `public.role_permissions`
    9. `public.sms_templates`
  These **9** tables are intentionally server-only (`service_role` access only).
- **`auth_leaked_password_protection` (`WARN`, F-06):** Expected to remain `WARN` until enabled in Supabase Dashboard -> Authentication -> Providers/Settings.

---

## D. Duplicate & Redundancy Report

1. **Duplicate M04 History (`20261113150348`, `20261113150428`):** Safe w.r.t. policy/function duplication due to full M04 idempotency (`75` `DROP POLICY IF EXISTS` before `68` `CREATE POLICY`, `CREATE OR REPLACE FUNCTION`), pending live timestamp ordering verification against M10 (`enquiries` & `favorites` policies).
2. **Redundant M11 Index (`F-02`):** `idx_transactions_reference_unique` duplicates baseline `transactions_transaction_reference_unique` on `public.transactions(transaction_reference)`.
3. **M06 Indexes:** `111` `CREATE INDEX IF NOT EXISTS` statements verified against `123` baseline `pg_indexes` rows and `111` baseline unindexed FK advisor findings -> **0 redundant M06 indexes**, **111/111** coverage. (Live `pg_indexes` confirmation pending MCP reconnect.)
4. **Cross-Migration Policy Name Overlaps:**
   - **M09 vs M04:** `0` policy name overlaps (`15` distinct new staff/admin policies).
   - **M10 vs M04:** `2` intentional policy replacements (`"Customers create own enquiries"` on `enquiries` and `"Customers manage own favorites"` on `favorites`), each preceded by `DROP POLICY IF EXISTS` in M10.
5. **`set_updated_at` Triggers (`M07` vs `M10`):** Canonical baseline used `public.update_updated_at_column()` (hardened in M07); M10 adds `set_updated_at` triggers on `public.quotes` and `public.comparison_sheets`. Live `pg_trigger` check pending MCP reconnect to verify exact trigger function target (`extensions.moddatetime` vs `public.update_updated_at_column`).

---

## E. Backend & Frontend Compatibility Analysis

### E.1 Reconciled Staff / Admin / Concierge API Route Inventory (**37 Unique Route Files / 106 Total API Routes**)

A full scan of all **106** Next.js API route files under `apps/web/app/api/` resolved an earlier reporting discrepancy (the prior draft cited 20 concierge/staff routes while listing 21 and omitted `admin/auth/login` while double-counting `admin/venues/[id]`). The verified inventory contains **37 unique staff/admin/concierge route files** (**38** guard call sites across **106** total API routes):

- **15 `requireActiveAdmin`-only Route Files:**
  1. `apps/web/app/api/admin/admins/route.ts` (`GET, POST`)
  2. `apps/web/app/api/admin/enquiries/[id]/assign/route.ts` (`PATCH`)
  3. `apps/web/app/api/admin/me/route.ts` (`GET`)
  4. `apps/web/app/api/admin/moderation-logs/route.ts` (`GET`)
  5. `apps/web/app/api/admin/notification-templates/route.ts` (`GET, POST`)
  6. `apps/web/app/api/admin/payments/[id]/refund/route.ts` (`POST`)
  7. `apps/web/app/api/admin/reports/[id]/route.ts` (`PATCH`)
  8. `apps/web/app/api/admin/reviews/[id]/moderate/route.ts` (`PATCH`)
  9. `apps/web/app/api/admin/roles/route.ts` (`GET, POST`)
  10. `apps/web/app/api/admin/settings/route.ts` (`GET, PATCH`)
  11. `apps/web/app/api/admin/users/[id]/route.ts` (`PATCH`)
  12. `apps/web/app/api/admin/users/route.ts` (`GET`)
  13. `apps/web/app/api/admin/vendors/[id]/link-user/route.ts` (`POST`)
  14. `apps/web/app/api/admin/vendors/[id]/verify/route.ts` (`PATCH`)
  15. `apps/web/app/api/analytics/admin/route.ts` (`GET`)
- **1 Mixed Route File (uses BOTH `requireConciergeOrAdmin` and `requireActiveAdmin`):**
  16. `apps/web/app/api/admin/venues/[id]/route.ts` (`PATCH` -> `requireConciergeOrAdmin`; `DELETE` -> `requireActiveAdmin`)
- **21 Concierge / Staff-Only Route Files (`17` `requireConciergeOrAdmin` + `4` staff auth routes):**
  17. `apps/web/app/api/admin/auth/change-password/route.ts` (`POST` — `changeAuthenticatedPassword(..., { requireStaff: true })`)
  18. `apps/web/app/api/admin/auth/login/route.ts` (`POST` — `loginWithPassword(..., { requireStaff: true })`)
  19. `apps/web/app/api/admin/auth/verify-otp/route.ts` (`POST` — `resolveAuthenticatedContext` checking `ctx.isConciergeOrAdmin`)
  20. `apps/web/app/api/admin/auth/verify/route.ts` (`GET` — `resolveAuthenticatedContext` checking `ctx.isConciergeOrAdmin`)
  21. `apps/web/app/api/admin/cms/[resource]/route.ts` (`GET, POST, DELETE` — `requireConciergeOrAdmin`)
  22. `apps/web/app/api/admin/venues/[id]/media/route.ts` (`POST, DELETE` — `requireConciergeOrAdmin`)
  23. `apps/web/app/api/admin/venues/[id]/pricing/route.ts` (`PUT` — `requireConciergeOrAdmin`)
  24. `apps/web/app/api/admin/venues/route.ts` (`GET, POST` — `requireConciergeOrAdmin`)
  25. `apps/web/app/api/analytics/concierge/route.ts` (`GET` — `requireConciergeOrAdmin`)
  26. `apps/web/app/api/concierge/bookings/[id]/status/route.ts` (`PATCH` — `requireConciergeOrAdmin`)
  27. `apps/web/app/api/concierge/bookings/route.ts` (`POST` — `requireConciergeOrAdmin`)
  28. `apps/web/app/api/concierge/enquiries/[id]/comparison-sheet/route.ts` (`POST` — `requireConciergeOrAdmin`)
  29. `apps/web/app/api/concierge/enquiries/[id]/quotes/route.ts` (`POST` — `requireConciergeOrAdmin`)
  30. `apps/web/app/api/concierge/enquiries/[id]/site-visit/route.ts` (`PATCH` — `requireConciergeOrAdmin`)
  31. `apps/web/app/api/concierge/enquiries/[id]/status/route.ts` (`PATCH` — `requireConciergeOrAdmin`)
  32. `apps/web/app/api/concierge/leads/route.ts` (`GET` — `requireConciergeOrAdmin`)
  33. `apps/web/app/api/concierge/quotes/[id]/route.ts` (`PATCH` — `requireConciergeOrAdmin`)
  34. `apps/web/app/api/concierge/vendors/[id]/contacts/route.ts` (`GET` — `requireConciergeOrAdmin`)
  35. `apps/web/app/api/concierge/venues/[id]/availability/route.ts` (`POST` — `requireConciergeOrAdmin`)
  36. `apps/web/app/api/concierge/venues/[id]/contacts/route.ts` (`GET` — `requireConciergeOrAdmin`)
  37. `apps/web/app/api/concierge/workspace/summary/route.ts` (`GET` — `requireConciergeOrAdmin`)

**Inactive-Admin Exposure Summary:** Because of **F-01**, an inactive admin whose `public.users.role_id` still references `'admin'` can pass **all 37** route files (all **16** `requireActiveAdmin` files and all **22** concierge/staff handler files), bypass `/concierge-portal/*` Edge `middleware.ts`, and read **13** tables directly via RLS (`private.is_concierge_or_admin()`). Only `admins` (other users' rows), `reviews`, and `reports` are protected at the SQL RLS layer (`private.is_active_admin()`), but those tables are still exposed via service-role API routes (`admin/admins`, `admin/reviews/[id]/moderate`, `admin/reports/[id]`).

### E.2 Service-Layer Schema Compatibility (M04–M11)

- **Customer/Vendor Ownership & Auth (`M04`, `M08`):** `customerService.ts`, `vendorService.ts`, `authService.ts` align with M04 column grants (`users`, `vendors`, `review_votes`) and M08 `auth.users -> public.users / user_profile` trigger + `'customer'` default role.
- **Quotes & Comparison Sheets (`M10`):** `quoteComparisonService.ts` targets `public.quotes` and `public.comparison_sheets` (`quote_ids` array); `enquiryService.ts` targets `enquiries.assigned_specialist_id` (plus **F-01** assignee bug in `assignEnquirySpecialist()`).
- **Bookings, Site Visits, Payments & Preferences (`M11`):** `bookingPaymentService.ts` targets `bookings.enquiry_id`, `bookings.quote_id`, `payments.idempotency_key`, `transactions.transaction_reference`, and M11's `booking_status` seeds; `enquiryService.ts` targets `enquiries.site_visit_*`; customer profile preferences target `user_profile.preferences`.

### E.3 Frontend UI Integration Snapshot

Verified scan across **147** UI `.ts`/`.tsx` files (`apps/web/app/` & `apps/web/components/`, excluding `app/api/`):
- **43** UI files still reference mock data.
- **4** UI files call `/api/` endpoints (`apps/web/app/concierge-portal/layout.tsx`, `login/page.tsx`, `settings/page.tsx`, `apps/web/components/admin/AdminHeader.tsx`).
- **0** UI files query Supabase directly via `.from()`.

---

## F. Final Readiness Assessment

| Dimension | Status / Score | Evidence Basis | Key Blockers / Notes |
| :--- | :--- | :--- | :--- |
| **Canonical Migration Design (M01–M11)** | **Strong (8.5 / 10)** | Verified SQL & static checks | Clean RLS isolation, `staging` quarantine, 111/111 FK indexes, `search_path` hardening; minor cleanup needed for M11 `idx_transactions_reference_unique` (**F-02**) and `private.is_concierge_or_admin()` (**F-01**). |
| **Live Deployment Verification (M04–M11)** | **BLOCKED (Unverified)** | `supabase_mcp` auth failure | M01–M03 & M05 were verified in earlier sessions; **M04–M11 live state, M04 vs M10 policy precedence, live `admins` count, and post-M11 advisors require re-run once MCP signs in.** |
| **Application Security / RBAC** | **NOT READY (5.0 / 10)** | Verified `rbac.ts`, `middleware.ts`, 37 route files | **High-severity inactive-admin bypass (F-01)** affects all 37 admin/concierge route files and middleware; service-role clients bypass RLS. |
| **Data Integrity** | **Good (8.0 / 10)** | Verified M02–M11 SQL & services | Single-target checks, idempotency/quote uniqueness, FK indexes intact; `comparison_sheets.quote_ids` array FK limitation (**F-04**) mitigated in service layer; redundant unique index in M11 (**F-02**). |
| **Backend API Readiness** | **Conditionally Ready (7.5 / 10)** | 106 API route files & core services | Schema-compatible across M04–M11; blocked from production sign-off solely on **F-01** RBAC fix + live DB confirmation. |
| **Frontend UI Integration** | **Early / Mock-Backed (2.5 / 10)** | 147 UI files scanned | 43 files still mock-backed; only 4 concierge/admin UI files call `/api/`. |
| **Overall MVP Launch Readiness** | **NO-GO (Blocked on F-01 + Live DB Check)** | Combined evidence | Fix **F-01**, reconnect `supabase_mcp` to execute Section G live verification queries, enable HaveIBeenPwned password protection (**F-06**), and queue **F-02** cleanup migration. |

---

## G. Pending Read-Only Live Verification Queries (Run Once `supabase_mcp` Reconnects)

1. **Migration History & M04 Duplicate Timestamp Order vs M10:**
   ```sql
   SELECT version, name
   FROM supabase_migrations.schema_migrations
   ORDER BY version;
   ```
2. **M04 vs M10 Overlap & Duplicate Policy/Function Check:**
   ```sql
   SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
   FROM pg_policies
   WHERE schemaname = 'public'
     AND (tablename IN ('enquiries', 'favorites', 'quotes', 'comparison_sheets', 'admins', 'roles', 'reviews', 'reports')
       OR policyname LIKE 'Concierge%')
   ORDER BY tablename, policyname;
   ```
3. **M06 Index Presence & M11 Redundant `transactions` Index:**
   ```sql
   SELECT tablename, indexname, indexdef
   FROM pg_indexes
   WHERE schemaname = 'public'
     AND (tablename = 'transactions' OR indexname LIKE 'idx_%')
   ORDER BY tablename, indexname;
   ```
4. **M07–M10 Functions, Search Paths & Triggers:**
   ```sql
   SELECT n.nspname, p.proname, p.prosecdef, p.proconfig
   FROM pg_proc p
   JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname IN ('public', 'private')
     AND p.proname IN (
       'update_updated_at_column',
       'is_vendor_owner', 'is_review_owner', 'is_pending_review_owner',
       'handle_new_auth_user', 'is_active_admin', 'is_concierge_or_admin'
     )
   ORDER BY n.nspname, p.proname;
   ```
5. **M08 Role Seed & M09 Active Admins Verification:**
   ```sql
   SELECT role_id, role_name, status FROM public.roles ORDER BY role_id;
   SELECT admin_id, user_id, role_level, status FROM public.admins ORDER BY admin_id;
   ```
6. **Advisors:** Re-run Supabase `get_advisors` (`type = 'security'` and `type = 'performance'`) to confirm `rls_enabled_no_policy = 9` (expected intentional server-only tables), `function_search_path_mutable = 0`, `unindexed_foreign_keys = 0`, and `no_primary_key = 0`.

