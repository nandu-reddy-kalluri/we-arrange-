import { NextRequest } from "next/server";
import { positiveIntIdSchema, quoteRespondSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { respondToQuote } from "@we-arrange/service-booking";
import { requireAuthenticatedUser } from "@/services/auth";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuthenticatedUser();
    const { id } = await context.params;
    const quoteId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, quoteRespondSchema);
    const adminClient = createServiceRoleClient();
    const updated = await respondToQuote(
      adminClient,
      quoteId,
      ctx.userId,
      body.decision,
      body.notes
    );
    return ok(updated);
  } catch (err) {
    return fail(err, "Failed to respond to quotation.");
  }
}

