import type { SupabaseClient } from "@supabase/supabase-js";
import { mapDatabaseError } from "@we-arrange/database/errors";
import type { Database } from "@we-arrange/database/types";
import { listPublicVenues } from "@we-arrange/service-venue";
import { listPublicVendors } from "@we-arrange/service-vendor";

export async function runUnifiedCatalogSearch(
  supabase: SupabaseClient<Database>,
  input: {
    q?: string;
    scope: "all" | "venues" | "vendors";
    city?: string;
    locality?: string;
    category?: string;
    type?: string;
    space?: string;
    minCapacity?: number;
    maxCapacity?: number;
    minPlatePrice?: number;
    maxPlatePrice?: number;
    priceOnRequestOnly?: boolean;
    minRating?: number;
    verifiedOnly?: boolean;
    sortBy?: "relevance" | "rating" | "reviews" | "capacity" | "newest";
    page: number;
    limit: number;
  }
) {
  const [venuesRes, vendorsRes] = await Promise.all([
    input.scope === "all" || input.scope === "venues"
      ? listPublicVenues(
          supabase,
          {
            q: input.q,
            city: input.city,
            locality: input.locality,
            type: input.type,
            space: input.space,
            minCapacity: input.minCapacity,
            maxCapacity: input.maxCapacity,
            minPlatePrice: input.minPlatePrice,
            maxPlatePrice: input.maxPlatePrice,
            priceOnRequestOnly: input.priceOnRequestOnly,
            sortBy: input.sortBy,
            page: input.page,
            limit: input.limit,
          },
          { includeMedia: true }
        )
      : Promise.resolve({
          items: [],
          meta: { page: input.page, limit: input.limit, total: 0, totalPages: 0 },
        }),
    input.scope === "all" || input.scope === "vendors"
      ? listPublicVendors(supabase, {
          q: input.q,
          category: input.category,
          city: input.city,
          verifiedOnly: input.verifiedOnly,
          minRating: input.minRating,
          sortBy:
            input.sortBy === "rating" || input.sortBy === "reviews" || input.sortBy === "newest"
              ? input.sortBy
              : "relevance",
          page: input.page,
          limit: input.limit,
        })
      : Promise.resolve({
          items: [],
          meta: { page: input.page, limit: input.limit, total: 0, totalPages: 0 },
        }),
  ]);

  return {
    scope: input.scope,
    venues: venuesRes,
    vendors: vendorsRes,
  };
}

export async function listPopularSearches(
  supabase: SupabaseClient<Database>,
  limit = 12
) {
  const safeLimit = Math.min(30, Math.max(1, limit));
  const { data, error } = await supabase
    .from("popular_searches")
    .select("popular_search_id, search_query, search_type, search_count, last_searched_at")
    .order("search_count", { ascending: false, nullsFirst: false })
    .limit(safeLimit);

  if (error) throw mapDatabaseError(error, "Failed to load popular searches.");
  return data ?? [];
}

