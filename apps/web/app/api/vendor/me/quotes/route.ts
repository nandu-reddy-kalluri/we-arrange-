import { NextRequest } from "next/server";
import { vendorQuoteCreateSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { AppError, mapDatabaseError } from "@we-arrange/database/errors";
import { createCuratedQuote } from "@we-arrange/service-booking";
import { requireVendorOwner } from "@/services/auth";
import { created, fail, ok, parseJsonBody } from "@/services/http/response";

export async function GET() {
  try {
    const ctx = await requireVendorOwner();
    const adminClient = createServiceRoleClient();
    const { data, error } = await adminClient
      .from("quotes")
      .select("*")
      .eq("vendor_id", ctx.vendorId)
      .order("created_at", { ascending: false });

    if (error) throw mapDatabaseError(error, "Failed to load vendor quotes.");
    return ok(data ?? []);
  } catch (err) {
    return fail(err, "Failed to load vendor quotes.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireVendorOwner();
    const body = await parseJsonBody(request, vendorQuoteCreateSchema);
    const adminClient = createServiceRoleClient();

    const { data: enquiry, error: eErr } = await adminClient
      .from("enquiries")
      .select("enquiry_id, vendor_id")
      .eq("enquiry_id", body.enquiryId)
      .maybeSingle();

    if (eErr) throw mapDatabaseError(eErr, "Failed to verify enquiry ownership.");
    if (!enquiry) throw new AppError("NOT_FOUND", 404, "Enquiry not found.");
    if (enquiry.vendor_id !== ctx.vendorId) {
      throw new AppError(
        "FORBIDDEN",
        403,
        "You can only create quotes for enquiries assigned to your vendor profile."
      );
    }

    const quote = await createCuratedQuote(adminClient, body.enquiryId, ctx.userId, {
      vendorId: ctx.vendorId,
      packageName: body.packageName,
      baseCostInr: body.baseCostInr,
      cateringIncluded: body.cateringIncluded,
      inclusions: body.inclusions,
      exclusions: body.exclusions,
      notes: body.notes,
      validUntil: body.validUntil,
      status: body.status,
      allowVendorQuote: true,
    });

    return created(quote);
  } catch (err) {
    return fail(err, "Failed to create vendor quote.");
  }
}
