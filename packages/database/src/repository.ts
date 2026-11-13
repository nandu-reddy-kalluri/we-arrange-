import fs from "node:fs";
import path from "node:path";
import type { Json } from "./database.types";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 50;

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function normalizePagination(input: PaginationInput = {}): {
  page: number;
  limit: number;
  from: number;
  to: number;
} {
  const rawPage = Number.isFinite(input.page) ? Math.floor(Number(input.page)) : DEFAULT_PAGE;
  const rawLimit = Number.isFinite(input.limit) ? Math.floor(Number(input.limit)) : DEFAULT_LIMIT;
  const page = Math.max(1, rawPage);
  const limit = Math.min(MAX_LIMIT, Math.max(1, rawLimit));
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { page, limit, from, to };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const safeTotal = Math.max(0, total);
  return {
    page,
    limit,
    total: safeTotal,
    totalPages: safeTotal === 0 ? 0 : Math.ceil(safeTotal / limit),
  };
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Strict non-PII public projection matching Migration 01 & 02 column grants
export const PUBLIC_VENUE_COLUMNS = [
  "venue_id",
  "type_id",
  "venue_name",
  "slug",
  "description",
  "area_id",
  "address",
  "rating",
  "price_range",
  "capacity",
  "status",
  "created_at",
  "locality_name",
  "primary_locality",
  "base_city",
  "pincode",
  "short_summary",
  "about_venue",
  "reviews_count",
  "best_rating",
  "worst_rating",
  "price_subtext",
  "currency",
  "venue_price_tag",
  "category_price_suffix_text",
  "destination_price",
  "destination_price_unit",
  "guest_count_min",
  "guest_count_max",
  "indoor_outdoor_spaces",
  "catering_policy",
  "decor_policy",
  "availability_start_time",
  "availability_end_time",
  "website",
  "google_maps",
  "features",
  "rules_policies",
].join(", ");

export const PUBLIC_VENDOR_COLUMNS = [
  "vendor_id",
  "category_id",
  "vendor_name",
  "slug",
  "description",
  "logo",
  "cover_image",
  "rating",
  "is_verified",
  "status",
  "created_at",
  "updated_at",
].join(", ");

// Whitelist safe non-PII metadata keys if service_role reads vendors.metadata internally
const SAFE_VENDOR_METADATA_KEYS = new Set([
  "city",
  "primary_locality",
  "locality",
  "base_city",
  "service_type",
  "price_subtext",
  "vendor_price",
  "starting_price_with_unit",
  "starting_price_raw",
  "small_event_price",
  "small_event_price_label",
  "small_event_price_duration",
  "specialisation",
  "reviews_count",
  "best_rating",
  "worst_rating",
]);

export function sanitizeVendorMetadata(metadata: Json | null | undefined): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }
  const safe: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(metadata)) {
    if (SAFE_VENDOR_METADATA_KEYS.has(k)) {
      safe[k] = v;
    }
  }
  return safe;
}

export interface MigrationCheckReport {
  directory: string;
  count: number;
  files: string[];
  ordered: boolean;
  hasUnsafeBlanketGrants: boolean;
}

export function verifyMigrationInventory(migrationsDir: string): MigrationCheckReport {
  if (!fs.existsSync(migrationsDir)) {
    return {
      directory: migrationsDir,
      count: 0,
      files: [],
      ordered: false,
      hasUnsafeBlanketGrants: false,
    };
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const prefixes = files.map((f) => f.split("_")[0] ?? "");
  const ordered = prefixes.every((val, idx) => idx === 0 || val > prefixes[idx - 1]);

  let hasUnsafeBlanketGrants = false;
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    if (
      /GRANT\s+ALL\s+PRIVILEGES\s+ON\s+ALL\s+TABLES/i.test(sql) ||
      /GRANT\s+SELECT\s+ON\s+public\.(?:venue_contacts|vendor_contacts)\s+TO\s+anon/i.test(sql)
    ) {
      hasUnsafeBlanketGrants = true;
    }
  }

  return {
    directory: migrationsDir,
    count: files.length,
    files,
    ordered,
    hasUnsafeBlanketGrants,
  };
}

