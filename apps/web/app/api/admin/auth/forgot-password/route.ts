import { NextRequest } from "next/server";
import { forgotPasswordSchema } from "@we-arrange/validation";
import { sendPasswordResetEmail } from "@/services/auth";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request, forgotPasswordSchema);
    await sendPasswordResetEmail(body.email, body.redirectTo);
    return ok({
      success: true,
      message: "Password recovery email dispatched via Supabase Auth.",
    });
  } catch (err) {
    return fail(err, "Failed to process forgot password request.");
  }
}
