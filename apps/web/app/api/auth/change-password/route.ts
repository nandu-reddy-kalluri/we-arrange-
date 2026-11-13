import { NextRequest } from "next/server";
import { changePasswordSchema } from "@we-arrange/validation";
import { fail, ok, parseJsonBody } from "@/services/http/response";
import { changeAuthenticatedPassword } from "@/services/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request, changePasswordSchema);
    const result = await changeAuthenticatedPassword({
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });
    return ok(result);
  } catch (err) {
    return fail(err, "Failed to change password.");
  }
}

