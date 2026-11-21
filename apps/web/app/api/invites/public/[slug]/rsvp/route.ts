import { NextRequest } from "next/server";
import { inviteRsvpCreateSchema, slugSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { submitPublicInviteRsvp } from "@/services/cms/cmsService";
import { created, fail, parseJsonBody } from "@/services/http/response";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const validSlug = slugSchema.parse(slug);
    const body = await parseJsonBody(request, inviteRsvpCreateSchema);
    const adminClient = createServiceRoleClient();
    const rsvp = await submitPublicInviteRsvp(adminClient, validSlug, body);
    return created(rsvp);
  } catch (err) {
    return fail(err, "Failed to submit RSVP.");
  }
}

