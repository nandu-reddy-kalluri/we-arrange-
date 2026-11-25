import { NextRequest } from "next/server";
import { couponValidateSchema } from "@we-arrange/validation";
import { checkRateLimit, getClientIp } from "@we-arrange/utils";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { validateAndCalculateCoupon } from "@we-arrange/service-booking";
import { requireAuthenticatedUser } from "@/services/auth";
import { AppError, fail, ok, parseJsonBody } from "@/services/http/response";

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const rateLimitKey = `${ctx.userId}_${getClientIp(request)}`;
    const rl = checkRateLimit("coupon_validate", rateLimitKey, {
      windowMs: 10 * 60 * 1000,
      max: process.env.NODE_ENV === "test" ? 1000 : 10,
    });
    if (!rl.success) {
      throw new AppError("TOO_MANY_REQUESTS", 429, "Too many coupon validation attempts. Please try again later.");
    }

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

