import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, mapDatabaseError } from "@we-arrange/database/errors";
import { buildPaginationMeta, normalizePagination } from "@we-arrange/database/repository";
import type { Database } from "@we-arrange/database/types";

export async function createCustomerEnquiry(
  supabase: SupabaseClient<Database>,
  adminClient: SupabaseClient<Database>,
  userId: string,
  input: {
    venueId?: number;
    vendorId?: number;
    subject: string;
    message: string;
    eventDate?: string;
    guestCount?: number;
    budgetRange?: string;
    preferredCity?: string;
  }
) {
  const detailsHeader = [
    input.eventDate ? `Event Date: ${input.eventDate}` : null,
    input.guestCount ? `Guests: ${input.guestCount}` : null,
    input.budgetRange ? `Budget: ${input.budgetRange}` : null,
    input.preferredCity ? `City: ${input.preferredCity}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const fullMessage = detailsHeader ? `[${detailsHeader}]\n${input.message}` : input.message;

  const { data: enquiry, error } = await supabase
    .from("enquiries")
    .insert({
      user_id: userId,
      venue_id: input.venueId ?? null,
      vendor_id: input.vendorId ?? null,
      subject: input.subject,
      message: fullMessage,
      status: "Pending",
      assigned_specialist_id: null,
    })
    .select("*")
    .single();

  if (error || !enquiry) throw mapDatabaseError(error, "Failed to submit enquiry.");

  // Record initial audit status history via server client
  const { error: histErr } = await adminClient.from("enquiry_status_history").insert({
    enquiry_id: enquiry.enquiry_id,
    status: "Pending",
    changed_by: userId,
    remarks: "Enquiry submitted by customer.",
  });
  if (histErr) throw mapDatabaseError(histErr, "Failed to record initial enquiry status history.");

  return enquiry;
}

export async function listEnquiries(
  client: SupabaseClient<Database>,
  options: {
    userId?: string;
    vendorId?: number;
    status?: "Pending" | "Active" | "Approved" | "Rejected";
    assignedSpecialistId?: string;
    page?: number;
    limit?: number;
  }
) {
  const { page, limit, from, to } = normalizePagination(options);
  let query = client
    .from("enquiries")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (options.userId) query = query.eq("user_id", options.userId);
  if (options.vendorId !== undefined) query = query.eq("vendor_id", options.vendorId);
  if (options.status) query = query.eq("status", options.status);
  if (options.assignedSpecialistId) {
    query = query.eq("assigned_specialist_id", options.assignedSpecialistId);
  }

  const { data, error, count } = await query;
  if (error) throw mapDatabaseError(error, "Failed to list enquiries.");

  return {
    items: data ?? [],
    meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0),
  };
}

export async function getEnquiryDetail(
  client: SupabaseClient<Database>,
  enquiryId: number,
  options: {
    viewerUserId: string;
    isStaff: boolean;
    isActiveAdmin?: boolean;
    viewerVendorId?: number | null;
  }
) {
  const { data: enquiry, error } = await client
    .from("enquiries")
    .select("*")
    .eq("enquiry_id", enquiryId)
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to load enquiry.");
  if (!enquiry) throw new AppError("NOT_FOUND", 404, "Enquiry not found.");

  const isCustomerOwner = enquiry.user_id === options.viewerUserId;
  const isVendorOwner = Boolean(
    options.viewerVendorId != null && enquiry.vendor_id === options.viewerVendorId
  );

  if (!options.isStaff && !isCustomerOwner && !isVendorOwner) {
    throw new AppError("FORBIDDEN", 403, "You do not have permission to view this enquiry.");
  }

  if (
    options.isStaff &&
    !options.isActiveAdmin &&
    enquiry.assigned_specialist_id &&
    enquiry.assigned_specialist_id !== options.viewerUserId
  ) {
    throw new AppError(
      "FORBIDDEN",
      403,
      "This enquiry is assigned to another concierge specialist."
    );
  }

  let quotesQuery = client
    .from("quotes")
    .select("*")
    .eq("enquiry_id", enquiryId)
    .order("created_at", { ascending: false });

  let sheetsQuery = client
    .from("comparison_sheets")
    .select("*")
    .eq("enquiry_id", enquiryId)
    .order("created_at", { ascending: false });

  if (!options.isStaff && isVendorOwner && !isCustomerOwner) {
    quotesQuery = quotesQuery.eq("vendor_id", options.viewerVendorId!);
  } else if (!options.isStaff) {
    quotesQuery = quotesQuery.neq("status", "Draft");
    sheetsQuery = sheetsQuery.neq("status", "Draft");
  }

  const [messagesRes, historyRes, quotesRes, sheetsRes] = await Promise.all([
    client
      .from("enquiry_messages")
      .select("*")
      .eq("enquiry_id", enquiryId)
      .order("created_at", { ascending: true }),
    client
      .from("enquiry_status_history")
      .select("*")
      .eq("enquiry_id", enquiryId)
      .order("created_at", { ascending: true }),
    quotesQuery,
    !options.isStaff && isVendorOwner && !isCustomerOwner
      ? Promise.resolve({ data: [] })
      : sheetsQuery,
  ]);

  return {
    enquiry,
    messages: messagesRes.data ?? [],
    statusHistory: historyRes.data ?? [],
    quotes: quotesRes.data ?? [],
    comparisonSheets: sheetsRes.data ?? [],
  };
}

export async function postEnquiryMessage(
  client: SupabaseClient<Database>,
  enquiryId: number,
  sender: {
    userId: string;
    isStaff: boolean;
    isActiveAdmin?: boolean;
    vendorId?: number | null;
  },
  message: string
) {
  const { data: enquiry, error: eErr } = await client
    .from("enquiries")
    .select("enquiry_id, user_id, vendor_id, assigned_specialist_id")
    .eq("enquiry_id", enquiryId)
    .maybeSingle();

  if (eErr) throw mapDatabaseError(eErr, "Failed to verify enquiry.");
  if (!enquiry) throw new AppError("NOT_FOUND", 404, "Enquiry not found.");

  const isCustomerOwner = enquiry.user_id === sender.userId;
  const isVendorOwner = Boolean(sender.vendorId != null && enquiry.vendor_id === sender.vendorId);

  if (!sender.isStaff && !isCustomerOwner && !isVendorOwner) {
    throw new AppError("FORBIDDEN", 403, "Cannot post message to another user's enquiry.");
  }

  if (
    sender.isStaff &&
    !sender.isActiveAdmin &&
    enquiry.assigned_specialist_id &&
    enquiry.assigned_specialist_id !== sender.userId
  ) {
    throw new AppError(
      "FORBIDDEN",
      403,
      "Cannot post message to an enquiry assigned to another concierge specialist."
    );
  }

  const { data, error } = await client
    .from("enquiry_messages")
    .insert({
      enquiry_id: enquiryId,
      sender_id: sender.userId,
      message,
    })
    .select("*")
    .single();

  if (error || !data) throw mapDatabaseError(error, "Failed to post enquiry message.");
  return data;
}

export async function assignEnquirySpecialist(
  adminClient: SupabaseClient<Database>,
  enquiryId: number,
  input: { specialistId: string; assignedBy: string; remarks?: string }
) {
  // Verify specialist is an active concierge or active admin user (without non-active admin override)
  const [{ data: specialistAdmin }, { data: specialistUser }] = await Promise.all([
    adminClient
      .from("admins")
      .select("admin_id, status")
      .eq("user_id", input.specialistId)
      .maybeSingle(),
    adminClient
      .from("users")
      .select("user_id, role_id, status")
      .eq("user_id", input.specialistId)
      .eq("status", "Active")
      .maybeSingle(),
  ]);

  const isActiveAdmin = Boolean(specialistAdmin && specialistAdmin.status === "active");
  const hasNonActiveAdminRecord = Boolean(specialistAdmin && specialistAdmin.status !== "active");

  let isActiveConcierge = false;
  if (specialistUser && !hasNonActiveAdminRecord && specialistUser.role_id) {
    const { data: roleRow } = await adminClient
      .from("roles")
      .select("role_name, status")
      .eq("role_id", specialistUser.role_id)
      .maybeSingle();
    const roleName = roleRow?.role_name?.toLowerCase().trim();
    const isRoleActive = !roleRow?.status || roleRow.status === "Active";
    isActiveConcierge = isRoleActive && roleName === "concierge";
  }

  const isValidSpecialist = Boolean(specialistUser) && (isActiveAdmin || isActiveConcierge);

  if (!isValidSpecialist) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "Target specialist must be an active concierge or admin account."
    );
  }

  const { data: updated, error } = await adminClient
    .from("enquiries")
    .update({
      assigned_specialist_id: input.specialistId,
      status: "Active",
      updated_at: new Date().toISOString(),
    })
    .eq("enquiry_id", enquiryId)
    .select("*")
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to assign enquiry specialist.");
  if (!updated) throw new AppError("NOT_FOUND", 404, "Enquiry not found.");

  await adminClient.from("enquiry_status_history").insert({
    enquiry_id: enquiryId,
    status: "Active",
    changed_by: input.assignedBy,
    remarks: input.remarks ?? `Assigned to specialist ${input.specialistId}`,
  });

  return updated;
}

export async function updateEnquiryStatus(
  adminClient: SupabaseClient<Database>,
  enquiryId: number,
  input: {
    status: "Pending" | "Active" | "Approved" | "Rejected";
    changedBy: string;
    isActiveAdmin?: boolean;
    remarks?: string;
  }
) {
  if (!input.isActiveAdmin) {
    const { data: existing, error: fetchErr } = await adminClient
      .from("enquiries")
      .select("enquiry_id, assigned_specialist_id")
      .eq("enquiry_id", enquiryId)
      .maybeSingle();

    if (fetchErr) throw mapDatabaseError(fetchErr, "Failed to verify enquiry ownership.");
    if (!existing) throw new AppError("NOT_FOUND", 404, "Enquiry not found.");
    if (existing.assigned_specialist_id && existing.assigned_specialist_id !== input.changedBy) {
      throw new AppError(
        "FORBIDDEN",
        403,
        "Cannot modify status of an enquiry assigned to another concierge specialist."
      );
    }
  }

  const { data, error } = await adminClient
    .from("enquiries")
    .update({
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("enquiry_id", enquiryId)
    .select("*")
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to update enquiry status.");
  if (!data) throw new AppError("NOT_FOUND", 404, "Enquiry not found.");

  await adminClient.from("enquiry_status_history").insert({
    enquiry_id: enquiryId,
    status: input.status,
    changed_by: input.changedBy,
    remarks: input.remarks ?? null,
  });

  return data;
}

export async function updateEnquirySiteVisit(
  adminClient: SupabaseClient<Database>,
  enquiryId: number,
  staffUserId: string,
  input: {
    siteVisitAt?: string;
    siteVisitStatus: "Requested" | "Scheduled" | "Completed" | "Cancelled";
    siteVisitNotes?: string;
    isActiveAdmin?: boolean;
  }
) {
  if (!input.isActiveAdmin) {
    const { data: existing, error: fetchErr } = await adminClient
      .from("enquiries")
      .select("enquiry_id, assigned_specialist_id")
      .eq("enquiry_id", enquiryId)
      .maybeSingle();

    if (fetchErr) throw mapDatabaseError(fetchErr, "Failed to verify enquiry ownership.");
    if (!existing) throw new AppError("NOT_FOUND", 404, "Enquiry not found.");
    if (existing.assigned_specialist_id && existing.assigned_specialist_id !== staffUserId) {
      throw new AppError(
        "FORBIDDEN",
        403,
        "Cannot modify site visit for an enquiry assigned to another concierge specialist."
      );
    }
  }

  const { data, error } = await adminClient
    .from("enquiries")
    .update({
      site_visit_at: input.siteVisitAt ?? null,
      site_visit_status: input.siteVisitStatus,
      site_visit_notes: input.siteVisitNotes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("enquiry_id", enquiryId)
    .select("*")
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to update site visit coordination.");
  if (!data) throw new AppError("NOT_FOUND", 404, "Enquiry not found.");

  await adminClient.from("enquiry_status_history").insert({
    enquiry_id: enquiryId,
    status: data.status ?? "Active",
    changed_by: staffUserId,
    remarks: `Site visit ${input.siteVisitStatus}${input.siteVisitAt ? ` (${input.siteVisitAt})` : ""}`,
  });

  return data;
}

