import { createPublicAnonClient } from "@we-arrange/database/clients";
import { listVendorCategories } from "@we-arrange/service-vendor";
import { fail, ok } from "@/services/http/response";

export async function GET() {
  try {
    const supabase = createPublicAnonClient();
    const categories = await listVendorCategories(supabase);
    return ok(categories, undefined, 200, {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    });
  } catch (err) {
    return fail(err, "Failed to load vendor categories.");
  }
}

