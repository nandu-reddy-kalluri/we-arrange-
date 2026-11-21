import { NextRequest } from "next/server";
import { positiveIntIdSchema, venuePricingUpsertSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { upsertVenuePricing } from "@we-arrange/service-venue";
import { requireConciergeOrAdmin } from "@/services/auth";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireConciergeOrAdmin();
    const { id } = await context.params;
    const venueId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, venuePricingUpsertSchema);
    const adminClient = createServiceRoleClient();
    const saved = await upsertVenuePricing(adminClient, venueId, body);
    return ok(saved);
  } catch (err) {
    return fail(err, "Failed to update venue pricing.");
  }
}

