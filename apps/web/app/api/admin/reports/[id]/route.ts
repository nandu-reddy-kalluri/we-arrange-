import { NextRequest } from "next/server";
import { positiveIntIdSchema, reportResolveSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireActiveAdmin } from "@/services/auth";
import { resolveReport } from "@/services/reviews/reviewService";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireActiveAdmin();
    const { id } = await context.params;
    const reportId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, reportResolveSchema);
    const adminClient = createServiceRoleClient();
    const report = await resolveReport(adminClient, reportId, userId, body);
    return ok(report);
  } catch (err) {
    return fail(err, "Failed to resolve report.");
  }
}
