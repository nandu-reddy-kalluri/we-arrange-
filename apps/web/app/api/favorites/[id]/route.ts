import { NextRequest } from "next/server";
import { positiveIntIdSchema } from "@we-arrange/validation";
import { removeCustomerFavorite } from "@we-arrange/service-customer";
import { requireAuthenticatedUser } from "@/services/auth";
import { fail, ok } from "@/services/http/response";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuthenticatedUser();
    const { id } = await context.params;
    const favoriteId = positiveIntIdSchema.parse(id);
    const result = await removeCustomerFavorite(ctx.supabase, ctx.userId, favoriteId);
    return ok(result);
  } catch (err) {
    return fail(err, "Failed to delete favorite.");
  }
}

