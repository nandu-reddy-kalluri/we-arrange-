import { NextRequest } from "next/server";
import { positiveIntIdSchema, reviewVoteSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireAuthenticatedUser } from "@/services/auth";
import { voteOnReview } from "@/services/reviews/reviewService";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuthenticatedUser();
    const { id } = await context.params;
    const reviewId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, reviewVoteSchema);
    // review_votes.user_id is hidden from client SELECT; enforce verified userId server-side
    const result = await voteOnReview(
      createServiceRoleClient(),
      userId,
      reviewId,
      body.voteType
    );
    return ok(result);
  } catch (err) {
    return fail(err, "Failed to record review vote.");
  }
}
