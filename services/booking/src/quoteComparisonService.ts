import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, mapDatabaseError } from "@we-arrange/database/errors";
import {
  buildPaginationMeta,
  normalizePagination,
  PUBLIC_VENDOR_COLUMNS,
  PUBLIC_VENUE_COLUMNS,
} from "@we-arrange/database/repository";
import type { Database, Json } from "@we-arrange/database/types";

export async function createCuratedQuote(
  adminClient: SupabaseClient<Database>,
  enquiryId: number,
  staffUserId: string,
  input: {
    venueId?: number;
    vendorId?: number;
    packageName: string;
    baseCostInr: number;
    cateringIncluded: boolean;
    inclusions: string[];
    exclusions: string[];
    notes?: string;
    validUntil?: string;
    status?: "Draft" | "Published";
    isActiveAdmin?: boolean;
    allowVendorQuote?: boolean;
  }
) {
  const { data: enquiry, error: eErr } = await adminClient
    .from("enquiries")
    .select("enquiry_id, assigned_specialist_id")
    .eq("enquiry_id", enquiryId)
    .maybeSingle();
  if (eErr) throw mapDatabaseError(eErr, "Failed to verify enquiry.");
  if (!enquiry) throw new AppError("NOT_FOUND", 404, "Enquiry not found.");

  if (
    !input.allowVendorQuote &&
    !input.isActiveAdmin &&
    enquiry.assigned_specialist_id &&
    enquiry.assigned_specialist_id !== staffUserId
  ) {
    throw new AppError(
      "FORBIDDEN",
      403,
      "Cannot create quote for an enquiry assigned to another concierge specialist."
    );
  }

  const { data: quote, error } = await adminClient
    .from("quotes")
    .insert({
      enquiry_id: enquiryId,
      venue_id: input.venueId ?? null,
      vendor_id: input.vendorId ?? null,
      collected_by: staffUserId,
      package_name: input.packageName,
      base_cost_inr: input.baseCostInr,
      currency: "INR",
      catering_included: input.cateringIncluded,
      inclusions: input.inclusions as Json,
      exclusions: input.exclusions as Json,
      notes: input.notes ?? null,
      valid_until: input.validUntil ?? null,
      status: input.status ?? "Draft",
    })
    .select("*")
    .single();

  if (error || !quote) throw mapDatabaseError(error, "Failed to create curated quote.");
  return quote;
}

export async function updateCuratedQuote(
  adminClient: SupabaseClient<Database>,
  quoteId: number,
  input: {
    packageName?: string;
    baseCostInr?: number;
    cateringIncluded?: boolean;
    inclusions?: string[];
    exclusions?: string[];
    notes?: string | null;
    validUntil?: string | null;
    status?: "Draft" | "Published" | "Approved" | "Rejected";
  },
  actor?: { userId: string; isActiveAdmin?: boolean }
) {
  const { data: existingQuote, error: qErr } = await adminClient
    .from("quotes")
    .select("quote_id, enquiry_id, collected_by, status")
    .eq("quote_id", quoteId)
    .maybeSingle();

  if (qErr) throw mapDatabaseError(qErr, "Failed to verify quote ownership.");
  if (!existingQuote) throw new AppError("NOT_FOUND", 404, "Quote not found.");

  if (actor && !actor.isActiveAdmin) {
    const { data: enquiry, error: eErr } = existingQuote.enquiry_id
      ? await adminClient
          .from("enquiries")
          .select("assigned_specialist_id")
          .eq("enquiry_id", existingQuote.enquiry_id)
          .maybeSingle()
      : { data: null, error: null };

    if (eErr) throw mapDatabaseError(eErr, "Failed to verify enquiry ownership.");

    if (
      (enquiry?.assigned_specialist_id && enquiry.assigned_specialist_id !== actor.userId) ||
      (!enquiry?.assigned_specialist_id &&
        existingQuote.collected_by &&
        existingQuote.collected_by !== actor.userId)
    ) {
      throw new AppError(
        "FORBIDDEN",
        403,
        "Cannot modify a quote assigned to another concierge specialist."
      );
    }

    if (input.status === "Approved" && existingQuote.status !== "Approved") {
      throw new AppError(
        "FORBIDDEN",
        403,
        "Only the customer or an active administrator may approve a quote."
      );
    }
  }

  if (input.status !== undefined && input.status !== existingQuote.status) {
    if (existingQuote.status === "Approved" || existingQuote.status === "Rejected") {
      throw new AppError(
        "UNPROCESSABLE_ENTITY",
        422,
        `Cannot transition quote from finalized status '${existingQuote.status}' to '${input.status}'.`
      );
    }
    if (existingQuote.status === "Draft" && input.status === "Approved") {
      throw new AppError(
        "UNPROCESSABLE_ENTITY",
        422,
        "Quote must be Published before it can be Approved."
      );
    }
  }

  const updateData: Database["public"]["Tables"]["quotes"]["Update"] = {
    updated_at: new Date().toISOString(),
  };
  if (input.packageName !== undefined) updateData.package_name = input.packageName;
  if (input.baseCostInr !== undefined) updateData.base_cost_inr = input.baseCostInr;
  if (input.cateringIncluded !== undefined)
    updateData.catering_included = input.cateringIncluded;
  if (input.inclusions !== undefined) updateData.inclusions = input.inclusions as Json;
  if (input.exclusions !== undefined) updateData.exclusions = input.exclusions as Json;
  if (input.notes !== undefined) updateData.notes = input.notes;
  if (input.validUntil !== undefined) updateData.valid_until = input.validUntil;
  if (input.status !== undefined) updateData.status = input.status;

  const { data, error } = await adminClient
    .from("quotes")
    .update(updateData)
    .eq("quote_id", quoteId)
    .select("*")
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to update quote.");
  if (!data) throw new AppError("NOT_FOUND", 404, "Quote not found.");
  return data;
}

export async function getQuoteForViewer(
  adminClient: SupabaseClient<Database>,
  quoteId: number,
  viewer: { userId: string; isStaff: boolean; vendorId?: number | null }
) {
  const { data: quote, error } = await adminClient
    .from("quotes")
    .select("*")
    .eq("quote_id", quoteId)
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to load quote.");
  if (!quote) throw new AppError("NOT_FOUND", 404, "Quote not found.");

  if (!viewer.isStaff) {
    if (viewer.vendorId != null) {
      if (quote.vendor_id === viewer.vendorId) {
        return quote;
      }
      throw new AppError("FORBIDDEN", 403, "Access denied to this quote.");
    }
    if (quote.status === "Draft") {
      throw new AppError("NOT_FOUND", 404, "Quote not found.");
    }
    const { data: enquiry } = await adminClient
      .from("enquiries")
      .select("user_id")
      .eq("enquiry_id", quote.enquiry_id)
      .maybeSingle();
    if (!enquiry || enquiry.user_id !== viewer.userId) {
      throw new AppError("FORBIDDEN", 403, "Access denied to this quote.");
    }
  }

  return quote;
}

export async function respondToQuote(
  adminClient: SupabaseClient<Database>,
  quoteId: number,
  userId: string,
  decision: "Approved" | "Rejected",
  notes?: string
) {
  const quote = await getQuoteForViewer(adminClient, quoteId, {
    userId,
    isStaff: false,
  });

  if (quote.status === "Approved" || quote.status === "Rejected") {
    throw new AppError(
      "CONFLICT",
      409,
      `Quote has already been ${quote.status.toLowerCase()}.`
    );
  }
  if (quote.status !== "Published") {
    throw new AppError(
      "UNPROCESSABLE_ENTITY",
      422,
      "Only Published quotes can be responded to."
    );
  }

  if (quote.valid_until) {
    const todayIso = new Date().toISOString().slice(0, 10);
    if (quote.valid_until < todayIso && decision === "Approved") {
      throw new AppError("UNPROCESSABLE_ENTITY", 422, "This quote has expired.");
    }
  }

  const { data: updated, error } = await adminClient
    .from("quotes")
    .update({
      status: decision,
      updated_at: new Date().toISOString(),
    })
    .eq("quote_id", quoteId)
    .select("*")
    .single();

  if (error || !updated) throw mapDatabaseError(error, "Failed to respond to quote.");

  await adminClient.from("enquiry_status_history").insert({
    enquiry_id: quote.enquiry_id,
    status: decision,
    changed_by: userId,
    remarks: notes
      ? `Customer ${decision.toLowerCase()} quote #${quoteId}: ${notes}`
      : `Customer ${decision.toLowerCase()} quote #${quoteId}`,
  });

  return updated;
}

export async function createComparisonSheet(
  adminClient: SupabaseClient<Database>,
  enquiryId: number,
  staffUserId: string,
  input: {
    title: string;
    quoteIds: number[];
    summaryNotes?: string;
    status?: "Draft" | "Published";
    isActiveAdmin?: boolean;
  }
) {
  const { data: enquiry, error: eErr } = await adminClient
    .from("enquiries")
    .select("enquiry_id, assigned_specialist_id")
    .eq("enquiry_id", enquiryId)
    .maybeSingle();

  if (eErr) throw mapDatabaseError(eErr, "Failed to verify enquiry.");
  if (!enquiry) throw new AppError("NOT_FOUND", 404, "Enquiry not found.");

  if (
    !input.isActiveAdmin &&
    enquiry.assigned_specialist_id &&
    enquiry.assigned_specialist_id !== staffUserId
  ) {
    throw new AppError(
      "FORBIDDEN",
      403,
      "Cannot create comparison sheet for an enquiry assigned to another concierge specialist."
    );
  }

  const uniqueIds = [...new Set(input.quoteIds)];
  const { data: quotes, error: qErr } = await adminClient
    .from("quotes")
    .select("quote_id, enquiry_id")
    .in("quote_id", uniqueIds);

  if (qErr) throw mapDatabaseError(qErr, "Failed to verify quotes for comparison.");
  if (!quotes || quotes.length !== uniqueIds.length) {
    throw new AppError("VALIDATION_ERROR", 400, "One or more quoteIds do not exist.");
  }
  const wrongEnquiry = quotes.some((q) => q.enquiry_id !== enquiryId);
  if (wrongEnquiry) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "All quotes in a comparison sheet must belong to the same enquiry."
    );
  }

  const { data, error } = await adminClient
    .from("comparison_sheets")
    .insert({
      enquiry_id: enquiryId,
      created_by: staffUserId,
      title: input.title,
      quote_ids: uniqueIds,
      summary_notes: input.summaryNotes ?? null,
      status: input.status ?? "Published",
    })
    .select("*")
    .single();

  if (error || !data) throw mapDatabaseError(error, "Failed to create comparison sheet.");
  return data;
}

export async function listCustomerComparisonSheets(
  adminClient: SupabaseClient<Database>,
  viewer: { userId: string; isStaff: boolean },
  pagination?: { page?: number; limit?: number }
) {
  const { page, limit, from, to } = normalizePagination(pagination);

  if (viewer.isStaff) {
    const { data, error, count } = await adminClient
      .from("comparison_sheets")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw mapDatabaseError(error, "Failed to list comparison sheets.");
    return {
      items: data ?? [],
      meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0),
    };
  }

  const { data: ownEnquiries } = await adminClient
    .from("enquiries")
    .select("enquiry_id")
    .eq("user_id", viewer.userId);
  const enquiryIds = (ownEnquiries ?? []).map((e) => e.enquiry_id);
  if (enquiryIds.length === 0) {
    return { items: [], meta: buildPaginationMeta(page, limit, 0) };
  }

  const { data, error, count } = await adminClient
    .from("comparison_sheets")
    .select("*", { count: "exact" })
    .in("enquiry_id", enquiryIds)
    .neq("status", "Draft")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw mapDatabaseError(error, "Failed to load comparison sheets.");
  return {
    items: data ?? [],
    meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0),
  };
}

export async function getComparisonSheetDetail(
  adminClient: SupabaseClient<Database>,
  sheetId: number,
  viewer: { userId: string; isStaff: boolean }
) {
  const { data: sheet, error } = await adminClient
    .from("comparison_sheets")
    .select("*")
    .eq("comparison_sheet_id", sheetId)
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to load comparison sheet.");
  if (!sheet) throw new AppError("NOT_FOUND", 404, "Comparison sheet not found.");

  if (!viewer.isStaff) {
    if (sheet.status === "Draft") {
      throw new AppError("NOT_FOUND", 404, "Comparison sheet not found.");
    }
    const { data: enquiry } = await adminClient
      .from("enquiries")
      .select("user_id")
      .eq("enquiry_id", sheet.enquiry_id)
      .maybeSingle();
    if (!enquiry || enquiry.user_id !== viewer.userId) {
      throw new AppError("FORBIDDEN", 403, "Access denied to this comparison sheet.");
    }
  }

  const { data: quotes } =
    sheet.quote_ids.length > 0
      ? await adminClient
          .from("quotes")
          .select("*")
          .in("quote_id", sheet.quote_ids)
      : { data: [] };

  return { sheet, quotes: quotes ?? [] };
}

export async function buildComparisonPreview(
  supabase: SupabaseClient<Database>,
  input: { venueIds: number[]; vendorIds: number[] }
) {
  const [venuesRes, venuePricingRes, vendorsRes, vendorPricingRes] = await Promise.all([
    input.venueIds.length > 0
      ? supabase
          .from("venues")
          .select(PUBLIC_VENUE_COLUMNS)
          .in("venue_id", input.venueIds)
          .eq("status", "Active")
      : Promise.resolve({ data: [] }),
    input.venueIds.length > 0
      ? supabase.from("venue_pricing").select("*").in("venue_id", input.venueIds)
      : Promise.resolve({ data: [] }),
    input.vendorIds.length > 0
      ? supabase
          .from("vendors")
          .select(PUBLIC_VENDOR_COLUMNS)
          .in("vendor_id", input.vendorIds)
          .eq("status", "Active")
      : Promise.resolve({ data: [] }),
    input.vendorIds.length > 0
      ? supabase.from("vendor_pricing").select("*").in("vendor_id", input.vendorIds)
      : Promise.resolve({ data: [] }),
  ]);

  return {
    venues: venuesRes.data ?? [],
    venuePricing: venuePricingRes.data ?? [],
    vendors: vendorsRes.data ?? [],
    vendorPricing: vendorPricingRes.data ?? [],
  };
}
