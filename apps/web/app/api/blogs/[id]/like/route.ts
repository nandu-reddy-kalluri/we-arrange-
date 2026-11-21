import { NextRequest } from "next/server";
import { positiveIntIdSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireAuthenticatedUser } from "@/services/auth";
import { toggleBlogLike } from "@/services/cms/cmsService";
import { fail, ok } from "@/services/http/response";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuthenticatedUser();
    const { id } = await context.params;
    const blogId = positiveIntIdSchema.parse(id);
    // blog_likes.user_id is hidden from client SELECT; enforce verified userId server-side
    const res = await toggleBlogLike(createServiceRoleClient(), blogId, userId);
    return ok(res);
  } catch (err) {
    return fail(err, "Failed to toggle blog like.");
  }
}
