import { NextRequest } from "next/server";
import { bookingStatusUpdateSchema, positiveIntIdSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { updateBookingStatus } from "@we-arrange/service-booking";
import { requireConciergeOrAdmin } from "@/services/auth";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await requireConciergeOrAdmin();
    const { id } = await context.params;
    const bookingId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, bookingStatusUpdateSchema);
    const adminClient = createServiceRoleClient();
    const result = await updateBookingStatus(adminClient, bookingId, body, {
      userId: staff.userId,
      isActiveAdmin: staff.isActiveAdmin,
    });
    return ok(result);
  } catch (err) {
    return fail(err, "Failed to update booking status.");
  }
}

