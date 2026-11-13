import { NextRequest } from "next/server";
import { loginSchema } from "@we-arrange/validation";
import { ADMIN_SESSION_COOKIE } from "@/lib/adminAuth";
import { loginWithPassword } from "@/services/auth";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request, loginSchema);
    const ctx = await loginWithPassword(body.email, body.password, {
      requireStaff: true,
    });

    const response = ok({
      success: true,
      message: "Admin authentication successful.",
      user: {
        id: ctx.userId,
        email: ctx.email,
        fullName: ctx.fullName,
        role: ctx.role,
        isActiveAdmin: ctx.isActiveAdmin,
      },
    });

    // Clear any legacy non-Supabase admin cookie during cutover
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err) {
    return fail(err, "Administrator authentication failed.");
  }
}
