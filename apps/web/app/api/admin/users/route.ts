import { NextRequest } from "next/server";
import { listQueryWithStatusSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireActiveAdmin } from "@/services/auth";
import { listUsersForAdmin } from "@/services/admin/adminPortalService";
import { fail, ok, parseSearchParams } from "@/services/http/response";
import { z } from "zod";

const adminUsersQuerySchema = listQueryWithStatusSchema.extend({
  search: z.string().trim().max(120).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireActiveAdmin();
    const query = parseSearchParams(request.nextUrl.searchParams, adminUsersQuerySchema);
    const adminClient = createServiceRoleClient();
    const res = await listUsersForAdmin(adminClient, query);
    return ok(res.items, res.meta);
  } catch (err) {
    return fail(err, "Failed to list users.");
  }
}
