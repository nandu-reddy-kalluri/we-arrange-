import { NextRequest } from "next/server";
import { positiveIntIdSchema, venueAvailabilityCreateSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { addVenueAvailabilitySlot } from "@we-arrange/service-venue";
import { requireConciergeOrAdmin } from "@/services/auth";
import { created, fail, parseJsonBody } from "@/services/http/response";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireConciergeOrAdmin();
    const { id } = await context.params;
    const venueId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, venueAvailabilityCreateSchema);
    const adminClient = createServiceRoleClient();
    const slot = await addVenueAvailabilitySlot(adminClient, venueId, body);
    return created(slot);
  } catch (err) {
    return fail(err, "Failed to create venue availability slot.");
  }
}

