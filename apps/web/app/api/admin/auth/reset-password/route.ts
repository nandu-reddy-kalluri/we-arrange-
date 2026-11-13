import { NextRequest } from "next/server";
import { resetPasswordSchema } from "@we-arrange/validation";
import { ADMIN_SESSION_COOKIE, completePasswordReset } from "@/lib/adminAuth";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request, resetPasswordSchema);
    await completePasswordReset({
      newPassword: body.newPassword,
      code: body.code,
    });

    const response = ok({
      success: true,
      message: "Password updated via Supabase Auth.",
    });

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
    return fail(err, "Failed to reset admin password.");
  }
}
