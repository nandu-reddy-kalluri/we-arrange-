import { NextRequest } from "next/server";
import { bookingCreateFromQuoteSchema, paginationQuerySchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import {
  createBookingFromAcceptedQuote,
  listBookingsForActor,
} from "@we-arrange/service-booking";
import { requireAuthenticatedUser } from "@/services/auth";
import { created, fail, ok, parseJsonBody, parseSearchParams } from "@/services/http/response";

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const q = parseSearchParams(request.url, paginationQuerySchema);
    const client = ctx.isConciergeOrAdmin ? createServiceRoleClient() : ctx.supabase;
    const result = await listBookingsForActor(
      client,
      {
        userId: ctx.userId,
        isStaff: ctx.isConciergeOrAdmin,
        vendorId: ctx.vendorId,
      },
      q
    );
    return ok(result.items, result.meta);
  } catch (err) {
    return fail(err, "Failed to load bookings.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const body = await parseJsonBody(request, bookingCreateFromQuoteSchema);
    const adminClient = createServiceRoleClient();
    const booking = await createBookingFromAcceptedQuote(
      adminClient,
      { userId: ctx.userId, isStaff: ctx.isConciergeOrAdmin, isActiveAdmin: ctx.isActiveAdmin },
      body
    );
    return created(booking);
  } catch (err) {
    return fail(err, "Failed to create booking.");
  }
}

