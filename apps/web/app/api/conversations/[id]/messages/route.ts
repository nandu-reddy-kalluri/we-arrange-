import { NextRequest } from "next/server";
import { messageCreateSchema, positiveIntIdSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireAuthenticatedUser } from "@/services/auth";
import {
  listConversationMessages,
  sendConversationMessage,
} from "@/services/notifications/notificationService";
import { created, fail, ok, parseJsonBody } from "@/services/http/response";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuthenticatedUser();
    const { id } = await context.params;
    const conversationId = positiveIntIdSchema.parse(id);
    const adminClient = createServiceRoleClient();
    const res = await listConversationMessages(adminClient, conversationId, {
      userId: ctx.userId,
      isStaff: ctx.isConciergeOrAdmin,
      vendorId: ctx.vendorId,
    });
    return ok(res);
  } catch (err) {
    return fail(err, "Failed to load conversation messages.");
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuthenticatedUser();
    const { id } = await context.params;
    const conversationId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, messageCreateSchema);
    const adminClient = createServiceRoleClient();
    const msg = await sendConversationMessage(
      adminClient,
      conversationId,
      { userId: ctx.userId, isStaff: ctx.isConciergeOrAdmin, vendorId: ctx.vendorId },
      body
    );
    return created(msg);
  } catch (err) {
    return fail(err, "Failed to send message.");
  }
}
