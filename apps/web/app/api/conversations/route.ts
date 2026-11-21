import { NextRequest } from "next/server";
import { conversationCreateSchema, paginationQuerySchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireAuthenticatedUser } from "@/services/auth";
import { createConversation, listUserConversations } from "@/services/notifications/notificationService";
import { created, fail, ok, parseJsonBody, parseSearchParams } from "@/services/http/response";

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const pagination = parseSearchParams(request.nextUrl.searchParams, paginationQuerySchema);
    const adminClient = createServiceRoleClient();
    const res = await listUserConversations(
      adminClient,
      { userId: ctx.userId, isStaff: ctx.isConciergeOrAdmin, vendorId: ctx.vendorId },
      pagination
    );
    return ok(res.items, res.meta);
  } catch (err) {
    return fail(err, "Failed to list conversations.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const body = await parseJsonBody(request, conversationCreateSchema);
    const adminClient = createServiceRoleClient();
    const conv = await createConversation(adminClient, ctx.userId, body);
    return created(conv);
  } catch (err) {
    return fail(err, "Failed to start conversation.");
  }
}
