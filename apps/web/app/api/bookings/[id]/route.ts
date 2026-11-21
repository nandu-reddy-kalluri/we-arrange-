import { NextRequest } from "next/server";
import { positiveIntIdSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { getBookingDetail } from "@we-arrange/service-booking";
import { requireAuthenticatedUser } from "@/services/auth";
import { fail, ok } from "@/services/http/response";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuthenticatedUser();
    const { id } = await context.params;
    const bookingId = positiveIntIdSchema.parse(id);
    const adminClient = createServiceRoleClient();
    const detail = await getBookingDetail(adminClient, bookingId, {
      userId: ctx.userId,
      isStaff: ctx.isConciergeOrAdmin,
      vendorId: ctx.vendorId,
    });
    return ok(detail);
  } catch (err) {
    return fail(err, "Failed to load booking.");
  }
}

