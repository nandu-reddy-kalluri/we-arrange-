import { NextRequest } from "next/server";
import { paginationQuerySchema, slugSchema } from "@we-arrange/validation";
import { AppError } from "@we-arrange/database/errors";
import { createSupabaseServerClient } from "@/services/supabase/server";
import {
  CMS_PUBLIC_RESOURCES,
  type CmsPublicResource,
  listPublicCmsResource,
} from "@/services/cms/cmsService";
import { fail, ok, parseSearchParams } from "@/services/http/response";

const cmsQuerySchema = paginationQuerySchema.extend({
  slug: slugSchema.optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  try {
    const { resource } = await context.params;
    if (!CMS_PUBLIC_RESOURCES.includes(resource as CmsPublicResource)) {
      throw new AppError("NOT_FOUND", 404, `Unknown CMS resource '${resource}'.`);
    }
    const query = parseSearchParams(request.nextUrl.searchParams, cmsQuerySchema);
    const supabase = await createSupabaseServerClient();
    const res = await listPublicCmsResource(supabase, resource as CmsPublicResource, query);
    return ok(res.items, res.meta);
  } catch (err) {
    return fail(err, "Failed to load CMS content.");
  }
}
