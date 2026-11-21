import { NextRequest } from "next/server";
import { bookingCreateFromQuoteSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { createBookingFromAcceptedQuote } from "@we-arrange/service-booking";
import { requireConciergeOrAdmin } from "@/services/auth";
import { created, fail, parseJsonBody } from "@/services/http/response";

export async function POST(request: NextRequest) {
  try {
    const staff = await requireConciergeOrAdmin();
    const body = await parseJsonBody(request, bookingCreateFromQuoteSchema);
    const adminClient = createServiceRoleClient();
    const booking = await createBookingFromAcceptedQuote(
      adminClient,
      { userId: staff.userId, isStaff: true, isActiveAdmin: staff.isActiveAdmin },
      body
    );
    return created(booking);
  } catch (err) {
    return fail(err, "Failed to create managed booking.");
  }
}

