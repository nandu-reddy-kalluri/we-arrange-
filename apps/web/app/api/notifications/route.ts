import { NextRequest } from "next/server";
import { paginationQuerySchema } from "@we-arrange/validation";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/services/auth";
import { listUserNotifications } from "@/services/notifications/notificationService";
import { fail, ok, parseSearchParams } from "@/services/http/response";

const querySchema = paginationQuerySchema.extend({
  unreadOnly: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { supabase, userId } = await requireAuthenticatedUser();
    const query = parseSearchParams(request.nextUrl.searchParams, querySchema);
    const res = await listUserNotifications(supabase, userId, query);
    return ok(res.items, res.meta);
  } catch (err) {
    return fail(err, "Failed to list notifications.");
  }
}
