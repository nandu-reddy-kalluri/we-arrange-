import { NextRequest } from "next/server";
import { createPublicAnonClient } from "@we-arrange/database/clients";
import { paginationQuerySchema } from "@we-arrange/validation";
import { listPopularSearches } from "@/services/search/searchService";
import { fail, ok, parseSearchParams } from "@/services/http/response";

export async function GET(request: NextRequest) {
  try {
    const q = parseSearchParams(request.url, paginationQuerySchema);
    const supabase = createPublicAnonClient();
    const items = await listPopularSearches(supabase, q.limit);
    return ok(items);
  } catch (err) {
    return fail(err, "Failed to fetch popular searches.");
  }
}

