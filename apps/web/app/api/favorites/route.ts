import { NextRequest } from "next/server";
import { z } from "zod";
import { favoriteCreateSchema, paginationQuerySchema, positiveIntIdSchema } from "@we-arrange/validation";
import { addCustomerFavorite, listCustomerFavorites } from "@we-arrange/service-customer";
import { requireAuthenticatedUser } from "@/services/auth";
import { created, fail, ok, parseJsonBody, parseSearchParams } from "@/services/http/response";

const listFavoritesQuerySchema = paginationQuerySchema.extend({
  collectionId: positiveIntIdSchema.optional(),
});

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const q = parseSearchParams(request.url, listFavoritesQuerySchema);
    const result = await listCustomerFavorites(ctx.supabase, ctx.userId, q);
    return ok(result.items, result.meta);
  } catch (err) {
    return fail(err, "Failed to load favorites.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const body = await parseJsonBody(request, favoriteCreateSchema);
    const result = await addCustomerFavorite(ctx.supabase, ctx.userId, body);
    return result.created ? created(result) : ok(result);
  } catch (err) {
    return fail(err, "Failed to save favorite.");
  }
}

