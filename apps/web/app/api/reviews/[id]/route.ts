import { NextRequest } from "next/server";
import { positiveIntIdSchema, reviewUpdateSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireAuthenticatedUser } from "@/services/auth";
import { deleteOwnReview, updateOwnReview } from "@/services/reviews/reviewService";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, userId } = await requireAuthenticatedUser();
    const { id } = await context.params;
    const reviewId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, reviewUpdateSchema);
    const updated = await updateOwnReview(supabase, userId, reviewId, body);
    return ok(updated);
  } catch (err) {
    return fail(err, "Failed to update review.");
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuthenticatedUser();
    const { id } = await context.params;
    const reviewId = positiveIntIdSchema.parse(id);
    const adminClient = createServiceRoleClient();
    const dbClient = ctx.isActiveAdmin ? adminClient : ctx.supabase;
    const deleted = await deleteOwnReview(dbClient, ctx.userId, reviewId, ctx.isActiveAdmin, adminClient);
    return ok(deleted);
  } catch (err) {
    return fail(err, "Failed to delete review.");
  }
}
