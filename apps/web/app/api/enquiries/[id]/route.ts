import { NextRequest } from "next/server";
import { positiveIntIdSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { getEnquiryDetail } from "@we-arrange/service-booking";
import { requireAuthenticatedUser } from "@/services/auth";
import { fail, ok } from "@/services/http/response";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuthenticatedUser();
    const { id } = await context.params;
    const enquiryId = positiveIntIdSchema.parse(id);
    const client =
      ctx.isConciergeOrAdmin || ctx.vendorId !== null
        ? createServiceRoleClient()
        : ctx.supabase;
    const detail = await getEnquiryDetail(client, enquiryId, {
      viewerUserId: ctx.userId,
      isStaff: ctx.isConciergeOrAdmin,
      isActiveAdmin: ctx.isActiveAdmin,
      viewerVendorId: ctx.vendorId,
    });
    return ok(detail);
  } catch (err) {
    return fail(err, "Failed to load enquiry details.");
  }
}

