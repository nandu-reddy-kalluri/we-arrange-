import { NextRequest } from "next/server";
import { AppError } from "@we-arrange/database/errors";
import { loginSchema } from "@we-arrange/validation";
import { checkRateLimit, getClientIp } from "@we-arrange/utils";
import { ADMIN_SESSION_COOKIE } from "@/lib/adminAuth";
import { loginWithPassword } from "@/services/auth";
import { fail, ok } from "@/services/http/response";

const FORBIDDEN_PRIVILEGE_FIELDS = [
  "role",
  "role_id",
  "roleId",
  "user_metadata",
  "app_metadata",
  "is_admin",
  "isAdmin",
  "isActiveAdmin",
  "admin_status",
  "status",
];

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rl = checkRateLimit("admin_auth_login", clientIp, {
      windowMs: 15 * 60 * 1000,
      max: process.env.NODE_ENV === "test" ? 1000 : 5,
    });
    if (!rl.success) {
      throw new AppError("TOO_MANY_REQUESTS", 429, "Too many administrative login attempts. Please try again later.");
    }

    const raw = await request.json().catch(() => null);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return fail(loginSchema.safeParse(raw).error);
    }

    const rawObj = raw as Record<string, unknown>;
    if (FORBIDDEN_PRIVILEGE_FIELDS.some((key) => key in rawObj)) {
      return fail(
        new AppError(
          "FORBIDDEN",
          403,
          "Role and privilege override fields are not permitted during admin login."
        )
      );
    }

    const parsed = loginSchema.safeParse(rawObj);
    if (!parsed.success) {
      return fail(parsed.error);
    }

    const body = parsed.data;
    const ctx = await loginWithPassword(body.email, body.password, {
      requireAdmin: true,
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
