import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireConciergeOrAdmin } from "@/services/auth";
import { getConciergeAnalytics } from "@/services/analytics/analyticsService";
import { fail, ok } from "@/services/http/response";

export async function GET() {
  try {
    const auth = await requireConciergeOrAdmin();
    const adminClient = createServiceRoleClient();
    const metrics = await getConciergeAnalytics(adminClient, auth.userId);
    return ok(metrics);
  } catch (err) {
    return fail(err, "Failed to load concierge analytics.");
  }
}
