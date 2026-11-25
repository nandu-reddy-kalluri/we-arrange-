import { NextRequest } from "next/server";
import { loginSchema } from "@we-arrange/validation";
import { checkRateLimit, getClientIp } from "@we-arrange/utils";
import { AppError, fail, logApiEvent, ok, parseJsonBody } from "@/services/http/response";
import { loginWithPassword } from "@/services/auth";

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rl = checkRateLimit("auth_login", clientIp, {
      windowMs: 15 * 60 * 1000,
      max: process.env.NODE_ENV === "test" ? 1000 : 10,
    });
    if (!rl.success) {
      throw new AppError("TOO_MANY_REQUESTS", 429, "Too many login attempts. Please try again later.");
    }

    const body = await parseJsonBody(request, loginSchema);
    const ctx = await loginWithPassword(body.email, body.password, {
      requireVendor: body.portal === "vendor",
      rejectAdmin: true,
      rejectStaff: body.portal !== "vendor",
    });

    logApiEvent({
      route: "/api/auth/login",
      method: "POST",
      userId: ctx.userId,
      status: 200,
    });

    const redirectUrl = ctx.role === "vendor" ? "/vendor" : "/customer/overview";

    return ok({
      user: {
        id: ctx.userId,
        email: ctx.email,
        fullName: ctx.fullName,
        role: ctx.role,
        vendorId: ctx.vendorId,
        isActiveAdmin: ctx.isActiveAdmin,
      },
      redirectUrl,
    });
  } catch (err) {
    return fail(err, "Authentication failed.");
  }
}

