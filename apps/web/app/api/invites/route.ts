import { NextRequest } from "next/server";
import { inviteCreateSchema } from "@we-arrange/validation";
import { requireAuthenticatedUser } from "@/services/auth";
import { createUserInvite, listUserInvites } from "@/services/cms/cmsService";
import { created, fail, ok, parseJsonBody } from "@/services/http/response";

export async function GET() {
  try {
    const { supabase, userId } = await requireAuthenticatedUser();
    const invites = await listUserInvites(supabase, userId);
    return ok(invites);
  } catch (err) {
    return fail(err, "Failed to list e-invites.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, userId } = await requireAuthenticatedUser();
    const body = await parseJsonBody(request, inviteCreateSchema);
    const invite = await createUserInvite(supabase, userId, body);
    return created(invite);
  } catch (err) {
    return fail(err, "Failed to create e-invite.");
  }
}
