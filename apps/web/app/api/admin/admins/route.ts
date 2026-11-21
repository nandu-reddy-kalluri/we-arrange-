import { NextRequest } from "next/server";
import { adminAssignSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireActiveAdmin } from "@/services/auth";
import { assignOrUpdateAdmin, listAdmins } from "@/services/admin/adminPortalService";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function GET() {
  try {
    await requireActiveAdmin();
    const adminClient = createServiceRoleClient();
    const data = await listAdmins(adminClient);
    return ok(data);
  } catch (err) {
    return fail(err, "Failed to list admins.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireActiveAdmin();
    const body = await parseJsonBody(request, adminAssignSchema);
    const adminClient = createServiceRoleClient();
    const data = await assignOrUpdateAdmin(adminClient, auth.userId, body);
    return ok(data);
  } catch (err) {
    return fail(err, "Failed to assign admin.");
  }
}
