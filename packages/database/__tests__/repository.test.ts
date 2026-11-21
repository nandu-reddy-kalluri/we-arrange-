import path from "node:path";
import { describe, expect, it } from "vitest";
import { AppError, mapDatabaseError } from "../src/errors";
import {
  buildPaginationMeta,
  MAX_LIMIT,
  normalizePagination,
  PUBLIC_VENDOR_COLUMNS,
  PUBLIC_VENUE_COLUMNS,
  sanitizeVendorMetadata,
  slugify,
  verifyMigrationInventory,
} from "../src/repository";

describe("Database Foundation: Errors & Repository Helpers", () => {
  it("maps PostgreSQL and PostgREST error codes cleanly without leaking SQL", () => {
    const conflict = mapDatabaseError({ code: "23505", message: "duplicate key value violates unique constraint ..." });
    expect(conflict).toBeInstanceOf(AppError);
    expect(conflict.status).toBe(409);
    expect(conflict.code).toBe("CONFLICT");
    expect(conflict.message).not.toContain("constraint");

    const notFound = mapDatabaseError({ code: "PGRST116", message: "The result contains 0 rows" });
    expect(notFound.status).toBe(404);
    expect(notFound.code).toBe("NOT_FOUND");

    const forbidden = mapDatabaseError({ code: "42501", message: "permission denied for table venues" });
    expect(forbidden.status).toBe(403);
    expect(forbidden.message).not.toContain("venues");

    const unmigrated = mapDatabaseError({ code: "42P01", message: "relation public.quotes does not exist" });
    expect(unmigrated.status).toBe(503);
    expect(unmigrated.code).toBe("SERVICE_UNAVAILABLE");
  });

  it("normalizes pagination and calculates meta accurately", () => {
    expect(normalizePagination({ page: -3, limit: 500 })).toEqual({
      page: 1,
      limit: MAX_LIMIT,
      from: 0,
      to: MAX_LIMIT - 1,
    });

    expect(normalizePagination({ page: 3, limit: 10 })).toEqual({
      page: 3,
      limit: 10,
      from: 20,
      to: 29,
    });

    expect(buildPaginationMeta(2, 10, 25)).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
    });
  });

  it("excludes PII and internal identifiers from public column lists and vendor metadata", () => {
    expect(PUBLIC_VENUE_COLUMNS).not.toMatch(/\bphone\b/);
    expect(PUBLIC_VENUE_COLUMNS).not.toMatch(/\bexternal_id\b/);
    expect(PUBLIC_VENUE_COLUMNS).not.toMatch(/\bsource_url\b/);
    expect(PUBLIC_VENDOR_COLUMNS).not.toMatch(/\bmetadata\b/);
    expect(PUBLIC_VENDOR_COLUMNS).not.toMatch(/\buser_id\b/);

    const sanitized = sanitizeVendorMetadata({
      phone: "+91 9999999999",
      phone_numbers_raw: ["9999999999"],
      email: "private@vendor.com",
      email_raw: "private@vendor.com",
      import_source: "scrape",
      city: "Hyderabad",
      primary_locality: "Jubilee Hills",
      price_subtext: "On Request",
    });

    expect(sanitized).toEqual({
      city: "Hyderabad",
      primary_locality: "Jubilee Hills",
      price_subtext: "On Request",
    });
    expect("phone" in sanitized).toBe(false);
    expect("email" in sanitized).toBe(false);
    expect("import_source" in sanitized).toBe(false);
  });

  it("slugifies names cleanly and verifies ordered migration inventory", () => {
    expect(slugify("The Taj Falaknuma Palace & Lawns!")).toBe("the-taj-falaknuma-palace-lawns");
    const repoRoot = path.resolve(__dirname, "../../..");
    const report = verifyMigrationInventory(path.join(repoRoot, "supabase", "migrations"));
    expect(report.count).toBe(12);
    expect(report.ordered).toBe(true);
    expect(report.hasUnsafeBlanketGrants).toBe(false);
  });
});

