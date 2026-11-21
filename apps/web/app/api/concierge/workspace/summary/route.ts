import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireConciergeOrAdmin } from "@/services/auth";
import { getConciergeWorkspaceSummary } from "@/services/concierge/conciergeService";
import { fail, ok } from "@/services/http/response";

export async function GET() {
  try {
    const staff = await requireConciergeOrAdmin();
    const adminClient = createServiceRoleClient();
    const summary = await getConciergeWorkspaceSummary(adminClient, staff.userId);
    return ok(summary);
  } catch (err) {
    return fail(err, "Failed to load concierge workspace summary.");
  }
}

