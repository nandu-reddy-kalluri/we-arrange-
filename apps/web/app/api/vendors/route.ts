import { NextRequest } from "next/server";
import { createPublicAnonClient } from "@we-arrange/database/clients";
import { vendorQuerySchema } from "@we-arrange/validation";
import { listPublicVendors } from "@we-arrange/service-vendor";
import { fail, ok, parseSearchParams } from "@/services/http/response";

export async function GET(request: NextRequest) {
  try {
    const query = parseSearchParams(request.url, vendorQuerySchema);
    const supabase = createPublicAnonClient();
    const result = await listPublicVendors(supabase, query);
    return ok(result.items, result.meta, 200, {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    });
  } catch (err) {
    return fail(err, "Failed to load vendors.");
  }
}

