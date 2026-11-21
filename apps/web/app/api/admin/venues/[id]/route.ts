import { NextRequest } from "next/server";
import { positiveIntIdSchema, venueUpdateSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { deleteVenueRecord, updateVenueRecord } from "@we-arrange/service-venue";
import { requireActiveAdmin, requireConciergeOrAdmin } from "@/services/auth";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireConciergeOrAdmin();
    const { id } = await context.params;
    const venueId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, venueUpdateSchema);
    const adminClient = createServiceRoleClient();
    const updated = await updateVenueRecord(adminClient, venueId, body);
    return ok(updated);
  } catch (err) {
    return fail(err, "Failed to update venue.");
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireActiveAdmin();
    const { id } = await context.params;
    const venueId = positiveIntIdSchema.parse(id);
    const adminClient = createServiceRoleClient();
    const result = await deleteVenueRecord(adminClient, venueId);
    return ok(result);
  } catch (err) {
    return fail(err, "Failed to deactivate venue.");
  }
}

