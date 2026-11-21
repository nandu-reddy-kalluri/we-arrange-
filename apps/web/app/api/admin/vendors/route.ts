import { NextRequest } from "next/server";
import { z } from "zod";
import { listQueryWithStatusSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireActiveAdmin } from "@/services/auth";
import { listVendorsForAdmin } from "@/services/admin/adminPortalService";
import { fail, ok, parseSearchParams } from "@/services/http/response";

const adminVendorsQuerySchema = listQueryWithStatusSchema.extend({
  search: z.string().trim().max(120).optional(),
  verified: z.enum(["true", "false"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireActiveAdmin();
    const query = parseSearchParams(request.url, adminVendorsQuerySchema);
    const adminClient = createServiceRoleClient();
    const result = await listVendorsForAdmin(adminClient, query);
    return ok(result.items, result.meta);
  } catch (err) {
    return fail(err, "Failed to list vendors.");
  }
}
