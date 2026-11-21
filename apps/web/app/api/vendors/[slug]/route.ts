import { NextRequest } from "next/server";
import { createPublicAnonClient } from "@we-arrange/database/clients";
import { slugOrIdSchema } from "@we-arrange/validation";
import { getPublicVendorBySlugOrId } from "@we-arrange/service-vendor";
import { fail, ok } from "@/services/http/response";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const safeSlug = slugOrIdSchema.parse(slug);
    const supabase = createPublicAnonClient();
    const result = await getPublicVendorBySlugOrId(supabase, safeSlug);
    return ok(result, undefined, 200, {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    });
  } catch (err) {
    return fail(err, "Failed to load vendor.");
  }
}

