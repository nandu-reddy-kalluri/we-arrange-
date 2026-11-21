import { NextRequest } from "next/server";
import { enquiryMessageCreateSchema, positiveIntIdSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { postEnquiryMessage } from "@we-arrange/service-booking";
import { requireAuthenticatedUser } from "@/services/auth";
import { created, fail, parseJsonBody } from "@/services/http/response";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuthenticatedUser();
    const { id } = await context.params;
    const enquiryId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, enquiryMessageCreateSchema);
    const client =
      ctx.isConciergeOrAdmin || ctx.vendorId !== null
        ? createServiceRoleClient()
        : ctx.supabase;
    const msg = await postEnquiryMessage(
      client,
      enquiryId,
      {
        userId: ctx.userId,
        isStaff: ctx.isConciergeOrAdmin,
        isActiveAdmin: ctx.isActiveAdmin,
        vendorId: ctx.vendorId,
      },
      body.message
    );
    return created(msg);
  } catch (err) {
    return fail(err, "Failed to send enquiry message.");
  }
}

