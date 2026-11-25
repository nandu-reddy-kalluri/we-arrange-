import { cache } from "react";
import { createPublicAnonClient } from "@we-arrange/database/clients";
import {
  getPublicVenueBySlugOrId,
  listVenueTypes,
  listPublicVenues,
} from "@we-arrange/service-venue";
import {
  getPublicVendorBySlugOrId,
  listVendorCategories,
  listPublicVendors,
} from "@we-arrange/service-vendor";
import type { Venue } from "@/mock-data/venues";
import type { Vendor } from "@/mock-data/vendors";
import {
  transformVenueDetailPayload,
  transformVendorDetailPayload,
  mapDbVenueToUi,
  mapDbVendorToUi,
  type VenueDetailResult,
  type VendorDetailResult,
} from "./catalogMappers";

export type { VenueDetailResult, VendorDetailResult };

/**
 * Server-side memoized venue detail loader (ARCH-002 & BE-003).
 * Shared across generateMetadata and Page component via React cache() — executes exactly once per SSR request.
 */
export const getCachedServerVenueDetail = cache(
  async (slugOrId: string): Promise<VenueDetailResult | null> => {
    const term = slugOrId.trim();
    if (!term) return null;
    try {
      const supabase = createPublicAnonClient();
      const [payload, types] = await Promise.all([
        getPublicVenueBySlugOrId(supabase, term),
        listVenueTypes(supabase),
      ]);
      const typeMap = new Map<number, string>();
      for (const t of types ?? []) {
        typeMap.set(t.type_id, t.type_name);
      }
      return transformVenueDetailPayload(payload as Record<string, unknown>, typeMap);
    } catch {
      return null;
    }
  }
);

/**
 * Server-side memoized vendor detail loader (ARCH-002 & BE-003).
 * Shared across generateMetadata and Page component via React cache() — executes exactly once per SSR request.
 */
export const getCachedServerVendorDetail = cache(
  async (slugOrId: string): Promise<VendorDetailResult | null> => {
    const term = slugOrId.trim();
    if (!term) return null;
    try {
      const supabase = createPublicAnonClient();
      const [payload, categories] = await Promise.all([
        getPublicVendorBySlugOrId(supabase, term),
        listVendorCategories(supabase),
      ]);
      const catMap = new Map<number, { slug?: string; category_name?: string }>();
      for (const c of categories ?? []) {
        catMap.set(c.category_id, { slug: c.slug ?? undefined, category_name: c.category_name });
      }
      return transformVendorDetailPayload(payload as Record<string, unknown>, catMap);
    } catch {
      return null;
    }
  }
);

/**
 * Server-side memoized venue directory loader (FE-002).
 * Fetches page 1 of public venues with type metadata to eliminate client-side skeleton waterfall.
 */
export const getCachedServerVenuesDirectory = cache(
  async (
    page = 1,
    limit = 20
  ): Promise<{ items: Venue[]; total: number; totalPages: number }> => {
    try {
      const supabase = createPublicAnonClient();
      const [venuesRes, venueTypes] = await Promise.all([
        listPublicVenues(supabase, { page, limit }, { includeMedia: true }),
        listVenueTypes(supabase),
      ]);
      const typeMap = new Map<number, string>();
      for (const t of venueTypes ?? []) {
        typeMap.set(t.type_id, t.type_name);
      }
      const items = (venuesRes.items ?? []).map((row) =>
        mapDbVenueToUi(row as unknown as Record<string, unknown>, undefined, typeMap)
      );
      const total = venuesRes.meta?.total ?? items.length;
      return {
        items,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      };
    } catch {
      return { items: [], total: 0, totalPages: 1 };
    }
  }
);

/**
 * Server-side memoized vendor directory loader (FE-002).
 * Fetches page 1 of public vendors for a category to eliminate client-side skeleton waterfall.
 */
export const getCachedServerVendorsDirectory = cache(
  async (
    category?: string,
    page = 1,
    limit = 20
  ): Promise<{ items: Vendor[]; total: number; totalPages: number }> => {
    try {
      const supabase = createPublicAnonClient();
      const [vendorsRes, categories] = await Promise.all([
        listPublicVendors(supabase, {
          page,
          limit,
          category: category || undefined,
        }),
        listVendorCategories(supabase),
      ]);
      const catMap = new Map<number, string>();
      for (const c of categories ?? []) {
        catMap.set(c.category_id, c.slug ?? "");
      }
      const items = (vendorsRes.items ?? []).map((row) =>
        mapDbVendorToUi(row as unknown as Record<string, unknown>, catMap)
      );
      const total = vendorsRes.meta?.total ?? items.length;
      return {
        items,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      };
    } catch {
      return { items: [], total: 0, totalPages: 1 };
    }
  }
);

