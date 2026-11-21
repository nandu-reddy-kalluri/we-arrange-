import { createSupabaseServerClient } from "@/services/supabase/server";
import { listReportReasons } from "@/services/reviews/reviewService";
import { fail, ok } from "@/services/http/response";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const reasons = await listReportReasons(supabase);
    return ok(reasons);
  } catch (err) {
    return fail(err, "Failed to load report reasons.");
  }
}
