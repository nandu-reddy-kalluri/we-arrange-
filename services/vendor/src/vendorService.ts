import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, mapDatabaseError } from "@we-arrange/database/errors";
import {
  buildPaginationMeta,
  normalizePagination,
  PUBLIC_VENDOR_COLUMNS,
  sanitizePostgrestFilterTerm,
} from "@we-arrange/database/repository";
import type { Database } from "@we-arrange/database/types";

const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  makeup: "bridal-makeup",
  "bridal-makeup": "bridal-makeup",
  photography: "photographers",
  photographers: "photographers",
  decor: "decorators",
  "decor-florists": "decorators",
  decorators: "decorators",
  catering: "catering",
  mehendi: "mehendi",
};

export function normalizeVendorCategorySlug(slug: string): string {
  const key = slug.toLowerCase().trim();
  return CATEGORY_SLUG_ALIASES[key] ?? key;
}

export interface VendorFilterInput {
  page?: number;
  limit?: number;
  category?: string;
  categoryId?: number;
  city?: string;
  verifiedOnly?: boolean;
  minRating?: number;
  q?: string;
  sortBy?: "relevance" | "rating" | "reviews" | "newest";
  sortOrder?: "asc" | "desc";
}

export async function listVendorCategories(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("vendor_categories")
    .select("category_id, category_name, slug, status")
    .eq("status", "Active")
    .order("category_name", { ascending: true });

  if (error) throw mapDatabaseError(error, "Failed to load vendor categories.");
  return data ?? [];
}

export async function listPublicVendors(
  supabase: SupabaseClient<Database>,
  filters: VendorFilterInput = {}
) {
  const { page, limit, from, to } = normalizePagination(filters);

  let categoryId = filters.categoryId;
  if (!categoryId && filters.category) {
    const normalizedSlug = normalizeVendorCategorySlug(filters.category);
    const { data: cat } = await supabase
      .from("vendor_categories")
      .select("category_id")
      .eq("slug", normalizedSlug)
      .maybeSingle();
    if (!cat) {
      return { items: [], meta: buildPaginationMeta(page, limit, 0) };
    }
    categoryId = cat.category_id;
  }

  let query = supabase
    .from("vendors")
    .select(PUBLIC_VENDOR_COLUMNS, { count: "exact" })
    .eq("status", "Active");

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }
  if (filters.verifiedOnly) {
    query = query.eq("is_verified", true);
  }
  if (filters.minRating !== undefined && filters.minRating > 0) {
    query = query.gte("rating", filters.minRating);
  }
  if (filters.city && filters.city.trim().toLowerCase() !== "hyderabad") {
    query = query.ilike("description", `%${filters.city.trim()}%`);
  }
  if (filters.q) {
    const term = sanitizePostgrestFilterTerm(filters.q);
    if (term) {
      query = query.or(`vendor_name.ilike.%${term}%,description.ilike.%${term}%`);
    }
  }

  const ascending = filters.sortOrder === "asc";
  switch (filters.sortBy) {
    case "newest":
      query = query.order("created_at", { ascending }).order("vendor_id", { ascending: true });
      break;
    case "rating":
      query = query
        .order("rating", { ascending, nullsFirst: false })
        .order("is_verified", { ascending: false })
        .order("vendor_id", { ascending: true });
      break;
    case "reviews":
      query = query
        .order("rating", { ascending: false, nullsFirst: false })
        .order("is_verified", { ascending: false })
        .order("vendor_id", { ascending: true });
      break;
    case "relevance":
    default:
      query = query
        .order("is_verified", { ascending: false })
        .order("rating", { ascending: false, nullsFirst: false })
        .order("vendor_id", { ascending: true });
      break;
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw mapDatabaseError(error, "Failed to load vendors.");

  const rows = data ?? [];
  if (rows.length > 0) {
    const vendorIds = rows
      .map((r) => (r as unknown as { vendor_id?: number }).vendor_id)
      .filter((id): id is number => typeof id === "number");

    if (vendorIds.length > 0) {
      const { data: pricingRows } = await supabase
        .from("vendor_pricing")
        .select("vendor_id, price")
        .in("vendor_id", vendorIds);

      if (Array.isArray(pricingRows) && pricingRows.length > 0) {
        const pricingByVendorId = new Map<number, Array<{ price: number | null }>>();
        for (const p of pricingRows) {
          if (typeof p.vendor_id !== "number") continue;
          const list = pricingByVendorId.get(p.vendor_id) ?? [];
          list.push({ price: p.price });
          pricingByVendorId.set(p.vendor_id, list);
        }
        return {
          items: rows.map((row) => {
            const vid = (row as unknown as { vendor_id?: number }).vendor_id;
            return {
              ...(row as unknown as Record<string, unknown>),
              pricing: typeof vid === "number" ? (pricingByVendorId.get(vid) ?? []) : [],
            };
          }),
          meta: buildPaginationMeta(page, limit, count ?? rows.length),
        };
      }
    }
  }

  return {
    items: rows,
    meta: buildPaginationMeta(page, limit, count ?? rows.length),
  };
}

export async function getPublicVendorBySlugOrId(
  supabase: SupabaseClient<Database>,
  slugOrId: string,
  options?: { includeInactive?: boolean }
) {
  const trimmed = slugOrId.trim();
  const isNumeric = /^\d+$/.test(trimmed);

  let vendorQuery = supabase.from("vendors").select(PUBLIC_VENDOR_COLUMNS);
  if (!options?.includeInactive) {
    vendorQuery = vendorQuery.eq("status", "Active");
  }
  vendorQuery = isNumeric
    ? vendorQuery.eq("vendor_id", Number(trimmed))
    : vendorQuery.eq("slug", trimmed);

  const { data: vendorRaw, error } = await vendorQuery.maybeSingle();
  if (error) throw mapDatabaseError(error, "Failed to load vendor.");
  if (!vendorRaw || typeof vendorRaw !== "object") {
    throw new AppError("NOT_FOUND", 404, "Vendor not found.");
  }

  const vendor = vendorRaw as unknown as Record<string, unknown> & { vendor_id: number };
  const vendorId = vendor.vendor_id;

  const [
    servicesRes,
    pricingRes,
    packagesRes,
    galleryRes,
    videosRes,
    faqRes,
    socialRes,
    teamRes,
    availabilityRes,
  ] = await Promise.all([
    supabase.from("vendor_services").select("*").eq("vendor_id", vendorId),
    supabase.from("vendor_pricing").select("*").eq("vendor_id", vendorId),
    supabase.from("vendor_packages").select("*").eq("vendor_id", vendorId),
    supabase
      .from("vendor_gallery")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("vendor_videos")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("vendor_faq")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("sort_order", { ascending: true }),
    supabase.from("vendor_social_links").select("*").eq("vendor_id", vendorId),
    supabase.from("vendor_team").select("*").eq("vendor_id", vendorId),
    supabase
      .from("vendor_availability")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("available_from", { ascending: true }),
  ]);

  return {
    vendor,
    services: servicesRes.data ?? [],
    pricing: pricingRes.data ?? [],
    packages: packagesRes.data ?? [],
    gallery: galleryRes.data ?? [],
    videos: videosRes.data ?? [],
    faqs: faqRes.data ?? [],
    socialLinks: socialRes.data ?? [],
    team: teamRes.data ?? [],
    availability: availabilityRes.data ?? [],
  };
}

// ── Vendor Authenticated Self-Service (strictly owner-scoped, zero privilege mutations) ──
export async function getOwnedVendorProfile(
  supabase: SupabaseClient<Database>,
  vendorId: number
) {
  const details = await getPublicVendorBySlugOrId(supabase, String(vendorId), {
    includeInactive: true,
  });
  const { data: contacts } = await supabase
    .from("vendor_contacts")
    .select("*")
    .eq("vendor_id", vendorId);
  return { ...details, contacts: contacts ?? [] };
}

export async function updateOwnedVendorProfile(
  supabase: SupabaseClient<Database>,
  vendorId: number,
  userId: string,
  input: {
    vendorName?: string;
    description?: string;
    logo?: string | null;
    coverImage?: string | null;
    categoryId?: number;
  }
) {
  if (!userId) throw new AppError("UNAUTHENTICATED", 401, "Authentication required.");

  // Never write is_verified, status, user_id, or metadata in vendor self-service
  const safeUpdate: Database["public"]["Tables"]["vendors"]["Update"] = {
    updated_at: new Date().toISOString(),
  };
  if (input.vendorName !== undefined) safeUpdate.vendor_name = input.vendorName;
  if (input.description !== undefined) safeUpdate.description = input.description;
  if (input.logo !== undefined) safeUpdate.logo = input.logo;
  if (input.coverImage !== undefined) safeUpdate.cover_image = input.coverImage;
  if (input.categoryId !== undefined) safeUpdate.category_id = input.categoryId;

  // Ownership is enforced by ctx.vendorId and RLS private.is_vendor_owner(vendor_id); vendors.user_id is not client-readable
  const { data, error } = await supabase
    .from("vendors")
    .update(safeUpdate)
    .eq("vendor_id", vendorId)
    .select(PUBLIC_VENDOR_COLUMNS)
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to update vendor profile.");
  if (!data) throw new AppError("FORBIDDEN", 403, "Vendor ownership check failed.");
  return data;
}

export async function upsertOwnedVendorContacts(
  supabase: SupabaseClient<Database>,
  vendorId: number,
  input: {
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
  }
) {
  const { data: existing } = await supabase
    .from("vendor_contacts")
    .select("contact_id")
    .eq("vendor_id", vendorId)
    .maybeSingle();

  const row = {
    vendor_id: vendorId,
    contact_person: input.contactPerson ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    address: input.address ?? null,
  };

  if (existing) {
    const { data, error } = await supabase
      .from("vendor_contacts")
      .update(row)
      .eq("contact_id", existing.contact_id)
      .eq("vendor_id", vendorId)
      .select("*")
      .single();
    if (error || !data) throw mapDatabaseError(error, "Failed to update vendor contacts.");
    return data;
  }

  const { data, error } = await supabase
    .from("vendor_contacts")
    .insert(row)
    .select("*")
    .single();
  if (error || !data) throw mapDatabaseError(error, "Failed to create vendor contacts.");
  return data;
}

export async function adminLinkVendorUser(
  adminClient: SupabaseClient<Database>,
  vendorId: number,
  userId: string
) {
  const { data: roleRow } = await adminClient
    .from("roles")
    .select("role_id")
    .ilike("role_name", "vendor")
    .maybeSingle();

  const { data: vendor, error } = await adminClient
    .from("vendors")
    .update({ user_id: userId, updated_at: new Date().toISOString() })
    .eq("vendor_id", vendorId)
    .select("vendor_id, vendor_name, user_id, is_verified, status")
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to link vendor to user.");
  if (!vendor) throw new AppError("NOT_FOUND", 404, "Vendor not found.");

  if (roleRow?.role_id) {
    await adminClient
      .from("users")
      .update({ role_id: roleRow.role_id, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
  }

  return vendor;
}

export async function adminVerifyVendor(
  adminClient: SupabaseClient<Database>,
  vendorId: number,
  input: {
    isVerified: boolean;
    status?: "Active" | "Inactive" | "Pending" | "Rejected";
  }
) {
  const updatePayload: Database["public"]["Tables"]["vendors"]["Update"] = {
    is_verified: input.isVerified,
    updated_at: new Date().toISOString(),
  };
  if (input.status !== undefined) {
    updatePayload.status = input.status;
  } else if (input.isVerified) {
    updatePayload.status = "Active";
  }

  const { data, error } = await adminClient
    .from("vendors")
    .update(updatePayload)
    .eq("vendor_id", vendorId)
    .select("vendor_id, vendor_name, is_verified, status, updated_at")
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to verify vendor.");
  if (!data) throw new AppError("NOT_FOUND", 404, "Vendor not found.");
  return data;
}
