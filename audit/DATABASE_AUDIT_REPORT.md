# DATABASE AND SUPABASE AUDIT REPORT: YouMarriageWeArrange
**Target System:** YouMarriageWeArrange Supabase Database (`zujjiiljvjwgcxtaqype` - ap-south-1)  
**Auditor Role:** Principal Database Architect & PostgreSQL Performance Specialist  
**Date of Audit:** 2026-11-22  
**Status:** **CONFIRMED SCHEMA, MIGRATION & RLS AUDIT**

---

## 1. Executive Summary

A comprehensive database audit was executed across all 12 Supabase SQL migrations (`supabase/migrations/`), database client configurations (`packages/database/src/clients.ts`), entity models (`packages/database/src/database.types.ts`), and PostgREST access patterns.

### Overall Database Posture: **OPERATIONAL GAPS & MISSING RUNTIME OPTIMIZATIONS**

The schema design reflects solid relational modeling and thorough column-scoped permission grants. However, severe operational risks and missing indexes threaten production stability:

1. **Unapplied Migration Status**: All 12 SQL migration scripts in `supabase/migrations/` remain marked `-- STATUS: PREPARED — NOT APPLIED`. Until executed via `supabase db push`, the live database lacks foreign key indexes, slug columns, and hardened RLS policies.
2. **111 Unindexed Foreign Keys**: Migration 06 (`20261112170006_foreign_key_indexes.sql`) documents 111 foreign keys across the schema that lack covering indexes. In production, unindexed foreign keys cause sequential scans on parent updates and deletes.
3. **Zero Trigram (`pg_trgm`) Search Indexes**: All search queries in `venueService.ts` and `vendorService.ts` use leading-wildcard matching (`ILIKE '%term%'`). Standard B-tree indexes cannot accelerate leading wildcards; without PostgreSQL GIN/trigram indexes, every search query performs a full sequential table scan.
4. **Missing Numeric Plate Price Column**: In `public.venues`, pricing is stored as unparsed text strings (`venue_price_tag TEXT`). Because PostgreSQL cannot index or filter text strings numerically, the application is forced to download up to 5,000 rows into Node.js memory to evaluate regex bounds.
5. **Hardcoded Mock Data Bloat in Database Package**: Over 1,500 lines of mock arrays are committed directly inside `@we-arrange/database/src/`, creating confusion and bundle bloat.

---

## 2. Table-by-Table RLS Status and Policy Matrix

| Table Name | RLS Enabled? | SELECT Policy | INSERT Policy | UPDATE Policy | DELETE Policy | Security & Performance Assessment |
|---|---|---|---|---|---|---|
| `admins` | Inherited | Own row or active admin | None (service_role) | None (service_role) | None (service_role) | **SECURE**. Protected staff roster. |
| `app_settings` | Inherited | None (0 client grants) | None (0 client grants) | None (0 client grants) | None (0 client grants) | **SECURE**. Server-only service_role access. |
| `blogs` | Inherited | Published blogs | None (staff) | None (staff) | None (staff) | **RESOLVED IN LOCAL M03**. Public read enabled. |
| `bookings` | Inherited | Customer own / Vendor linked / Staff | None (server-only) | None (server-only) | None (service_role) | **SECURE**. Mutations locked to server APIs. |
| `comparison_sheets`| ✅ Explicit | Customer own (non-draft) / Staff | None (service_role) | None (service_role) | None (service_role) | **SECURE**. Drafts shielded from couples. |
| `coupons` | Inherited | None (SELECT revoked) | None | None | None | **SECURE HARDENING**. Client scraping blocked. |
| `enquiries` | Inherited | Customer own / Staff | Own user_id + Pending | None (service_role) | None (service_role) | **SECURE**. Staff assignment protected. |
| `enquiry_messages` | Inherited | Customer own / Staff | Own enquiry + sender_id | None | None | **SECURE**. Sender-verified ownership. |
| `favorites` | Inherited | Own user_id | Own user_id + own collection | Own favorite | Own favorite | **SECURE**. Collection IDOR prevented. |
| `invites` | Inherited | Own user_id | Own user_id | Own user_id | Own user_id | **SECURE**. Customer self-managed. |
| `payments` | Inherited | Own user_id | None (service_role) | None (service_role) | None (service_role) | **SECURE**. Mutations via webhook only. |
| `quotes` | ✅ Explicit | Customer own (non-draft) / Staff | None (service_role) | None (service_role) | None (service_role) | **SECURE**. Draft quotes hidden from clients. |
| `reviews` | Inherited | Published / Own pending / Admin | Own user_id + Pending | Own review (text/rating only) | Own review | **SECURE**. Status mutation revoked from client. |
| `roles` | Inherited | Staff / User own role | None (service_role) | None (service_role) | None (service_role) | **SECURE**. Zero client modification. |
| `user_profile` | Inherited | Own user_id / Staff | Own user_id | Own user_id | None | **SECURE**. Profile self-managed. |
| `users` | Inherited | Own user_id / Staff | None (trigger only) | Own row (name/phone only) | None | **SECURE**. Role/status mutation blocked. |
| `vendor_contacts` | Inherited | Linked vendor / Staff | Linked vendor | Linked vendor | Linked vendor | **SECURE**. Scraped contacts hidden from public. |
| `vendors` | Inherited | Public: Active / Vendor: Own | None (server API) | Vendor own (safe fields) | None (service_role) | **SECURE**. Scraped PII stripped at grant level. |
| `venue_contacts` | Inherited | Staff only | None (service_role) | None (service_role) | None (service_role) | **SECURE**. Public access completely denied. |
| `venues` | Inherited | Active venues | None (service_role) | None (service_role) | None (service_role) | **SECURE**. Phone and member IDs stripped. |

---

## 3. Database Bottlenecks and Missing Indexes

### DB-001: 111 Missing Foreign Key Covering Indexes
- **Component:** `supabase/migrations/20261112170006_foreign_key_indexes.sql`
- **Root Cause:** In PostgreSQL, creating a foreign key constraint (`REFERENCES parent_table(id)`) does NOT automatically create an index on the referencing foreign key column.
- **Technical Impact:**
  - Whenever a query filters child tables by parent ID (e.g., `venue_amenities.venue_id`, `vendor_pricing.vendor_id`), PostgreSQL must sequentially scan the entire child table.
  - Whenever a parent record is updated or deleted, PostgreSQL must lock and scan all referencing child tables to enforce referential integrity.
- **Recommended Fix:** Apply Migration 06 to create covering B-tree indexes for all 111 foreign keys:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_venue_amenities_venue_id ON public.venue_amenities (venue_id);
  CREATE INDEX IF NOT EXISTS idx_venue_pricing_venue_id ON public.venue_pricing (venue_id);
  CREATE INDEX IF NOT EXISTS idx_venue_gallery_venue_id ON public.venue_gallery (venue_id);
  CREATE INDEX IF NOT EXISTS idx_vendor_pricing_vendor_id ON public.vendor_pricing (vendor_id);
  CREATE INDEX IF NOT EXISTS idx_vendor_gallery_vendor_id ON public.vendor_gallery (vendor_id);
  ```

---

### DB-002: Zero Trigram Indexes for Substring Search (`ILIKE '%term%'`)
- **Component:** `public.venues` (`venue_name`, `locality_name`, `base_city`), `public.vendors` (`vendor_name`, `description`)
- **Root Cause:** Standard B-tree indexes only support prefix matching (`ILIKE 'term%'`). The application code performs substring matching (`ILIKE '%term%'`).
- **Technical Impact:** Every search for a venue, locality, or vendor causes a full table scan. As the dataset expands, query time grows linearly with row count.
- **Recommended Fix:** Enable `pg_trgm` and add GIN trigram indexes in a new migration:
  ```sql
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  CREATE INDEX IF NOT EXISTS idx_venues_name_trgm ON public.venues USING gin (venue_name gin_trgm_ops);
  CREATE INDEX IF NOT EXISTS idx_venues_locality_trgm ON public.venues USING gin (locality_name gin_trgm_ops);
  CREATE INDEX IF NOT EXISTS idx_vendors_name_trgm ON public.vendors USING gin (vendor_name gin_trgm_ops);
  ```

---

### DB-003: Missing Numeric Price Column
- **Component:** `public.venues.venue_price_tag`
- **Root Cause:** Budget was stored as unstructured text (`"₹ 1,000 per plate"`) rather than a structured numeric price.
- **Technical Impact:** Forces the backend to scan 5,000 rows in memory to compute budget bounds.
- **Recommended Fix:** Add structured numeric columns with B-tree indexes:
  ```sql
  ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS min_plate_price NUMERIC;
  ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS max_plate_price NUMERIC;
  CREATE INDEX IF NOT EXISTS idx_venues_plate_price ON public.venues (min_plate_price);
  ```

---
*Report certified by Principal Database Architect & PostgreSQL Performance Specialist.*
