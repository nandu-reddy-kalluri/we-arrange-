import { NextRequest } from "next/server";
import { adminUserUpdateSchema, uuidSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireActiveAdmin } from "@/services/auth";
import { updateUserRoleAndStatus } from "@/services/admin/adminPortalService";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireActiveAdmin();
    const { id } = await context.params;
    const targetUserId = uuidSchema.parse(id);
    const body = await parseJsonBody(request, adminUserUpdateSchema);
    const adminClient = createServiceRoleClient();
    const updated = await updateUserRoleAndStatus(adminClient, auth.userId, targetUserId, body);
    return ok(updated);
  } catch (err) {
    return fail(err, "Failed to update user.");
  }
}
