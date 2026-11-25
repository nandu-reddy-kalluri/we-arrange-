import { NextRequest } from "next/server";
import { forgotPasswordSchema } from "@we-arrange/validation";
import { checkRateLimit, getClientIp } from "@we-arrange/utils";
import { AppError, fail, ok, parseJsonBody } from "@/services/http/response";
import { sendPasswordResetEmail } from "@/services/auth";

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rl = checkRateLimit("auth_forgot_password", clientIp, {
      windowMs: 60 * 60 * 1000,
      max: process.env.NODE_ENV === "test" ? 1000 : 5,
    });
    if (!rl.success) {
      throw new AppError("TOO_MANY_REQUESTS", 429, "Too many password reset requests. Please try again later.");
    }

    const body = await parseJsonBody(request, forgotPasswordSchema);
    const result = await sendPasswordResetEmail(body.email, body.redirectTo);
    return ok(result);
  } catch (err) {
    return fail(err, "Unable to initiate password reset.");
  }
}

