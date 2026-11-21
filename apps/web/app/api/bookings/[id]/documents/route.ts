import { NextRequest } from "next/server";
import { bookingDocumentCreateSchema, positiveIntIdSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { addBookingDocument, getBookingDetail } from "@we-arrange/service-booking";
import { requireAuthenticatedUser } from "@/services/auth";
import { created, fail, ok, parseJsonBody } from "@/services/http/response";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuthenticatedUser();
    const { id } = await context.params;
    const bookingId = positiveIntIdSchema.parse(id);
    const adminClient = createServiceRoleClient();
    const detail = await getBookingDetail(adminClient, bookingId, {
      userId: ctx.userId,
      isStaff: ctx.isConciergeOrAdmin,
      vendorId: ctx.vendorId,
    });
    return ok(detail.documents);
  } catch (err) {
    return fail(err, "Failed to load booking documents.");
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuthenticatedUser();
    const { id } = await context.params;
    const bookingId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, bookingDocumentCreateSchema);
    const adminClient = createServiceRoleClient();
    const doc = await addBookingDocument(
      adminClient,
      bookingId,
      { userId: ctx.userId, isStaff: ctx.isConciergeOrAdmin },
      body
    );
    return created(doc);
  } catch (err) {
    return fail(err, "Failed to attach booking document.");
  }
}

