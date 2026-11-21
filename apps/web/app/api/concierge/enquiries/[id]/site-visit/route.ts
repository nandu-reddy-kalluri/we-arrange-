import { NextRequest } from "next/server";
import { positiveIntIdSchema, siteVisitUpdateSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { updateEnquirySiteVisit } from "@we-arrange/service-booking";
import { requireConciergeOrAdmin } from "@/services/auth";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await requireConciergeOrAdmin();
    const { id } = await context.params;
    const enquiryId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, siteVisitUpdateSchema);
    const adminClient = createServiceRoleClient();
    const updated = await updateEnquirySiteVisit(adminClient, enquiryId, staff.userId, {
      ...body,
      isActiveAdmin: staff.isActiveAdmin,
    });
    return ok(updated);
  } catch (err) {
    return fail(err, "Failed to update site visit status.");
  }
}

