import { createPublicAnonClient } from "@we-arrange/database/clients";
import { listVenueTypes } from "@we-arrange/service-venue";
import { fail, ok } from "@/services/http/response";

export async function GET() {
  try {
    const supabase = createPublicAnonClient();
    const types = await listVenueTypes(supabase);
    return ok(types, undefined, 200, {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    });
  } catch (err) {
    return fail(err, "Failed to load venue types.");
  }
}

