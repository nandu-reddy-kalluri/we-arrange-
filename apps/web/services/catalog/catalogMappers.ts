import type { Venue } from "@/mock-data/venues";
import type { Vendor } from "@/mock-data/vendors";

export const DEFAULT_VENUE_IMAGE = "/images/placeholders/venue.svg";
export const DEFAULT_VENDOR_IMAGE = "/images/placeholders/photography.svg";

const VENDOR_CATEGORY_FALLBACKS: Record<string, string> = {
  photography: "/images/placeholders/photography.svg",
  photographers: "/images/placeholders/photography.svg",
  decor: "/images/placeholders/decor.svg",
  decorators: "/images/placeholders/decor.svg",
  "decor-florists": "/images/placeholders/decor.svg",
  makeup: "/images/placeholders/makeup.svg",
  "bridal-makeup": "/images/placeholders/makeup.svg",
  mehendi: "/images/placeholders/mehendi.svg",
  catering: "/images/placeholders/catering.svg",
};

export function getVendorFallbackImage(category?: string): string {
  const key = (category || "").toLowerCase().trim();
  return VENDOR_CATEGORY_FALLBACKS[key] ?? DEFAULT_VENDOR_IMAGE;
}

/** Splits DB media fields that occasionally store multiple pipe-delimited URLs in one column. */
export function splitMediaUrls(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split("|")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function normalizeVenueType(rawType?: string | null): Venue["type"] {
  const t = (rawType || "").toLowerCase();
  if (t.includes("resort")) return "Resort";
  if (t.includes("farmhouse")) return "Farmhouse";
  if (t.includes("hotel")) return "Hotel";
  if (t.includes("palace")) return "Palace";
  if (t.includes("convention")) return "Convention";
  if (t.includes("destination")) return "Destination";
  return "Banquet";
}

function normalizeVenueSpace(rawSpace?: string | null): Venue["space"] {
  const s = (rawSpace || "").toLowerCase();
  if (s.includes("pool")) return "Poolside";
  if (s.includes("roof")) return "Rooftop";
  if (s.includes("garden")) return "Garden";
  if (s.includes("outdoor") || s.includes("lawn")) return "Outdoor";
  return "Indoor";
}

export function deriveVenueTheme(
  name: string,
  desc: string,
  typeName?: string,
  spaces?: string
): string {
  const combined = `${name} ${desc} ${typeName ?? ""} ${spaces ?? ""}`.toLowerCase();
  if (
    combined.includes("palace") ||
    combined.includes("heritage") ||
    combined.includes("royal") ||
    combined.includes("fort")
  ) {
    return "Royal Heritage & Palace";
  }
  if (
    combined.includes("itc") ||
    combined.includes("taj") ||
    combined.includes("marriott") ||
    combined.includes("hyatt") ||
    combined.includes("novotel") ||
    combined.includes("radisson") ||
    combined.includes("hotel") ||
    combined.includes("5-star") ||
    combined.includes("five star")
  ) {
    return "Luxury 5-Star Hotel";
  }
  if (
    combined.includes("lawn") ||
    combined.includes("garden") ||
    combined.includes("meadow")
  ) {
    return "Scenic Garden & Lawn";
  }
  if (
    combined.includes("resort") ||
    combined.includes("pool") ||
    combined.includes("farm") ||
    combined.includes("retreat")
  ) {
    return "Poolside & Resort";
  }
  if (combined.includes("convention") || combined.includes("expo")) {
    return "Grand Convention";
  }
  if (
    combined.includes("mandapam") ||
    combined.includes("kalyana") ||
    combined.includes("traditional")
  ) {
    return "Traditional Mandapam";
  }
  return "Modern Minimalist";
}

export function mapDbVenueToUi(
  rawRow: Record<string, unknown>,
  fallbackBySlug?: Venue,
  typeNameById?: Map<number, string>
): Venue {
  const row =
    rawRow.venue && typeof rawRow.venue === "object" && !Array.isArray(rawRow.venue)
      ? (rawRow.venue as Record<string, unknown>)
      : rawRow;

  const slug = String(row.slug ?? fallbackBySlug?.slug ?? row.venue_id ?? "");
  const minCap = Number(row.guest_count_min ?? 100);
  const maxCap = Number(row.guest_count_max ?? row.capacity ?? 500);
  const priceTag =
    (typeof row.venue_price_tag === "string" && row.venue_price_tag.trim()) ||
    (typeof row.price_range === "string" ? row.price_range.trim() : "");
  const numericPlate = Number(priceTag.replace(/[^\d.]/g, ""));
  const featuresObj =
    row.features && typeof row.features === "object" && !Array.isArray(row.features)
      ? (row.features as Record<string, unknown>)
      : {};
  const rulesObj =
    row.rules_policies &&
    typeof row.rules_policies === "object" &&
    !Array.isArray(row.rules_policies)
      ? (row.rules_policies as Record<string, unknown>)
      : {};
  const rawMedia = Array.isArray(row.media)
    ? row.media
    : Array.isArray(rawRow.gallery)
      ? rawRow.gallery
      : Array.isArray(row.gallery)
        ? row.gallery
        : [];
  const mediaList = rawMedia
    .flatMap((m) =>
      typeof m === "string"
        ? splitMediaUrls(m)
        : splitMediaUrls(
            (m as Record<string, unknown>).media_url ??
              (m as Record<string, unknown>).url
          )
    );

  const dbTypeName = typeNameById?.get(Number(row.type_id ?? 0));
  const rawRating = Number(row.rating ?? fallbackBySlug?.rating ?? 0);
  const rawSummary =
    typeof row.short_summary === "string" && row.short_summary.trim()
      ? row.short_summary.trim()
      : "";

  const derivedTheme = deriveVenueTheme(
    String(row.venue_name ?? fallbackBySlug?.name ?? ""),
    String(row.description ?? row.about_venue ?? fallbackBySlug?.venueHighlights?.join(" ") ?? ""),
    dbTypeName,
    String(row.indoor_outdoor_spaces ?? "")
  );
  const initialMoodTags = Array.isArray(featuresObj.moodTags)
    ? featuresObj.moodTags.map(String)
    : fallbackBySlug?.moodTags ?? [];
  const mergedMoodTags = Array.from(new Set([derivedTheme, ...initialMoodTags]));

  return {
    ...(fallbackBySlug ?? {}),
    id: String(row.venue_id ?? fallbackBySlug?.id ?? slug),
    name: String(row.venue_name ?? fallbackBySlug?.name ?? "Luxury Venue"),
    location: String(
      row.locality_name ?? row.primary_locality ?? fallbackBySlug?.location ?? "Hyderabad"
    ),
    city: String(row.base_city ?? fallbackBySlug?.city ?? "Hyderabad"),
    capacityRange:
      fallbackBySlug?.capacityRange ?? `${minCap} - ${Math.max(minCap, maxCap)} Guests`,
    maxCapacity: Number.isFinite(maxCap) && maxCap > 0 ? maxCap : 500,
    priceOnwards: String(
      row.price_range ?? row.price_subtext ?? fallbackBySlug?.priceOnwards ?? "Price on Request"
    ),
    pricePerPlate:
      Number.isFinite(numericPlate) && numericPlate > 0
        ? numericPlate
        : fallbackBySlug?.pricePerPlate,
    rating: Number.isFinite(rawRating) && rawRating > 0 ? rawRating : 0,
    imageUrl: mediaList[0] || fallbackBySlug?.imageUrl || DEFAULT_VENUE_IMAGE,
    gallery:
      mediaList.length > 0
        ? mediaList
        : fallbackBySlug?.gallery ?? [DEFAULT_VENUE_IMAGE],
    type:
      fallbackBySlug?.type ??
      normalizeVenueType(dbTypeName ?? String(row.venue_name ?? "")),
    space:
      fallbackBySlug?.space ??
      normalizeVenueSpace(String(row.indoor_outdoor_spaces ?? "")),
    slug,
    isVerified: fallbackBySlug?.isVerified ?? true,
    isPopular: Number(row.reviews_count ?? 0) > 5 || Boolean(fallbackBySlug?.isPopular),
    isPremium: fallbackBySlug?.isPremium ?? false,
    savedCount: fallbackBySlug?.savedCount ?? 0,
    reviewCount: Number(row.reviews_count ?? fallbackBySlug?.reviewCount ?? 0),
    amenities: Array.isArray(featuresObj.amenities)
      ? featuresObj.amenities.map(String)
      : fallbackBySlug?.amenities ?? [],
    policies: {
      outsideCatering:
        typeof rulesObj.outsideCatering === "boolean"
          ? rulesObj.outsideCatering
          : !String(row.catering_policy ?? "").toLowerCase().includes("in-house only"),
      outsideDecor:
        typeof rulesObj.outsideDecor === "boolean"
          ? rulesObj.outsideDecor
          : !String(row.decor_policy ?? "").toLowerCase().includes("panel only"),
      alcohol:
        typeof rulesObj.alcohol === "boolean"
          ? rulesObj.alcohol
          : fallbackBySlug?.policies?.alcohol ?? true,
      dj:
        typeof rulesObj.dj === "boolean"
          ? rulesObj.dj
          : fallbackBySlug?.policies?.dj ?? true,
      petFriendly:
        typeof rulesObj.petFriendly === "boolean"
          ? rulesObj.petFriendly
          : fallbackBySlug?.policies?.petFriendly ?? false,
    },
    rooms: fallbackBySlug?.rooms ?? 0,
    parking: fallbackBySlug?.parking ?? 0,
    theme: fallbackBySlug?.theme ?? derivedTheme,
    moodTags: mergedMoodTags,
    venueHighlights: Array.isArray(featuresObj.highlights)
      ? featuresObj.highlights.map(String)
      : fallbackBySlug?.venueHighlights ?? (rawSummary ? [rawSummary] : []),
  };
}

export function mapDbVendorToUi(
  rawRow: Record<string, unknown>,
  categorySlugById: Map<number, string>,
  fallbackBySlug?: Vendor
): Vendor {
  const row =
    rawRow.vendor && typeof rawRow.vendor === "object" && !Array.isArray(rawRow.vendor)
      ? (rawRow.vendor as Record<string, unknown>)
      : rawRow;

  const slug = String(row.slug ?? fallbackBySlug?.slug ?? row.vendor_id ?? "");
  const categoryId = Number(row.category_id ?? 0);
  const resolvedCat =
    categorySlugById.get(categoryId) ?? fallbackBySlug?.category ?? "photography";
  const normalizedCat =
    resolvedCat === "photographers"
      ? "photography"
      : resolvedCat === "decorators"
        ? "decor"
        : resolvedCat === "bridal-makeup"
          ? "makeup"
          : resolvedCat;

  const meta =
    row.safeMetadata && typeof row.safeMetadata === "object"
      ? (row.safeMetadata as Record<string, unknown>)
      : {};

  const rawGallery = Array.isArray(rawRow.gallery)
    ? rawRow.gallery
    : Array.isArray(row.gallery)
      ? row.gallery
      : Array.isArray(row.media)
        ? row.media
        : [];
  const galleryList = rawGallery
    .flatMap((m) =>
      typeof m === "string"
        ? splitMediaUrls(m)
        : splitMediaUrls(
            (m as Record<string, unknown>).media_url ??
              (m as Record<string, unknown>).url
          )
    );
  const coverUrls = splitMediaUrls(row.cover_image);

  const pricingPrices = Array.isArray(rawRow.pricing)
    ? rawRow.pricing
        .map((p) => Number((p as Record<string, unknown>)?.price))
        .filter((n) => Number.isFinite(n) && n > 0)
    : [];
  const packagePrices = Array.isArray(rawRow.packages)
    ? rawRow.packages
        .map((p) => Number((p as Record<string, unknown>)?.price))
        .filter((n) => Number.isFinite(n) && n > 0)
    : [];
  const allPricesInr = [...pricingPrices, ...packagePrices];
  const minInr = allPricesInr.length > 0 ? Math.min(...allPricesInr) : null;
  const metaPriceLakhs = Number(meta.vendor_price ?? fallbackBySlug?.priceStart ?? 0);
  const derivedPriceStart =
    minInr !== null
      ? Number((minInr / 100000).toFixed(2))
      : Number.isFinite(metaPriceLakhs) && metaPriceLakhs > 0
        ? metaPriceLakhs
        : 0;

  const rawRating = Number(row.rating ?? fallbackBySlug?.rating ?? 0);
  const rawReviews = Number(
    meta.reviews_count ?? row.reviews_count ?? fallbackBySlug?.reviewsCount ?? 0
  );

  const descText = String(
    row.description ?? fallbackBySlug?.description ?? ""
  );

  let derivedExperience = fallbackBySlug?.experience;
  if (!derivedExperience) {
    const sinceMatch = descText.match(/since\s*(19\d\d|20\d\d)/i);
    const yearsMatch = descText.match(/(\d+)\+?\s*years?/i);
    if (sinceMatch && sinceMatch[1]) {
      const year = parseInt(sinceMatch[1], 10);
      if (year > 1980 && year <= 2026) {
        derivedExperience = 2026 - year;
      }
    } else if (yearsMatch && yearsMatch[1]) {
      const yrs = parseInt(yearsMatch[1], 10);
      if (yrs > 0 && yrs < 50) {
        derivedExperience = yrs;
      }
    }
    if (!derivedExperience) {
      const vNum = Number(row.vendor_id ?? 0);
      derivedExperience = 4 + (vNum % 8);
    }
  }

  const derivedTier: "Luxury" | "Premium" | "Budget" =
    fallbackBySlug?.tier ??
    (derivedPriceStart >= 2.5
      ? "Luxury"
      : derivedPriceStart >= 1.0
        ? "Premium"
        : "Budget");

  const derivedSpaceType: "Indoor" | "Outdoor" | "Both" =
    fallbackBySlug?.spaceType ??
    (normalizedCat === "makeup" || normalizedCat === "mehendi"
      ? "Indoor"
      : "Both");

  let derivedLocation = String(
    meta.locality ?? meta.primary_locality ?? fallbackBySlug?.location ?? ""
  );
  if (!derivedLocation || derivedLocation.toLowerCase() === "hyderabad") {
    const commonAreas = [
      "Banjara Hills",
      "Jubilee Hills",
      "Gachibowli",
      "Hitec City",
      "Madhapur",
      "Kondapur",
      "Kukatpally",
      "Secunderabad",
      "Begumpet",
      "Moinabad",
      "Shamshabad",
      "Financial District",
      "Kompally",
      "Manikonda",
      "Ameerpet",
      "Abids",
      "Mehdipatnam",
      "Charminar",
      "Tolichowki",
      "Uppal",
    ];
    for (const area of commonAreas) {
      if (new RegExp(`\\b${area}\\b`, "i").test(descText)) {
        derivedLocation = `${area}, Hyderabad`;
        break;
      }
    }
    if (!derivedLocation) {
      derivedLocation = "Hyderabad";
    }
  }

  return {
    ...(fallbackBySlug ?? {}),
    id: String(row.vendor_id ?? fallbackBySlug?.id ?? slug),
    name: String(row.vendor_name ?? fallbackBySlug?.name ?? "Wedding Vendor"),
    category: normalizedCat,
    location: derivedLocation,
    city: String(meta.city ?? meta.base_city ?? fallbackBySlug?.city ?? "Hyderabad"),
    priceStart: derivedPriceStart,
    rating: Number.isFinite(rawRating) && rawRating > 0 ? rawRating : 0,
    reviewsCount: Number.isFinite(rawReviews) && rawReviews > 0 ? rawReviews : 0,
    imageUrl:
      coverUrls[0] ||
      galleryList[0] ||
      fallbackBySlug?.imageUrl ||
      getVendorFallbackImage(normalizedCat),
    logoUrl:
      (typeof row.logo === "string" && row.logo) || fallbackBySlug?.logoUrl,
    slug,
    isVerified: Boolean(row.is_verified ?? fallbackBySlug?.isVerified ?? false),
    isPremium: fallbackBySlug?.isPremium ?? Boolean(row.is_verified),
    isFeatured: fallbackBySlug?.isFeatured ?? false,
    tags:
      fallbackBySlug?.tags ??
      (Array.isArray(rawRow.services)
        ? rawRow.services
            .map((s) => String((s as Record<string, unknown>)?.service_name ?? ""))
            .filter(Boolean)
        : []),
    description: descText,
    experience: derivedExperience,
    availability: fallbackBySlug?.availability ?? "Available",
    spaceType: derivedSpaceType,
    tier: derivedTier,
  };
}

import type {
  VenueDetailResult,
  VendorDetailResult,
  VendorServiceRecord,
  VendorPricingRecord,
  VendorPackageRecord,
  VendorGalleryRecord,
  VendorVideoRecord,
  VendorFaqRecord,
  VendorSocialLinkRecord,
  VendorTeamRecord,
  VendorAvailabilityRecord,
  VenuePricingRecord,
  VenuePackageRecord,
  VenueMenuRecord,
  VenueAmenityRecord,
  VenueFeatureRecord,
  VenueRoomRecord,
  VenueParkingRecord,
  VenueGalleryRecord,
  VenueVideoRecord,
  VenueFaqRecord,
  VenueAvailabilityRecord,
} from "./catalogApi";

export type {
  VenueDetailResult,
  VendorDetailResult,
};

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

export function transformVenueDetailPayload(
  payload: Record<string, unknown>,
  typeMap: Map<number, string> = new Map()
): VenueDetailResult {
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

  return {
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
  };
}

export function transformVendorDetailPayload(
  payload: Record<string, unknown>,
  categoryDetailMap: Map<number, { slug?: string; category_name?: string }> = new Map()
): VendorDetailResult {
  const vendorRow =
    payload.vendor && typeof payload.vendor === "object" && !Array.isArray(payload.vendor)
      ? (payload.vendor as Record<string, unknown>)
      : payload;

  const catSlugById = new Map<number, string>();
  categoryDetailMap.forEach((cat, id) => {
    if (cat.slug) catSlugById.set(id, cat.slug);
  });

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

  return {
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
  };
}
