import { NextRequest } from "next/server";
import { paginationQuerySchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireActiveAdmin } from "@/services/auth";
import { listModerationLogs } from "@/services/admin/adminPortalService";
import { fail, ok, parseSearchParams } from "@/services/http/response";

export async function GET(request: NextRequest) {
  try {
    await requireActiveAdmin();
    const query = parseSearchParams(request.nextUrl.searchParams, paginationQuerySchema);
    const adminClient = createServiceRoleClient();
    const res = await listModerationLogs(adminClient, query);
    return ok(res.items, res.meta);
  } catch (err) {
    return fail(err, "Failed to list moderation logs.");
  }
}
