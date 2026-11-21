import { NextRequest } from "next/server";
import { paginationQuerySchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { listCustomerComparisonSheets } from "@we-arrange/service-booking";
import { requireAuthenticatedUser } from "@/services/auth";
import { fail, ok, parseSearchParams } from "@/services/http/response";

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const q = parseSearchParams(request.url, paginationQuerySchema);
    const adminClient = createServiceRoleClient();
    const result = await listCustomerComparisonSheets(
      adminClient,
      { userId: ctx.userId, isStaff: ctx.isConciergeOrAdmin },
      q
    );
    return ok(result.items, result.meta);
  } catch (err) {
    return fail(err, "Failed to load comparison sheets.");
  }
}

