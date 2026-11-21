# Phase 2, Step 2A — Database Foundation Implementation Plan

**Project:** YouMarriageWeArrange (`zujjiiljvjwgcxtaqype`, `ap-south-1`, PostgreSQL `17.11.0.003`)  
**Branch:** `chore/phase-1-integration-foundation` (preserved)  
**Scope:** Planning-only deliverable based on live read-only schema revalidation and current Supabase documentation. Zero DDL, DML, grants, RLS, indexes, auth, or frontend changes have been executed.

---

## 1. Current State (Revalidated Live Snapshot)

| Metric | Revalidated Live Value | Verification Notes |
|---|---|---|
| **Public Base Tables** | **97** | 14 populated (catalog + staging); **83** with `0` rows |
| **Primary Keys** | **96** | `public.photographers_import_v2` (1,086 rows) is the sole table without a PK |
| **Foreign Keys** | **117** | Only 6 covered by unique/PK indexes; **111** unindexed (`0001_unindexed_foreign_keys`) |
| **Unique Constraints** | **27** | Backed by 27 unique indexes |
| **Indexes (`public`)** | **123** | 96 PK + 27 unique indexes = 123 total; **0** standalone FK/query indexes |
| **CHECK Constraint Discrepancy** | **`pg_constraint`: `2`** / **`information_schema`: `228`** | **Resolved:** Postgres exposes 2 explicit table `CHECK` constraints (`reports_mutual_exclusion_check`, `reports_only_one_target` on `public.reports`) plus **226** `NOT NULL` column constraints synthesized as `CHECK` entries in `information_schema.table_constraints` (`226 + 2 = 228`). `contype = 'n'` is `0`. |
| **Enums (`public`)** | **4** | `status_enum` (`Active`, `Inactive`, `Draft`, `Pending`, `Published`, `Approved`, `Rejected`); `admin_status_enum`, `banner_status_enum`, `report_status_enum` (`active`, `inactive`, `pending` — **lowercase**) |
| **Triggers & Functions** | **32** triggers / **1** function | `public.update_updated_at_column()` (`SECURITY INVOKER`, mutable `search_path = NULL`) |
| **RLS Status & Policies** | **97 / 97** RLS enabled / **17** policies | **80** tables have RLS enabled with **0 policies**; 17 tables have `SELECT`-only policies (`banners` uses `{public}` instead of `{anon,authenticated}`) |
| **Table & Sequence Grants** | **0 DML grants** / **0 sequence `USAGE`** | `pg_class.relacl` shows `{postgres=arwdDxtm, anon=Dxtm, authenticated=Dxtm, service_role=Dxtm}`: **`anon`, `authenticated`, AND `service_role` all lack `SELECT/INSERT/UPDATE/DELETE` (`arwd`)** on all 97 tables and lack `USAGE` on all **93** sequences (while `anon`/`authenticated` retain `TRUNCATE`/`REFERENCES`/`TRIGGER`/`MAINTAIN`). |
| **Migration History** | **1** remote / **0** local | Remote `supabase_migrations.schema_migrations` has `20261031083047_create_catering_import_staging`; repo has no `./supabase/` directory yet. |
| **Business Table Counts** | `venues`: **1,198**, `venue_types`: **20**, `venue_gallery`: **4,760**, `venue_pricing`: **1,190**, `venue_faq`: **5,452**, `venue_contacts`: **1,198**, `venue_room_details`: **424**; `vendors`: **2,995**, `vendor_categories`: **5**, `vendor_gallery`: **9,750**, `vendor_pricing`: **1,102**, `vendor_services`: **1,074**, `vendor_contacts`: **2,995**; `photographers_import_v2`: **1,086** (`1,074` match `vendors` in `category_id = 2`) | `auth.users`: **20**; `public.users`: **0**, `public.user_profile`: **0**, `public.admins`: **0**, `public.roles`: **0**; `bookings`/`enquiries`/`favorites`/`reviews`/`payments`/`invites`/`notifications`/`blogs`: **0** |
| **Additional Schema Defects** | `venue_menus.menu_id` default = `NULL` (missing `nextval`); `venues` has no `slug`; `favorites` & `reviews` lack target-exclusivity `CHECK`s; `quotes` & `comparison_sheets` missing | Auth leaked-password protection disabled; `supabase` CLI not currently installed globally or in workspace `devDependencies`. |

---

## 2. Security & Access-Control Matrix

**Rules Applied (per Supabase Skill & Security Checklist):**
- Never assume `authenticated` = admin or vendor (`TO authenticated` alone without ownership/role predicate = BOLA/IDOR).
- Never use deprecated `auth.role()` or user-editable `raw_user_meta_data` (`user_metadata`) in RLS.
- Every `UPDATE` policy includes both `USING` and `WITH CHECK` (plus Postgres requires a matching `SELECT` policy for `UPDATE` to locate rows).
- Admin/Concierge authorization checks active DB membership (`public.admins` where `status = 'active'` or `public.users` + `public.roles` concierge/admin role) via a non-exposed `private` schema `SECURITY DEFINER` helper (`search_path = ''`, checking `auth.uid()`).
- Server-only `service_role` has full privileges (`BYPASSRLS`) strictly inside Next.js Route Handlers/webhooks (`apps/web/app/api/*`), never in client bundles.

Legend: **S** = `SELECT`, **I** = `INSERT`, **U** = `UPDATE`, **D** = `DELETE`, **—** = Denied. `(pub)` = active/published rows only; `(own)` = row owned by `(select auth.uid()) = user_id` or linked `vendor_id`; `(pub-no-pii)` = public catalog columns excluding phone/email/scraping fields.

| Domain & Tables | `anon` | Customer (`authenticated`) | Vendor (`user_id = auth.uid()`) | Concierge | Admin | Notes / Column & Write Boundaries |
|---|---|---|---|---|---|---|
| **Venues Core (`venues`, `venue_types`, `venue_gallery`, `venue_pricing`, `venue_faq`, `venue_room_details`, `venue_amenities`, `venue_availability`, `venue_features`, `venue_menus`, `venue_packages`, `venue_parking`, `venue_videos`)** | S `(pub-no-pii)` | S `(pub-no-pii)` | S `(pub-no-pii)` | S `(all)`, U `(availability/pricing via API)` | S, I, U, D | Restrict `venues` public exposure away from `phone`/`website`/`google_maps`/`source_url`/`member_id` via column-level grants or a `security_invoker` catalog view / server route. |
| **Venue Contacts (`venue_contacts`)** | — | — | — | S | S, I, U, D | Contains 1,198 direct phone numbers; concierge/admin-only so enquiries flow through YMWA concierge. |
| **Vendors Core (`vendors`, `vendor_categories`, `vendor_gallery`, `vendor_pricing`, `vendor_services`, `vendor_availability`, `vendor_faq`, `vendor_packages`, `vendor_social_links`, `vendor_team`, `vendor_videos`)** | S `(pub)` | S `(pub)` | S `(pub)`, U `(own profile/services/gallery — NOT is_verified/status)` | S `(all)` | S, I, U, D | Vendors cannot self-register (`ENGINEERING_RULES.md`) or self-verify (`is_verified` column update restricted via trigger/API). |
| **Vendor Contacts (`vendor_contacts`)** | — | — | S, U `(own)` | S | S, I, U, D | Contains 2,995 phones, 424 emails, 1,340 names; hidden from `anon` and customers. |
| **User Profiles (`users`, `user_profile`)** | — | S, U `(own)` | S, U `(own)` | S `(assigned customers)` | S, I, U, D | `users.role_id` & `users.status` immutable by self (`WITH CHECK` + column lock); `INSERT` handled by `auth.users` signup trigger (`service_role`/trigger). |
| **RBAC & Admin (`admins`, `roles`, `permissions`, `role_permissions`)** | — | — | — | S `(roles/own status)` | S, I, U, D `(super-admin)` | Never readable/writable by `anon` or customers; avoids recursive RLS via `private.is_admin()` helper. |
| **Bookings (`bookings`, `booking_status`, `booking_documents`, `booking_payments`)** | — | S `(own bookings)`, S `(booking_status)` | S `(own vendor bookings)` | S, I, U `(bookings/docs)` | S, I, U, D | Customers **cannot** `INSERT` confirmed bookings or `UPDATE` `status_id`/`total_amount`; mutations via validated server routes. |
| **Enquiries (`enquiries`, `enquiry_messages`, `enquiry_status_history`)** | — | S, I `(own enquiries & messages)` | S `(if assigned/linked)`, I `(messages)` | S, U `(status/assign)`, I `(messages/history)` | S, I, U, D | `enquiry_status_history` append-only for Concierge/Admin; customers read history on own enquiries. |
| **Favorites (`favorites`, `collections`)** | — | S, I, U `(collections)`, D `(own)` | S, I, U, D `(own personal)` | — (except own) | S `(support)` | `auth.uid() = user_id` required on all operations; enforced unique `(user_id, venue_id)` / `(user_id, vendor_id)`. |
| **Reviews & Moderation (`reviews`, `review_images`, `review_votes`)** | S `(pub/approved)` | S `(pub + own)`, I `(own review/vote/img)`, U/D `(own pending)` | S `(pub on own listing)` | S `(all)` | S, U `(approve/reject)`, D | Public sees only `status IN ('Active','Published','Approved')`. Votes 1 per user per review (`user_id = auth.uid()`). |
| **Reports & Logs (`reports`, `report_reasons`, `moderation_logs`)** | S `(reasons)` | S, I `(own reports)` | S, I `(own reports)` | S, I `(own reports)` | S, I, U `(moderate)` | `moderation_logs` strictly Admin-only. |
| **Payments & Transactions (`payments`, `invoices`, `transactions`, `refunds`, `coupons`)** | S `(active coupons if needed)` | S `(own payments/invoices/tx/refunds)` | S `(payout/tx if linked)` | S `(booking payment status)` | S `(all)`, U `(refunds/coupons)` | **Zero client writes** (`INSERT/UPDATE/DELETE`) from `anon` or `authenticated`; all payment/transaction/refund writes execute strictly via verified server webhooks using `service_role`. |
| **Invitations (`invites`, `invite_templates`, `invite_guests`, `invite_media`, `invite_rsvp`)** | S `(active invite_templates)`, S `(invite by slug via API)`, I `(invite_rsvp via verified API)` | S, I, U, D `(own invites, guests, media)` | — (unless own) | — | S, I, U, D `(templates)` | Guest RSVP inserts should pass through a rate-limited/validated Route Handler rather than open anonymous table `INSERT`. |
| **Messaging & Notifications (`conversations`, `messages`, `message_attachments`, `chat_notifications`, `notifications`, `notification_logs`, `notification_templates`, `email_templates`, `sms_templates`)** | — | S `(participant conversations/messages, own notifications)`, I `(participant messages)`, U `(own is_read)` | S, I `(participant)` | S, I `(participant)` | S, I, U, D `(templates, all)` | `notification_logs`, `email_templates`, `sms_templates`, `notification_templates` contain provider payloads and system copy — Admin/`service_role` only. |
| **CMS, Blog & Locations (`blogs`, `blog_categories`, `blog_tags`, `inspirations`, `inspiration_categories`, `inspiration_gallery`, `real_weddings`, `wedding_gallery`, `wedding_tags`, `wedding_vendors`, `banners`, `home_sections`, `pages`, `seo`, `faqs`, `testimonials`, `themes`, `countries`, `states`, `cities`, `areas`, `localities`, `currencies`, `languages`, `popular_searches`, `search_filters`)** | S `(pub)` | S `(pub)` | S `(pub)` | S `(all)`, I/U `(CMS pages)` | S, I, U, D | `blog_comments`, `blog_likes`: `S (pub)`, `I/D (own authenticated)`. `recent_searches`: `S/I/D (own authenticated)`. `app_settings`: Admin/`service_role` only. `photographers_import_v2`: **no access for `anon`/`authenticated`**. |

---

## 3. Catalog Data Correction Plan (Preserving Existing Records, Zero Invented Data)

| Issue (Live Data Evidence) | Impact if Uncorrected | Safe Correction Strategy | Preservation Guarantee |
|---|---|---|---|
| **`venues.status` is `NULL` on 1,198 / 1,198 rows** | Enabling RLS `status = 'Active'` immediately hides all 1,198 venues from the storefront. | Backfill `UPDATE public.venues SET status = 'Active' WHERE status IS NULL;` and set column default `'Active'::status_enum`. | Zero rows deleted; every existing row becomes deterministically active and reversible via timestamp/audit. |
| **`venues.area_id` is `NULL` on 1,198 / 1,198 rows** (`base_city`: Hyderabad 1,192, Vikarabad 4, Lemoor 1, Medak 1; `locality_name` 707, `primary_locality` 726) | Location filters break if queries join `areas -> cities` via `area_id`. | Keep `area_id` nullable for now; **do not invent `area_id` values**. Seed `countries`/`states`/`cities`/`areas` strictly from distinct existing `base_city` & normalized `primary_locality`/`locality_name` values, then backfill `area_id` only on exact normalized text matches; allow service queries to fall back to `base_city` / `locality_name`. | Existing text location columns stay intact; unmatched rows retain `area_id = NULL` rather than receiving guessed neighborhoods. |
| **Missing `venues.slug` column** (1,195 distinct names across 1,198 rows — **3 exact name collisions**) | `/venues/[slug]` routes cannot query live DB by slug; naive slugification fails unique constraint on the 3 duplicate names. | Add nullable `slug text`, populate deterministically from `venue_name` (lowercase ASCII kebab-case), append `'-' || venue_id::text` automatically on duplicate slugs (or consistently `-<venue_id>`), verify `0` nulls and `1,198` distinct values, **then** set `NOT NULL` + `UNIQUE`. | Deterministic, collision-free, zero synthetic marketing text invented, and existing `venue_id` preserved. |
| **`vendors.user_id` is `NULL` on 2,995 / 2,995 rows** | Owner-based RLS (`user_id = auth.uid()`) matches nobody until onboarding; cannot auto-claim safely without matching accounts. | Keep `user_id` nullable (`NULL`). Build an admin-approved vendor claim/invite workflow that attaches real `auth.users(id)`/`public.users(user_id)` only after verification. | Zero fake user ownership; prevents unauthorized account takeover on 2,995 imported vendor listings. |
| **`vendors.is_verified` default is `false` (2,995 / 2,995 `false`)** | If public RLS requires `is_verified = true`, all 2,995 vendors disappear. | Keep column default `false` (imported ≠ YMWA-vetted). Gate public directory visibility on `status = 'Active'`, and reserve `is_verified = true` for the "YMWA Verified" UI badge once admin-vetted. | Preserves factual vetting state without hiding active directory listings or falsely marking unvetted imports as verified. |
| **Category slug mismatch** (`vendor_categories`: `bridal-makeup`, `photographers`, `catering`, `decorators`, `mehendi` vs frontend: `makeup`, `photography`, `decor`) | Filtering `vendors` by frontend URL slugs (`makeup`, `photography`, `decor`) returns 0 rows. | **Do not mutate existing DB `vendor_categories.slug`** (preserves indexed/seeded DB slugs). Add an explicit slug-mapping map in `services/vendor` (and optional URL redirect/alias support) during Step 3 catalog integration. | Preserves existing DB rows and bookmarks while maintaining clean frontend routes. |
| **Public visibility of `venue_contacts` (1,198 phones) & `vendor_contacts` (2,995 phones, 424 emails) + `venues` direct contact columns (`phone`, `website`, `google_maps`)** | Granting raw `SELECT` on `venues`, `venue_contacts`, and `vendor_contacts` exposes all scraped vendor/venue phone numbers and emails to anonymous scraping and bypasses YMWA concierge attribution. | Lock `venue_contacts` and `vendor_contacts` to Concierge/Admin/Owner via RLS (`0` grants to `anon`). For `venues`, either grant `SELECT` on explicit non-PII columns only (`GRANT SELECT (venue_id, type_id, venue_name, slug, ...) ON public.venues TO anon, authenticated`) OR expose a `security_invoker = true` public view / server route that omits `phone`, `website`, `google_maps`, `external_id`, `member_id`, `membership_id`, and `source_url`. | Preserves all contact rows intact for Concierge/Admin while protecting business contact PII from anonymous bulk scraping. |

---

## 4. Database Foundation Migration Sequence (8 Ordered Migrations)

Following the Supabase Skill (**Imperative Migrations**, small single-purpose migrations, never combining unrelated changes, never creating blanket `USING (true)` write policies):

1. **`01_schema_prerequisites_and_grants`** — Structural fixes & least-privilege API grants:
   - Fix `venue_menus.menu_id` missing sequence (`CREATE SEQUENCE` / `ALTER COLUMN ... SET DEFAULT nextval(...)`).
   - Add `venues.slug`, enforce unique/check integrity on `favorites` (`CHECK` single target + `UNIQUE (user_id, venue_id)`, `UNIQUE (user_id, vendor_id)` + optional `collection_id` FK) and `reviews` (`CHECK` `venue_id` XOR `vendor_id`).
   - Grant `ALL` on all `public` tables and `USAGE, SELECT` on all sequences to `service_role` (unblocking server/webhook code).
   - Revoke overly broad `TRUNCATE` from `anon`/`authenticated` where unused, grant explicit `SELECT` / `INSERT` / `UPDATE` / `DELETE` privileges **only** on intended tables (and column-scoped `SELECT` on `venues` if exposed directly to `anon`/`authenticated`), plus sequence `USAGE` for `authenticated`.
2. **`02_public_catalog_and_cms_rls`** — Public read policies:
   - Add `TO anon, authenticated` `SELECT` policies on `venues` (`status = 'Active'`), public venue child tables (excluding `venue_contacts`), `vendors` (`status = 'Active'`), and public vendor child tables (excluding `vendor_contacts`).
   - Fix `banners` policy role from `{public}` to `TO anon, authenticated`.
   - Ensure `venue_contacts` and `vendor_contacts` have zero `anon` read policies.
3. **`03_customer_and_vendor_ownership_rls`** — User & partner isolation:
   - Strict `TO authenticated` owner policies (`(select auth.uid()) = user_id` with matching `WITH CHECK`) for `users` (read/update safe fields), `user_profile`, `favorites`, `collections`, `enquiries`, `enquiry_messages`, `bookings` (read own), `reviews` / `review_images` / `review_votes`, `reports`, `invites` / `invite_guests` / `invite_media`, `conversations` / `messages` / `notifications`, `recent_searches`, and `payments`/`invoices`/`transactions` (read own only).
   - Vendor self-management policies (`EXISTS (SELECT 1 FROM public.vendors v WHERE v.vendor_id = ... AND v.user_id = (select auth.uid()))`) with protection preventing modification of `is_verified` or `status`.
4. **`04_admin_and_concierge_authorization`** — Role seeding & privileged RLS:
   - Seed `public.roles` (`customer`, `vendor`, `concierge`, `admin`) and baseline `permissions`.
   - Create private schema helper `private.is_active_admin()` (`SECURITY DEFINER`, `SET search_path = ''`, verifying `(select auth.uid())` against `public.admins` where `status = 'active'::admin_status_enum`) + `private.is_concierge_or_admin()` (`REVOKE EXECUTE FROM PUBLIC`, `GRANT EXECUTE TO authenticated` only after internal `auth.uid()` guard).
   - Add Admin and Concierge policies on catalog, leads (`enquiries`), `bookings`, CMS tables, `venue_contacts`, `vendor_contacts`, `admins`, and `reports`/`moderation_logs`.
   - Prepare schema extension note for Step 5 interactive flows (`quotes` / `comparison_sheets` and `enquiries.assigned_specialist_id` aligned with `DATABASE_SECURITY.md`).
5. **`05_foreign_key_indexes`** — Performance indexing:
   - Create covering B-tree indexes (`CREATE INDEX IF NOT EXISTS ...`) for all **111** unindexed foreign keys reported by `0001_unindexed_foreign_keys` (grouped cleanly or ordered by hot-path domains: catalog first, then bookings/enquiries/favorites/payments/editorial).
6. **`06_staging_table_primary_key_and_isolation`** — Staging table decision:
   - Move `public.photographers_import_v2` (1,086 staging rows, 1,074 already matched in `vendors`) out of exposed `public` schema into a private `staging` schema (`ALTER TABLE public.photographers_import_v2 SET SCHEMA staging;`), **and/or** add `id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY` so `0004_no_primary_key` is resolved while keeping zero Data API exposure.
7. **`07_function_search_path_hardening`** — Security advisor remediation:
   - `ALTER FUNCTION public.update_updated_at_column() SET search_path = '';`
   - Dashboard / Auth API step (non-SQL): Enable **Leaked Password Protection** (`auth_leaked_password_protection`).
8. **`08_auth_signup_profile_sync`** — Auth-to-public synchronization:
   - Create `private.handle_new_auth_user()` (`SECURITY DEFINER`, `SET search_path = ''`) triggered `AFTER INSERT ON auth.users` to insert into `public.users` (with `customer` role from `public.roles`) and `public.user_profile` idempotently (`ON CONFLICT DO NOTHING`).
   - Run a reviewed, idempotent backfill SQL step for the **20 existing `auth.users`** accounts that currently have 0 rows in `public.users`.

---

## 5. Required SQL Outline (Illustrative Templates for Step 2 Execution)

> Planning outline only — **nothing below has been executed**.

```sql
-- Migration 01 (excerpt): Sequence + Grants
CREATE SEQUENCE IF NOT EXISTS public.venue_menus_menu_id_seq;
ALTER TABLE public.venue_menus
  ALTER COLUMN menu_id SET DEFAULT nextval('public.venue_menus_menu_id_seq');
SELECT setval('public.venue_menus_menu_id_seq', COALESCE((SELECT MAX(menu_id) FROM public.venue_menus), 1));

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role, authenticated;

REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
-- Least-privilege table/column grants issued explicitly per table (no blanket GRANT ALL TO anon/authenticated)
GRANT SELECT (venue_id, type_id, venue_name, slug, description, address, rating, price_range,
  capacity, status, locality_name, primary_locality, base_city, pincode, short_summary,
  about_venue, reviews_count, price_subtext, currency, venue_price_tag, guest_count_min,
  guest_count_max, indoor_outdoor_spaces, catering_policy, decor_policy,
  availability_start_time, availability_end_time, features, rules_policies)
  ON public.venues TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;

-- Migration 02/03 (excerpt): Catalog & Customer RLS
CREATE POLICY "Public can view active venues"
  ON public.venues FOR SELECT TO anon, authenticated
  USING (status = 'Active'::status_enum);

CREATE POLICY "Customers manage own favorites"
  ON public.favorites FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Migration 04 (excerpt): Admin helper in private schema (not exposed to PostgREST)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.is_active_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT (select auth.uid()) IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.admins a
    WHERE a.user_id = (select auth.uid())
      AND a.status = 'active'::public.admin_status_enum
  );
$$;

-- Migration 07: Function search_path fix
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- Migration 08 (excerpt): Auth signup sync trigger
CREATE OR REPLACE FUNCTION private.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_customer_role_id bigint;
BEGIN
  SELECT role_id INTO v_customer_role_id
  FROM public.roles WHERE lower(role_name) = 'customer' LIMIT 1;

  INSERT INTO public.users (user_id, role_id, full_name, email, status)
  VALUES (
    NEW.id,
    v_customer_role_id,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''), split_part(NEW.email, '@', 1)),
    NEW.email,
    'Active'::public.status_enum
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_profile (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;
```

---

## 6. Type Generation Strategy

- **Existing Consumers Reviewed:** `packages/types/src/*` currently defines camelCase UI/domain models (`Venue`, `Vendor`, `VendorCategory`, `CustomerProfile`, `CustomerBooking`, `ConciergeLead`, `SessionUser`) imported across `apps/web`, `packages/auth`, `packages/database`, and `services/*`. Overwriting `packages/types/src/{venues,vendors,customer,leads,auth}.ts` would break all frontend components and mock mappers immediately.
- **Recommended Location & Preservation:**
  1. Generate raw Postgres types into a dedicated, clearly marked generated file: `packages/types/src/database.generated.ts`.
  2. Keep existing UI interfaces untouched and export `Database`, `Tables`, `TablesInsert`, `TablesUpdate`, and `Enums` from `packages/types/src/index.ts` alongside existing exports (checking for any symbol name collisions first).
  3. Supply `<Database>` to `createBrowserClient<Database>` in `packages/auth/src/supabaseClient.ts` and `createServerClient<Database>` in `apps/web/services/supabase/server.ts`.
- **Exact Generation Commands (after migrations 01–08 complete):**
  - **Preferred via Supabase CLI** (install `supabase` as root `devDependency` or run via `pnpm dlx`):
    ```bash
    pnpm dlx supabase gen types --lang typescript --project-id zujjiiljvjwgcxtaqype --schema public > packages/types/src/database.generated.ts
    ```
  - **Alternative via Supabase MCP:** Call `generate_typescript_types` with `project_id: "zujjiiljvjwgcxtaqype"` and write output to `packages/types/src/database.generated.ts`.
  - Add a root/package script (`"db:types"`) in future implementation so schema migrations and type regeneration stay paired.
  - Note: Workspace currently pins `@supabase/supabase-js` `^2.43.0`; `Database` generic typing works cleanly on `2.43.0` (upgrade to `>=2.48.0` only if JSONB selector path inference is needed later).

---

## 7. Migration Safety & History Strategy (Baselining the Existing Remote DB)

Because `zujjiiljvjwgcxtaqype` already contains 97 tables and 1 remote migration (`20261031083047_create_catering_import_staging`) while the repository has no `./supabase/` directory:

1. **Initialize & Link Without Recreating Existing Tables:**
   - Run `supabase init` at repo root (`we-arrange-`) to create `./supabase/config.toml`.
   - Authenticate (`supabase login`) and link (`supabase link --project-ref zujjiiljvjwgcxtaqype`).
2. **Pull & Reconcile Baseline Schema (Never Re-run Against Live):**
   - Run `supabase db pull` to dump the live remote schema into `supabase/migrations/<timestamp>_remote_schema.sql` and review `supabase migration list` (also sync/repair `20261031083047` locally if needed).
   - **Mandatory Hygiene Review (per Supabase docs):** Inspect the generated baseline file and remove noisy `DROP EXTENSION` or redundant `GRANT MAINTAIN, REFERENCES...` diff artifacts before committing.
   - Because `db pull` records the baseline timestamp in `supabase_migrations.schema_migrations`, `supabase db push` will **not** re-execute `CREATE TABLE` against existing remote tables or destroy existing data.
3. **Verify Reproducibility Locally:**
   - Test the baseline + new migrations locally with `supabase start` and `supabase db reset` (requires Docker) before pushing anything to `zujjiiljvjwgcxtaqype`.
4. **Daily Workflow (Option B: Imperative Migrations):**
   - Create each of the 8 planned migrations via `supabase migration new <name>` (sequentially tested locally, verified with `get_advisors` / `supabase db advisors`), then deploy via `supabase db push --dry-run` followed by `supabase db push`. **Never** use `supabase db reset --linked` or `--include-seed` on the live project, and avoid editing the remote schema manually in Studio once migrations are tracked.

---

## 8. Verification & Rollback Strategy

- **Pre-Execution Snapshot:** Capture a schema + catalog backup (`supabase db dump --linked` and data backup for `venues`/`vendors`) before applying Migration 01.
- **Verification After Each Migration:**
  1. Re-run `get_advisors` (`security` + `performance`) after every migration step — target **0** `0008_rls_enabled_no_policy`, **0** `0011_function_search_path_mutable`, **0** `0004_no_primary_key`, **0** `0001_unindexed_foreign_keys`, and **0** `auth_leaked_password_protection`.
  2. Run automated RLS role-impersonation tests in SQL (`SET LOCAL ROLE anon` / `SET LOCAL ROLE authenticated` with `request.jwt.claims` for Customer A, Customer B, Vendor A, Concierge, Admin) verifying:
     - `anon` can read active `venues`/`vendors` (without `venue_contacts`/`vendor_contacts`), and gets `permission denied` or `0` rows on `bookings`, `enquiries`, `payments`, `users`, `admins`, and `photographers_import_v2`.
     - Customer A cannot read/update/delete Customer B's `favorites`, `enquiries`, `bookings`, `payments`, or `user_profile`, nor escalate `users.role_id`.
     - `service_role` can execute full server operations cleanly.
  3. Confirm live `venues` count (`1,198` active, `1,198` distinct slugs) and `vendors` count (`2,995` active, `0` unverified changed unintentionally).
- **Rollback Strategy:**
  - Every migration includes an explicit down-script checklist (e.g., `DROP POLICY`, `REVOKE`, `DROP INDEX`, `DROP TRIGGER`, `DROP COLUMN`) stored cleanly in PR review notes.
  - Because `venues.status` backfill only updates `NULL` rows (`status IS NULL`) and `venues.slug` is additive, reverting does not delete or corrupt any original scraped column values.

---

## 9. Risks & Dependencies

1. **Missing `service_role` & Sequence Grants Today:** Currently **even `service_role` lacks DML and sequence grants** on `public`. Migration 01 must restore `service_role` grants before any server Route Handler or Edge Function attempts DB access.
2. **Data Visibility Ordering Risk:** Enabling RLS on `venues` before backfilling `venues.status = 'Active'` will immediately return `0` venues. Catalog backfill must precede or atomically ship within the same tested step as catalog RLS.
3. **Contact PII Product Confirmation Required:** Because `venues` stores `phone`/`website`/`google_maps` directly on the parent table (unlike `vendors`, which isolates them in `vendor_contacts`), exposing `venues` directly to `anon` via PostgREST requires either column-level `SELECT` grants or serving public venue details through a `security_invoker` view / Next.js server routes.
4. **Local Tooling Prerequisite:** `supabase` CLI is not currently installed in the workspace (`ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`), and Docker is needed for local `supabase start` / `db reset` verification.
5. **Missing `quotes` / `comparison_sheets` Tables:** The concierge quoting & comparison workflow documented in `.agents/rules/DATABASE_SECURITY.md` has no backing tables in the 97-table schema; those tables (plus `enquiries.assigned_specialist_id`) must be added cleanly in a dedicated follow-on migration before Step 5 enquiry/quote integration.

---

## 10. Exact Recommended First Implementation Step

**First Step (Phase 2, Step 2B):** **Initialize Supabase Migration Baseline & Apply Migration 01 (Schema Prerequisites, Catalog Slug/Status Backfill Prep, & Least-Privilege Grants)**

1. Confirm two product decisions upfront:
   - Whether `venues.phone` / `website` / `google_maps` should remain hidden from `anon` alongside `venue_contacts` / `vendor_contacts` (recommended: hidden from `anon`, accessible to Concierge/Admin).
   - Confirm whether Docker + Supabase CLI (`supabase` devDependency) will be used for local baseline (`supabase init` + `supabase db pull`) or Supabase MCP (`execute_sql` + recorded migration workflow).
2. Execute the **baseline pull** (`supabase init`, `supabase link --project-ref zujjiiljvjwgcxtaqype`, `supabase db pull`) and verify `supabase migration list` without altering existing tables.
3. Author, locally verify, and apply **Migration 01 (`schema_prerequisites_and_grants`)** alone first (fixing `venue_menus.menu_id` sequence, adding `venues.slug`, adding `favorites`/`reviews` constraints, restoring `service_role` table + sequence grants, revoking `anon`/`authenticated` `TRUNCATE`, and applying least-privilege `SELECT`/`INSERT`/`UPDATE`/`DELETE` grants), then verify with `get_advisors` before moving to Migration 02 (`public_catalog_and_cms_rls`).

