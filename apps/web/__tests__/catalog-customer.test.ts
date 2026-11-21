import { describe, expect, it, vi, afterEach } from "vitest";
import { PUBLIC_VENDOR_COLUMNS, PUBLIC_VENUE_COLUMNS } from "@we-arrange/database/repository";
import { venueQuerySchema } from "@we-arrange/validation";
import { getPublicVenueBySlugOrId, listPublicVenues } from "@we-arrange/service-venue";
import { apiClient } from "@we-arrange/api-client";
import {
  fetchSavedCatalogItems,
  fetchVendorDetail,
  fetchVenueDetail,
  mapDbVendorToUi,
  mapDbVenueToUi,
} from "@/services/catalog/catalogApi";
import {
  adminVerifyVendor,
  getPublicVendorBySlugOrId,
  normalizeVendorCategorySlug,
  updateOwnedVendorProfile,
} from "@we-arrange/service-vendor";
import { addCustomerFavorite, updateCustomerProfile } from "@we-arrange/service-customer";
import {
  createSignedMediaUploadUrl,
  sanitizeUploadFileName,
} from "@/services/storage/mediaAdapter";
import { createMockSupabaseClient } from "./helpers/mockSupabase";

describe("Modules 3-8: Customer, Vendor, Venue, Search & Media Security", () => {
  it("projects strictly non-PII columns on venue and vendor public queries", async () => {
    let capturedColumns = "";
    const client = createMockSupabaseClient({
      onQuery: (table, _op, state) => {
        capturedColumns = state.columns ?? "";
        if (table === "venues") {
          return {
            data: [{ venue_id: 1, venue_name: "Falaknuma", slug: "falaknuma", status: "Active" }],
            count: 1,
          };
        }
        return { data: [], count: 0 };
      },
    });

    const list = await listPublicVenues(client, { city: "Hyderabad", sortBy: "rating" });
    expect(list.items).toHaveLength(1);
    expect(capturedColumns).toBe(PUBLIC_VENUE_COLUMNS);
    expect(capturedColumns).not.toMatch(/\bphone\b/);
    expect(capturedColumns).not.toMatch(/\bexternal_id\b/);

    const detail = await getPublicVenueBySlugOrId(client, "falaknuma");
    expect(detail.venue.venue_id).toBe(1);
  });

  it("normalizes frontend vendor category aliases and strips vendor metadata PII", async () => {
    expect(normalizeVendorCategorySlug("makeup")).toBe("bridal-makeup");
    expect(normalizeVendorCategorySlug("photography")).toBe("photographers");
    expect(normalizeVendorCategorySlug("decor")).toBe("decorators");

    let vendorCols = "";
    const client = createMockSupabaseClient({
      onQuery: (table, _op, state) => {
        if (table === "vendors") {
          vendorCols = state.columns ?? "";
          return {
            data: { vendor_id: 12, vendor_name: "Pixel Craft", slug: "pixel-craft", status: "Active" },
          };
        }
        return { data: [] };
      },
    });

    const detail = await getPublicVendorBySlugOrId(client, "12");
    expect(detail.vendor.vendor_id).toBe(12);
    expect(vendorCols).toBe(PUBLIC_VENDOR_COLUMNS);
    expect(vendorCols).not.toMatch(/\bmetadata\b/);
    expect(vendorCols).not.toMatch(/\buser_id\b/);
  });

  it("prevents vendor self-verification and lets admin verify vendors", async () => {
    let vendorUpdatePayload: Record<string, unknown> = {};
    let vendorUpdateFilters: Array<{ method: string; args: unknown[] }> = [];
    const vendorClient = createMockSupabaseClient({
      onQuery: (table, op, state) => {
        if (table === "vendors" && op === "update") {
          vendorUpdatePayload = state.payload as Record<string, unknown>;
          vendorUpdateFilters = state.filters;
          return { data: { vendor_id: 12, vendor_name: "Studio X", is_verified: false } };
        }
        return { data: null };
      },
    });

    await updateOwnedVendorProfile(vendorClient, 12, "user-v", {
      vendorName: "Studio X",
    });
    expect("is_verified" in vendorUpdatePayload).toBe(false);
    expect("status" in vendorUpdatePayload).toBe(false);
    expect(vendorUpdateFilters.some((f) => f.args[0] === "user_id")).toBe(false);

    const verified = await adminVerifyVendor(vendorClient, 12, { isVerified: true });
    expect(verified).toMatchObject({ vendor_id: 12 });
    expect(vendorUpdatePayload.is_verified).toBe(true);
    expect(vendorUpdatePayload.status).toBe("Active");
  });

  it("blocks cross-user collection assignment on favorites (IDOR prevention) & merges preferences", async () => {
    const client = createMockSupabaseClient({
      onQuery: (table) => {
        if (table === "collections") return { data: null };
        return { data: [] };
      },
    });

    await expect(
      addCustomerFavorite(client, "user-a", { venueId: 5, collectionId: 999 })
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });

    let savedPrefs: Record<string, unknown> = {};
    const prefClient = createMockSupabaseClient({
      onQuery: (table, op, state) => {
        if (table === "user_profile" && op === "select") {
          return { data: { profile_id: 1, preferences: { emailNotifications: true } } };
        }
        if (table === "user_profile" && op === "update") {
          savedPrefs = (state.payload as Record<string, unknown>).preferences as Record<string, unknown>;
          return { data: { profile_id: 1 } };
        }
        if (table === "users") {
          return { data: { user_id: "user-a", email: "a@b.com", full_name: "A", phone: null } };
        }
        return { data: null };
      },
    });

    await updateCustomerProfile(prefClient, "user-a", {
      preferences: { preferredCity: "Hyderabad" },
    });
    expect(savedPrefs).toEqual({ emailNotifications: true, preferredCity: "Hyderabad" });
  });

  it("signs Cloudflare R2 upload URLs safely and fails closed when unconfigured", () => {
    expect(sanitizeUploadFileName("../../etc/passwd?a=1")).toBe("passwd-a-1");

    expect(() =>
      createSignedMediaUploadUrl(
        {
          scope: "avatars",
          ownerId: "user-1",
          fileName: "avatar.png",
          contentType: "image/png",
          fileSizeBytes: 1024,
        },
        null
      )
    ).toThrow(/not configured/i);

    const signed = createSignedMediaUploadUrl(
      {
        scope: "avatars",
        ownerId: "user-1",
        fileName: "photo.jpg",
        contentType: "image/jpeg",
        fileSizeBytes: 2048,
      },
      {
        accountId: "acc123",
        accessKeyId: "ak123",
        secretAccessKey: "sk123",
        bucket: "ymwa-media",
        publicBaseUrl: "https://cdn.ymwa.in",
      }
    );

    expect(signed.method).toBe("PUT");
    expect(signed.uploadUrl).toContain("X-Amz-Signature=");
    expect(signed.publicUrl.startsWith("https://cdn.ymwa.in/avatars/user-1/")).toBe(true);
  });

  it("supports venue locality/space/multi-type filters, batched gallery media, and UI mapping", async () => {
    const parsed = venueQuerySchema.parse({ space: "Indoor & Outdoor", locality: "Hitech City" });
    expect(parsed.space).toBe("Indoor & Outdoor");

    let venueFilters: Array<{ method: string; args: unknown[] }> = [];
    const client = createMockSupabaseClient({
      onQuery: (table, _op, state) => {
        if (table === "venue_types") {
          return { data: [{ type_id: 5 }, { type_id: 17 }] };
        }
        if (table === "venues") {
          venueFilters = state.filters;
          return {
            data: [{ venue_id: 443, venue_name: "ITC Kohenur", slug: "itc-kohenur", status: "Active" }],
            count: 1,
          };
        }
        if (table === "venue_gallery") {
          return {
            data: [{ venue_id: 443, media_url: "https://venue-images.youmarriagewearrange.com/itc/1.webp" }],
          };
        }
        return { data: [] };
      },
    });

    const result = await listPublicVenues(
      client,
      { locality: "Hitech City", type: "Hotel", space: "Indoor & Outdoor" },
      { includeMedia: true }
    );
    expect(result.items).toHaveLength(1);
    expect((result.items[0] as Record<string, unknown>).media).toEqual([
      { media_url: "https://venue-images.youmarriagewearrange.com/itc/1.webp" },
    ]);
    expect(venueFilters.some((f) => f.method === "in" && f.args[0] === "type_id")).toBe(true);
    expect(
      venueFilters.some(
        (f) => f.method === "ilike" && f.args[0] === "indoor_outdoor_spaces" && f.args[1] === "%Indoor%Outdoor%"
      )
    ).toBe(true);
    expect(
      venueFilters.some((f) => f.method === "or" && String(f.args[0]).includes("address.ilike.%Hitech City%"))
    ).toBe(true);

    const mapped = mapDbVenueToUi(
      {
        venue: {
          venue_id: 443,
          type_id: 17,
          venue_name: "ITC Kohenur",
          slug: "itc-kohenur",
          price_range: "1,000",
          venue_price_tag: null,
          base_city: "Hyderabad",
        },
        gallery: [{ media_url: "https://venue-images.youmarriagewearrange.com/itc/1.webp" }],
      },
      undefined,
      new Map([[17, "5 Star Hotel"]])
    );
    expect(mapped.pricePerPlate).toBe(1000);
    expect(mapped.type).toBe("Hotel");
    expect(mapped.imageUrl).toBe("https://venue-images.youmarriagewearrange.com/itc/1.webp");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps nested vendor detail payloads without fabricating prices or ratings", () => {
    const mapped = mapDbVendorToUi(
      {
        vendor: {
          vendor_id: 10,
          category_id: 1,
          vendor_name: "The Makeup Mafia",
          slug: "The-Makeup-Mafia-670506",
          cover_image: "https://cdn.example.com/makeup.jpg",
          rating: null,
          is_verified: false,
        },
        services: [{ service_id: 1, vendor_id: 10, service_name: "HD Bridal Makeup", description: null }],
        pricing: [{ pricing_id: 2, vendor_id: 10, service_name: "Bridal", price: 50000, price_unit: "event", currency: "INR" }],
        packages: [],
        gallery: [],
      },
      new Map([[1, "bridal-makeup"]])
    );

    expect(mapped.id).toBe("10");
    expect(mapped.name).toBe("The Makeup Mafia");
    expect(mapped.category).toBe("makeup");
    expect(mapped.priceStart).toBe(0.5);
    expect(mapped.rating).toBe(0);
    expect(mapped.isVerified).toBe(false);
    expect(mapped.tags).toEqual(["HD Bridal Makeup"]);
  });

  it("hydrates vendor/venue detail and saved shortlist items via API and omits 404 records", async () => {
    vi.spyOn(apiClient, "get").mockImplementation(async (url: string) => {
      if (url === "/api/vendors/categories") {
        return {
          ok: true,
          status: 200,
          error: null,
          data: [{ category_id: 1, category_name: "Bridal Makeup", slug: "bridal-makeup" }],
        };
      }
      if (url === "/api/venues/types") {
        return {
          ok: true,
          status: 200,
          error: null,
          data: [{ type_id: 17, type_name: "5 Star Hotel" }],
        };
      }
      if (url === "/api/vendors/The-Makeup-Mafia-670506" || url === "/api/vendors/10") {
        return {
          ok: true,
          status: 200,
          error: null,
          data: {
            vendor: {
              vendor_id: 10,
              category_id: 1,
              vendor_name: "The Makeup Mafia",
              slug: "The-Makeup-Mafia-670506",
              description: "Bridal studio in Hyderabad",
              cover_image: "https://cdn.example.com/cover.jpg",
              is_verified: true,
            },
            services: [{ service_id: 1, vendor_id: 10, service_name: "Airbrush", description: null }],
            pricing: [],
            packages: [{ package_id: 5, vendor_id: 10, package_name: "Bridal Package", description: null, price: 150000, currency: "INR" }],
            gallery: [],
            videos: [],
            faqs: [],
            socialLinks: [],
            team: [],
            availability: [],
          },
        };
      }
      if (url === "/api/venues/itc-kohenur" || url === "/api/venues/443") {
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
              base_city: "Hyderabad",
              locality_name: "Hitech City",
              guest_count_min: 100,
              guest_count_max: 800,
              about_venue: "Luxury hotel venue",
            },
            pricing: [{ pricing_id: 1, venue_id: 443, starting_price: 500000, veg_price: 2500, non_veg_price: 1, rental_cost: null, currency: "INR", price_tag: null, price_subtext: null }],
            packages: [],
            menus: [],
            amenities: [{ amenity_id: 1, venue_id: 443, amenity_name: "Valet Parking" }],
            features: [],
            rooms: [{ room_id: 1, venue_id: 443, number_of_rooms: 271, room_description: null }],
            parking: [],
            gallery: [{ gallery_id: 1, venue_id: 443, media_type: "image", media_url: "https://cdn.example.com/itc.jpg", is_cover: true, sort_order: 1 }],
            videos: [],
            faqs: [{ faq_id: 1, venue_id: 443, question: "Outside catering?", answer: "No" }],
            availability: [],
          },
        };
      }
      return { ok: false, status: 404, error: "Not found", data: null };
    });

    const vendorDetail = await fetchVendorDetail("The-Makeup-Mafia-670506");
    expect(vendorDetail.ok).toBe(true);
    if (vendorDetail.ok) {
      expect(vendorDetail.data.vendor.name).toBe("The Makeup Mafia");
      expect(vendorDetail.data.startingPriceInr).toBe(150000);
      expect(vendorDetail.data.packages).toHaveLength(1);
    }

    const venueDetail = await fetchVenueDetail("itc-kohenur");
    expect(venueDetail.ok).toBe(true);
    if (venueDetail.ok) {
      expect(venueDetail.data.venue.rooms).toBe(271);
      expect(venueDetail.data.venue.amenities).toEqual(["Valet Parking"]);
      expect(venueDetail.data.faqs).toHaveLength(1);
      expect(venueDetail.data.galleryUrls).toEqual(["https://cdn.example.com/itc.jpg"]);
    }

    const saved = await fetchSavedCatalogItems({
      venueIds: ["443", "999999", "legacy-slug"],
      vendorIds: ["10", "888888"],
    });
    expect(saved.venues.map((v) => v.id)).toEqual(["443"]);
    expect(saved.vendors.map((v) => v.id)).toEqual(["10"]);
    expect(saved.missingVenueIds).toEqual(["999999"]);
    expect(saved.missingVendorIds).toEqual(["888888"]);
  });

  it("filters full venue catalog by plate budget without truncating at 50 and passes vendor minRating", async () => {
    const client = createMockSupabaseClient({
      onQuery: (table, _op, state) => {
        if (table === "venues") {
          return {
            data: [
              { venue_id: 1, venue_name: "Palace A", slug: "palace-a", price_range: "900", status: "Active" },
              { venue_id: 2, venue_name: "Hotel B", slug: "hotel-b", price_range: "2,200", status: "Active" },
              { venue_id: 3, venue_name: "Hotel C", slug: "hotel-c", price_range: "Price on Request", status: "Active" },
            ],
            count: 3,
          };
        }
        return { data: [], count: 0 };
      },
    });

    const under1000 = await listPublicVenues(client, { maxPlatePrice: 1000, page: 1, limit: 20 });
    expect(under1000.items.map((v) => (v as Record<string, unknown>).venue_id)).toEqual([1]);
    expect(under1000.meta.total).toBe(1);

    const reqOnly = await listPublicVenues(client, { priceOnRequestOnly: true, page: 1, limit: 20 });
    expect(reqOnly.items.map((v) => (v as Record<string, unknown>).venue_id)).toEqual([3]);

    expect(venueQuerySchema.parse({ maxPlatePrice: "1000", priceOnRequestOnly: "true" })).toMatchObject({
      maxPlatePrice: 1000,
      priceOnRequestOnly: true,
    });
  });
});

