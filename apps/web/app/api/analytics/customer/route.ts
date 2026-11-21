import { requireAuthenticatedUser } from "@/services/auth";
import { getCustomerAnalytics } from "@/services/analytics/analyticsService";
import { fail, ok } from "@/services/http/response";

export async function GET() {
  try {
    const { supabase, userId } = await requireAuthenticatedUser();
    const metrics = await getCustomerAnalytics(supabase, userId);
    return ok(metrics);
  } catch (err) {
    return fail(err, "Failed to load customer analytics.");
  }
}
