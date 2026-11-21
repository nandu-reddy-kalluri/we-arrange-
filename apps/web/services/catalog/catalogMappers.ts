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
    moodTags: Array.isArray(featuresObj.moodTags)
      ? featuresObj.moodTags.map(String)
      : fallbackBySlug?.moodTags ?? [],
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

  return {
    ...(fallbackBySlug ?? {}),
    id: String(row.vendor_id ?? fallbackBySlug?.id ?? slug),
    name: String(row.vendor_name ?? fallbackBySlug?.name ?? "Wedding Vendor"),
    category: normalizedCat,
    location: String(
      meta.locality ?? meta.primary_locality ?? fallbackBySlug?.location ?? "Hyderabad"
    ),
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
    description:
      (typeof row.description === "string" && row.description) ||
      fallbackBySlug?.description ||
      "",
    experience: fallbackBySlug?.experience,
    availability: fallbackBySlug?.availability,
    spaceType: fallbackBySlug?.spaceType,
    tier: fallbackBySlug?.tier,
  };
}
