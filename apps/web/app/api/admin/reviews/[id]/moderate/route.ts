import { NextRequest } from "next/server";
import { moderationDecisionSchema, positiveIntIdSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireActiveAdmin } from "@/services/auth";
import { moderateReview } from "@/services/reviews/reviewService";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireActiveAdmin();
    const { id } = await context.params;
    const reviewId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, moderationDecisionSchema);
    const adminClient = createServiceRoleClient();
    const review = await moderateReview(adminClient, reviewId, userId, body);
    return ok(review);
  } catch (err) {
    return fail(err, "Failed to moderate review.");
  }
}
