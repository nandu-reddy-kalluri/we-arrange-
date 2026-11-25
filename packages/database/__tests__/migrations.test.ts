import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const MIGRATIONS_DIR = path.join(REPO_ROOT, "supabase", "migrations");

const EXPECTED_MIGRATIONS = [
  "20261112170001_minimum_required_grants.sql",
  "20261112170002_venue_catalog_schema_and_status.sql",
  "20261112170003_public_catalog_and_cms_rls.sql",
  "20261112170004_customer_and_vendor_ownership_rls.sql",
  "20261112170005_isolate_photographers_import_v2.sql",
  "20261112170006_foreign_key_indexes.sql",
  "20261112170007_harden_update_updated_at_search_path.sql",
  "20261112170008_auth_signup_profile_sync.sql",
  "20261112170009_admin_concierge_authorization_rls.sql",
  "20261112170010_quotes_comparison_sheets_and_links.sql",
  "20261112180011_booking_links_site_visits_and_preferences.sql",
  "20261112180012_harden_concierge_or_admin_rls.sql",
  "20261112180013_trigram_search_and_numeric_plate_pricing.sql",
] as const;

function readMigration(filename: string): string {
  return fs.readFileSync(path.join(MIGRATIONS_DIR, filename), "utf8");
}

function stripSqlComments(sql: string): string {
  return sql
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n");
}

describe("Prepared SQL Migrations 01–10 Security & Integrity Verification", () => {
  it("contains all 10 ordered migrations marked PREPARED — NOT APPLIED", () => {
    for (const filename of EXPECTED_MIGRATIONS) {
      const fullPath = path.join(MIGRATIONS_DIR, filename);
      expect(fs.existsSync(fullPath), `${filename} should exist`).toBe(true);
      const sql = readMigration(filename);
      expect(sql).toContain("STATUS: PREPARED — NOT APPLIED");
    }
  });

  it("never uses deprecated auth.role() or permissive USING (true) / WITH CHECK (true) write policies", () => {
    for (const filename of EXPECTED_MIGRATIONS) {
      const sql = stripSqlComments(readMigration(filename));
      expect(sql).not.toMatch(/auth\.role\s*\(\)/i);

      for (const stmt of sql.split(";")) {
        expect(stmt).not.toMatch(
          /FOR\s+(INSERT|UPDATE|DELETE|ALL)[\s\S]*?(USING|WITH\s+CHECK)\s*\(\s*true\s*\)/i
        );
        expect(stmt).not.toMatch(
          /GRANT\s+ALL[\s\S]*?ON\s+ALL\s+TABLES[\s\S]*?TO\s+(anon|authenticated|PUBLIC)\b/i
        );
      }
    }
    // Zero blanket GRANT ALL anywhere in Migration 01 (least-privilege per table)
    const mig01Raw = stripSqlComments(readMigration(EXPECTED_MIGRATIONS[0]));
    expect(mig01Raw).not.toMatch(/GRANT\s+ALL/i);
    expect(mig01Raw).toMatch(
      /REVOKE\s+ALL\s+PRIVILEGES\s+ON\s+ALL\s+TABLES\s+IN\s+SCHEMA\s+public\s+FROM\s+PUBLIC,\s*anon,\s*authenticated,\s*service_role/i
    );
    expect(mig01Raw).not.toMatch(/photographers_import_v2/i);
    expect(mig01Raw).not.toMatch(/booking_status_status_id_seq/i);
  });

  it("never uses user_metadata / raw_user_meta_data in authorization checks (Migration 09)", () => {
    const mig09 = stripSqlComments(readMigration(EXPECTED_MIGRATIONS[8]));
    expect(mig09).not.toMatch(/user_metadata/i);
    expect(mig09).toContain("SET search_path = ''");
    expect(mig09).toContain("(select auth.uid()) IS NOT NULL");
    expect(mig09).toContain("'active'::public.admin_status_enum");
  });

  it("protects Contact PII (Decision 1), vendor metadata, and internal user UUIDs in Migration 01 & 02", () => {
    const mig01 = stripSqlComments(readMigration(EXPECTED_MIGRATIONS[0]));
    const mig02 = stripSqlComments(readMigration(EXPECTED_MIGRATIONS[1]));

    // venues.phone and internal IDs excluded from column-level SELECT
    const venuesSelectMatch = mig01.match(/GRANT\s+SELECT\s*\(([\s\S]*?)\)\s*ON\s+public\.venues\s+TO\s+anon,\s*authenticated/i);
    expect(venuesSelectMatch).not.toBeNull();
    const venuesCols = venuesSelectMatch?.[1] ?? "";
    expect(venuesCols).toContain("website");
    expect(venuesCols).toContain("google_maps");
    expect(venuesCols).not.toMatch(/\bphone\b/i);
    expect(venuesCols).not.toMatch(/\bexternal_id\b/i);
    expect(venuesCols).not.toMatch(/\bmember_id\b/i);
    expect(venuesCols).not.toMatch(/\bmembership_id\b/i);
    expect(venuesCols).not.toMatch(/\bsource_url\b/i);

    // vendors: excludes metadata (scraped phone/email PII) and user_id from public SELECT
    const vendorsSelectMatch = mig01.match(/GRANT\s+SELECT\s*\(([\s\S]*?)\)\s*ON\s+public\.vendors\s+TO\s+anon,\s*authenticated/i);
    expect(vendorsSelectMatch).not.toBeNull();
    const vendorsCols = vendorsSelectMatch?.[1] ?? "";
    expect(vendorsCols).toContain("vendor_name");
    expect(vendorsCols).toContain("is_verified");
    expect(vendorsCols).not.toMatch(/\bmetadata\b/i);
    expect(vendorsCols).not.toMatch(/\buser_id\b/i);

    // editorial & review tables exclude user_id / author_id / created_by from public SELECT
    for (const [tbl, excludedCol] of [
      ["blogs", "author_id"],
      ["inspirations", "created_by"],
      ["real_weddings", "created_by"],
      ["reviews", "user_id"],
      ["review_votes", "user_id"],
      ["blog_comments", "user_id"],
      ["blog_likes", "user_id"],
    ] as const) {
      const m = mig01.match(
        new RegExp(`GRANT\\s+SELECT\\s*\\(([\\s\\S]*?)\\)\\s*ON\\s+public\\.${tbl}\\s+TO\\s+anon,\\s*authenticated`, "i")
      );
      expect(m, `${tbl} should use column-scoped public SELECT`).not.toBeNull();
      expect(m?.[1]).not.toMatch(new RegExp(`\\b${excludedCol}\\b`, "i"));
    }

    // slug granted in Migration 02 after creation
    expect(mig02).toMatch(/GRANT\s+SELECT\s*\(\s*slug\s*\)\s*ON\s+public\.venues\s+TO\s+anon,\s*authenticated/i);

    // Zero anon grants on private contact tables or financial/staff tables
    const anonLines = mig01
      .split(";")
      .filter((stmt) => /\bTO\s+(anon|anon\s*,\s*authenticated)\b/i.test(stmt) && !/\bREVOKE\b/i.test(stmt))
      .join("\n");
    for (const forbidden of [
      "venue_contacts",
      "vendor_contacts",
      "payments",
      "invoices",
      "transactions",
      "refunds",
      "bookings",
      "enquiries",
      "admins",
      "users",
    ]) {
      expect(anonLines).not.toMatch(new RegExp(`\\b${forbidden}\\b`, "i"));
    }

    // Concierge/admin authenticated RLS query requires SELECT on venue_contacts
    expect(mig01).toMatch(/GRANT\s+SELECT\s+ON\s+public\.admins,\s*public\.roles,\s*public\.venue_contacts\s+TO\s+authenticated/i);

    // Immutable privilege & scraped-metadata columns locked down
    expect(mig01).toMatch(/GRANT\s+UPDATE\s*\(\s*full_name,\s*phone,\s*updated_at\s*\)\s*ON\s+public\.users\s+TO\s+authenticated/i);
    expect(mig01).toMatch(/GRANT\s+UPDATE\s*\([^)]*\)\s*ON\s+public\.vendors\s+TO\s+authenticated/i);
    const vendorsUpdateMatch = mig01.match(/GRANT\s+UPDATE\s*\(([^)]*)\)\s*ON\s+public\.vendors/i);
    expect(vendorsUpdateMatch?.[1]).not.toMatch(/\bis_verified\b/i);
    expect(vendorsUpdateMatch?.[1]).not.toMatch(/\bstatus\b/i);
    expect(vendorsUpdateMatch?.[1]).not.toMatch(/\buser_id\b/i);
    expect(vendorsUpdateMatch?.[1]).not.toMatch(/\bmetadata\b/i);
  });

  it("assigns only lowest-privilege customer role on signup in Migration 08", () => {
    const mig08 = stripSqlComments(readMigration(EXPECTED_MIGRATIONS[7]));
    expect(mig08).toContain("WHERE lower(role_name) = 'customer'");
    expect(mig08).toContain("SET search_path = ''");
    expect(mig08).not.toMatch(/raw_user_meta_data\s*->>\s*'role'/i);
  });

  it("defines Migration 10 schema, FK indexes, anti-IDOR RLS, and INR/XOR constraints", () => {
    const mig10 = stripSqlComments(readMigration(EXPECTED_MIGRATIONS[9]));
    expect(mig10).toContain("ADD COLUMN IF NOT EXISTS assigned_specialist_id uuid");
    expect(mig10).toContain("ADD COLUMN IF NOT EXISTS collection_id bigint");
    expect(mig10).toContain("CREATE TABLE IF NOT EXISTS public.quotes");
    expect(mig10).toContain("CREATE TABLE IF NOT EXISTS public.comparison_sheets");
    expect(mig10).toContain("quotes_single_partner_check");
    expect(mig10).toContain("CHECK (currency = 'INR')");
    expect(mig10).toContain("idx_quotes_enquiry_id");
    expect(mig10).toContain("idx_comparison_sheets_enquiry_id");
    expect(mig10).toContain("c.user_id = (select auth.uid())");
    expect(mig10).toContain("assigned_specialist_id IS NULL");
    expect(mig10).toContain("private.is_concierge_or_admin()");
    expect(mig10).not.toMatch(/GRANT\s+ALL/i);
  });

  it("defines Migration 11 booking-quote links, site-visit check, idempotency indexes, and booking status seeds", () => {
    const mig11 = stripSqlComments(readMigration(EXPECTED_MIGRATIONS[10]));
    expect(mig11).toContain("ADD COLUMN IF NOT EXISTS preferences jsonb");
    expect(mig11).toContain("enquiries_site_visit_status_check");
    expect(mig11).toContain("idx_bookings_unique_quote_id");
    expect(mig11).toContain("idx_payments_idempotency_key");
    expect(mig11).toContain("idx_transactions_reference_unique");
    expect(mig11).toContain("INSERT INTO public.booking_status");
  });

  it("includes review service_role grants (M01), identity-safe venue_menus fix (M02), and status-filtered inspirations/real_weddings RLS (M03)", () => {
    const mig01 = stripSqlComments(readMigration(EXPECTED_MIGRATIONS[0]));
    const mig02 = stripSqlComments(readMigration(EXPECTED_MIGRATIONS[1]));
    const mig03 = stripSqlComments(readMigration(EXPECTED_MIGRATIONS[2]));

    expect(mig01).toMatch(/public\.reviews,/i);
    expect(mig01).toMatch(/public\.review_images,/i);
    expect(mig01).toMatch(/public\.review_votes,/i);
    expect(mig02).toContain("is_identity = 'NO'");
    expect(mig03).toContain('CREATE POLICY "Public can view inspirations"');
    expect(mig03).toContain('CREATE POLICY "Public can view real weddings"');
  });

  it("enforces Migration 04 ownership, least-privilege column grants, and anti-tamper RLS corrections", () => {
    const mig04 = stripSqlComments(readMigration(EXPECTED_MIGRATIONS[3]));

    // 1. No invalid password_hash references
    expect(mig04).not.toMatch(/password_hash/i);

    // 2. Table-level SELECT revoked on users, replaced with safe column whitelist
    expect(mig04).toMatch(/REVOKE\s+SELECT\s+ON\s+TABLE\s+public\.users\s+FROM\s+anon,\s*authenticated/i);
    const usersColsMatch = mig04.match(/GRANT\s+SELECT\s*\(([\s\S]*?)\)\s*ON\s+TABLE\s+public\.users\s+TO\s+authenticated/i);
    expect(usersColsMatch).not.toBeNull();
    const usersCols = usersColsMatch?.[1] ?? "";
    expect(usersCols).toContain("user_id");
    expect(usersCols).toContain("role_id");
    expect(usersCols).toContain("full_name");
    expect(usersCols).toContain("email");
    expect(usersCols).toContain("phone");
    expect(usersCols).toContain("status");
    expect(usersCols).toContain("created_at");
    expect(usersCols).toContain("updated_at");

    // 3. No redundant unique index creation
    expect(mig04).not.toContain("review_votes_review_user_uidx");
    expect(mig04).not.toContain("blog_likes_blog_user_uidx");

    // 4. Vendor review moderation locked down, status update revoked from authenticated
    expect(mig04).toMatch(/REVOKE\s+UPDATE\s*\(\s*status\s*\)\s*ON\s+public\.reviews\s+FROM\s+anon,\s*authenticated/i);
    expect(mig04).not.toMatch(/CREATE\s+POLICY\s+"Vendors\s+moderate\s+reviews/i);
    expect(mig04).toContain('DROP POLICY IF EXISTS "Vendors moderate reviews on own listings" ON public.reviews');

    // 5. is_pending_review_owner helper present with empty search_path
    expect(mig04).toContain("private.is_pending_review_owner(target_review_id bigint)");
    expect(mig04).toContain("SET search_path = ''");
    expect(mig04).toContain("r.status = 'Pending'::public.status_enum");

    // 6. Review images scoped to owner's pending reviews
    expect(mig04).toMatch(/CREATE\s+POLICY\s+"Users\s+insert\s+images\s+on\s+own\s+pending\s+reviews"[\s\S]*?private\.is_pending_review_owner\(review_id\)/i);
    expect(mig04).toMatch(/CREATE\s+POLICY\s+"Users\s+delete\s+images\s+on\s+own\s+pending\s+reviews"[\s\S]*?private\.is_pending_review_owner\(review_id\)/i);

    // 7. Review votes restricted to valid vote types and published/approved reviews
    expect(mig04).toContain("vote_type IN ('helpful', 'unhelpful')");
    expect(mig04).toMatch(/CREATE\s+POLICY\s+"Users\s+create\s+own\s+review\s+votes\s+on\s+published\s+reviews"/i);
    expect(mig04).toMatch(/CREATE\s+POLICY\s+"Users\s+update\s+own\s+review\s+votes\s+on\s+published\s+reviews"/i);

    // 8. Blog likes INSERT requires published blog
    expect(mig04).toMatch(/CREATE\s+POLICY\s+"Users\s+create\s+own\s+blog\s+likes\s+on\s+published\s+blogs"[\s\S]*?b\.status\s*=\s*'Published'::public\.status_enum/i);

    // 9. Reports enforce lowercase pending status_enum
    expect(mig04).toContain("status = 'pending'::public.report_status_enum");
  });

  it("covers all 111 unindexed foreign keys with non-redundant B-tree indexes in Migration 06", () => {
    const mig06 = stripSqlComments(readMigration(EXPECTED_MIGRATIONS[5]));
    const indexMatches = [...mig06.matchAll(/CREATE INDEX IF NOT EXISTS ([a-z0-9_]+) ON public\.([a-z0-9_]+) \(([a-z0-9_]+)\);/g)];

    // 1. Exactly 111 covering indexes created
    expect(indexMatches.length).toBe(111);

    // 2. All index names follow idx_<table_name>_<column_name> convention and are unique
    const indexNames = new Set<string>();
    for (const match of indexMatches) {
      const [, idxName, tableName, colName] = match;
      expect(idxName).toBe(`idx_${tableName}_${colName}`);
      expect(indexNames.has(idxName)).toBe(false);
      indexNames.add(idxName);
    }
    expect(indexNames.size).toBe(111);

    // 3. Verifies that pre-covered foreign keys are intentionally skipped (not redundant)
    expect(mig06).not.toContain("idx_admins_user_id");
    expect(mig06).not.toContain("idx_users_user_id");
    expect(mig06).not.toContain("idx_user_profile_user_id");
    expect(mig06).not.toContain("idx_blog_likes_blog_id");
    expect(mig06).not.toContain("idx_review_votes_review_id");
    expect(mig06).not.toContain("idx_role_permissions_role_id");

    // 4. Critical query joins are covered
    expect(mig06).toContain("CREATE INDEX IF NOT EXISTS idx_venues_type_id ON public.venues (type_id);");
    expect(mig06).toContain("CREATE INDEX IF NOT EXISTS idx_venues_area_id ON public.venues (area_id);");
    expect(mig06).toContain("CREATE INDEX IF NOT EXISTS idx_vendors_category_id ON public.vendors (category_id);");
    expect(mig06).toContain("CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON public.vendors (user_id);");
    expect(mig06).toContain("CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings (user_id);");
    expect(mig06).toContain("CREATE INDEX IF NOT EXISTS idx_enquiries_user_id ON public.enquiries (user_id);");
    expect(mig06).toContain("CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites (user_id);");
    expect(mig06).toContain("CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments (user_id);");
  });

  it("defines Migration 13 pg_trgm GIN search indexes, numeric plate pricing, and column grants", () => {
    const mig13 = stripSqlComments(readMigration("20261112180013_trigram_search_and_numeric_plate_pricing.sql"));

    // DB-002: Trigram extension and 5 GIN indexes
    expect(mig13).toContain("CREATE EXTENSION IF NOT EXISTS pg_trgm;");
    expect(mig13).toContain("CREATE INDEX IF NOT EXISTS idx_venues_venue_name_trgm");
    expect(mig13).toContain("ON public.venues USING gin (venue_name gin_trgm_ops)");
    expect(mig13).toContain("CREATE INDEX IF NOT EXISTS idx_venues_locality_name_trgm");
    expect(mig13).toContain("ON public.venues USING gin (locality_name gin_trgm_ops)");
    expect(mig13).toContain("CREATE INDEX IF NOT EXISTS idx_venues_base_city_trgm");
    expect(mig13).toContain("ON public.venues USING gin (base_city gin_trgm_ops)");
    expect(mig13).toContain("CREATE INDEX IF NOT EXISTS idx_vendors_vendor_name_trgm");
    expect(mig13).toContain("ON public.vendors USING gin (vendor_name gin_trgm_ops)");
    expect(mig13).toContain("CREATE INDEX IF NOT EXISTS idx_vendors_description_trgm");
    expect(mig13).toContain("ON public.vendors USING gin (description gin_trgm_ops)");

    // BE-001: Structured numeric columns and B-tree indexes
    expect(mig13).toContain("ADD COLUMN IF NOT EXISTS min_plate_price NUMERIC");
    expect(mig13).toContain("ADD COLUMN IF NOT EXISTS max_plate_price NUMERIC");
    expect(mig13).toContain("CREATE INDEX IF NOT EXISTS idx_venues_min_plate_price ON public.venues (min_plate_price)");
    expect(mig13).toContain("CREATE INDEX IF NOT EXISTS idx_venues_max_plate_price ON public.venues (max_plate_price)");

    // Least-privilege column grants for anon and authenticated
    expect(mig13).toMatch(/GRANT\s+SELECT\s*\(\s*min_plate_price,\s*max_plate_price\s*\)\s*ON\s+public\.venues\s+TO\s+anon,\s*authenticated/i);
    expect(mig13).not.toMatch(/GRANT\s+ALL/i);
  });
});

