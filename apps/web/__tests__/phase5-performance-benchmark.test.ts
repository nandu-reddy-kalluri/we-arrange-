import { describe, expect, it, vi, beforeEach } from "vitest";
import { apiClient } from "@we-arrange/api-client";
import {
  clearCatalogMemoryCache,
  fetchPaginatedVenues,
  fetchPaginatedVendors,
  fetchVenueDetail,
  fetchVendorDetail,
  getVendorCategoryDetailMap,
} from "@/services/catalog/catalogApi";

describe("Phase 5: Performance & Optimization Benchmarks", () => {
  beforeEach(() => {
    clearCatalogMemoryCache();
    vi.restoreAllMocks();
  });

  it("deduplicates concurrent type and category map fetches", async () => {
    let callCount = 0;
    vi.spyOn(apiClient, "get").mockImplementation(async (url: string) => {
      if (url === "/api/vendors/categories") {
        callCount++;
        // Simulate real network delay
        await new Promise((r) => setTimeout(r, 20));
        return {
          ok: true,
          status: 200,
          error: null,
          data: [{ category_id: 1, category_name: "Bridal Makeup", slug: "bridal-makeup" }],
        };
      }
      return { ok: false, status: 404, error: "Not found", data: null };
    });

    // Fire 5 concurrent calls
    const results = await Promise.all([
      getVendorCategoryDetailMap(),
      getVendorCategoryDetailMap(),
      getVendorCategoryDetailMap(),
      getVendorCategoryDetailMap(),
      getVendorCategoryDetailMap(),
    ]);

    expect(results).toHaveLength(5);
    expect(callCount).toBe(1); // Exactly 1 network request dispatched despite 5 concurrent callers
  });

  it("serves repeated paginated catalog searches instantly from memory cache (< 5ms)", async () => {
    let searchApiCalls = 0;
    vi.spyOn(apiClient, "get").mockImplementation(async (url: string) => {
      if (url === "/api/search") {
        searchApiCalls++;
        await new Promise((r) => setTimeout(r, 30));
        return {
          ok: true,
          status: 200,
          error: null,
          data: {
            venues: {
              items: [{ venue_id: 101, venue_name: "Taj Falaknuma Palace", slug: "taj-falaknuma" }],
              meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
            },
          },
        };
      }
      if (url === "/api/venues/types") {
        return { ok: true, status: 200, error: null, data: [{ type_id: 1, type_name: "Palace" }] };
      }
      return { ok: false, status: 404, error: "Not found", data: null };
    });

    const start1 = performance.now();
    const firstCall = await fetchPaginatedVenues({ q: "Falaknuma" });
    const duration1 = performance.now() - start1;

    expect(firstCall.items).toHaveLength(1);
    expect(searchApiCalls).toBe(1);
    expect(duration1).toBeGreaterThanOrEqual(25);

    const start2 = performance.now();
    const cachedCall = await fetchPaginatedVenues({ q: "Falaknuma" });
    const duration2 = performance.now() - start2;

    expect(cachedCall.items).toHaveLength(1);
    expect(searchApiCalls).toBe(1); // 0 additional API calls!
    expect(duration2).toBeLessThan(5); // Sub-millisecond response from memory cache
  });

  it("caches venue detail responses and prevents duplicate lookups during navigation", async () => {
    let detailCalls = 0;
    vi.spyOn(apiClient, "get").mockImplementation(async (url: string) => {
      if (url.startsWith("/api/venues/itc-kohenur")) {
        detailCalls++;
        await new Promise((r) => setTimeout(r, 25));
        return {
          ok: true,
          status: 200,
          error: null,
          data: {
            venue: {
              venue_id: 443,
              type_id: 17,
              venue_name: "ITC Kohenur",
              slug: "itc-kohenur",
              price_range: "1,500",
            },
            pricing: [],
            packages: [],
            menus: [],
            amenities: [],
            features: [],
            rooms: [],
            parking: [],
            gallery: [],
            videos: [],
            faqs: [],
            availability: [],
          },
        };
      }
      if (url === "/api/venues/types") {
        return { ok: true, status: 200, error: null, data: [] };
      }
      return { ok: false, status: 404, error: "Not found", data: null };
    });

    const res1 = await fetchVenueDetail("itc-kohenur");
    expect(res1.ok).toBe(true);
    expect(detailCalls).toBe(1);

    const startCached = performance.now();
    const res2 = await fetchVenueDetail("itc-kohenur");
    const cachedDuration = performance.now() - startCached;

    expect(res2.ok).toBe(true);
    expect(detailCalls).toBe(1); // Reused cache!
    expect(cachedDuration).toBeLessThan(5);
  });
});
