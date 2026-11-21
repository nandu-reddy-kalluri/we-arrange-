import { NextRequest } from "next/server";
import { blogCommentCreateSchema, positiveIntIdSchema } from "@we-arrange/validation";
import { requireAuthenticatedUser } from "@/services/auth";
import { createBlogComment } from "@/services/cms/cmsService";
import { created, fail, parseJsonBody } from "@/services/http/response";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, userId } = await requireAuthenticatedUser();
    const { id } = await context.params;
    const blogId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, blogCommentCreateSchema);
    const comment = await createBlogComment(supabase, blogId, userId, body.comment);
    return created(comment);
  } catch (err) {
    return fail(err, "Failed to post blog comment.");
  }
}
