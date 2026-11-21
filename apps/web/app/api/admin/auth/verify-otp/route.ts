import { NextRequest } from "next/server";
import { z } from "zod";
import { resolveAuthenticatedContext } from "@/services/auth";
import { createSupabaseServerClient } from "@/services/supabase/server";
import { AppError, fail, ok, parseJsonBody } from "@/services/http/response";

const verifyRecoveryOtpSchema = z.object({
  email: z.string().trim().email(),
  otp: z.string().trim().min(6).max(12),
});

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request, verifyRecoveryOtpSchema);
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: body.email.toLowerCase().trim(),
      token: body.otp,
      type: "recovery",
    });

    if (error || !data.user) {
      throw new AppError("VALIDATION_ERROR", 400, "Invalid or expired recovery OTP.");
    }

    let ctx;
    try {
      ctx = await resolveAuthenticatedContext(supabase);
    } catch (resolveErr) {
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      throw resolveErr;
    }
    if (!ctx.isConciergeOrAdmin) {
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      throw new AppError(
        "FORBIDDEN",
        403,
        "Recovery OTP account is not authorized as Administrator or Concierge."
      );
    }

    return ok({
      success: true,
      message: "Recovery code verified via Supabase Auth.",
      userId: data.user.id,
    });
  } catch (err) {
    return fail(err, "Failed to verify recovery OTP.");
  }
}
