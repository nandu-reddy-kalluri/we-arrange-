import { apiClient } from "./client";

export type ConciergeLeadStatus =
  | "New"
  | "Contacted"
  | "Negotiating"
  | "Quote Sent"
  | "Won / Closed"
  | "Lost";

export type BackendEnquiryStatus = "Pending" | "Active" | "Approved" | "Rejected";
export type SiteVisitStatus = "Requested" | "Scheduled" | "Completed" | "Cancelled";
export type QuoteStatus = "Draft" | "Published" | "Approved" | "Rejected";
export type BookingStatusName =
  | "Pending"
  | "Confirmed"
  | "In Progress"
  | "Completed"
  | "Cancelled"
  | "Refunded";

export interface AdminLead {
  id: string;
  enquiryId?: number;
  statusRaw?: BackendEnquiryStatus;
  venueId?: number | null;
  vendorId?: number | null;
  siteVisitStatus?: string | null;
  siteVisitAt?: string | null;
  siteVisitNotes?: string | null;
  coupleName: string;
  ceremony: string;
  guests: string;
  budget: string;
  status: ConciergeLeadStatus;
  assignedTo: string;
  phone: string;
  email: string;
  preferredDates: string;
  city: string;
  venueInquired: string;
  internalNotes: string;
  createdAt: string;
}

export interface PageSectionContent {
  hero: {
    badge: string;
    headline: string;
    subhead: string;
    ctaText: string;
    heroImage: string;
  };
  trustStrip: {
    stat1Number: string;
    stat1Label: string;
    stat2Number: string;
    stat2Label: string;
    guaranteeText: string;
  };
  banners: {
    active: boolean;
    title: string;
    subtitle: string;
    linkUrl: string;
    bannerImage: string;
  };
  conciergeJourney: {
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    ogImage: string;
  };
}

export interface AdminPageRecord {
  pageId?: number;
  slug: string;
  title: string;
  routeUrl: string;
  sectionCount: number;
  lastUpdated: string;
  status?: "Draft" | "Published" | "Inactive";
  content: PageSectionContent;
}

export interface ConciergeWorkspaceSummaryDTO {
  pendingLeads: number;
  activeLeads: number;
  assignedToMe: number;
  openSiteVisits: number;
  quotesCollectedByMe: number;
}

export interface ConciergeAnalyticsDTO {
  assignedEnquiriesCount: number;
  unassignedOrPendingCount: number;
  scheduledSiteVisitsCount: number;
  quotesCollectedCount: number;
  quotesApprovedCount: number;
  platformBookingsCount: number;
}

export interface ConciergeLeadCustomerDTO {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

export interface ConciergeLeadRow {
  enquiry_id: number;
  user_id: string | null;
  venue_id: number | null;
  vendor_id: number | null;
  subject: string | null;
  message: string | null;
  status: BackendEnquiryStatus | null;
  assigned_specialist_id: string | null;
  site_visit_at: string | null;
  site_visit_status: SiteVisitStatus | null;
  site_visit_notes: string | null;
  created_at: string | null;
  updated_at?: string | null;
  customer: ConciergeLeadCustomerDTO | null;
}

export interface ConciergeEnquiryDetailDTO {
  enquiry: ConciergeLeadRow;
  messages: Array<{
    message_id: number;
    enquiry_id: number;
    sender_user_id: string | null;
    message: string;
    created_at: string | null;
  }>;
  statusHistory: Array<{
    history_id: number;
    enquiry_id: number;
    old_status: string | null;
    new_status: string;
    remarks: string | null;
    changed_by: string | null;
    created_at: string | null;
  }>;
  quotes: Array<{
    quote_id: number;
    enquiry_id: number;
    venue_id: number | null;
    vendor_id: number | null;
    package_name: string;
    base_cost_inr: number;
    catering_included: boolean;
    inclusions: string[] | null;
    exclusions: string[] | null;
    notes: string | null;
    valid_until: string | null;
    status: string | null;
    created_at: string | null;
  }>;
  comparisonSheets: Array<{
    comparison_sheet_id?: number;
    sheet_id?: number;
    enquiry_id: number;
    title: string;
    quote_ids: number[] | null;
    summary_notes: string | null;
    status: string | null;
    created_at: string | null;
  }>;
}

export interface ConciergeBookingRow {
  booking_id: number;
  user_id: string | null;
  quote_id: number | null;
  venue_id: number | null;
  vendor_id: number | null;
  booking_date: string | null;
  event_date: string | null;
  guest_count: number | null;
  total_amount?: number | null;
  total_amount_inr?: number | null;
  status_name: string | null;
  notes: string | null;
  created_at: string | null;
}

export interface ConciergeQuoteCreatePayload {
  venueId?: number;
  vendorId?: number;
  packageName: string;
  baseCostInr: number;
  cateringIncluded: boolean;
  inclusions: string[];
  exclusions: string[];
  notes?: string;
  validUntil?: string;
  status: "Draft" | "Published";
}

export interface ConciergeQuoteUpdatePayload {
  packageName?: string;
  baseCostInr?: number;
  cateringIncluded?: boolean;
  inclusions?: string[];
  exclusions?: string[];
  notes?: string;
  validUntil?: string;
  status?: QuoteStatus;
}

export interface CmsPageRow {
  page_id: number;
  page_name: string;
  slug: string;
  title: string | null;
  content: string | null;
  featured_image: string | null;
  status: "Draft" | "Published" | "Inactive" | null;
  updated_at?: string | null;
  created_at?: string | null;
}

export function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "items" in data) {
    const items = (data as { items?: unknown }).items;
    return Array.isArray(items) ? (items as T[]) : [];
  }
  return [];
}

export function mapBackendEnquiryStatusToLead(
  status?: string | null,
  siteVisitStatus?: string | null
): ConciergeLeadStatus {
  if (status === "Approved") return "Won / Closed";
  if (status === "Rejected") return "Lost";
  if (status === "Active") {
    return siteVisitStatus === "Completed" ? "Quote Sent" : "Negotiating";
  }
  return "New";
}

export function mapLeadStatusToBackend(status: ConciergeLeadStatus): BackendEnquiryStatus {
  if (status === "Won / Closed") return "Approved";
  if (status === "Lost") return "Rejected";
  if (status === "New") return "Pending";
  return "Active";
}

export function mapConciergeLeadToAdminLead(row: ConciergeLeadRow): AdminLead {
  return {
    id: String(row.enquiry_id),
    enquiryId: row.enquiry_id,
    statusRaw: (row.status as BackendEnquiryStatus) || "Pending",
    venueId: row.venue_id,
    vendorId: row.vendor_id,
    siteVisitStatus: row.site_visit_status,
    siteVisitAt: row.site_visit_at,
    siteVisitNotes: row.site_visit_notes,
    coupleName: row.customer?.full_name || row.customer?.email || "Client Enquiry",
    ceremony: row.subject || "Wedding Concierge Consultation",
    guests: "TBD",
    budget: "Custom Concierge Quote",
    status: mapBackendEnquiryStatusToLead(row.status, row.site_visit_status),
    assignedTo: row.assigned_specialist_id || "Unassigned",
    phone: row.customer?.phone || "Not provided",
    email: row.customer?.email || "Not provided",
    preferredDates: row.site_visit_at
      ? new Date(row.site_visit_at).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Flexible",
    city: "Hyderabad",
    venueInquired: row.venue_id
      ? `Venue #${row.venue_id}`
      : row.vendor_id
        ? `Vendor #${row.vendor_id}`
        : "General Consultation",
    internalNotes: row.site_visit_notes || row.message || "",
    createdAt: row.created_at
      ? new Date(row.created_at).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Recently",
  };
}

export function createDefaultPageSectionContent(title = "YMWA Page"): PageSectionContent {
  return {
    hero: {
      badge: "Curated Elite Concierge",
      headline: title,
      subhead:
        "Hyderabad's premier luxury wedding planning concierge. Compare verified venues, vendors, and tailored bids effortlessly.",
      ctaText: "Explore Now",
      heroImage: "/images/editorial/insp_bridal.png",
    },
    trustStrip: {
      stat1Number: "4,000+",
      stat1Label: "Verified Partners",
      stat2Number: "100%",
      stat2Label: "Transparent Concierge Pricing",
      guaranteeText: "Dedicated Hospitality Specialist & Price Match Assurance",
    },
    banners: {
      active: false,
      title: "",
      subtitle: "",
      linkUrl: "/venues",
      bannerImage: "/images/editorial/vendor_photography.png",
    },
    conciergeJourney: {
      step1Title: "1. Share Your Vision",
      step1Desc: "Share preferred dates, capacity, and style preferences.",
      step2Title: "2. Receive Itemized Bids",
      step2Desc: "Review negotiated concierge quotes side by side.",
      step3Title: "3. Book with Confidence",
      step3Desc: "Lock dates with milestone invoicing and dedicated support.",
    },
    seo: {
      metaTitle: `${title} | YouMarriageWeArrange`,
      metaDescription: "Luxury wedding venues, curated vendors, and concierge planning.",
      keywords: "wedding concierge, luxury wedding venues, curated wedding vendors",
      ogImage: "/images/editorial/insp_bridal.png",
    },
  };
}

export function parseCmsPageRow(row: CmsPageRow): AdminPageRecord {
  const defaults = createDefaultPageSectionContent(row.title || row.page_name);
  let parsed: Partial<PageSectionContent> | null = null;
  if (row.content) {
    try {
      const candidate = JSON.parse(row.content);
      if (candidate && typeof candidate === "object" && "hero" in candidate) {
        parsed = candidate as Partial<PageSectionContent>;
      }
    } catch {
      parsed = null;
    }
  }

  const content: PageSectionContent = {
    hero: {
      ...defaults.hero,
      ...(parsed?.hero ?? {}),
      ...(row.featured_image && !parsed?.hero?.heroImage ? { heroImage: row.featured_image } : {}),
    },
    trustStrip: { ...defaults.trustStrip, ...(parsed?.trustStrip ?? {}) },
    banners: { ...defaults.banners, ...(parsed?.banners ?? {}) },
    conciergeJourney: { ...defaults.conciergeJourney, ...(parsed?.conciergeJourney ?? {}) },
    seo: { ...defaults.seo, ...(parsed?.seo ?? {}) },
  };

  return {
    pageId: row.page_id,
    slug: row.slug,
    title: row.title || row.page_name,
    routeUrl: row.slug === "home" ? "/" : `/${row.slug.replace(/^\/+/, "")}`,
    sectionCount: 5,
    lastUpdated: row.updated_at || row.created_at || "Recently",
    status: row.status ?? "Published",
    content,
  };
}

export const conciergeApi = {
  getWorkspaceSummary() {
    return apiClient.get<ConciergeWorkspaceSummaryDTO>("/api/concierge/workspace/summary", {
      retryOn401: false,
    });
  },

  getAnalytics() {
    return apiClient.get<ConciergeAnalyticsDTO>("/api/analytics/concierge", {
      retryOn401: false,
    });
  },

  listLeads(params: {
    page?: number;
    limit?: number;
    status?: BackendEnquiryStatus;
    assignedToMe?: boolean;
  } = {}) {
    return apiClient.get<ConciergeLeadRow[]>("/api/concierge/leads", {
      query: {
        page: params.page ?? 1,
        limit: params.limit ?? 50,
        status: params.status,
        assignedToMe: params.assignedToMe ? "true" : undefined,
      },
      retryOn401: false,
    });
  },

  getEnquiryDetail(enquiryId: number) {
    return apiClient.get<ConciergeEnquiryDetailDTO>(`/api/enquiries/${enquiryId}`, {
      retryOn401: false,
    });
  },

  sendEnquiryMessage(enquiryId: number, message: string) {
    return apiClient.post<Record<string, unknown>>(`/api/enquiries/${enquiryId}/messages`, {
      message,
    });
  },

  updateEnquiryStatus(
    enquiryId: number,
    payload: { status: BackendEnquiryStatus; remarks?: string }
  ) {
    return apiClient.patch<Record<string, unknown>>(
      `/api/concierge/enquiries/${enquiryId}/status`,
      payload
    );
  },

  scheduleSiteVisit(
    enquiryId: number,
    payload: { siteVisitStatus: SiteVisitStatus; siteVisitAt?: string; siteVisitNotes?: string }
  ) {
    return apiClient.patch<Record<string, unknown>>(
      `/api/concierge/enquiries/${enquiryId}/site-visit`,
      payload
    );
  },

  createQuote(enquiryId: number, payload: ConciergeQuoteCreatePayload) {
    const hasVenue = typeof payload.venueId === "number" && payload.venueId > 0;
    const hasVendor = typeof payload.vendorId === "number" && payload.vendorId > 0;
    if (hasVenue === hasVendor) {
      return Promise.resolve({
        ok: false as const,
        data: null,
        error: "Specify either a Venue ID or a Vendor ID (mutually exclusive).",
        status: 400,
      });
    }
    return apiClient.post<Record<string, unknown>>(
      `/api/concierge/enquiries/${enquiryId}/quotes`,
      payload
    );
  },

  updateQuote(quoteId: number, payload: ConciergeQuoteUpdatePayload) {
    return apiClient.patch<Record<string, unknown>>(`/api/concierge/quotes/${quoteId}`, payload);
  },

  createComparisonSheet(
    enquiryId: number,
    payload: { title: string; quoteIds: number[]; summaryNotes?: string; status?: "Draft" | "Published" }
  ) {
    return apiClient.post<Record<string, unknown>>(
      `/api/concierge/enquiries/${enquiryId}/comparison-sheet`,
      payload
    );
  },

  listBookings() {
    return apiClient.get<ConciergeBookingRow[]>("/api/bookings", {
      query: { limit: 50 },
      retryOn401: false,
    });
  },

  createBooking(payload: { quoteId: number; eventDate: string; guestCount?: number; notes?: string }) {
    return apiClient.post<Record<string, unknown>>("/api/concierge/bookings", payload);
  },

  updateBookingStatus(
    bookingId: number,
    payload: { statusName: BookingStatusName; notes?: string }
  ) {
    return apiClient.patch<Record<string, unknown>>(
      `/api/concierge/bookings/${bookingId}/status`,
      payload
    );
  },

  getVenueContacts(venueId: number) {
    return apiClient.get<{
      venueId: number;
      venueName: string;
      primaryPhone: string | null;
      website: string | null;
      googleMaps: string | null;
      address: string | null;
      contacts: Array<Record<string, unknown>>;
    }>(`/api/concierge/venues/${venueId}/contacts`, { retryOn401: false });
  },

  addVenueAvailability(
    venueId: number,
    payload: { availableFrom: string; availableTo: string; isBooked: boolean }
  ) {
    return apiClient.post<Record<string, unknown>>(
      `/api/concierge/venues/${venueId}/availability`,
      payload
    );
  },

  getVendorContacts(vendorId: number) {
    return apiClient.get<{
      vendorId: number;
      vendorName: string;
      isVerified: boolean | null;
      status: string | null;
      contacts: Array<Record<string, unknown>>;
    }>(`/api/concierge/vendors/${vendorId}/contacts`, { retryOn401: false });
  },

  listVenues(params: { page?: number; limit?: number } = {}) {
    return apiClient.get<Array<Record<string, unknown>>>("/api/admin/venues", {
      query: { page: params.page ?? 1, limit: params.limit ?? 50 },
      retryOn401: false,
    });
  },

  createVenue(payload: {
    typeId: number;
    venueName: string;
    baseCity?: string;
    localityName?: string;
    capacity?: number;
    priceRange?: string;
    shortSummary?: string;
    cateringPolicy?: string;
    decorPolicy?: string;
    status?: "Active" | "Inactive" | "Pending";
  }) {
    return apiClient.post<Record<string, unknown>>("/api/admin/venues", payload);
  },

  updateVenue(
    venueId: number,
    payload: {
      venueName?: string;
      baseCity?: string;
      localityName?: string;
      capacity?: number;
      priceRange?: string;
      shortSummary?: string;
      cateringPolicy?: string;
      decorPolicy?: string;
      status?: "Active" | "Inactive" | "Pending";
    }
  ) {
    return apiClient.patch<Record<string, unknown>>(`/api/admin/venues/${venueId}`, payload);
  },

  deactivateVenue(venueId: number) {
    return apiClient.delete<Record<string, unknown>>(`/api/admin/venues/${venueId}`);
  },

  listVendors(params: { page?: number; limit?: number } = {}) {
    return apiClient.get<Array<Record<string, unknown>>>("/api/vendors", {
      query: { page: params.page ?? 1, limit: params.limit ?? 50 },
      retryOn401: false,
    });
  },

  updateVendorVerification(
    vendorId: number,
    payload: { isVerified?: boolean; status?: "Active" | "Inactive" | "Pending" }
  ) {
    return apiClient.patch<Record<string, unknown>>(`/api/admin/vendors/${vendorId}/verify`, payload);
  },

  listCmsPages(params: { page?: number; limit?: number } = {}) {
    return apiClient.get<CmsPageRow[]>("/api/admin/cms/pages", {
      query: { page: params.page ?? 1, limit: params.limit ?? 50 },
      retryOn401: false,
    });
  },

  saveCmsPage(payload: {
    pageName: string;
    slug: string;
    title?: string;
    content?: string;
    featuredImage?: string | null;
    status: "Draft" | "Published" | "Inactive";
  }) {
    return apiClient.post<CmsPageRow>("/api/admin/cms/pages", payload);
  },

  deleteCmsPage(pageId: number) {
    return apiClient.delete<Record<string, unknown>>("/api/admin/cms/pages", undefined, {
      query: { id: pageId },
    });
  },
};

export interface AdminVenue {
  id: string;
  name: string;
  location: string;
  city: string;
  capacityRange: string;
  maxCapacity: number;
  priceOnwards: string;
  pricePerPlate?: number;
  rating: number;
  imageUrl: string;
  gallery: string[];
  type: "Banquet" | "Resort" | "Farmhouse" | "Hotel" | "Palace" | "Convention" | "Destination";
  space: "Indoor" | "Outdoor" | "Poolside" | "Rooftop" | "Garden";
  slug: string;
  isVerified: boolean;
  isPopular: boolean;
  isPremium: boolean;
  savedCount: number;
  reviewCount: number;
  amenities: string[];
  policies: {
    outsideCatering: boolean;
    outsideDecor: boolean;
    alcohol: boolean;
    dj: boolean;
    petFriendly: boolean;
  };
  rooms: number;
  parking: number;
  moodTags: string[];
  venueHighlights: string[];
  editorTag?: string;
}

export interface AdminVendor {
  id: string;
  name: string;
  category: string;
  location: string;
  city: string;
  priceStart: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  logoUrl?: string;
  slug: string;
  isVerified?: boolean;
  isPremium?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  description?: string;
  experience?: number;
  availability?: "Available" | "Booked";
  spaceType?: "Indoor" | "Outdoor" | "Both";
  tier?: "Luxury" | "Premium" | "Budget";
}

const DEFAULT_VENUE_IMAGE = "/images/editorial/venue_1.png";
const DEFAULT_VENDOR_IMAGE = "/images/editorial/vendor_photography.png";
const STANDARD_CMS_PAGES: Array<{ slug: string; title: string }> = [
  { slug: "home", title: "Home Page" },
  { slug: "venues", title: "Venues Discovery" },
  { slug: "vendors", title: "Vendors Directory" },
  { slug: "inspiration", title: "Inspiration Gallery" },
];

function normalizeVenueType(rawType?: string | null): AdminVenue["type"] {
  const t = (rawType || "").toLowerCase();
  if (t.includes("resort")) return "Resort";
  if (t.includes("farmhouse")) return "Farmhouse";
  if (t.includes("hotel")) return "Hotel";
  if (t.includes("palace")) return "Palace";
  if (t.includes("convention")) return "Convention";
  if (t.includes("destination")) return "Destination";
  return "Banquet";
}

function normalizeVenueSpace(rawSpace?: string | null): AdminVenue["space"] {
  const s = (rawSpace || "").toLowerCase();
  if (s.includes("pool")) return "Poolside";
  if (s.includes("roof")) return "Rooftop";
  if (s.includes("garden")) return "Garden";
  if (s.includes("outdoor") || s.includes("lawn")) return "Outdoor";
  return "Indoor";
}

export function mapStaffVenueToUi(row: Record<string, unknown>): AdminVenue {
  const slug = String(row.slug ?? row.venue_id ?? "");
  const minCap = Number(row.guest_count_min ?? 100);
  const maxCap = Number(row.guest_count_max ?? row.capacity ?? 500);
  const priceTag = typeof row.venue_price_tag === "string" ? row.venue_price_tag : "";
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
  const mediaList = Array.isArray(row.media)
    ? (row.media as Array<Record<string, unknown>>)
        .map((m) => String(m.media_url ?? m.url ?? ""))
        .filter(Boolean)
    : [];

  return {
    id: String(row.venue_id ?? slug),
    name: String(row.venue_name ?? "Luxury Venue"),
    location: String(row.locality_name ?? row.primary_locality ?? "Hyderabad"),
    city: String(row.base_city ?? "Hyderabad"),
    capacityRange: `${minCap} - ${Math.max(minCap, maxCap)} Guests`,
    maxCapacity: Number.isFinite(maxCap) && maxCap > 0 ? maxCap : 500,
    priceOnwards: String(row.price_range ?? row.price_subtext ?? "Price on Request"),
    pricePerPlate: Number.isFinite(numericPlate) && numericPlate > 0 ? numericPlate : undefined,
    rating: Number(row.rating ?? 4.8) || 4.8,
    imageUrl: mediaList[0] || DEFAULT_VENUE_IMAGE,
    gallery: mediaList.length > 0 ? mediaList : [DEFAULT_VENUE_IMAGE],
    type: normalizeVenueType(String(row.venue_name ?? "")),
    space: normalizeVenueSpace(String(row.indoor_outdoor_spaces ?? "")),
    slug,
    isVerified: row.status === "Active",
    isPopular: Number(row.reviews_count ?? 0) > 5,
    isPremium: true,
    savedCount: 0,
    reviewCount: Number(row.reviews_count ?? 0),
    amenities: Array.isArray(featuresObj.amenities)
      ? featuresObj.amenities.map(String)
      : ["Valet Parking", "Bridal Suite"],
    policies: {
      outsideCatering:
        typeof rulesObj.outsideCatering === "boolean"
          ? rulesObj.outsideCatering
          : !String(row.catering_policy ?? "").toLowerCase().includes("in-house only"),
      outsideDecor:
        typeof rulesObj.outsideDecor === "boolean"
          ? rulesObj.outsideDecor
          : !String(row.decor_policy ?? "").toLowerCase().includes("panel only"),
      alcohol: typeof rulesObj.alcohol === "boolean" ? rulesObj.alcohol : true,
      dj: typeof rulesObj.dj === "boolean" ? rulesObj.dj : true,
      petFriendly: typeof rulesObj.petFriendly === "boolean" ? rulesObj.petFriendly : false,
    },
    rooms: 20,
    parking: 150,
    moodTags: Array.isArray(featuresObj.moodTags)
      ? featuresObj.moodTags.map(String)
      : ["Curated"],
    venueHighlights:
      typeof row.short_summary === "string" && row.short_summary.trim()
        ? [row.short_summary]
        : ["Verified Concierge Listing"],
  };
}

export function mapStaffVendorToUi(row: Record<string, unknown>): AdminVendor {
  const slug = String(row.slug ?? row.vendor_id ?? "");
  const meta =
    row.safeMetadata && typeof row.safeMetadata === "object"
      ? (row.safeMetadata as Record<string, unknown>)
      : {};
  const categoryId = Number(row.category_id ?? 1);
  const categoryMap: Record<number, string> = {
    1: "photography",
    2: "decor",
    3: "makeup",
    4: "mehendi",
    5: "catering",
  };

  return {
    id: String(row.vendor_id ?? slug),
    name: String(row.vendor_name ?? row.business_name ?? "Verified Vendor"),
    category: categoryMap[categoryId] ?? "photography",
    location: String(meta.locality ?? meta.primary_locality ?? "Hyderabad"),
    city: String(meta.city ?? meta.base_city ?? "Hyderabad"),
    priceStart: Number(row.price_start ?? meta.priceStart ?? 1.5) || 1.5,
    rating: Number(row.rating ?? 4.8) || 4.8,
    reviewsCount: Number(row.reviews_count ?? 0),
    imageUrl: String(row.profile_image ?? meta.imageUrl ?? DEFAULT_VENDOR_IMAGE),
    slug,
    isVerified: Boolean(row.is_verified),
    isPremium: true,
    isFeatured: Boolean(row.is_verified),
    tags: Array.isArray(meta.tags) ? meta.tags.map(String) : ["Verified Partner"],
    description: typeof row.description === "string" ? row.description : undefined,
    availability: row.status === "Active" ? "Available" : "Booked",
    tier: "Luxury",
  };
}

export const adminDataService = {
  async getVenues(): Promise<AdminVenue[]> {
    const res = await conciergeApi.listVenues({ limit: 100 });
    if (!res.ok) return [];
    return extractArray<Record<string, unknown>>(res.data).map(mapStaffVenueToUi);
  },

  async saveVenue(venue: AdminVenue): Promise<{ success: boolean; message: string }> {
    const isNumericId = /^\d+$/.test(venue.id);
    const validSlug =
      venue.slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(venue.slug) ? venue.slug : undefined;
    const payload = {
      venueName: venue.name.trim(),
      ...(validSlug ? { slug: validSlug } : {}),
      baseCity: venue.city.trim() || undefined,
      localityName: venue.location.trim() || undefined,
      capacity: venue.maxCapacity > 0 ? venue.maxCapacity : undefined,
      priceRange: venue.priceOnwards.trim() || undefined,
      indoorOutdoorSpaces: venue.space,
      shortSummary: venue.venueHighlights?.[0] || undefined,
      cateringPolicy: venue.policies?.outsideCatering
        ? "Outside Catering Allowed"
        : "In-house Catering Only",
      decorPolicy: venue.policies?.outsideDecor
        ? "Outside Decor Allowed"
        : "Empaneled Decor Only",
    };

    const res = isNumericId
      ? await conciergeApi.updateVenue(Number(venue.id), payload)
      : await conciergeApi.createVenue({ typeId: 1, status: "Active", ...payload });

    return {
      success: res.ok,
      message: res.ok
        ? isNumericId
          ? "✓ Venue updated in backend catalog."
          : "✓ Venue created in backend catalog."
        : res.error || "Failed to save venue.",
    };
  },

  async deleteVenue(id: string): Promise<{ success: boolean; message: string }> {
    if (!/^\d+$/.test(id)) {
      return { success: false, message: "Invalid numeric venue ID." };
    }
    const res = await conciergeApi.deactivateVenue(Number(id));
    return {
      success: res.ok,
      message: res.ok
        ? "✓ Venue deactivated in backend catalog."
        : res.error || "Only active admins can deactivate venues.",
    };
  },

  async getVendors(): Promise<AdminVendor[]> {
    const res = await conciergeApi.listVendors({ limit: 100 });
    if (!res.ok) return [];
    return extractArray<Record<string, unknown>>(res.data).map(mapStaffVendorToUi);
  },

  async saveVendor(vendor: AdminVendor): Promise<{ success: boolean; message: string }> {
    if (!/^\d+$/.test(vendor.id)) {
      return {
        success: false,
        message: "New vendors must register via Partner Onboarding (/api/auth/register).",
      };
    }
    const res = await conciergeApi.updateVendorVerification(Number(vendor.id), {
      isVerified: Boolean(vendor.isVerified),
      status: vendor.availability === "Booked" ? "Pending" : "Active",
    });
    return {
      success: res.ok,
      message: res.ok
        ? "✓ Vendor verification status updated."
        : res.error || "Admin permission required to update vendor status.",
    };
  },

  async deleteVendor(id: string): Promise<{ success: boolean; message: string }> {
    if (!/^\d+$/.test(id)) {
      return { success: false, message: "Invalid numeric vendor ID." };
    }
    const res = await conciergeApi.updateVendorVerification(Number(id), {
      status: "Inactive",
    });
    return {
      success: res.ok,
      message: res.ok
        ? "✓ Vendor deactivated in backend registry."
        : res.error || "Admin permission required to deactivate vendor.",
    };
  },

  async getLeads(): Promise<AdminLead[]> {
    const res = await conciergeApi.listLeads({ limit: 50 });
    if (!res.ok) return [];
    return extractArray<ConciergeLeadRow>(res.data).map(mapConciergeLeadToAdminLead);
  },

  async updateLeadStatus(
    id: string,
    status: AdminLead["status"],
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    const enquiryId = Number(id);
    if (!Number.isFinite(enquiryId) || enquiryId <= 0) {
      return { success: false, message: "Invalid enquiry ID." };
    }
    const backendStatus = mapLeadStatusToBackend(status);
    const res = await conciergeApi.updateEnquiryStatus(enquiryId, {
      status: backendStatus,
      ...(notes?.trim() ? { remarks: notes.trim() } : {}),
    });
    return {
      success: res.ok,
      message: res.ok
        ? `✓ Enquiry #${enquiryId} updated to ${backendStatus}.`
        : res.error || "Failed to update enquiry status.",
    };
  },

  async getPages(): Promise<AdminPageRecord[]> {
    const res = await conciergeApi.listCmsPages({ limit: 50 });
    const rows = res.ok ? extractArray<CmsPageRow>(res.data) : [];
    const parsed = rows.map(parseCmsPageRow);
    const existingSlugs = new Set(parsed.map((p) => p.slug));

    const placeholders: AdminPageRecord[] = STANDARD_CMS_PAGES.filter(
      (s) => !existingSlugs.has(s.slug)
    ).map((s) => ({
      slug: s.slug,
      title: s.title,
      routeUrl: s.slug === "home" ? "/" : `/${s.slug}`,
      sectionCount: 5,
      lastUpdated: "Not yet published in CMS",
      status: "Draft",
      content: createDefaultPageSectionContent(s.title),
    }));

    return [...parsed, ...placeholders];
  },

  async getPageBySlug(slug: string): Promise<AdminPageRecord | null> {
    const pages = await this.getPages();
    return pages.find((p) => p.slug === slug) ?? null;
  },

  async savePageContent(
    slug: string,
    content: PageSectionContent
  ): Promise<{ success: boolean; message: string }> {
    const label =
      STANDARD_CMS_PAGES.find((p) => p.slug === slug)?.title ||
      content.hero.headline ||
      slug;
    const res = await conciergeApi.saveCmsPage({
      pageName: label,
      slug,
      title: content.hero.headline || label,
      content: JSON.stringify(content),
      featuredImage: content.hero.heroImage || null,
      status: "Published",
    });
    return {
      success: res.ok,
      message: res.ok
        ? "✓ Page content saved to CMS backend."
        : res.error || "Failed to save CMS page.",
    };
  },

  conciergeApi,
};

