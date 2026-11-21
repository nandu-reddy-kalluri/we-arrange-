import { NextRequest } from "next/server";
import { inviteUpdateSchema, positiveIntIdSchema } from "@we-arrange/validation";
import { requireAuthenticatedUser } from "@/services/auth";
import {
  deleteOwnedInvite,
  getOwnedInvite,
  updateOwnedInvite,
} from "@/services/cms/cmsService";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, userId } = await requireAuthenticatedUser();
    const { id } = await context.params;
    const inviteId = positiveIntIdSchema.parse(id);
    const detail = await getOwnedInvite(supabase, userId, inviteId);
    return ok(detail);
  } catch (err) {
    return fail(err, "Failed to load e-invite.");
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, userId } = await requireAuthenticatedUser();
    const { id } = await context.params;
    const inviteId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, inviteUpdateSchema);
    const updated = await updateOwnedInvite(supabase, userId, inviteId, body);
    return ok(updated);
  } catch (err) {
    return fail(err, "Failed to update e-invite.");
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, userId } = await requireAuthenticatedUser();
    const { id } = await context.params;
    const inviteId = positiveIntIdSchema.parse(id);
    const deleted = await deleteOwnedInvite(supabase, userId, inviteId);
    return ok(deleted);
  } catch (err) {
    return fail(err, "Failed to delete e-invite.");
  }
}
