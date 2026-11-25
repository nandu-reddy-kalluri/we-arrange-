import { NextRequest } from "next/server";
import { inviteRsvpCreateSchema, slugSchema } from "@we-arrange/validation";
import { checkRateLimit, getClientIp } from "@we-arrange/utils";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { submitPublicInviteRsvp } from "@/services/cms/cmsService";
import { AppError, created, fail, parseJsonBody } from "@/services/http/response";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const clientIp = getClientIp(request);
    const rl = checkRateLimit("public_rsvp", clientIp, {
      windowMs: 10 * 60 * 1000,
      max: process.env.NODE_ENV === "test" ? 1000 : 15,
    });
    if (!rl.success) {
      throw new AppError("TOO_MANY_REQUESTS", 429, "Too many RSVP submissions from this connection. Please try again later.");
    }

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

