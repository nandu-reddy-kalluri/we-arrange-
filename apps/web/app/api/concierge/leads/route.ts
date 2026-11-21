import { NextRequest } from "next/server";
import { enquiryListQuerySchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireConciergeOrAdmin } from "@/services/auth";
import { listConciergeLeads } from "@/services/concierge/conciergeService";
import { fail, ok, parseSearchParams } from "@/services/http/response";

export async function GET(request: NextRequest) {
  try {
    const staff = await requireConciergeOrAdmin();
    const q = parseSearchParams(request.url, enquiryListQuerySchema);
    const adminClient = createServiceRoleClient();
    const result = await listConciergeLeads(adminClient, {
      page: q.page,
      limit: q.limit,
      status: q.status,
      assignedSpecialistId: q.assignedToMe === "true" ? staff.userId : undefined,
      viewerUserId: staff.userId,
      isActiveAdmin: staff.isActiveAdmin,
    });
    return ok(result.items, result.meta);
  } catch (err) {
    return fail(err, "Failed to fetch concierge leads.");
  }
}

