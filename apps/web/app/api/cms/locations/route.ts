import { NextRequest } from "next/server";
import { positiveIntIdSchema } from "@we-arrange/validation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/services/supabase/server";
import { listGeoLocations } from "@/services/cms/cmsService";
import { fail, ok, parseSearchParams } from "@/services/http/response";

const locationQuerySchema = z.object({
  countryId: positiveIntIdSchema.optional(),
  stateId: positiveIntIdSchema.optional(),
  cityId: positiveIntIdSchema.optional(),
  areaId: positiveIntIdSchema.optional(),
});

export async function GET(request: NextRequest) {
  try {
    const query = parseSearchParams(request.nextUrl.searchParams, locationQuerySchema);
    const supabase = await createSupabaseServerClient();
    const res = await listGeoLocations(supabase, query);
    return ok(res);
  } catch (err) {
    return fail(err, "Failed to load locations.");
  }
}
