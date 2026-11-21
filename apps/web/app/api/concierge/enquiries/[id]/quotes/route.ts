import { NextRequest } from "next/server";
import { positiveIntIdSchema, quoteCreateSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { createCuratedQuote } from "@we-arrange/service-booking";
import { requireConciergeOrAdmin } from "@/services/auth";
import { created, fail, parseJsonBody } from "@/services/http/response";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await requireConciergeOrAdmin();
    const { id } = await context.params;
    const enquiryId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, quoteCreateSchema);
    const adminClient = createServiceRoleClient();
    const quote = await createCuratedQuote(adminClient, enquiryId, staff.userId, {
      ...body,
      isActiveAdmin: staff.isActiveAdmin,
    });
    return created(quote);
  } catch (err) {
    return fail(err, "Failed to create quotation.");
  }
}

