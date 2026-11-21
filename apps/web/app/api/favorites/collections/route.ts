import { NextRequest } from "next/server";
import { collectionCreateSchema, paginationQuerySchema } from "@we-arrange/validation";
import { createCustomerCollection, listCustomerCollections } from "@we-arrange/service-customer";
import { requireAuthenticatedUser } from "@/services/auth";
import { created, fail, ok, parseJsonBody, parseSearchParams } from "@/services/http/response";

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const q = parseSearchParams(request.url, paginationQuerySchema);
    const result = await listCustomerCollections(ctx.supabase, ctx.userId, q);
    return ok(result.items, result.meta);
  } catch (err) {
    return fail(err, "Failed to load saved collections.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const body = await parseJsonBody(request, collectionCreateSchema);
    const col = await createCustomerCollection(ctx.supabase, ctx.userId, body);
    return created(col);
  } catch (err) {
    return fail(err, "Failed to create collection.");
  }
}

