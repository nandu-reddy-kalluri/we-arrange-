import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, mapDatabaseError } from "@we-arrange/database/errors";
import { buildPaginationMeta, normalizePagination } from "@we-arrange/database/repository";
import type { Database } from "@we-arrange/database/types";

export async function listConciergeLeads(
  adminClient: SupabaseClient<Database>,
  options: {
    page?: number;
    limit?: number;
    status?: "Pending" | "Active" | "Approved" | "Rejected";
    assignedSpecialistId?: string;
    viewerUserId?: string;
    isActiveAdmin?: boolean;
  }
) {
  const { page, limit, from, to } = normalizePagination(options);
  let query = adminClient
    .from("enquiries")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (options.status) query = query.eq("status", options.status);
  if (options.assignedSpecialistId) {
    query = query.eq("assigned_specialist_id", options.assignedSpecialistId);
  } else if (options.viewerUserId && !options.isActiveAdmin) {
    query = query.or(
      `assigned_specialist_id.is.null,assigned_specialist_id.eq.${options.viewerUserId}`
    );
  }

  const { data: leads, error, count } = await query;
  if (error) throw mapDatabaseError(error, "Failed to load concierge leads.");

  const userIds = [
    ...new Set((leads ?? []).map((l) => l.user_id).filter((id): id is string => Boolean(id))),
  ];
  const { data: users } =
    userIds.length > 0
      ? await adminClient
          .from("users")
          .select("user_id, full_name, email, phone")
          .in("user_id", userIds)
      : { data: [] };

  const userMap = new Map((users ?? []).map((u) => [u.user_id, u]));

  return {
    items: (leads ?? []).map((l) => ({
      ...l,
      customer: l.user_id ? (userMap.get(l.user_id) ?? null) : null,
    })),
    meta: buildPaginationMeta(page, limit, count ?? leads?.length ?? 0),
  };
}

export async function getConciergeWorkspaceSummary(
  adminClient: SupabaseClient<Database>,
  specialistUserId: string
) {
  const [pendingRes, activeRes, assignedRes, siteVisitsRes, quotesRes] = await Promise.all([
    adminClient
      .from("enquiries")
      .select("enquiry_id", { count: "exact", head: true })
      .eq("status", "Pending"),
    adminClient
      .from("enquiries")
      .select("enquiry_id", { count: "exact", head: true })
      .eq("status", "Active"),
    adminClient
      .from("enquiries")
      .select("enquiry_id", { count: "exact", head: true })
      .eq("assigned_specialist_id", specialistUserId),
    adminClient
      .from("enquiries")
      .select("enquiry_id", { count: "exact", head: true })
      .in("site_visit_status", ["Requested", "Scheduled"])
      .or(`assigned_specialist_id.is.null,assigned_specialist_id.eq.${specialistUserId}`),
    adminClient
      .from("quotes")
      .select("quote_id", { count: "exact", head: true })
      .eq("collected_by", specialistUserId),
  ]);

  return {
    pendingLeads: pendingRes.count ?? 0,
    activeLeads: activeRes.count ?? 0,
    assignedToMe: assignedRes.count ?? 0,
    openSiteVisits: siteVisitsRes.count ?? 0,
    quotesCollectedByMe: quotesRes.count ?? 0,
  };
}

export async function getPrivateVenueContactsForStaff(
  adminClient: SupabaseClient<Database>,
  venueId: number
) {
  const [{ data: venue, error: vErr }, { data: contacts, error: cErr }] = await Promise.all([
    adminClient
      .from("venues")
      .select("venue_id, venue_name, phone, website, google_maps, address")
      .eq("venue_id", venueId)
      .maybeSingle(),
    adminClient.from("venue_contacts").select("*").eq("venue_id", venueId),
  ]);

  if (vErr) throw mapDatabaseError(vErr, "Failed to load venue record.");
  if (cErr) throw mapDatabaseError(cErr, "Failed to load venue contacts.");
  if (!venue) throw new AppError("NOT_FOUND", 404, "Venue not found.");

  return {
    venueId: venue.venue_id,
    venueName: venue.venue_name,
    primaryPhone: venue.phone,
    website: venue.website,
    googleMaps: venue.google_maps,
    address: venue.address,
    contacts: contacts ?? [],
  };
}

export async function getPrivateVendorContactsForStaff(
  adminClient: SupabaseClient<Database>,
  vendorId: number
) {
  const [{ data: vendor, error: vErr }, { data: contacts, error: cErr }] = await Promise.all([
    adminClient
      .from("vendors")
      .select("vendor_id, vendor_name, is_verified, status")
      .eq("vendor_id", vendorId)
      .maybeSingle(),
    adminClient.from("vendor_contacts").select("*").eq("vendor_id", vendorId),
  ]);

  if (vErr) throw mapDatabaseError(vErr, "Failed to load vendor record.");
  if (cErr) throw mapDatabaseError(cErr, "Failed to load vendor contacts.");
  if (!vendor) throw new AppError("NOT_FOUND", 404, "Vendor not found.");

  return {
    vendorId: vendor.vendor_id,
    vendorName: vendor.vendor_name,
    isVerified: vendor.is_verified,
    status: vendor.status,
    contacts: contacts ?? [],
  };
}

