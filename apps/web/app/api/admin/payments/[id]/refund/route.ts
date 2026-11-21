import { NextRequest } from "next/server";
import { positiveIntIdSchema, refundCreateSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { createAdminRefund } from "@we-arrange/service-booking";
import { requireActiveAdmin } from "@/services/auth";
import { created, fail, parseJsonBody } from "@/services/http/response";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireActiveAdmin();
    const { id } = await context.params;
    const paymentId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, refundCreateSchema);
    const adminClient = createServiceRoleClient();

    const refund = await createAdminRefund(adminClient, paymentId, body);
    await adminClient.from("moderation_logs").insert({
      moderator_id: admin.userId,
      action: "refund_initiated",
      remarks: `Payment #${paymentId} refund INR ${body.amountInr}: ${body.reason}`,
    });

    return created(refund);
  } catch (err) {
    return fail(err, "Failed to initiate refund.");
  }
}

