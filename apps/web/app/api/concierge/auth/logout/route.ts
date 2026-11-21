import { ADMIN_SESSION_COOKIE, logoutSession } from "@/lib/adminAuth";
import { fail, ok } from "@/services/http/response";

export async function POST() {
  try {
    await logoutSession();
    const response = ok({
      success: true,
      message: "Concierge session ended.",
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
    return fail(err, "Failed to end concierge session.");
  }
}
