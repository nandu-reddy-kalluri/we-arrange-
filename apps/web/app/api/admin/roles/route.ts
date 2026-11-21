import { NextRequest } from "next/server";
import { adminRoleCreateSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireActiveAdmin } from "@/services/auth";
import { createRoleWithPermissions, listRolesAndPermissions } from "@/services/admin/adminPortalService";
import { created, fail, ok, parseJsonBody } from "@/services/http/response";

export async function GET() {
  try {
    await requireActiveAdmin();
    const adminClient = createServiceRoleClient();
    const data = await listRolesAndPermissions(adminClient);
    return ok(data);
  } catch (err) {
    return fail(err, "Failed to list roles.");
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireActiveAdmin();
    const body = await parseJsonBody(request, adminRoleCreateSchema);
    const adminClient = createServiceRoleClient();
    const role = await createRoleWithPermissions(adminClient, body);
    return created(role);
  } catch (err) {
    return fail(err, "Failed to create role.");
  }
}
