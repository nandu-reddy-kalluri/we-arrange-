import { NextRequest } from "next/server";
import { venueQuerySchema } from "@we-arrange/validation";
import { createPublicAnonClient } from "@we-arrange/database/clients";
import { listPublicVenues } from "@we-arrange/service-venue";
import { fail, ok, parseSearchParams } from "@/services/http/response";

export async function GET(request: NextRequest) {
  try {
    const query = parseSearchParams(request.url, venueQuerySchema);
    const supabase = createPublicAnonClient();
    const result = await listPublicVenues(supabase, query, { includeMedia: true });
    return ok(result.items, result.meta, 200, {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    });
  } catch (err) {
    return fail(err, "Failed to fetch venues.");
  }
}

