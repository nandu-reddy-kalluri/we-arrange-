import { NextRequest } from "next/server";
import { inviteGuestCreateSchema, positiveIntIdSchema } from "@we-arrange/validation";
import { requireAuthenticatedUser } from "@/services/auth";
import {
  addInviteGuest,
  getOwnedInvite,
  removeInviteGuest,
} from "@/services/cms/cmsService";
import { created, fail, ok, parseJsonBody } from "@/services/http/response";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, userId } = await requireAuthenticatedUser();
    const { id } = await context.params;
    const inviteId = positiveIntIdSchema.parse(id);
    const detail = await getOwnedInvite(supabase, userId, inviteId);
    return ok(detail.guests);
  } catch (err) {
    return fail(err, "Failed to list invite guests.");
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, userId } = await requireAuthenticatedUser();
    const { id } = await context.params;
    const inviteId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, inviteGuestCreateSchema);
    const guest = await addInviteGuest(supabase, userId, inviteId, body);
    return created(guest);
  } catch (err) {
    return fail(err, "Failed to add invite guest.");
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, userId } = await requireAuthenticatedUser();
    const { id } = await context.params;
    const inviteId = positiveIntIdSchema.parse(id);
    const guestId = positiveIntIdSchema.parse(request.nextUrl.searchParams.get("guestId"));
    const deleted = await removeInviteGuest(supabase, userId, inviteId, guestId);
    return ok(deleted);
  } catch (err) {
    return fail(err, "Failed to remove invite guest.");
  }
}
