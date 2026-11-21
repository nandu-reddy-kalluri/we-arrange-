import { NextRequest } from "next/server";
import { slugSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { getPublicInviteBySlug } from "@/services/cms/cmsService";
import { fail, ok } from "@/services/http/response";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const validSlug = slugSchema.parse(slug);
    const adminClient = createServiceRoleClient();
    const data = await getPublicInviteBySlug(adminClient, validSlug);
    return ok(data);
  } catch (err) {
    return fail(err, "Failed to load public e-invite.");
  }
}

