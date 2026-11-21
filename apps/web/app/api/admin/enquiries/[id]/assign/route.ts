import { NextRequest } from "next/server";
import { adminEnquiryAssignSchema, positiveIntIdSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { assignEnquirySpecialist } from "@we-arrange/service-booking";
import { requireActiveAdmin } from "@/services/auth";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireActiveAdmin();
    const { id } = await context.params;
    const enquiryId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, adminEnquiryAssignSchema);
    const adminClient = createServiceRoleClient();
    const updated = await assignEnquirySpecialist(adminClient, enquiryId, {
      specialistId: body.specialistId,
      assignedBy: admin.userId,
      remarks: body.remarks,
    });
    return ok(updated);
  } catch (err) {
    return fail(err, "Failed to assign enquiry specialist.");
  }
}

