import { NextRequest } from "next/server";
import { listQueryWithStatusSchema, reportCreateSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireAuthenticatedUser } from "@/services/auth";
import { listReports, submitReport } from "@/services/reviews/reviewService";
import { created, fail, ok, parseJsonBody, parseSearchParams } from "@/services/http/response";

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const query = parseSearchParams(request.nextUrl.searchParams, listQueryWithStatusSchema);
    const status =
      query.status === "active" || query.status === "inactive" || query.status === "pending"
        ? query.status
        : undefined;

    if (ctx.isConciergeOrAdmin) {
      const adminClient = createServiceRoleClient();
      const res = await listReports(adminClient, { ...query, status });
      return ok(res.items, res.meta);
    }

    const res = await listReports(ctx.supabase, {
      ...query,
      status,
      reporterId: ctx.userId,
    });
    return ok(res.items, res.meta);
  } catch (err) {
    return fail(err, "Failed to list reports.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, userId } = await requireAuthenticatedUser();
    const body = await parseJsonBody(request, reportCreateSchema);
    const report = await submitReport(supabase, userId, body);
    return created(report);
  } catch (err) {
    return fail(err, "Failed to submit report.");
  }
}
