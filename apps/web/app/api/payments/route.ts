import { NextRequest } from "next/server";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { mapDatabaseError } from "@we-arrange/database/errors";
import { buildPaginationMeta, normalizePagination } from "@we-arrange/database/repository";
import { paginationQuerySchema } from "@we-arrange/validation";
import { requireAuthenticatedUser } from "@/services/auth";
import { fail, ok, parseSearchParams } from "@/services/http/response";

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const q = parseSearchParams(request.url, paginationQuerySchema);
    const { page, limit, from, to } = normalizePagination(q);
    const client = ctx.isActiveAdmin ? createServiceRoleClient() : ctx.supabase;

    let query = client
      .from("payments")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!ctx.isActiveAdmin) {
      query = query.eq("user_id", ctx.userId);
    }

    const { data, error, count } = await query;
    if (error) throw mapDatabaseError(error, "Failed to load payments.");
    return ok(data ?? [], buildPaginationMeta(page, limit, count ?? data?.length ?? 0));
  } catch (err) {
    return fail(err, "Failed to load payments.");
  }
}

