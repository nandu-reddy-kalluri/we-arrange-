import { NextRequest } from "next/server";
import { createPublicAnonClient } from "@we-arrange/database/clients";
import { unifiedSearchQuerySchema } from "@we-arrange/validation";
import { runUnifiedCatalogSearch } from "@/services/search/searchService";
import { fail, ok, parseSearchParams } from "@/services/http/response";

export async function GET(request: NextRequest) {
  try {
    const q = parseSearchParams(request.url, unifiedSearchQuerySchema);
    const supabase = createPublicAnonClient();
    const result = await runUnifiedCatalogSearch(supabase, q);
    return ok(result, undefined, 200, {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
    });
  } catch (err) {
    return fail(err, "Search query failed.");
  }
}

