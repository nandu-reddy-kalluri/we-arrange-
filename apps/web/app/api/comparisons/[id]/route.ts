import { NextRequest } from "next/server";
import { positiveIntIdSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { getComparisonSheetDetail } from "@we-arrange/service-booking";
import { requireAuthenticatedUser } from "@/services/auth";
import { fail, ok } from "@/services/http/response";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuthenticatedUser();
    const { id } = await context.params;
    const sheetId = positiveIntIdSchema.parse(id);
    const adminClient = createServiceRoleClient();
    const detail = await getComparisonSheetDetail(adminClient, sheetId, {
      userId: ctx.userId,
      isStaff: ctx.isConciergeOrAdmin,
    });
    return ok(detail);
  } catch (err) {
    return fail(err, "Failed to load comparison sheet.");
  }
}

