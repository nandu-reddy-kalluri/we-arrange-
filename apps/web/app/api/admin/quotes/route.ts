import { NextRequest } from "next/server";
import { listQueryWithStatusSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireActiveAdmin } from "@/services/auth";
import { listQuotesForAdmin } from "@/services/admin/adminPortalService";
import { fail, ok, parseSearchParams } from "@/services/http/response";

export async function GET(request: NextRequest) {
  try {
    await requireActiveAdmin();
    const query = parseSearchParams(request.url, listQueryWithStatusSchema);
    const adminClient = createServiceRoleClient();
    const result = await listQuotesForAdmin(adminClient, query);
    return ok(result.items, result.meta);
  } catch (err) {
    return fail(err, "Failed to list quotes.");
  }
}
