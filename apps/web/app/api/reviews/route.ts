import { NextRequest } from "next/server";
import { paginationQuerySchema, positiveIntIdSchema, reviewCreateSchema } from "@we-arrange/validation";
import { createSupabaseServerClient } from "@/services/supabase/server";
import { requireAuthenticatedUser } from "@/services/auth";
import { createReview, listPublicReviews } from "@/services/reviews/reviewService";
import { created, fail, ok, parseJsonBody, parseSearchParams } from "@/services/http/response";

const listReviewsQuerySchema = paginationQuerySchema.extend({
  venueId: positiveIntIdSchema.optional(),
  vendorId: positiveIntIdSchema.optional(),
});

export async function GET(request: NextRequest) {
  try {
    const query = parseSearchParams(request.nextUrl.searchParams, listReviewsQuerySchema);
    const supabase = await createSupabaseServerClient();
    const res = await listPublicReviews(supabase, query);
    return ok(res.items, res.meta, 200, {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    });
  } catch (err) {
    return fail(err, "Failed to load reviews.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, userId } = await requireAuthenticatedUser();
    const body = await parseJsonBody(request, reviewCreateSchema);
    const review = await createReview(supabase, userId, body);
    return created(review);
  } catch (err) {
    return fail(err, "Failed to submit review.");
  }
}
