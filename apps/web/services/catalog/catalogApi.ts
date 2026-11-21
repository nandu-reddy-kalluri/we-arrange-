"use client";

import { apiClient } from "@we-arrange/api-client";
import type { Venue } from "@/mock-data/venues";
import type { Vendor } from "@/mock-data/vendors";

export interface ReviewItem {
  review_id: number;
  user_id: string | null;
  venue_id: number | null;
  vendor_id: number | null;
  rating: number | null;
  review_text: string | null;
  status: string | null;
  created_at: string | null;
  helpful_count?: number;
  unhelpful_count?: number;
}

export interface VendorServiceRecord {
  service_id: number;
  vendor_id: number;
  service_name: string;
  description: string | null;
}

export interface VendorPricingRecord {
  pricing_id: number;
  vendor_id: number;
  service_name: string | null;
  price: number | null;
  price_unit: string | null;
  currency: string | null;
}

export interface VendorPackageRecord {
  package_id: number;
  vendor_id: number;
  package_name: string;
  description: string | null;
  price: number | null;
  currency: string | null;
}

export interface VendorGalleryRecord {
  gallery_id: number;
  vendor_id: number;
  media_type: string | null;
  media_url: string;
  is_cover: boolean | null;
  sort_order: number | null;
}

export interface VendorVideoRecord {
  video_id: number;
  vendor_id: number;
  video_url: string;
  title: string | null;
  sort_order: number | null;
}

export interface VendorFaqRecord {
  faq_id: number;
  vendor_id: number;
  question: string | null;
  answer: string | null;
  sort_order: number | null;
}

export interface VendorSocialLinkRecord {
  social_id: number;
  vendor_id: number;
  platform: string | null;
  url: string | null;
}

export interface VendorTeamRecord {
  team_id: number;
  vendor_id: number;
  name: string | null;
  role: string | null;
  photo: string | null;
}

export interface VendorAvailabilityRecord {
  availability_id: number;
  vendor_id: number;
  available_from: string | null;
  available_to: string | null;
  is_booked: boolean | null;
}

export interface VendorDetailResult {
  vendor: Vendor;
  categorySlug: string;
  categoryName: string;
  rawDescription: string | null;
  startingPriceInr: number | null;
  galleryUrls: string[];
  services: VendorServiceRecord[];
  pricing: VendorPricingRecord[];
  packages: VendorPackageRecord[];
  gallery: VendorGalleryRecord[];
  videos: VendorVideoRecord[];
  faqs: VendorFaqRecord[];
  socialLinks: VendorSocialLinkRecord[];
  team: VendorTeamRecord[];
  availability: VendorAvailabilityRecord[];
}

export interface VenuePricingRecord {
  pricing_id: number;
  venue_id: number;
  starting_price: number | null;
  veg_price: number | null;
  non_veg_price: number | null;
  rental_cost: number | null;
  currency: string | null;
  price_tag: string | null;
  price_subtext: string | null;
}

export interface VenuePackageRecord {
  package_id: number;
  venue_id: number;
  package_name: string;
  description: string | null;
  price: number | null;
  capacity: number | null;
}

export interface VenueMenuRecord {
  menu_id: number;
  venue_id: number;
  menu_name: string | null;
  menu_url: string | null;
  veg_price: number | null;
  non_veg_price: number | null;
  cuisines: string | null;
  outside_catering: boolean | null;
  alcohol_policy: string | null;
}

export interface VenueAmenityRecord {
  amenity_id: number;
  venue_id: number;
  amenity_name: string;
}

export interface VenueFeatureRecord {
  feature_id: number;
  venue_id: number;
  feature_name: string;
}

export interface VenueRoomRecord {
  room_id: number;
  venue_id: number;
  number_of_rooms: number | null;
  room_description: string | null;
}

export interface VenueParkingRecord {
  parking_id: number;
  venue_id: number;
  available: boolean | null;
  parking_details: string | null;
}

export interface VenueGalleryRecord {
  gallery_id: number;
  venue_id: number;
  media_type: string | null;
  media_url: string;
  is_cover: boolean | null;
  sort_order: number | null;
}

export interface VenueVideoRecord {
  video_id: number;
  venue_id: number;
  video_url: string;
  title: string | null;
  sort_order: number | null;
}

export interface VenueFaqRecord {
  faq_id: number;
  venue_id: number;
  question: string | null;
  answer: string | null;
}

export interface VenueAvailabilityRecord {
  availability_id: number;
  venue_id: number;
  available_from: string | null;
  available_to: string | null;
  is_booked: boolean | null;
}

export interface VenueDetailResult {
  venue: Venue;
  typeName: string | null;
  rawVenue: {
    description: string | null;
    aboutVenue: string | null;
    shortSummary: string | null;
    address: string | null;
    pincode: string | null;
    cateringPolicy: string | null;
    decorPolicy: string | null;
    indoorOutdoorSpaces: string | null;
    availabilityStartTime: string | null;
    availabilityEndTime: string | null;
    website: string | null;
    googleMaps: string | null;
    priceSubtext: string | null;
    currency: string | null;
    reviewsCount: number;
    hasExplicitRating: boolean;
  };
  galleryUrls: string[];
  pricing: VenuePricingRecord[];
  packages: VenuePackageRecord[];
  menus: VenueMenuRecord[];
  amenities: VenueAmenityRecord[];
  features: VenueFeatureRecord[];
  rooms: VenueRoomRecord[];
  parking: VenueParkingRecord[];
  gallery: VenueGalleryRecord[];
  videos: VenueVideoRecord[];
  faqs: VenueFaqRecord[];
  availability: VenueAvailabilityRecord[];
}

export type CatalogDetailResponse<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

import {
  DEFAULT_VENUE_IMAGE,
  DEFAULT_VENDOR_IMAGE,
  getVendorFallbackImage,
  mapDbVenueToUi,
  mapDbVendorToUi,
  splitMediaUrls,
} from "./catalogMappers";

export {
  DEFAULT_VENUE_IMAGE,
  DEFAULT_VENDOR_IMAGE,
  getVendorFallbackImage,
  mapDbVenueToUi,
  mapDbVendorToUi,
};

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedCatalogResult<T> {
  items: T[];
  meta: PaginationMeta;
  error?: string;
}

function normalizeMeta(meta: Record<string, unknown> | undefined, count: number, page: number, limit: number): PaginationMeta {
  const total = typeof meta?.total === "number" ? meta.total : count;
  const totalPages =
    typeof meta?.totalPages === "number"
      ? meta.totalPages
      : Math.max(1, Math.ceil(total / Math.max(1, limit)));
  return {
    page: typeof meta?.page === "number" ? meta.page : page,
    limit: typeof meta?.limit === "number" ? meta.limit : limit,
    total,
    totalPages,
  };
}

let cachedCategoryMap: Map<number, string> | null = null;
let cachedCategoryDetailMap: Map<number, { category_id: number; category_name: string; slug: string }> | null = null;
let cachedVenueTypeMap: Map<number, string> | null = null;
let venueTypeMapPromise: Promise<Map<number, string>> | null = null;
let vendorCategoryDetailMapPromise: Promise<Map<number, { category_id: number; category_name: string; slug: string }>> | null = null;

async function getVenueTypeMap(): Promise<Map<number, string>> {
  if (cachedVenueTypeMap && cachedVenueTypeMap.size > 0) {
    return cachedVenueTypeMap;
  }
  if (venueTypeMapPromise) {
    return venueTypeMapPromise;
  }
  venueTypeMapPromise = (async () => {
    try {
      const typesRes = await apiClient.get<Array<{ type_id: number; type_name: string }>>(
        "/api/venues/types",
        { retryOn401: false }
      );
      const map = new Map<number, string>();
      if (typesRes.ok && Array.isArray(typesRes.data)) {
        typesRes.data.forEach((t) => map.set(t.type_id, t.type_name));
        cachedVenueTypeMap = map;
      }
      return map;
    } finally {
      venueTypeMapPromise = null;
    }
  })();
  return venueTypeMapPromise;
}

export async function getVendorCategoryDetailMap(): Promise<
  Map<number, { category_id: number; category_name: string; slug: string }>
> {
  if (cachedCategoryDetailMap && cachedCategoryDetailMap.size > 0) {
    return cachedCategoryDetailMap;
  }
  if (vendorCategoryDetailMapPromise) {
    return vendorCategoryDetailMapPromise;
  }
  vendorCategoryDetailMapPromise = (async () => {
    try {
      const catsRes = await apiClient.get<
        Array<{ category_id: number; category_name: string; slug: string | null }>
      >("/api/vendors/categories", { retryOn401: false });
      const slugMap = new Map<number, string>();
      const detailMap = new Map<number, { category_id: number; category_name: string; slug: string }>();
      if (catsRes.ok && Array.isArray(catsRes.data)) {
        catsRes.data.forEach((c) => {
          const slug = c.slug || c.category_name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          slugMap.set(c.category_id, slug);
          detailMap.set(c.category_id, {
            category_id: c.category_id,
            category_name: c.category_name,
            slug,
          });
        });
        cachedCategoryMap = slugMap;
        cachedCategoryDetailMap = detailMap;
      }
      return detailMap;
    } finally {
      vendorCategoryDetailMapPromise = null;
    }
  })();
  return vendorCategoryDetailMapPromise;
}

export async function getVendorCategoryMap(): Promise<Map<number, string>> {
  if (cachedCategoryMap && cachedCategoryMap.size > 0) {
    return cachedCategoryMap;
  }
  await getVendorCategoryDetailMap();
  return cachedCategoryMap ?? new Map<number, string>();
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

const venueCatalogMemoryCache = new Map<string, { data: PaginatedCatalogResult<Venue>; timestamp: number }>();
const vendorCatalogMemoryCache = new Map<string, { data: PaginatedCatalogResult<Vendor>; timestamp: number }>();
const venueDetailMemoryCache = new Map<string, { data: CatalogDetailResponse<VenueDetailResult>; timestamp: number }>();
const vendorDetailMemoryCache = new Map<string, { data: CatalogDetailResponse<VendorDetailResult>; timestamp: number }>();
const CATALOG_CACHE_TTL_MS = 60_000; // 60 seconds fast-path memory cache

export function clearCatalogMemoryCache(): void {
  venueCatalogMemoryCache.clear();
  vendorCatalogMemoryCache.clear();
  venueDetailMemoryCache.clear();
  vendorDetailMemoryCache.clear();
  cachedVenueTypeMap = null;
  cachedCategoryMap = null;
  cachedCategoryDetailMap = null;
}

export async function fetchPaginatedVenues(params: {
  page?: number;
  limit?: number;
  q?: string;
  city?: string;
  locality?: string;
  type?: string;
  space?: string;
  minCapacity?: number;
  maxCapacity?: number;
  minPlatePrice?: number;
  maxPlatePrice?: number;
  priceOnRequestOnly?: boolean;
  sortBy?: "relevance" | "rating" | "reviews" | "capacity" | "newest";
}): Promise<PaginatedCatalogResult<Venue>> {
  const cacheKey = JSON.stringify(params);
  const cached = venueCatalogMemoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CATALOG_CACHE_TTL_MS) {
    return cached.data;
  }

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const typeMap = await getVenueTypeMap();

  if (params.q && params.q.trim()) {
    const res = await apiClient.get<{
      venues?: { items?: Array<Record<string, unknown>>; meta?: Record<string, unknown> };
    }>("/api/search", {
      query: {
        scope: "venues",
        q: params.q.trim(),
        city: params.city,
        locality: params.locality,
        type: params.type,
        space: params.space,
        minCapacity: params.minCapacity,
        maxCapacity: params.maxCapacity,
        minPlatePrice: params.minPlatePrice,
        maxPlatePrice: params.maxPlatePrice,
        priceOnRequestOnly: params.priceOnRequestOnly ? "true" : undefined,
        sortBy: params.sortBy,
        page,
        limit,
      },
      retryOn401: false,
    });
    if (!res.ok) {
      return {
        items: [],
        meta: { page, limit, total: 0, totalPages: 0 },
        error: res.error || "Failed to search venues.",
      };
    }
    const rows = Array.isArray(res.data?.venues?.items) ? res.data.venues.items : [];
    const searchResult: PaginatedCatalogResult<Venue> = {
      items: dedupeById(rows.map((row) => mapDbVenueToUi(row, undefined, typeMap))),
      meta: normalizeMeta(res.data?.venues?.meta, rows.length, page, limit),
    };
    venueCatalogMemoryCache.set(cacheKey, { data: searchResult, timestamp: Date.now() });
    return searchResult;
  }

  const res = await apiClient.get<Array<Record<string, unknown>>>("/api/venues", {
    query: {
      page,
      limit,
      city: params.city,
      locality: params.locality,
      type: params.type,
      space: params.space,
      minCapacity: params.minCapacity,
      maxCapacity: params.maxCapacity,
      minPlatePrice: params.minPlatePrice,
      maxPlatePrice: params.maxPlatePrice,
      priceOnRequestOnly: params.priceOnRequestOnly ? "true" : undefined,
      sortBy: params.sortBy,
    },
    retryOn401: false,
  });

  if (!res.ok) {
    return {
      items: [],
      meta: { page, limit, total: 0, totalPages: 0 },
      error: res.error || "Failed to fetch venues.",
    };
  }

  const rows = Array.isArray(res.data) ? res.data : [];
  const result: PaginatedCatalogResult<Venue> = {
    items: dedupeById(rows.map((row) => mapDbVenueToUi(row, undefined, typeMap))),
    meta: normalizeMeta(res.meta, rows.length, page, limit),
  };
  venueCatalogMemoryCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

export async function fetchPaginatedVendors(params: {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  city?: string;
  verifiedOnly?: boolean;
  minRating?: number;
  sortBy?: "relevance" | "rating" | "reviews" | "newest";
}): Promise<PaginatedCatalogResult<Vendor>> {
  const cacheKey = JSON.stringify(params);
  const cached = vendorCatalogMemoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CATALOG_CACHE_TTL_MS) {
    return cached.data;
  }

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const catMap = await getVendorCategoryMap();

  if (params.q && params.q.trim()) {
    const res = await apiClient.get<{
      vendors?: { items?: Array<Record<string, unknown>>; meta?: Record<string, unknown> };
    }>("/api/search", {
      query: {
        scope: "vendors",
        q: params.q.trim(),
        category: params.category,
        city: params.city,
        verifiedOnly: params.verifiedOnly ? "true" : undefined,
        minRating: params.minRating,
        sortBy: params.sortBy,
        page,
        limit,
      },
      retryOn401: false,
    });
    if (!res.ok) {
      return {
        items: [],
        meta: { page, limit, total: 0, totalPages: 0 },
        error: res.error || "Failed to search vendors.",
      };
    }
    const rows = Array.isArray(res.data?.vendors?.items) ? res.data.vendors.items : [];
    const searchResult: PaginatedCatalogResult<Vendor> = {
      items: dedupeById(rows.map((row) => mapDbVendorToUi(row, catMap))),
      meta: normalizeMeta(res.data?.vendors?.meta, rows.length, page, limit),
    };
    vendorCatalogMemoryCache.set(cacheKey, { data: searchResult, timestamp: Date.now() });
    return searchResult;
  }

  const res = await apiClient.get<Array<Record<string, unknown>>>("/api/vendors", {
    query: {
      page,
      limit,
      category: params.category,
      city: params.city,
      verifiedOnly: params.verifiedOnly ? "true" : undefined,
      minRating: params.minRating,
      sortBy: params.sortBy,
    },
    retryOn401: false,
  });

  if (!res.ok) {
    return {
      items: [],
      meta: { page, limit, total: 0, totalPages: 0 },
      error: res.error || "Failed to fetch vendors.",
    };
  }

  const rows = Array.isArray(res.data) ? res.data : [];
  const result: PaginatedCatalogResult<Vendor> = {
    items: dedupeById(rows.map((row) => mapDbVendorToUi(row, catMap))),
    meta: normalizeMeta(res.meta, rows.length, page, limit),
  };
  vendorCatalogMemoryCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

export async function fetchMergedVenues(fallbackVenues: Venue[]): Promise<Venue[]> {
  const res = await apiClient.get<Array<Record<string, unknown>>>("/api/venues", {
    query: { limit: 50 },
    retryOn401: false,
  });
  if (!res.ok || !Array.isArray(res.data) || res.data.length === 0) {
    return fallbackVenues;
  }

  const fallbackMap = new Map(fallbackVenues.map((v) => [v.slug, v]));
  const seenSlugs = new Set<string>();
  const liveMapped = res.data.map((row) => {
    const slug = String(row.slug ?? "");
    seenSlugs.add(slug);
    return mapDbVenueToUi(row, fallbackMap.get(slug));
  });

  const remainingFallback = fallbackVenues.filter((v) => !seenSlugs.has(v.slug));
  return [...liveMapped, ...remainingFallback];
}

export async function fetchMergedVendors(fallbackVendors: Vendor[]): Promise<Vendor[]> {
  const [vendorsRes, catsRes] = await Promise.all([
    apiClient.get<Array<Record<string, unknown>>>("/api/vendors", {
      query: { limit: 50 },
      retryOn401: false,
    }),
    apiClient.get<Array<{ category_id: number; slug: string }>>(
      "/api/vendors/categories",
      { retryOn401: false }
    ),
  ]);

  if (!vendorsRes.ok || !Array.isArray(vendorsRes.data) || vendorsRes.data.length === 0) {
    return fallbackVendors;
  }

  const catMap = new Map<number, string>();
  if (catsRes.ok && Array.isArray(catsRes.data)) {
    catsRes.data.forEach((c) => catMap.set(c.category_id, c.slug));
  }

  const fallbackMap = new Map(fallbackVendors.map((v) => [v.slug, v]));
  const seenSlugs = new Set<string>();
  const liveMapped = vendorsRes.data.map((row) => {
    const slug = String(row.slug ?? "");
    seenSlugs.add(slug);
    return mapDbVendorToUi(row, catMap, fallbackMap.get(slug));
  });

  const remainingFallback = fallbackVendors.filter((v) => !seenSlugs.has(v.slug));
  return [...liveMapped, ...remainingFallback];
}

export async function fetchEntityReviews(params: {
  venueId?: number;
  vendorId?: number;
}): Promise<ReviewItem[]> {
  const res = await apiClient.get<ReviewItem[]>("/api/reviews", {
    query: {
      ...(params.venueId ? { venueId: params.venueId } : {}),
      ...(params.vendorId ? { vendorId: params.vendorId } : {}),
      limit: 20,
    },
    retryOn401: false,
  });
  return res.ok && Array.isArray(res.data) ? res.data : [];
}

export async function submitEntityReview(input: {
  venueId?: number;
  vendorId?: number;
  rating: number;
  reviewText: string;
}) {
  return apiClient.post<ReviewItem>("/api/reviews", input);
}

export async function voteEntityReview(
  reviewId: number,
  voteType: "helpful" | "unhelpful"
) {
  return apiClient.post(`/api/reviews/${reviewId}/vote`, { voteType });
}

export async function submitCustomerEnquiry(input: {
  venueId?: number;
  vendorId?: number;
  subject: string;
  message: string;
  eventDate?: string;
  guestCount?: number;
  budgetRange?: string;
  preferredCity?: string;
}) {
  return apiClient.post<{ enquiry_id?: number; status?: string }>(
    "/api/enquiries",
    input
  );
}

function asRecordArray<T>(val: unknown): T[] {
  return Array.isArray(val) ? (val as T[]) : [];
}

function dedupeStrings(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const val of values) {
    if (typeof val !== "string") continue;
    const trimmed = val.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

export async function fetchVendorDetail(
  slugOrId: string
): Promise<CatalogDetailResponse<VendorDetailResult>> {
  const safeSlug = encodeURIComponent(slugOrId.trim());
  if (!safeSlug) {
    return { ok: false, status: 404, error: "Vendor not found." };
  }

  const cached = vendorDetailMemoryCache.get(safeSlug);
  if (cached && Date.now() - cached.timestamp < CATALOG_CACHE_TTL_MS) {
    return cached.data;
  }

  const [detailRes, categoryDetailMap] = await Promise.all([
    apiClient.get<Record<string, unknown>>(`/api/vendors/${safeSlug}`, {
      retryOn401: false,
    }),
    getVendorCategoryDetailMap(),
  ]);

  if (!detailRes.ok || !detailRes.data || typeof detailRes.data !== "object") {
    return {
      ok: false,
      status: detailRes.status || 404,
      error: detailRes.error || "Vendor not found.",
    };
  }

  const payload = detailRes.data;
  const vendorRow =
    payload.vendor && typeof payload.vendor === "object" && !Array.isArray(payload.vendor)
      ? (payload.vendor as Record<string, unknown>)
      : payload;

  const catSlugById = new Map<number, string>();
  categoryDetailMap.forEach((cat, id) => catSlugById.set(id, cat.slug));

  const services = asRecordArray<VendorServiceRecord>(payload.services);
  const pricing = asRecordArray<VendorPricingRecord>(payload.pricing);
  const packages = asRecordArray<VendorPackageRecord>(payload.packages);
  const gallery = asRecordArray<VendorGalleryRecord>(payload.gallery);
  const videos = asRecordArray<VendorVideoRecord>(payload.videos);
  const faqs = asRecordArray<VendorFaqRecord>(payload.faqs);
  const socialLinks = asRecordArray<VendorSocialLinkRecord>(payload.socialLinks);
  const team = asRecordArray<VendorTeamRecord>(payload.team);
  const availability = asRecordArray<VendorAvailabilityRecord>(payload.availability);

  const vendor = mapDbVendorToUi(payload, catSlugById);
  const catId = Number(vendorRow.category_id ?? 0);
  const catInfo = categoryDetailMap.get(catId);

  const numericPrices = [
    ...pricing.map((p) => Number(p.price)),
    ...packages.map((p) => Number(p.price)),
  ].filter((n) => Number.isFinite(n) && n > 0);
  const startingPriceInr = numericPrices.length > 0 ? Math.min(...numericPrices) : null;

  const sortedGallery = [...gallery].sort(
    (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
  );
  const galleryUrls = dedupeStrings([
    ...splitMediaUrls(vendorRow.cover_image),
    ...sortedGallery.flatMap((g) => splitMediaUrls(g.media_url)),
  ]);

  const result: CatalogDetailResponse<VendorDetailResult> = {
    ok: true,
    data: {
      vendor,
      categorySlug: catInfo?.slug ?? vendor.category,
      categoryName: catInfo?.category_name ?? vendor.category,
      rawDescription:
        typeof vendorRow.description === "string" && vendorRow.description.trim()
          ? vendorRow.description.trim()
          : null,
      startingPriceInr,
      galleryUrls,
      services,
      pricing,
      packages,
      gallery: sortedGallery,
      videos,
      faqs,
      socialLinks,
      team,
      availability,
    },
  };
  vendorDetailMemoryCache.set(safeSlug, { data: result, timestamp: Date.now() });
  return result;
}

function formatInrAmount(amount: number, currency?: string | null): string {
  const code = (currency || "INR").toUpperCase();
  if (code !== "INR") {
    return `${code} ${amount.toLocaleString("en-IN")}`;
  }
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹${Number.isInteger(lakhs) ? lakhs : lakhs.toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export async function fetchVenueDetail(
  slugOrId: string
): Promise<CatalogDetailResponse<VenueDetailResult>> {
  const safeSlug = encodeURIComponent(slugOrId.trim());
  if (!safeSlug) {
    return { ok: false, status: 404, error: "Venue not found." };
  }

  const cached = venueDetailMemoryCache.get(safeSlug);
  if (cached && Date.now() - cached.timestamp < CATALOG_CACHE_TTL_MS) {
    return cached.data;
  }

  const [detailRes, typeMap] = await Promise.all([
    apiClient.get<Record<string, unknown>>(`/api/venues/${safeSlug}`, {
      retryOn401: false,
    }),
    getVenueTypeMap(),
  ]);

  if (!detailRes.ok || !detailRes.data || typeof detailRes.data !== "object") {
    return {
      ok: false,
      status: detailRes.status || 404,
      error: detailRes.error || "Venue not found.",
    };
  }

  const payload = detailRes.data;
  const venueRow =
    payload.venue && typeof payload.venue === "object" && !Array.isArray(payload.venue)
      ? (payload.venue as Record<string, unknown>)
      : payload;

  const pricing = asRecordArray<VenuePricingRecord>(payload.pricing);
  const packages = asRecordArray<VenuePackageRecord>(payload.packages);
  const menus = asRecordArray<VenueMenuRecord>(payload.menus);
  const amenities = asRecordArray<VenueAmenityRecord>(payload.amenities);
  const features = asRecordArray<VenueFeatureRecord>(payload.features);
  const rooms = asRecordArray<VenueRoomRecord>(payload.rooms);
  const parking = asRecordArray<VenueParkingRecord>(payload.parking);
  const gallery = asRecordArray<VenueGalleryRecord>(payload.gallery);
  const videos = asRecordArray<VenueVideoRecord>(payload.videos);
  const faqs = asRecordArray<VenueFaqRecord>(payload.faqs);
  const availability = asRecordArray<VenueAvailabilityRecord>(payload.availability);

  const venue = mapDbVenueToUi(payload, undefined, typeMap);
  const typeName = typeMap.get(Number(venueRow.type_id ?? 0)) ?? null;

  const sortedGallery = [...gallery].sort(
    (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
  );
  const galleryUrls = dedupeStrings(sortedGallery.map((g) => g.media_url));
  if (galleryUrls.length > 0) {
    venue.gallery = galleryUrls;
    venue.imageUrl = galleryUrls[0];
  } else {
    venue.gallery = [];
  }

  const primaryPricing = pricing[0];
  const startingAmt = Number(primaryPricing?.starting_price ?? 0);
  const rentalAmt = Number(primaryPricing?.rental_cost ?? 0);
  const vegAmt = Number(primaryPricing?.veg_price ?? menus[0]?.veg_price ?? 0);
  const nonVegAmt = Number(primaryPricing?.non_veg_price ?? menus[0]?.non_veg_price ?? 0);

  if (primaryPricing?.price_tag && primaryPricing.price_tag.trim()) {
    venue.priceOnwards = primaryPricing.price_tag.trim();
  } else if (Number.isFinite(startingAmt) && startingAmt > 1) {
    venue.priceOnwards = `${formatInrAmount(startingAmt, primaryPricing?.currency)} Onwards`;
  } else if (Number.isFinite(rentalAmt) && rentalAmt > 1) {
    venue.priceOnwards = `${formatInrAmount(rentalAmt, primaryPricing?.currency)} Onwards`;
  }

  if (Number.isFinite(vegAmt) && vegAmt > 1) {
    venue.pricePerPlate = vegAmt;
  } else if (Number.isFinite(nonVegAmt) && nonVegAmt > 1) {
    venue.pricePerPlate = nonVegAmt;
  }

  const amenityNames = dedupeStrings(amenities.map((a) => a.amenity_name));
  const featureNames = dedupeStrings(features.map((f) => f.feature_name));
  venue.amenities = amenityNames;

  const totalRooms = rooms.reduce(
    (sum, r) => sum + (Number.isFinite(Number(r.number_of_rooms)) ? Number(r.number_of_rooms) : 0),
    0
  );
  venue.rooms = totalRooms;

  const rawRating = Number(venueRow.rating ?? 0);
  const hasExplicitRating = Number.isFinite(rawRating) && rawRating > 0;
  venue.rating = hasExplicitRating ? rawRating : 0;

  const rawReviewsCount = Number(venueRow.reviews_count ?? 0);
  const reviewsCount = Number.isFinite(rawReviewsCount) && rawReviewsCount > 0 ? rawReviewsCount : 0;
  venue.reviewCount = reviewsCount;

  if (featureNames.length > 0) {
    venue.venueHighlights = featureNames;
  } else if (typeof venueRow.short_summary === "string" && venueRow.short_summary.trim()) {
    venue.venueHighlights = [venueRow.short_summary.trim()];
  } else {
    venue.venueHighlights = [];
  }

  const result: CatalogDetailResponse<VenueDetailResult> = {
    ok: true,
    data: {
      venue,
      typeName,
      rawVenue: {
        description:
          typeof venueRow.description === "string" && venueRow.description.trim()
            ? venueRow.description.trim()
            : null,
        aboutVenue:
          typeof venueRow.about_venue === "string" && venueRow.about_venue.trim()
            ? venueRow.about_venue.trim()
            : null,
        shortSummary:
          typeof venueRow.short_summary === "string" && venueRow.short_summary.trim()
            ? venueRow.short_summary.trim()
            : null,
        address:
          typeof venueRow.address === "string" && venueRow.address.trim()
            ? venueRow.address.trim()
            : null,
        pincode:
          venueRow.pincode != null && String(venueRow.pincode).trim()
            ? String(venueRow.pincode).trim()
            : null,
        cateringPolicy:
          typeof venueRow.catering_policy === "string" && venueRow.catering_policy.trim()
            ? venueRow.catering_policy.trim()
            : null,
        decorPolicy:
          typeof venueRow.decor_policy === "string" && venueRow.decor_policy.trim()
            ? venueRow.decor_policy.trim()
            : null,
        indoorOutdoorSpaces:
          typeof venueRow.indoor_outdoor_spaces === "string" &&
          venueRow.indoor_outdoor_spaces.trim()
            ? venueRow.indoor_outdoor_spaces.trim()
            : null,
        availabilityStartTime:
          typeof venueRow.availability_start_time === "string" &&
          venueRow.availability_start_time.trim()
            ? venueRow.availability_start_time.trim()
            : null,
        availabilityEndTime:
          typeof venueRow.availability_end_time === "string" &&
          venueRow.availability_end_time.trim()
            ? venueRow.availability_end_time.trim()
            : null,
        website:
          typeof venueRow.website === "string" && venueRow.website.trim()
            ? venueRow.website.trim()
            : null,
        googleMaps:
          typeof venueRow.google_maps === "string" && venueRow.google_maps.trim()
            ? venueRow.google_maps.trim()
            : null,
        priceSubtext:
          typeof primaryPricing?.price_subtext === "string" && primaryPricing.price_subtext.trim()
            ? primaryPricing.price_subtext.trim()
            : null,
        currency: primaryPricing?.currency ?? null,
        reviewsCount,
        hasExplicitRating,
      },
      galleryUrls,
      pricing,
      packages,
      menus,
      amenities,
      features,
      rooms,
      parking,
      gallery: sortedGallery,
      videos,
      faqs,
      availability,
    },
  };
  venueDetailMemoryCache.set(safeSlug, { data: result, timestamp: Date.now() });
  return result;
}

export async function fetchSavedCatalogItems(input: {
  venueIds: string[];
  vendorIds: string[];
}): Promise<{
  venues: Venue[];
  vendors: Vendor[];
  missingVenueIds: string[];
  missingVendorIds: string[];
}> {
  const uniqueVenueIds = Array.from(new Set(input.venueIds.filter((id) => /^\d+$/.test(id.trim()))));
  const uniqueVendorIds = Array.from(new Set(input.vendorIds.filter((id) => /^\d+$/.test(id.trim()))));

  const [venueResults, vendorResults] = await Promise.all([
    Promise.all(
      uniqueVenueIds.map(async (id) => ({
        id,
        res: await fetchVenueDetail(id),
      }))
    ),
    Promise.all(
      uniqueVendorIds.map(async (id) => ({
        id,
        res: await fetchVendorDetail(id),
      }))
    ),
  ]);

  const venues: Venue[] = [];
  const missingVenueIds: string[] = [];
  for (const item of venueResults) {
    if (item.res.ok) {
      venues.push(item.res.data.venue);
    } else if (item.res.status === 404) {
      missingVenueIds.push(item.id);
    }
  }

  const vendors: Vendor[] = [];
  const missingVendorIds: string[] = [];
  for (const item of vendorResults) {
    if (item.res.ok) {
      vendors.push(item.res.data.vendor);
    } else if (item.res.status === 404) {
      missingVendorIds.push(item.id);
    }
  }

  return { venues, vendors, missingVenueIds, missingVendorIds };
}
