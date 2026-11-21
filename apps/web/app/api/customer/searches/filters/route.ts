import { NextRequest } from "next/server";
import { positiveIntIdSchema, savedFilterCreateSchema } from "@we-arrange/validation";
import {
  deleteSavedFilter,
  listSavedFilters,
  saveSearchFilter,
} from "@we-arrange/service-customer";
import { requireAuthenticatedUser } from "@/services/auth";
import { created, fail, ok, parseJsonBody } from "@/services/http/response";

export async function GET() {
  try {
    const ctx = await requireAuthenticatedUser();
    const items = await listSavedFilters(ctx.supabase, ctx.userId);
    return ok(items);
  } catch (err) {
    return fail(err, "Failed to load saved search filters.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const body = await parseJsonBody(request, savedFilterCreateSchema);
    const saved = await saveSearchFilter(ctx.supabase, ctx.userId, body);
    return created(saved);
  } catch (err) {
    return fail(err, "Failed to save search filter.");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const filterId = positiveIntIdSchema.parse(request.nextUrl.searchParams.get("filterId"));
    const result = await deleteSavedFilter(ctx.supabase, ctx.userId, filterId);
    return ok(result);
  } catch (err) {
    return fail(err, "Failed to delete saved search filter.");
  }
}

