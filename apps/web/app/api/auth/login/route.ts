import { NextRequest } from "next/server";
import { loginSchema } from "@we-arrange/validation";
import { fail, logApiEvent, ok, parseJsonBody } from "@/services/http/response";
import { loginWithPassword } from "@/services/auth";

export async function POST(request: NextRequest) {
  try {
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

