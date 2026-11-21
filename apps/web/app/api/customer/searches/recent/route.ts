import { NextRequest } from "next/server";
import { paginationQuerySchema, positiveIntIdSchema, recentSearchCreateSchema } from "@we-arrange/validation";
import {
  clearRecentSearches,
  listRecentSearches,
  recordRecentSearch,
} from "@we-arrange/service-customer";
import { requireAuthenticatedUser } from "@/services/auth";
import { created, fail, ok, parseJsonBody, parseSearchParams } from "@/services/http/response";

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const q = parseSearchParams(request.url, paginationQuerySchema);
    const items = await listRecentSearches(ctx.supabase, ctx.userId, q.limit);
    return ok(items);
  } catch (err) {
    return fail(err, "Failed to load recent searches.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const body = await parseJsonBody(request, recentSearchCreateSchema);
    const saved = await recordRecentSearch(ctx.supabase, ctx.userId, body);
    return created(saved);
  } catch (err) {
    return fail(err, "Failed to record recent search.");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const searchIdParam = request.nextUrl.searchParams.get("searchId");
    const searchId = searchIdParam ? positiveIntIdSchema.parse(searchIdParam) : undefined;
    const result = await clearRecentSearches(ctx.supabase, ctx.userId, searchId);
    return ok(result);
  } catch (err) {
    return fail(err, "Failed to clear recent searches.");
  }
}

