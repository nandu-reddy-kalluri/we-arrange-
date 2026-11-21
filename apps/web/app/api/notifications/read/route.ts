import { NextRequest } from "next/server";
import { notificationMarkReadSchema } from "@we-arrange/validation";
import { requireAuthenticatedUser } from "@/services/auth";
import { markNotificationsRead } from "@/services/notifications/notificationService";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function PATCH(request: NextRequest) {
  try {
    const { supabase, userId } = await requireAuthenticatedUser();
    const body = await parseJsonBody(request, notificationMarkReadSchema);
    const res = await markNotificationsRead(supabase, userId, body);
    return ok(res);
  } catch (err) {
    return fail(err, "Failed to mark notifications as read.");
  }
}
