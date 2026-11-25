import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, mapDatabaseError } from "@we-arrange/database/errors";
import {
  buildPaginationMeta,
  normalizePagination,
  PUBLIC_VENUE_COLUMNS,
  sanitizePostgrestFilterTerm,
  slugify,
} from "@we-arrange/database/repository";
import type { Database, Json } from "@we-arrange/database/types";

export interface VenueFilterInput {
  page?: number;
  limit?: number;
  city?: string;
  locality?: string;
  areaId?: number;
  typeId?: number;
  typeIds?: number[];
  type?: string;
  space?: string;
  theme?: string;
  minCapacity?: number;
  maxCapacity?: number;
  minPlatePrice?: number;
  maxPlatePrice?: number;
  priceOnRequestOnly?: boolean;
  q?: string;
  sortBy?: "relevance" | "rating" | "reviews" | "capacity" | "newest";
  sortOrder?: "asc" | "desc";
}

export function parsePlatePrices(priceTag: string): number[] {
  if (!priceTag) return [];
  const matches = priceTag.match(/[\d,]+(?:\.\d+)?/g);
  if (!matches) return [];
  return matches
    .map((m) => Number(m.replace(/,/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export function matchesVenueBudget(
  row: Record<string, unknown>,
  filters: VenueFilterInput
): boolean {
  let minPrice: number | null =
    typeof row.min_plate_price === "number" && Number.isFinite(row.min_plate_price)
      ? row.min_plate_price
      : null;
  let maxPrice: number | null =
    typeof row.max_plate_price === "number" && Number.isFinite(row.max_plate_price)
      ? row.max_plate_price
      : null;

  if (minPrice === null && maxPrice === null) {
    const priceTag =
      (typeof row.venue_price_tag === "string" && row.venue_price_tag.trim()) ||
      (typeof row.price_range === "string" ? row.price_range.trim() : "");
    const prices = parsePlatePrices(priceTag);
    if (prices.length > 0) {
      minPrice = Math.min(...prices);
      maxPrice = Math.max(...prices);
    }
  }

  if (minPrice === null && maxPrice === null) {
    return Boolean(filters.priceOnRequestOnly);
  }
  if (filters.priceOnRequestOnly) {
    return false;
  }

  const effectiveMax = maxPrice ?? minPrice ?? 0;
  const effectiveMin = minPrice ?? maxPrice ?? 0;

  if (filters.minPlatePrice !== undefined && effectiveMax < filters.minPlatePrice) {
    return false;
  }
  if (filters.maxPlatePrice !== undefined && effectiveMin > filters.maxPlatePrice) {
    return false;
  }
  return true;
}

export async function listVenueTypes(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("venue_types")
    .select("type_id, type_name, status")
    .eq("status", "Active")
    .order("type_name", { ascending: true });

  if (error) throw mapDatabaseError(error, "Failed to load venue types.");
  return data ?? [];
}

export async function listPublicVenues(
  supabase: SupabaseClient<Database>,
  filters: VenueFilterInput = {},
  options?: { includeAllStatuses?: boolean; includeMedia?: boolean }
) {
  const { page, limit, from, to } = normalizePagination(filters);

  let resolvedTypeIds: number[] | null =
    Array.isArray(filters.typeIds) && filters.typeIds.length > 0
      ? filters.typeIds
      : filters.typeId
        ? [filters.typeId]
        : null;
  let derivedSpaceFilter = filters.space?.trim();

  if (!resolvedTypeIds && filters.type) {
    const rawType = filters.type.trim();
    const lowerType = rawType.toLowerCase();
    if (lowerType === "outdoor venue") {
      derivedSpaceFilter = derivedSpaceFilter || "Outdoor";
    } else if (lowerType === "indoor venue") {
      derivedSpaceFilter = derivedSpaceFilter || "Indoor";
    } else {
      const typeKeyword =
        lowerType === "convention centre"
          ? "Convention"
          : lowerType === "banquet hall"
            ? "Banquet"
            : lowerType === "wedding hall"
              ? "Hall"
              : rawType;

      let typeQuery = supabase.from("venue_types").select("type_id");
      typeQuery =
        lowerType === "wedding hall"
          ? typeQuery.or("type_name.ilike.%Hall%,type_name.ilike.%Mandapam%")
          : typeQuery.ilike("type_name", `%${typeKeyword}%`);

      const { data: typeMatches } = await typeQuery;
      if (Array.isArray(typeMatches) && typeMatches.length > 0) {
        resolvedTypeIds = typeMatches.map((t) => t.type_id);
      }
    }
  }

  let query = supabase
    .from("venues")
    .select(PUBLIC_VENUE_COLUMNS, { count: "exact" });

  if (!options?.includeAllStatuses) {
    query = query.eq("status", "Active");
  }

  if (resolvedTypeIds && resolvedTypeIds.length === 1) {
    query = query.eq("type_id", resolvedTypeIds[0]);
  } else if (resolvedTypeIds && resolvedTypeIds.length > 1) {
    query = query.in("type_id", resolvedTypeIds);
  }
  if (filters.areaId) {
    query = query.eq("area_id", filters.areaId);
  }
  if (filters.city) {
    query = query.ilike("base_city", `%${filters.city.trim()}%`);
  }
  if (filters.locality) {
    const loc = sanitizePostgrestFilterTerm(filters.locality);
    if (loc) {
      query = query.or(
        `locality_name.ilike.%${loc}%,primary_locality.ilike.%${loc}%,address.ilike.%${loc}%`
      );
    }
  }
  if (derivedSpaceFilter) {
    const lowerSpace = derivedSpaceFilter.toLowerCase();
    if (lowerSpace.includes("indoor") && lowerSpace.includes("outdoor")) {
      query = query.ilike("indoor_outdoor_spaces", "%Indoor%Outdoor%");
    } else {
      query = query.ilike("indoor_outdoor_spaces", `%${derivedSpaceFilter}%`);
    }
  }
  if (filters.minCapacity !== undefined) {
    query = query.gte("guest_count_max", filters.minCapacity);
  }
  if (filters.maxCapacity !== undefined) {
    query = query.lte("guest_count_min", filters.maxCapacity);
  }
  if (filters.q) {
    const term = sanitizePostgrestFilterTerm(filters.q);
    if (term) {
      query = query.or(
        `venue_name.ilike.%${term}%,locality_name.ilike.%${term}%,base_city.ilike.%${term}%,short_summary.ilike.%${term}%`
      );
    }
  }

  if (filters.theme && !filters.theme.startsWith("All") && !filters.theme.startsWith("Any")) {
    const t = filters.theme.toLowerCase();
    if (t.includes("royal") || t.includes("palace") || t.includes("heritage")) {
      query = query.or(
        "venue_name.ilike.%palace%,venue_name.ilike.%heritage%,venue_name.ilike.%royal%,description.ilike.%palace%,description.ilike.%heritage%,description.ilike.%royal%"
      );
    } else if (t.includes("5-star") || t.includes("luxury") || t.includes("hotel")) {
      query = query.or(
        "venue_name.ilike.%hotel%,venue_name.ilike.%itc%,venue_name.ilike.%taj%,venue_name.ilike.%marriott%,venue_name.ilike.%hyatt%,venue_name.ilike.%novotel%,venue_name.ilike.%radisson%,description.ilike.%luxury%,description.ilike.%5-star%"
      );
    } else if (t.includes("garden") || t.includes("lawn")) {
      query = query.or(
        "indoor_outdoor_spaces.ilike.%outdoor%,venue_name.ilike.%lawn%,venue_name.ilike.%garden%,description.ilike.%lawn%,description.ilike.%garden%"
      );
    } else if (t.includes("resort") || t.includes("pool") || t.includes("farm")) {
      query = query.or(
        "venue_name.ilike.%resort%,venue_name.ilike.%farm%,description.ilike.%resort%,description.ilike.%pool%"
      );
    } else if (t.includes("convention")) {
      query = query.or("venue_name.ilike.%convention%,description.ilike.%convention%");
    } else if (t.includes("mandapam") || t.includes("traditional")) {
      query = query.or(
        "venue_name.ilike.%mandapam%,venue_name.ilike.%kalyana%,description.ilike.%traditional%"
      );
    } else if (t.includes("minimal")) {
      query = query.or(
        "description.ilike.%contemporary%,description.ilike.%boutique%,description.ilike.%modern%"
      );
    }
  }

  // BE-001: Execute budget filters directly in PostgreSQL using B-tree indexed numeric columns
  const hasBudgetFilter =
    Boolean(filters.priceOnRequestOnly) ||
    filters.minPlatePrice !== undefined ||
    filters.maxPlatePrice !== undefined;

  if (filters.priceOnRequestOnly) {
    query = query.or("min_plate_price.is.null,venue_price_tag.ilike.%request%");
  } else {
    if (filters.minPlatePrice !== undefined) {
      query = query.gte("max_plate_price", filters.minPlatePrice);
    }
    if (filters.maxPlatePrice !== undefined) {
      query = query.lte("min_plate_price", filters.maxPlatePrice);
    }
  }

  // Strictly non-price sorting (ENGINEERING_RULES.md); always break ties by venue_id for stable pagination
  const ascending = filters.sortOrder === "asc";
  switch (filters.sortBy) {
    case "rating":
      query = query
        .order("rating", { ascending, nullsFirst: false })
        .order("reviews_count", { ascending: false, nullsFirst: false })
        .order("venue_id", { ascending: true });
      break;
    case "reviews":
      query = query
        .order("reviews_count", { ascending, nullsFirst: false })
        .order("rating", { ascending: false, nullsFirst: false })
        .order("venue_id", { ascending: true });
      break;
    case "capacity":
      query = query
        .order("guest_count_max", { ascending, nullsFirst: false })
        .order("venue_id", { ascending: true });
      break;
    case "newest":
      query = query
        .order("created_at", { ascending })
        .order("venue_id", { ascending: true });
      break;
    case "relevance":
    default:
      if (options?.includeAllStatuses) {
        query = query
          .order("created_at", { ascending: false, nullsFirst: false })
          .order("venue_id", { ascending: false });
      } else {
        query = query
          .order("rating", { ascending: false, nullsFirst: false })
          .order("reviews_count", { ascending: false, nullsFirst: false })
          .order("venue_id", { ascending: true });
      }
      break;
  }

  // Standard paginated fetch directly against PostgreSQL — eliminates 5,000-row in-memory chunking (BE-001)
  const { data, error, count } = await query.range(from, to);
  if (error) throw mapDatabaseError(error, "Failed to query venues.");
  const rawList = (data ?? []) as unknown as Array<Record<string, unknown>>;
  const rows = hasBudgetFilter
    ? rawList.filter((item) => matchesVenueBudget(item, filters))
    : rawList;
  const totalCount =
    hasBudgetFilter && count !== null && count !== undefined && rows.length === rawList.length
      ? count
      : hasBudgetFilter
        ? rows.length
        : (count ?? rows.length);

  if (options?.includeMedia && rows.length > 0) {
    const venueIds = rows
      .map((r) => (r as unknown as { venue_id?: number }).venue_id)
      .filter((id): id is number => typeof id === "number");

    if (venueIds.length > 0) {
      const { data: galleryRows } = await supabase
        .from("venue_gallery")
        .select("venue_id, media_url, is_cover, sort_order")
        .in("venue_id", venueIds)
        .order("is_cover", { ascending: false })
        .order("sort_order", { ascending: true });

      const mediaByVenueId = new Map<number, Array<{ media_url: string }>>();
      for (const g of galleryRows ?? []) {
        if (!g.media_url) continue;
        const list = mediaByVenueId.get(g.venue_id) ?? [];
        list.push({ media_url: g.media_url });
        mediaByVenueId.set(g.venue_id, list);
      }

      return {
        items: rows.map((row) => {
          const vid = (row as unknown as { venue_id?: number }).venue_id;
          return {
            ...(row as unknown as Record<string, unknown>),
            media: typeof vid === "number" ? (mediaByVenueId.get(vid) ?? []) : [],
          };
        }),
        meta: buildPaginationMeta(page, limit, totalCount),
      };
    }
  }

  return {
    items: rows,
    meta: buildPaginationMeta(page, limit, totalCount),
  };
}

export async function getPublicVenueBySlugOrId(
  supabase: SupabaseClient<Database>,
  slugOrId: string,
  options?: { includeInactive?: boolean }
) {
  const trimmed = slugOrId.trim();
  const isNumeric = /^\d+$/.test(trimmed);

  let venueQuery = supabase.from("venues").select(PUBLIC_VENUE_COLUMNS);
  if (!options?.includeInactive) {
    venueQuery = venueQuery.eq("status", "Active");
  }
  venueQuery = isNumeric
    ? venueQuery.eq("venue_id", Number(trimmed))
    : venueQuery.eq("slug", trimmed);

  const { data: venueRaw, error: venueErr } = await venueQuery.maybeSingle();
  if (venueErr) throw mapDatabaseError(venueErr, "Failed to load venue.");
  if (!venueRaw || typeof venueRaw !== "object") {
    throw new AppError("NOT_FOUND", 404, "Venue not found.");
  }

  const venue = venueRaw as unknown as Record<string, unknown> & { venue_id: number };
  const venueId = venue.venue_id;

  const [
    pricingRes,
    packagesRes,
    menusRes,
    amenitiesRes,
    featuresRes,
    roomsRes,
    parkingRes,
    galleryRes,
    videosRes,
    faqRes,
    availabilityRes,
  ] = await Promise.all([
    supabase.from("venue_pricing").select("*").eq("venue_id", venueId),
    supabase.from("venue_packages").select("*").eq("venue_id", venueId),
    supabase.from("venue_menus").select("*").eq("venue_id", venueId),
    supabase.from("venue_amenities").select("*").eq("venue_id", venueId),
    supabase.from("venue_features").select("*").eq("venue_id", venueId),
    supabase.from("venue_room_details").select("*").eq("venue_id", venueId),
    supabase.from("venue_parking").select("*").eq("venue_id", venueId),
    supabase
      .from("venue_gallery")
      .select("*")
      .eq("venue_id", venueId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("venue_videos")
      .select("*")
      .eq("venue_id", venueId)
      .order("sort_order", { ascending: true }),
    supabase.from("venue_faq").select("*").eq("venue_id", venueId),
    supabase
      .from("venue_availability")
      .select("*")
      .eq("venue_id", venueId)
      .order("available_from", { ascending: true }),
  ]);

  return {
    venue,
    pricing: pricingRes.data ?? [],
    packages: packagesRes.data ?? [],
    menus: menusRes.data ?? [],
    amenities: amenitiesRes.data ?? [],
    features: featuresRes.data ?? [],
    rooms: roomsRes.data ?? [],
    parking: parkingRes.data ?? [],
    gallery: galleryRes.data ?? [],
    videos: videosRes.data ?? [],
    faqs: faqRes.data ?? [],
    availability: availabilityRes.data ?? [],
  };
}

// ── Admin / Concierge Venue Mutations (require verified staff client) ─────────
export async function createVenueRecord(
  adminClient: SupabaseClient<Database>,
  input: {
    typeId: number;
    venueName: string;
    slug?: string;
    description?: string;
    shortSummary?: string;
    aboutVenue?: string;
    areaId?: number;
    address?: string;
    baseCity?: string;
    localityName?: string;
    primaryLocality?: string;
    pincode?: string;
    capacity?: number;
    guestCountMin?: number;
    guestCountMax?: number;
    priceRange?: string;
    priceSubtext?: string;
    indoorOutdoorSpaces?: string;
    cateringPolicy?: string;
    decorPolicy?: string;
    website?: string;
    googleMaps?: string;
    features?: Record<string, unknown>;
    rulesPolicies?: Record<string, unknown>;
    status?: "Active" | "Inactive" | "Draft" | "Pending";
    contactPhone?: string;
    whatsappAvailable?: boolean;
  }
) {
  const generatedSlug =
    input.slug?.trim() || `${slugify(input.venueName) || "venue"}-${Date.now().toString(36)}`;

  const { data: venue, error } = await adminClient
    .from("venues")
    .insert({
      type_id: input.typeId,
      venue_name: input.venueName,
      slug: generatedSlug,
      description: input.description ?? null,
      short_summary: input.shortSummary ?? null,
      about_venue: input.aboutVenue ?? null,
      area_id: input.areaId ?? null,
      address: input.address ?? null,
      base_city: input.baseCity ?? null,
      locality_name: input.localityName ?? null,
      primary_locality: input.primaryLocality ?? null,
      pincode: input.pincode ?? null,
      capacity: input.capacity ?? null,
      guest_count_min: input.guestCountMin ?? null,
      guest_count_max: input.guestCountMax ?? null,
      price_range: input.priceRange ?? null,
      price_subtext: input.priceSubtext ?? null,
      indoor_outdoor_spaces: input.indoorOutdoorSpaces ?? null,
      catering_policy: input.cateringPolicy ?? null,
      decor_policy: input.decorPolicy ?? null,
      website: input.website ?? null,
      google_maps: input.googleMaps ?? null,
      features: (input.features ?? {}) as Json,
      rules_policies: (input.rulesPolicies ?? {}) as Json,
      status: input.status ?? "Active",
    })
    .select(PUBLIC_VENUE_COLUMNS)
    .single();

  if (error || !venue) throw mapDatabaseError(error, "Failed to create venue.");

  const createdVenue = venue as unknown as { venue_id: number };
  if (input.contactPhone || input.website || input.googleMaps) {
    await adminClient.from("venue_contacts").insert({
      venue_id: createdVenue.venue_id,
      phone: input.contactPhone ?? null,
      whatsapp_available: input.whatsappAvailable ?? null,
      website: input.website ?? null,
      google_maps: input.googleMaps ?? null,
    });
  }

  return venue;
}

export async function updateVenueRecord(
  adminClient: SupabaseClient<Database>,
  venueId: number,
  input: Partial<Parameters<typeof createVenueRecord>[1]>
) {
  const updateData: Database["public"]["Tables"]["venues"]["Update"] = {};
  if (input.typeId !== undefined) updateData.type_id = input.typeId;
  if (input.venueName !== undefined) updateData.venue_name = input.venueName;
  if (input.slug !== undefined) updateData.slug = input.slug;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.shortSummary !== undefined) updateData.short_summary = input.shortSummary;
  if (input.aboutVenue !== undefined) updateData.about_venue = input.aboutVenue;
  if (input.areaId !== undefined) updateData.area_id = input.areaId;
  if (input.address !== undefined) updateData.address = input.address;
  if (input.baseCity !== undefined) updateData.base_city = input.baseCity;
  if (input.localityName !== undefined) updateData.locality_name = input.localityName;
  if (input.primaryLocality !== undefined) updateData.primary_locality = input.primaryLocality;
  if (input.pincode !== undefined) updateData.pincode = input.pincode;
  if (input.capacity !== undefined) updateData.capacity = input.capacity;
  if (input.guestCountMin !== undefined) updateData.guest_count_min = input.guestCountMin;
  if (input.guestCountMax !== undefined) updateData.guest_count_max = input.guestCountMax;
  if (input.priceRange !== undefined) updateData.price_range = input.priceRange;
  if (input.priceSubtext !== undefined) updateData.price_subtext = input.priceSubtext;
  if (input.indoorOutdoorSpaces !== undefined)
    updateData.indoor_outdoor_spaces = input.indoorOutdoorSpaces;
  if (input.cateringPolicy !== undefined) updateData.catering_policy = input.cateringPolicy;
  if (input.decorPolicy !== undefined) updateData.decor_policy = input.decorPolicy;
  if (input.website !== undefined) updateData.website = input.website;
  if (input.googleMaps !== undefined) updateData.google_maps = input.googleMaps;
  if (input.features !== undefined) updateData.features = input.features as Json;
  if (input.rulesPolicies !== undefined) updateData.rules_policies = input.rulesPolicies as Json;
  if (input.status !== undefined) updateData.status = input.status;

  const { data, error } = await adminClient
    .from("venues")
    .update(updateData)
    .eq("venue_id", venueId)
    .select(PUBLIC_VENUE_COLUMNS)
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to update venue.");
  if (!data) throw new AppError("NOT_FOUND", 404, "Venue not found.");
  return data;
}

export async function deleteVenueRecord(
  adminClient: SupabaseClient<Database>,
  venueId: number
) {
  const { data, error } = await adminClient
    .from("venues")
    .update({ status: "Inactive" })
    .eq("venue_id", venueId)
    .select("venue_id, status")
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to deactivate venue.");
  if (!data) throw new AppError("NOT_FOUND", 404, "Venue not found.");
  return { deactivated: true, venueId: data.venue_id, status: data.status };
}

export async function upsertVenuePricing(
  adminClient: SupabaseClient<Database>,
  venueId: number,
  input: {
    startingPrice?: number;
    vegPrice?: number;
    nonVegPrice?: number;
    rentalCost?: number;
    priceTag?: string;
    priceSubtext?: string;
  }
) {
  const { data: existing } = await adminClient
    .from("venue_pricing")
    .select("pricing_id")
    .eq("venue_id", venueId)
    .maybeSingle();

  const row = {
    venue_id: venueId,
    starting_price: input.startingPrice ?? null,
    veg_price: input.vegPrice ?? null,
    non_veg_price: input.nonVegPrice ?? null,
    rental_cost: input.rentalCost ?? null,
    currency: "INR",
    price_tag: input.priceTag ?? null,
    price_subtext: input.priceSubtext ?? null,
  };

  if (existing) {
    const { data, error } = await adminClient
      .from("venue_pricing")
      .update(row)
      .eq("pricing_id", existing.pricing_id)
      .select("*")
      .single();
    if (error || !data) throw mapDatabaseError(error, "Failed to update venue pricing.");
    return data;
  }

  const { data, error } = await adminClient
    .from("venue_pricing")
    .insert(row)
    .select("*")
    .single();
  if (error || !data) throw mapDatabaseError(error, "Failed to create venue pricing.");
  return data;
}

export async function addVenueAvailabilitySlot(
  adminClient: SupabaseClient<Database>,
  venueId: number,
  input: { availableFrom: string; availableTo: string; isBooked: boolean }
) {
  if (input.availableTo < input.availableFrom) {
    throw new AppError("VALIDATION_ERROR", 400, "availableTo must be on or after availableFrom.");
  }

  const { data, error } = await adminClient
    .from("venue_availability")
    .insert({
      venue_id: venueId,
      available_from: input.availableFrom,
      available_to: input.availableTo,
      is_booked: input.isBooked,
    })
    .select("*")
    .single();

  if (error || !data) throw mapDatabaseError(error, "Failed to add venue availability.");
  return data;
}

export async function addVenueMediaRecord(
  adminClient: SupabaseClient<Database>,
  venueId: number,
  input: {
    mediaUrl: string;
    mediaType: "image" | "video";
    isCover?: boolean;
    sortOrder?: number;
    title?: string;
  }
) {
  if (input.mediaType === "video") {
    const { data, error } = await adminClient
      .from("venue_videos")
      .insert({
        venue_id: venueId,
        video_url: input.mediaUrl,
        title: input.title ?? null,
        sort_order: input.sortOrder ?? 0,
      })
      .select("*")
      .single();
    if (error || !data) throw mapDatabaseError(error, "Failed to save venue video.");
    return data;
  }

  const { data, error } = await adminClient
    .from("venue_gallery")
    .insert({
      venue_id: venueId,
      media_url: input.mediaUrl,
      media_type: "image",
      is_cover: input.isCover ?? false,
      sort_order: input.sortOrder ?? 0,
    })
    .select("*")
    .single();
  if (error || !data) throw mapDatabaseError(error, "Failed to save venue gallery image.");
  return data;
}

export async function deleteVenueMediaRecord(
  adminClient: SupabaseClient<Database>,
  venueId: number,
  mediaId: number,
  mediaType: "image" | "video" = "image"
) {
  if (mediaType === "video") {
    const { data, error } = await adminClient
      .from("venue_videos")
      .delete()
      .eq("video_id", mediaId)
      .eq("venue_id", venueId)
      .select("video_id")
      .maybeSingle();
    if (error) throw mapDatabaseError(error, "Failed to delete venue video.");
    if (!data) throw new AppError("NOT_FOUND", 404, "Venue video not found.");
    return { deleted: true, mediaId };
  }

  const { data, error } = await adminClient
    .from("venue_gallery")
    .delete()
    .eq("gallery_id", mediaId)
    .eq("venue_id", venueId)
    .select("gallery_id")
    .maybeSingle();
  if (error) throw mapDatabaseError(error, "Failed to delete venue image.");
  if (!data) throw new AppError("NOT_FOUND", 404, "Venue image not found.");
  return { deleted: true, mediaId };
}
