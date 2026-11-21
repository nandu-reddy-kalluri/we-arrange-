import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireActiveAdmin } from "@/services/auth";
import { getAdminAnalytics } from "@/services/analytics/analyticsService";
import { fail, ok } from "@/services/http/response";

export async function GET() {
  try {
    await requireActiveAdmin();
    const adminClient = createServiceRoleClient();
    const metrics = await getAdminAnalytics(adminClient);
    return ok(metrics);
  } catch (err) {
    return fail(err, "Failed to load admin analytics.");
  }
}
