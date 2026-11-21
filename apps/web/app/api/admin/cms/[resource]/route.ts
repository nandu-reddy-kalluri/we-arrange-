import { NextRequest } from "next/server";
import {
  cmsBannerUpsertSchema,
  cmsBlogUpsertSchema,
  cmsFaqUpsertSchema,
  cmsHomeSectionUpsertSchema,
  cmsPageUpsertSchema,
  cmsTestimonialUpsertSchema,
  paginationQuerySchema,
  positiveIntIdSchema,
} from "@we-arrange/validation";
import { AppError } from "@we-arrange/database/errors";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireConciergeOrAdmin } from "@/services/auth";
import {
  adminCreateBanner,
  adminCreateBlog,
  adminCreateFaq,
  adminCreateHomeSection,
  adminCreatePage,
  adminCreateTestimonial,
  adminDeleteCmsResource,
  adminListCmsResource,
} from "@/services/cms/cmsService";
import { created, fail, ok, parseJsonBody, parseSearchParams } from "@/services/http/response";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  try {
    await requireConciergeOrAdmin();
    const { resource } = await context.params;
    const q = parseSearchParams(request.url, paginationQuerySchema);
    const adminClient = createServiceRoleClient();
    const res = await adminListCmsResource(adminClient, resource, q);
    return ok(res.items, res.meta);
  } catch (err) {
    return fail(err, "Failed to list CMS items.");
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  try {
    const auth = await requireConciergeOrAdmin();
    const { resource } = await context.params;
    const adminClient = createServiceRoleClient();

    switch (resource) {
      case "pages": {
        const body = await parseJsonBody(request, cmsPageUpsertSchema);
        return created(await adminCreatePage(adminClient, body));
      }
      case "blogs": {
        const body = await parseJsonBody(request, cmsBlogUpsertSchema);
        return created(await adminCreateBlog(adminClient, auth.userId, body));
      }
      case "banners": {
        const body = await parseJsonBody(request, cmsBannerUpsertSchema);
        return created(await adminCreateBanner(adminClient, body));
      }
      case "home-sections": {
        const body = await parseJsonBody(request, cmsHomeSectionUpsertSchema);
        return created(await adminCreateHomeSection(adminClient, body));
      }
      case "faqs": {
        const body = await parseJsonBody(request, cmsFaqUpsertSchema);
        return created(await adminCreateFaq(adminClient, body));
      }
      case "testimonials": {
        const body = await parseJsonBody(request, cmsTestimonialUpsertSchema);
        return created(await adminCreateTestimonial(adminClient, body));
      }
      default:
        throw new AppError("NOT_FOUND", 404, `Unsupported admin CMS resource '${resource}'.`);
    }
  } catch (err) {
    return fail(err, "Failed to save CMS item.");
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  try {
    await requireConciergeOrAdmin();
    const { resource } = await context.params;
    const itemId = positiveIntIdSchema.parse(request.nextUrl.searchParams.get("id"));
    const adminClient = createServiceRoleClient();
    const result = await adminDeleteCmsResource(adminClient, resource, itemId);
    return ok(result);
  } catch (err) {
    return fail(err, "Failed to delete CMS item.");
  }
}
