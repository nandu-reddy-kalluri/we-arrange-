import { NextRequest } from "next/server";
import { positiveIntIdSchema, quoteUpdateSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { updateCuratedQuote } from "@we-arrange/service-booking";
import { requireConciergeOrAdmin } from "@/services/auth";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await requireConciergeOrAdmin();
    const { id } = await context.params;
    const quoteId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, quoteUpdateSchema);
    const adminClient = createServiceRoleClient();
    const updated = await updateCuratedQuote(adminClient, quoteId, body, {
      userId: staff.userId,
      isActiveAdmin: staff.isActiveAdmin,
    });
    return ok(updated);
  } catch (err) {
    return fail(err, "Failed to update quotation.");
  }
}

