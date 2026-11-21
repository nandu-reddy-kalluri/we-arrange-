import { NextRequest } from "next/server";
import { couponValidateSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { validateAndCalculateCoupon } from "@we-arrange/service-booking";
import { requireAuthenticatedUser } from "@/services/auth";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function POST(request: NextRequest) {
  try {
    await requireAuthenticatedUser();
    const body = await parseJsonBody(request, couponValidateSchema);
    // Validate exact submitted code server-side; direct client SELECT on coupons is revoked
    const result = await validateAndCalculateCoupon(
      createServiceRoleClient(),
      body.couponCode,
      body.amountInr
    );
    return ok(result);
  } catch (err) {
    return fail(err, "Failed to validate coupon.");
  }
}

