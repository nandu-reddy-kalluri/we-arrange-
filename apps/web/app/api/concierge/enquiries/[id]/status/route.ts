import { NextRequest } from "next/server";
import { conciergeEnquiryStatusSchema, positiveIntIdSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { updateEnquiryStatus } from "@we-arrange/service-booking";
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
    const body = await parseJsonBody(request, conciergeEnquiryStatusSchema);
    const adminClient = createServiceRoleClient();
    const updated = await updateEnquiryStatus(adminClient, enquiryId, {
      status: body.status,
      changedBy: staff.userId,
      isActiveAdmin: staff.isActiveAdmin,
      remarks: body.remarks,
    });
    return ok(updated);
  } catch (err) {
    return fail(err, "Failed to update enquiry status.");
  }
}

