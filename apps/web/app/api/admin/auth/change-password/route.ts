import { NextRequest } from "next/server";
import { changePasswordSchema } from "@we-arrange/validation";
import { ADMIN_SESSION_COOKIE, changeAuthenticatedPassword } from "@/lib/adminAuth";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request, changePasswordSchema);
    await changeAuthenticatedPassword(
      {
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      },
      { requireStaff: true }
    );

    const response = ok({
      success: true,
      message: "Password updated successfully.",
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
    return fail(err, "Failed to update admin password.");
  }
}
