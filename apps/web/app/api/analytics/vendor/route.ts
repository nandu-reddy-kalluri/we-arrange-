import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireVendorOwner } from "@/services/auth";
import { getVendorAnalytics } from "@/services/analytics/analyticsService";
import { fail, ok } from "@/services/http/response";

export async function GET() {
  try {
    const auth = await requireVendorOwner();
    const adminClient = createServiceRoleClient();
    const metrics = await getVendorAnalytics(adminClient, auth.vendorId);
    return ok(metrics);
  } catch (err) {
    return fail(err, "Failed to load vendor analytics.");
  }
}
