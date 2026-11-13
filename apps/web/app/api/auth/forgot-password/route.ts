import { NextRequest } from "next/server";
import { forgotPasswordSchema } from "@we-arrange/validation";
import { fail, ok, parseJsonBody } from "@/services/http/response";
import { sendPasswordResetEmail } from "@/services/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request, forgotPasswordSchema);
    const result = await sendPasswordResetEmail(body.email, body.redirectTo);
    return ok(result);
  } catch (err) {
    return fail(err, "Unable to initiate password reset.");
  }
}

