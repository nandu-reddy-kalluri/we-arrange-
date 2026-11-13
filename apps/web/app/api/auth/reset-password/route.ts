import { NextRequest } from "next/server";
import { resetPasswordSchema } from "@we-arrange/validation";
import { fail, ok, parseJsonBody } from "@/services/http/response";
import { completePasswordReset } from "@/services/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request, resetPasswordSchema);
    const result = await completePasswordReset({
      newPassword: body.newPassword,
      code: body.code,
    });
    return ok(result);
  } catch (err) {
    return fail(err, "Unable to reset password.");
  }
}

